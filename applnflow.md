# ProofPack Application Flow & Gas Optimization Mechanics

This document explains the division of responsibilities between the **User** and the **Server** in ProofPack, and how transaction gas fees are reduced by over 91% to 95% on the **MST Blockchain** (Chain ID: `91562037` Coral Testnet, `4646` Mainnet).

---

## 1. What the User Does (Zero Gas)

When a user initiates a transaction in the ProofPack application:

1. **No Direct L1 Broadcast:** Their wallet (e.g., **BridgeKey**) does **not** broadcast a transaction to the MST Blockchain.
2. **Off-Chain Cryptographic Signature:** Instead, the wallet only creates an off-chain **EIP-712** typed structured data signature.
3. **Zero Gas Cost for Signing:** Signing an off-chain message costs **0 gas**. The user does not interact with the blockchain network directly at that moment.
4. **Mempool Ingestion via HTTP:** The user's browser sends this signed data payload to your server via HTTP (`POST /v1/transactions`).
5. **Agreed Micro-Fee:** Inside the message, the user agrees to pay a tiny micro-fee (e.g., `0.0001 MSTC`) to your server for aggregating and settling it.

---

## 2. What Your Server Does (The Optimization Engine)

Your server collects transactions from multiple users into an in-memory queue (the L2 mempool). When it reaches a threshold (e.g., 64 transactions) or a timer expires (e.g., 3 seconds):

1. **Deduplication:** Repeated sender and recipient addresses are placed into an **Address Dictionary** so a 20-byte address is stored only once, referenced by a 1-byte index.
2. **Binary Compression:** Numbers like amounts, nonces, and fees are encoded using **LEB128 Varints** (reducing 32-byte EVM words down to 1–3 bytes).
3. **Cryptographic Commitment:** All 64 transactions are hashed into a single 32-byte **Merkle Root**.
4. **Single Settlement:** Your server sends **ONE single transaction** to the `ProofPackSettlement.sol` contract on MST Blockchain containing the Merkle root and the compressed bytes.

> **Note:** Your server pays the on-chain gas for that single batch transaction using its operator wallet.

---

## 3. The Math: Why Gas Decreases by >91%

| Metric | Without ProofPack (Direct L1) | With ProofPack (L2 Server Batching) |
|---|---|---|
| **Transactions Sent to L1** | 64 separate transactions | **1 single batch transaction** |
| **Base Gas (21,000 each)** | $64 \times 21,000 = 1,344,000$ gas | **21,000 gas** (shared by all 64 users) |
| **EVM Signature Verifications** | 64 on-chain `ecrecover` checks | **0 on-chain checks** (verified off-chain by server; secured by Merkle root) |
| **State Storage Writes** | 64 separate contract writes | **1 contract write** (only the 32-byte Merkle root) |
| **Total Gas Consumed** | **~1,856,000 gas** | **~66,000 gas** |
| **Effective Cost Per User** | **~29,000 gas** | **~1,031 gas** |
| **Net Savings** | 0% | **94.4% Gas Reduction** |

---

## 4. Summary: How Roles Are Divided

### For the User:
- They get instant transaction confirmation (in ~84 ms).
- They never have to calculate gas limits or pay high L1 priority fees.
- They pay only a tiny off-chain micro-fee in `MSTC` or synthetic vouchers (`PPC`).

### For Your Server:
- It acts as the **Sequencer & Batcher**.
- It buffers, orders, and compresses transactions.
- It pays the single L1 batch fee on MST Blockchain.
- It collects the micro-fees from all transactions in that batch to cover the gas cost, keeping any remainder as operator profit.
