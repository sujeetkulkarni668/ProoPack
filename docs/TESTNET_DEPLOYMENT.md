# MST Coral Testnet Deployment Guide

This guide details the deployment of ProofPack's settlement contract and off-chain batching engine to the official **MST Coral Testnet** (Chain ID `54635`, `0xd56b`).

---

## 1. Network Configuration

- **Network Name:** MST Coral Testnet
- **Chain ID:** `54635` (Hex: `0xd56b`)
- **Native Currency:** `tMSTC` (18 decimals)
- **RPC Endpoint:** `https://coralrpc.mstblockchain.com`
- **Block Explorer:** `https://coral.mstscan.com` (and `https://testnet.mstscan.com`)
- **Faucet:** `https://coral-faucet.mstblockchain.com/`

> [!WARNING]
> Legacy testnet networks with Chain IDs `91562037` and `4545` are deprecated and scheduled for decommissioning on January 31, 2027. Do NOT deploy new contracts to legacy endpoints.

---

## 2. Prerequisites

1. **Testnet Gas Tokens (tMSTC):**
   Claim free testnet tokens from the Coral faucet:
   https://coral-faucet.mstblockchain.com/
2. **Operator Private Key:**
   Configure a funded private key in your server environment (`OPERATOR_PRIVATE_KEY`).

---

## 3. Deployment Procedure

### Step 1: Pre-Flight Runtime Verification
Verify that the configured RPC endpoint is operational and confirms Chain ID `54635`:

```bash
curl -X POST https://coralrpc.mstblockchain.com \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
```

Expected Response:
```json
{"jsonrpc":"2.0","id":1,"result":"0xd56b"}
```

### Step 2: Compile Contracts
```bash
npm --workspace=contracts run compile
```

### Step 3: Run Automated Contract Suite
```bash
npm run test:contracts
```

### Step 4: Deploy `ProofPackSettlement.sol` to Coral Testnet
```bash
npx hardhat run contracts/scripts/deploy.ts --network mstCoralTestnet
```

---

## 4. Environment Configuration (`.env`)

Configure the resulting deployed contract in your `.env` file:

```dotenv
APP_MODE=testnet

MST_NETWORK_NAME=MST Coral Testnet
MST_CHAIN_ID=54635
MST_CHAIN_ID_HEX=0xd56b
MST_CURRENCY_SYMBOL=tMSTC
MST_RPC_URL=https://coralrpc.mstblockchain.com
MST_EXPLORER_URL=https://coral.mstscan.com
MST_EXPLORER_API_URL=https://coral.mstscan.com/api/v2

PROOFPACK_SETTLEMENT_CONTRACT_ADDRESS=<deployed-contract-address>
OPERATOR_PRIVATE_KEY=<operator-private-key>
```

---

## 5. Verification on MSTScan Explorer

Once deployed:
1. Open https://coral.mstscan.com/address/<deployed-contract-address>
2. Confirm contract bytecode and creator transaction.
3. Observe `BatchSettled` events as ProofPack batches are committed.
