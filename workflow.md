# ProofPack Protocol & Architecture Workflow

**ProofPack** is a full-stack Layer 2 Transaction Optimization and Aggregation Platform engineered specifically for the **MST Blockchain** (Chain ID: `4646` Mainnet, `91562037` Coral Testnet) with native **BridgeKey Wallet** integration (EIP-1193 / EIP-712).

This document details the complete end-to-end operational workflow, cryptographic pipeline, data compression mechanics, on-chain settlement procedures, and user experience workflows.

---

## 1. High-Level Architecture Workflow

```mermaid
flowchart TD
    subgraph Client ["1. Client & Wallet Interface"]
        User([User]) -->|Connects BridgeKey / Web3| UI[ProofPack Web Dashboard]
        UI -->|EIP-712 Typed Signing (0 Gas)| Signer[BridgeKey Injected Provider]
        Signer -->|Signed Transfer (v, r, s)| API[ProofPack API Gateway]
    end

    subgraph RollupEngine ["2. Aggregation & Compression Engine"]
        API -->|POST /v1/transactions| Mempool[(In-Memory L2 Mempool)]
        Mempool -->|Sequential Nonce Validation| Sequencer[Batch Sequencer]
        Sequencer -->|Threshold 64 txs OR 3000ms idle| Builder[Batch Builder]
        Builder -->|Address Deduplication + LEB128 Varint| Codec[Binary Compression Engine]
        Builder -->|Keccak-256 Hashing| Merkle[Cryptographic Merkle Engine]
    end

    subgraph Settlement ["3. MST Blockchain L1 Settlement"]
        Codec -->|Dense Calldata| Settler[L2 Batch Settler Worker]
        Merkle -->|32-byte Merkle Root R| Settler
        Settler -->|commitBatch(seq, count, root, calldata)| SC[ProofPackSettlement.sol]
        SC -->|Emits BatchSettled event| MST[MST Blockchain EVM (Chain ID 4646 / 91562037)]
    end

    subgraph Verification ["4. Client Proofs & Observability"]
        MST -.->|On-Chain State| Explorer[Batch Explorer & Leads Table]
        SC -.->|verifyTransactionProof(root, leaf, proof)| ClientVerif[Client Fraud / Inclusion Proof]
    end
```

---

## 2. Step-by-Step Transaction Lifecycle

### Stage 1: Off-Chain EIP-712 Authorization (Zero L1 Gas)
1. **User Connection**: The user connects via the native **BridgeKey Wallet** (or an injected EIP-1193 provider).
2. **Typed Data Construction**: When initiating a transfer, ProofPack constructs an EIP-712 typed structured message:
   ```json
   {
     "types": {
       "Transfer": [
         {"name": "from", "type": "address"},
         {"name": "to", "type": "address"},
         {"name": "amount", "type": "uint256"},
         {"name": "fee", "type": "uint256"},
         {"name": "nonce", "type": "uint256"},
         {"name": "validUntil", "type": "uint256"}
       ]
     },
     "domain": {
       "name": "ProofPack L2",
       "version": "1",
       "chainId": 91562037,
       "verifyingContract": "0x5FbDB2315678afecb367f032d93F642f64180aa3"
     },
     "message": {
       "from": "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
       "to": "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
       "amount": "1000000000000000000",
       "fee": "10000000000000",
       "nonce": 0,
       "validUntil": 1793280000
     }
   }
   ```
3. **Cryptographic Signing**: The BridgeKey wallet signs the digest using standard ECDSA over `secp256k1`.
4. **Learner Benefit**: **Zero gas is paid at this point!** The signature is signed offline in the user's browser without broadcasting a costly L1 transaction.

---

### Stage 2: Mempool Ingestion & Sequencer Ordering
1. **API Ingestion**: The client dispatches `POST /v1/transactions` containing the signed payload to the Fastify API.
2. **Signature & Nonce Verification**:
   - Recovers the signer using `ecrecover(digest, signature)` and verifies that `signer === payload.from`.
   - Validates that the transaction nonce matches `expectedNonce[signer]` to prevent replay attacks and out-of-order execution.
3. **Mempool Staging**: Valid transactions enter the memory queue with status `QUEUED`.

---

### Stage 3: Binary Varint & Address Dictionary Compression
Standard EVM calldata stores 32-byte words for integers and 20 bytes for addresses, which is highly inefficient for micro-transactions. ProofPack uses a dual-compression technique:

1. **Address Dictionary Deduplication**:
   - In a batch of 64 transactions, addresses (senders, recipients) frequently repeat.
   - ProofPack extracts all unique 20-byte addresses into a dictionary header.
   - Within transaction bodies, addresses are replaced by a **1-byte dictionary index**:
     $$\text{Address Size Reduction: } 20 \text{ bytes} \longrightarrow 1 \text{ byte (95\% reduction)}$$

