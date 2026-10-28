# ProofPack Architecture Specification

## 1. System Overview

ProofPack is an off-chain transaction aggregation and Layer 2 settlement platform engineered for high-throughput, low-cost transaction processing on the **MST Blockchain** (Chain ID: 4646 / 4545).

```
                      +---------------------------------------+
                      |           Client Interfaces           |
                      |  - Web Dashboard (Vite/React/Tailwind)|
                      |  - BridgeKey Wallet / Injected Web3   |
                      |  - Developer REST / WebSocket API     |
                      +-------------------+-------------------+
                                          | (EIP-712 Signed Tx)
                                          v
                      +---------------------------------------+
                      |          ProofPack API Gateway        |
                      |  - Authentication & Rate Limiting     |
                      |  - Nonce & Signature Verification    |
                      |  - Idempotency & Lifecycle Tracking   |
                      +-------------------+-------------------+
                                          |
                                          v
                      +---------------------------------------+
                      |       Batcher & Compression Engine    |
                      |  - Transaction Ingestion Queue        |
                      |  - Deterministic Batch Ordering       |
                      |  - Binary Bit-Packed Compression      |
                      |  - Merkle Batch Tree Commitment Gen   |
                      +-------------------+-------------------+
                                          |
                                          v
                      +---------------------------------------+
                      |         Settlement Coordinator        |
                      |  - Batch State Transition Validation  |
                      |  - Gas Cost Optimization              |
                      |  - L1 Submission Worker               |
                      +-------------------+-------------------+
                                          |
                                          v
                      +---------------------------------------+
                      |    MST Blockchain (EVM Settlement)    |
                      |  - ProofPackSettlement.sol            |
                      |  - Batch Commitment Registry          |
                      |  - Replay Protection & Sequence Nonce |
                      |  - Event Emission for Finality        |
                      +---------------------------------------+
```

---

## 2. Component Architecture

### A. Client & Wallet Tier
- **Frontend Dashboard:** Modern, developer-focused interface displaying live batch analytics, gas savings vs direct L1 submission, transaction explorer, and operator controls.
- **BridgeKey Connector (`packages/chain-adapters`):** Native adapter for Masterstroke Technosoft's BridgeKey Wallet using standard EIP-1193 and EIP-6963 provider interfaces. Supports automatic network detection, switching to MST Testnet (4545) or Mainnet (4646), and EIP-712 typed signing for zero-gas user transactions.

### B. Ingestion & Validation Engine (`apps/api` & `apps/batcher`)
- **Signature Validation:** Recovers signer address from EIP-712 typed data (`Transfer(address to, uint256 amount, uint256 fee, uint256 nonce, uint256 chainId)`).
- **Nonce Manager:** Ensures sequential transaction execution per user account, rejecting replay attacks and unordered requests.
- **Idempotency Guard:** Deterministic calculation of transaction ID (`keccak256(sender || nonce || to || amount || chainId)`).

### C. Compression Engine (`packages/compression`)
- Standard EVM transactions consume 21,000 gas base + ~112 bytes of calldata (at 16 gas per non-zero byte).
- ProofPack packs batched transactions into a compact binary format:
  - Account index dictionary (amortizing 20-byte addresses down to 2-byte indices).
  - Variable-length integer encoding (Varint) for amounts and fees.
  - Byte-aligned sequence headers.
- Achieves over 60% compression ratio compared to raw JSON or ABI-encoded calldata.

### D. Cryptographic Commitment (`packages/crypto`)
- Constructs a deterministic binary Merkle Tree over all transactions in a batch.
- Computes `batchRoot = MerkleRoot(tx_0, tx_1, ..., tx_N)`.
- Combines `batchRoot` with `previousBatchRoot`, `batchId`, `txCount`, and `totalFee` to form the batch commitment hash.

### E. Settlement Contract (`contracts/ProofPackSettlement.sol`)
- Deployed on MST Blockchain.
- Maintained by authorized Operator / Sequencer addresses with multi-sig or timelock capabilities.
- Stores sequential batch commitments and tracks state roots.
- Validates batch sequence numbers, preventing reorg or replay vulnerabilities.
- Emits `BatchSettled(uint256 indexed batchId, bytes32 indexed batchRoot, uint32 txCount, uint256 settledBlock)`.

---

## 3. Data Flow & Transaction Lifecycle

1. **SUBMITTED**: User signs EIP-712 transfer via BridgeKey Wallet and submits to API.
2. **VALIDATED**: API validates signature, chain ID (4646 / 4545 / 31337), nonce, and sender balance.
3. **QUEUED**: Transaction is buffered in the mempool queue awaiting batch construction.
4. **BATCHED**: Batch builder collects up to $N$ transactions (or timeout $T_{max}$ expires), orders them deterministically, and serializes into compressed payload.
5. **COMMITTED**: Merkle tree is computed, producing `batchRoot` and cryptographic commitment.
6. **SETTLING**: Worker submits `settleBatch(batchId, batchRoot, txCount, compressedPayload)` to `ProofPackSettlement.sol` on MST Blockchain.
7. **SETTLED**: Transaction receipt confirmed on MST L1. Status updated with MST block number and transaction hash.
