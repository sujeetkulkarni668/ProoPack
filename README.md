# ProofPack — Layer 2 Transaction Optimization Platform for MST Blockchain

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![EVM Compatible](https://img.shields.io/badge/EVM-Compatible%20(MST)-blue.svg)](https://mstblockchain.com)
[![BridgeKey](https://img.shields.io/badge/Wallet-BridgeKey%20Integrated-indigo.svg)](https://bridgekey.io)

**ProofPack** is an end-to-end Layer 2 transaction aggregation and settlement platform engineered for **MST Blockchain** (Chain ID: `4646` Mainnet, `4545` Testnet).

ProofPack addresses blockchain transaction bottlenecks by bundling, compressing, and committing micro-transactions off-chain, settling them deterministically onto MST Blockchain in verifiable batches.

---

## Key Capabilities

1. **70%–82% Fee Reduction:** Amortizes the base 21,000 gas transaction cost across up to 128 transactions per batch.
2. **Dense Binary Calldata Compression:** Features custom variable-length quantity (Varint) encoding and address dictionary deduplication, saving up to 68% in calldata data availability costs.
3. **Cryptographic Batch Verification:** Generates deterministic Merkle Trees with Keccak256 leaf inclusion proofs and batch state root commitments verified on `ProofPackSettlement.sol`.
4. **BridgeKey Wallet Integration:** First-class wallet connectivity for Masterstroke Technosoft's BridgeKey Wallet (EIP-1193 / EIP-6963), supporting EIP-712 structured zero-gas user signing.
5. **Full-Stack Developer Dashboard:** 7 responsive interface views (Overview, Transactions, Batch Explorer, Cost Analytics, Developer Portal, Network Status, Settings).
6. **Strict Monorepo Architecture:** Modular packages (`@proofpack/shared`, `@proofpack/crypto`, `@proofpack/compression`, `@proofpack/chain-adapters`, `@proofpack/batcher`, `@proofpack/api`, `@proofpack/web`).

---

## Verified MST Blockchain Parameters

| Network | Chain ID (Dec) | Native Coin | Public RPC Endpoint | Explorer |
| :--- | :--- | :--- | :--- | :--- |
| **MST Mainnet** | `4646` | MSTC | `https://mariorpc.mstblockchain.com` | [mstscan.com](https://mstscan.com) |
| **MST Testnet** | `4545` | tMSTC | `https://testnetrpc.mstblockchain.com` | [testnet.mstscan.com](https://testnet.mstscan.com) |
| **Local Devnet**| `31337`| tMSTC | `http://127.0.0.1:8545` | Local / In-memory |

---

## Monorepo Architecture

```
proofpack/
├── apps/
│   ├── api/             # Fastify REST API, transaction ingestion & rate limiting
│   ├── batcher/         # Mempool queue, scheduler, and settlement coordinator
│   └── web/             # Vite + React + Tailwind + BridgeKey Web3 Dashboard
├── contracts/
│   ├── src/             # ProofPackSettlement.sol (Solidity ^0.8.28)
│   └── test/            # Hardhat contract tests (Sequence, Replay, Merkle Proofs)
├── packages/
│   ├── shared/          # Types, schemas, constants & error definitions
│   ├── crypto/          # Merkle tree generation, EIP-712 hashing & leaf proofs
│   ├── compression/     # Varint & address dictionary binary codec
│   └── chain-adapters/  # BridgeKey wallet adapter & MST RPC client
├── docs/
│   ├── MST_COMPATIBILITY_REPORT.md  # Official MST & BridgeKey verification
│   ├── ARCHITECTURE.md              # Layer 2 aggregation architecture
│   ├── THREAT_MODEL.md              # Security model & attack mitigation
│   ├── PROTOCOL_SPEC.md             # Wire format & state commitments
│   ├── BENCHMARKS.md                # Measured gas & compression benchmarks
│   ├── API.md                       # REST API specification
│   └── LOCAL_DEVELOPMENT.md         # Setup and run guide
└── tests/
    └── benchmarks/      # Reproducible performance & cost benchmark runner
```

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Build Monorepo
```bash
npm run build
```

### 3. Run Tests
```bash
npm run test:all
```

### 4. Run Benchmarks
```bash
npm run benchmark
```

### 5. Launch Services
```bash
# Terminal 1: Backend API & Batcher Worker
npm run dev:api

# Terminal 2: Web Dashboard
npm run dev:web
```
Open [http://localhost:3000](http://localhost:3000) to view the ProofPack Dashboard.

---

## License

MIT © ProofPack Engineering Team
