# ProofPack Threat Model & Security Analysis

## 1. System Scope & Assets

ProofPack handles off-chain transaction ingestion, batching, cryptographic commitment, and Layer 2 settlement onto MST Blockchain.

### Protected Assets:
1. **User Funds & State:** Account balances and token allotments must never be seized, double-spent, or transferred without valid cryptographic authorization.
2. **Transaction Ordering & Execution:** Nonce sequencing must be strictly preserved; transactions cannot be skipped, front-run, or replayed.
3. **Operator Settlement Keys:** Private keys used by the ProofPack Sequencer to submit batches to MST Blockchain.
4. **Data Availability:** Sufficient transaction data must be published with batch commitments to allow state reconstruction.

---

## 2. Threat Vectors & Mitigations

| Threat Vector | Description | ProofPack Mitigation |
| :--- | :--- | :--- |
| **Signature Forgery** | Attacker crafts a transfer payload with a fake signature. | Strict EIP-712 structured typed data validation (`secp256k1` ecrecover). Domain separator binds to MST chain ID (4646 / 4545) and contract address. |
| **Replay Across Chains** | An authorized signature from MST Testnet is replayed on MST Mainnet. | EIP-712 domain separator includes explicit `chainId`. Cross-chain replay causes signature verification failure. |
| **Nonce Desynchronization & Double Spending** | Attacker submits concurrent transactions with identical or out-of-order nonces. | Sequential nonce validation enforced atomically in transaction processing database. Rejects nonces $\neq$ expected sender nonce. |
| **Batch Ordering Tampering** | Malicious actor attempts to inject or reorder transactions inside a settled batch. | Deterministic Merkle tree roots committed on MST L1 contract. Contract checks monotonic `batchId == nextBatchId` and stores immutable `batchRoot`. |
| **Data Withholding** | Sequencer posts batch commitment hash without releasing compressed transaction data. | The `settleBatch` method publishes `bytes calldata compressedData` on-chain directly to MST L1, ensuring EVM-level Data Availability. |
| **Operator Key Compromise** | Compromise of the sequencer private key used to sign `settleBatch` transactions. | Multi-role access control (`DEFAULT_ADMIN_ROLE`, `OPERATOR_ROLE`, `PAUSER_ROLE`) using OpenZeppelin AccessControl. Emergency pause function halts settlement immediately. |
| **Denial of Service (DoS)** | Flooding the API with invalid transactions to exhaust memory or block workers. | Input schema validation via Zod, rate limiting per IP / account, maximum payload bounds (max 128 txs / 64KB per batch), bounded worker retries. |
| **Reentrancy & Contract Exploits** | Malicious reentrant calls during batch settlement. | No external calls made to untrusted contracts during batch commitment. Explicit checks-effects-interactions pattern. |
| **Wallet Phishing / Blind Signing** | User tricked into signing arbitrary transactions. | BridgeKey wallet integration enforces transparent EIP-712 display with recipient address, amount in MSTC, fee, and nonce explicitly visible before approval. |

---

## 3. Operational Security & Incident Response

1. **Emergency Pause:** `ProofPackSettlement.sol` includes `pause()` which disables batch settlement.
2. **Key Rotation:** Operator keys can be revoked and reassigned by the multi-sig admin role without upgrading the contract.
3. **Graceful Degeneracy:** If the batcher is temporarily offline, pending transactions remain durable in the database queue without loss of funds.