2. **LEB128 Variable-Length Varint Encoding**:
   - EVM 256-bit integers often have 30+ leading zero bytes (e.g., nonces, small fee amounts).
   - ProofPack encodes numbers using LEB128 Varint:
     $$\text{Nonce } 0 \longrightarrow 0x00 \text{ (1 byte instead of 32 bytes)}$$
     $$\text{Amount } 10^{18} \longrightarrow \approx 9 \text{ bytes instead of 32 bytes}$$

3. **Compression Result**:
   - Raw uncompressed JSON / ABI representation: **~160 bytes per tx**.
   - ProofPack binary compressed wire payload: **~24 bytes per tx**.
   - **Calldata byte reduction: 85.0%**.

---

### Stage 4: Keccak-256 Merkle State Commitment
1. **Leaf Hashing**:
   Each transaction $T_i$ is deterministically hashed:
   $$\text{leaf}_i = \text{keccak256}(\text{abi.encodePacked}(\text{from}, \text{to}, \text{amount}, \text{nonce}, \text{validUntil}))$$
2. **Merkle Tree Construction**:
   Leaves are paired and hashed recursively:
   $$H_{i,j} = \text{keccak256}(\text{concat}(\text{leaf}_i, \text{leaf}_j))$$
   until the 32-byte **Merkle Root** $R$ is produced.
3. **State Commitment**:
   A cryptographic commitment is generated binding sequence number, previous root, current root, and count:
   $$\text{commitment} = \text{keccak256}(\text{abi.encodePacked}(\text{batchId}, \text{prevRoot}, \text{batchRoot}, \text{txCount}))$$

---

### Stage 5: MST Blockchain L1 Settlement
1. **Single On-Chain Transaction**:
   The operator batcher worker submits ONE single transaction to `ProofPackSettlement.sol`:
   ```solidity
   settlementContract.commitBatch(
       sequenceNumber,
       txCount,
       batchRoot,
       stateCommitment,
       compressedCalldata
   );
   ```
2. **Amortization Savings**:
   - Direct execution on MST L1: $64 \times 29,000 \text{ gas} = 1,856,000 \text{ gas}$.
   - ProofPack L2 batch settlement: $21,000 \text{ (base)} + 45,000 \text{ (contract)} + 97,520 \text{ (calldata)} = 163,520 \text{ gas}$.
   - **Effective gas per user**: **2,555 gas / tx**.
   - **Total fee reduction**: **91.19% savings**.

---

## 3. UI/UX Workflow & Themes

ProofPack includes a custom frontend tailored for operators, developers, and blockchain learners.

### 🌗 Dark & Light Theme System
- Integrated via the `useTheme` hook with automatic `localStorage` persistence.
- Easily toggled via the **Sun / Moon** icon button in the header bar.
- Supported across all visual components:
  - **Light Mode**: Crisp, high-contrast palette with soft slate surfaces (`bg-slate-50`, cards `bg-white`, borders `border-slate-200`, text `text-slate-900`).
  - **Dark Mode**: Cyber-slate aesthetic with deep navy surfaces (`bg-[#0a0f1d]`, cards `bg-[#111827]`, borders `border-gray-800`, text `text-gray-100`).

### 📊 Theme Components Overview
1. **Web3Bento Control Center** (`/`):
   - **Hero Tile**: L2 Rollup Net Performance & 30-day savings throughput curve.
   - **3D Batch Stack**: Interactive visual stack of recent L2 batches with Merkle roots and compression percentages.
   - **Gas Savings Tile**: Direct MST L1 gas vs ProofPack amortized gas comparison gauge.
   - **Calldata Allocation**: Breakdown of wire-format components (Varint, Dictionary, Merkle proofs).
   - **Settlement & Mempool Tiles**: Live queue capacity and MST contract sync status.
   - **MST Node Health**: Live block height (`#6643944`), Mario RPC latency (~42ms), and PoSA block interval.
2. **L2 Learning Lab** (`/learn`):
   - Designed for learners to walk through the 5-step rollup pipeline.
   - Includes an **Interactive Batch Amortization Sandbox** with a slider (4 to 128 txs) showing live savings, Merkle tree depth, and calldata byte reduction.
3. **L2 Transaction Registry** (`/transactions` - *LeadsDataTable theme*):
   - Real-time search, status filtering (`QUEUED`, `COMMITTED`, `SETTLED`), bulk selection, CSV export, and batch priority execution.
