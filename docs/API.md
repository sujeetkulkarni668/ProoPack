# ProofPack API Reference

## Base URL: `http://localhost:4000`

---

### `GET /health`
Returns system status, active MST RPC latency, and mempool queue size.

#### Response (200 OK):
```json
{
  "status": "ok",
  "timestamp": 1793281000,
  "mempoolQueueSize": 4,
  "mstRpc": {
    "status": "healthy",
    "latencyMs": 42,
    "blockNumber": "1528930"
  },
  "workerRunning": true
}
```

---

### `GET /config`
Returns active network parameters, target chain ID, and protocol limits.

---

### `POST /v1/transactions`
Submits an off-chain transaction authorized via EIP-712 signature.

#### Request Body:
```json
{
  "sender": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  "to": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
  "amount": "100000000000000000",
  "fee": "10000000000000",
  "nonce": 0,
  "validUntil": 1793280000,
  "signature": "0x4b706f366112d7c585d8bb63cb7386bfeb69704043b2f8a84610d65b1d9bf5b82194c5e31eb8fe3f7f89736cbb5d165f4ff94d03923de874ebf4ff8d82f763ee1b"
}
```

#### Response (202 Accepted):
```json
{
  "success": true,
  "transaction": {
    "txId": "0x89e24749f7ba3...f021",
    "sender": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    "status": "QUEUED",
    "nonce": 0
  }
}
```

---

### `GET /v1/batches`
Lists settled and pending batches.

---

### `GET /v1/analytics/costs`
Returns measured gas savings, compression ratio, and amortized cost per transaction.
