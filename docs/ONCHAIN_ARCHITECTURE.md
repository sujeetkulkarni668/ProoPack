# ProofPack On-Chain Architecture & Settlement Specification

This document specifies the smart contract architecture, state commitment proofs, and data availability mechanisms implemented by ProofPack on the **MST Blockchain** (targeting MST Coral Testnet `54635` and MST Mainnet `4646`).

---

## 1. Settlement Contract (`ProofPackSettlement.sol`)

The on-chain anchor of the ProofPack protocol is the `ProofPackSettlement` smart contract, deployed on the MST EVM.

### Key Responsibilities:
1. **Operator Authorization:** Only the designated operator or contract owner can submit batch settlements (`onlyOperator` modifier).
2. **State Root Storage:** Stores chronological batch commitments:
   - `batchId`: Incremental batch identifier.
   - `batchRoot`: 32-byte cryptographic Merkle root of all aggregated transactions.
   - `txCount`: Number of transactions included in the batch.
   - `compressedSize`: Byte count of serialized LEB128 payload.
   - `settledAt`: Block timestamp when committed to MST L1.
3. **Event Emission:** Emits `BatchSettled(...)` indexed by batch ID and root for real-time tracking by indexers and explorers.
4. **On-Chain Merkle Proof Verification:** Exposes `verifyMerkleProof(...)` for zero-knowledge transaction inclusion proofs:
   ```solidity
   function verifyMerkleProof(
       bytes32 root,
       bytes32 leaf,
       bytes32[] calldata proof,
       uint256 index
   ) external pure returns (bool);
   ```

---

## 2. Gas Optimization Mechanism

Direct execution of 64 transactions on L1 consumes:
$$64 \times 21,000 = 1,344,000 \text{ base gas}$$
Plus variable EVM execution and signature recovery costs (~1.8M gas).

By aggregating transactions into a single ProofPack batch:
- **Base Gas:** Shared across all 64 transfers (21,000 gas total).
- **Signature Verifications:** Executed off-chain by the sequencer.
- **On-Chain Footprint:** Only the 32-byte Merkle root and compressed calldata are stored.
- **Net Cost:** ~66,000 gas for the entire batch.
- **Effective Cost Per Transaction:** ~1,031 gas (>94% reduction).

---

## 3. Network Binding & Replay Protection

All off-chain EIP-712 transfer signatures cryptographically bind to:
- `chainId`: `54635` (MST Coral Testnet) or `4646` (MST Mainnet)
- `verifyingContract`: Target deployment address of `ProofPackSettlement.sol`
- `nonce`: Sequential user account nonce preventing double-execution

Cross-network replay attacks between Coral Testnet, legacy testnets, and Mainnet are strictly impossible.