4. **Batch Explorer** (`/batches`):
   - Detailed inspection of settled batches, Merkle roots, previous roots, and raw calldata hex published to MST L1.
5. **Cost Analytics** (`/analytics`):
   - Empirical gas savings comparison matrix and cost simulation in MSTC.
6. **Developer Portal** (`/developers` - *InteractiveLogsTable theme*):
   - Code snippets for cURL and TypeScript SDK, live event log terminal, and core API documentation.
7. **System & Network Telemetry** (`/status` - *SystemMonitor theme*):
   - Real-time CPU, mempool memory, and MST RPC latency sparklines.

---

## 4. Empirical Cost Scaling Matrix

Verified on MST EVM execution environment:

| Batch Size | Direct L1 Cost (gas) | ProofPack L2 Cost (gas) | Cost / Tx (gas) | **Net Gas Reduction** |
|:---:|:---:|:---:|:---:|:---:|
| **8** | 232,000 | 78,440 | 9,805 | **66.19%** |
| **16** | 464,000 | 94,880 | 5,930 | **79.55%** |
| **32** | 928,000 | 127,760 | 3,992 | **86.23%** |
| **64** | 1,856,000 | 163,520 | 2,555 | **91.19%** |
| **128** | 3,712,000 | 260,960 | 2,038 | **92.97%** |

---

## 5. Quick Start Instructions

### Starting Backend & Batch Worker
```powershell
npm run dev:api
```
*Listens on `http://localhost:4000`.*

### Starting Web Dashboard
```powershell
npm run dev:web
```
*Listens on `http://localhost:3000`.*

### Running Full Test Suite & Contracts
```powershell
npm run test:all
```

### Running Compression & Gas Benchmark Suite
```powershell
npm run benchmark
```


---

## 7. Complete Blockchain Explorer & Analytics Platform (Upgrade)

ProofPack features a full-fledged Layer 2 explorer combining the inspection capabilities of Etherscan, the channel routing views of Lightning network explorers, dense batch inspection, and developer telemetry.

### Implemented Sidebar Navigation & Routes

| Module Section | Page Route | Purpose & Implementation |
|---|---|---|
| **Overview** | `dashboard` | 8 Main stats cards (Volume, TPS, Batches, Proofs, Confirmation, Compression, Cost Savings, Bytes Saved) + interactive telemetry charts across 1h/24h/7d/30d |
| **Overview** | `network-statistics` | Dedicated performance page: avg/median/p95 latency percentiles, throughput peaks, bytes processed vs saved |
| **Overview** | `network-history` | Historical timeline analytics, hourly/daily aggregation switch, epoch checkpoints |
| **Explorer** | `transactions` | High-density transaction registry with filters (status, batch, address) + 5-stage lifecycle inspection modal (Overview, Timeline, Compression, Fee breakdown, Settlement, Raw JSON) |
| **Explorer** | `blocks-batches` | Dual-view separating underlying MST Blockchain blocks from ProofPack L2 aggregation batches |
| **Explorer** | `addresses` | Account balance lookup (native tMSTC via live RPC + PPC vouchers + tUSDT) + incoming/outgoing transfer ledger |
| **Explorer** | `tokens-transfers` | Token registry for MST assets (native gas, PPC vouchers, bridged ERC-20s) + transfer log |
| **ProofPack Technology** | `batch-explorer` | Binary payload inspection, address dictionary deduplication breakdown, and state commitments |
| **ProofPack Technology** | `proof-explorer` | Cryptographic Merkle tree inclusion proof auditor with real-time interactive verification tool |
| **ProofPack Technology** | `compression-analytics` | Empirical gas comparison model and interactive batch size amortization simulator |
| **ProofPack Technology** | `settlement-history` | On-chain settlement tracking on MST EVM with MSTScan explorer links |
| **Wallet** | `wallet` | BridgeKey wallet management, chain validation, and client-side EIP-712 signing interface |
| **Developer Tools** | `developer-docs` | REST API documentation, request/response schemas, and cURL commands |
| **Developer Tools** | `developer-sdk` | TypeScript SDK examples with `@proofpack/chain-adapters` and `@proofpack/crypto` |
| **Developer Tools** | `developer-webhooks` | Real-time push event subscriptions and test payload simulator |
| **Developer Tools** | `developer-usage` | API quota telemetry, rate-limit meter, and endpoint traffic distribution |
| **System** | `system-status` | Real-time service monitor (API, Worker, Prover, Queue, MST RPC latency) |
| **System** | `settings` | Network switcher, theme toggle, table density, and RPC configuration |
| **Learner Lab** | `learn` | Interactive 5-step visualizer for blockchain learners |
