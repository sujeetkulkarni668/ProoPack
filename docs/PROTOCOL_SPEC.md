# ProofPack Protocol Specification (v1.0)

## 1. EIP-712 Transaction Schema

ProofPack transactions are structured data objects signed by user wallets (e.g., BridgeKey Wallet) without requiring on-chain gas from the user at signing time:

### Domain Separator:
```json
{
  "name": "ProofPack L2",
  "version": "1.0",
  "chainId": 4646,
  "verifyingContract": "0xProofPackSettlementAddress"
}
```

### Type Definition:
```solidity
struct Transfer {
    address sender;
    address to;
    uint256 amount;
    uint256 fee;
    uint256 nonce;
    uint256 validUntil;
}
```

### Deterministic Transaction Hash ($TxID$):
$$TxID = \text{keccak256}(\text{abi.encodePacked}(chainId, sender, to, amount, fee, nonce, validUntil))$$

---

## 2. Compressed Binary Batch Wire Format

To minimize data publication costs on MST Blockchain, ProofPack packs transactions into a dense binary representation before submitting as calldata:

```
+-----------------------------------------------------------------------+
|                         BATCH HEADER (16 bytes)                       |
|  - Magic (2 bytes): 0x5050 ("PP")                                     |
|  - Version (1 byte): 0x01                                             |
|  - Batch ID (4 bytes): uint32 BE                                      |
|  - Transaction Count (2 bytes): uint16 BE                             |
|  - Dictionary Size (2 bytes): uint16 BE                               |
|  - Reserved / Flags (5 bytes)                                         |
+-----------------------------------------------------------------------+
|                   ADDRESS DICTIONARY (Variable Size)                  |
|  - Array of unique 20-byte addresses: [Addr_0, Addr_1, ..., Addr_K]   |
|  - Size = K * 20 bytes                                                |
+-----------------------------------------------------------------------+
|                TRANSACTION RECORDS (Variable Lengths)                 |
|  For each transaction i in [0..N-1]:                                  |
|    - Sender Index (uint16 BE): Index into Address Dictionary          |
|    - Recipient Index (uint16 BE): Index into Address Dictionary       |
|    - Nonce (Varint): Compact unsigned variable-length integer         |
|    - Amount (Varint): Compact unsigned amount in wei / sub-units       |
|    - Fee (Varint): Compact fee paid to batcher                        |
|    - Signature Compact (65 bytes): r (32) + s (32) + v (1)            |
+-----------------------------------------------------------------------+
```

### Varint Encoding Algorithm:
Values are encoded in 7-bit chunks with the most significant bit (MSB) indicating if further bytes follow:
- `0x00` - `0x7F` (0 to 127) $\rightarrow$ 1 byte.
- `0x80` - `0x3FFF` (128 to 16,383) $\rightarrow$ 2 bytes.
- Standard Ethereum amounts with repeating zeroes are optionally scaled by $10^{12}$ or $10^{15}$ decimals to reduce Varint size to 2-4 bytes.

---

## 3. Merkle Commitment Engine

Each batch commits to an ordered cryptographic Merkle Tree:

1. **Leaf Hash Computation:**
   $$\text{Leaf}_i = \text{keccak256}(\text{abi.encodePacked}(TxID_i, \text{sender}_i, \text{to}_i, \text{amount}_i, \text{nonce}_i))$$
2. **Tree Aggregation:**
   - Leaves are paired: $\text{Node}_{parent} = \text{keccak256}(\text{Left} \parallel \text{Right})$.
   - If odd number of leaves, the final leaf is duplicated to balance the pair.
3. **Batch Root:**
   $$\text{BatchRoot} = \text{Root of Merkle Tree}$$
4. **State Transition Commitment:**
   $$\text{Commitment} = \text{keccak256}(\text{abi.encodePacked}(\text{batchId}, \text{prevBatchRoot}, \text{batchRoot}, \text{txCount}))$$

---

## 4. On-Chain Settlement Interface

```solidity
interface IProofPackSettlement {
    event BatchSettled(
        uint256 indexed batchId,
        bytes32 indexed batchRoot,
        bytes32 stateCommitment,
        uint32 txCount,
        uint256 timestamp
    );

    function settleBatch(
        uint32 batchId,
        bytes32 prevBatchRoot,
        bytes32 batchRoot,
        uint32 txCount,
        bytes calldata compressedPayload
    ) external;

    function verifyTransactionInBatch(
        uint32 batchId,
        bytes32 txHash,
        bytes32[] calldata merkleProof,
        uint256 leafIndex
    ) external view returns (bool);
}
```
