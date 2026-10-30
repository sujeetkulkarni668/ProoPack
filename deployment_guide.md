# ProofPack — End-to-End Production & Testnet Deployment Guide

This guide provides the complete, step-by-step instructions for deploying all tiers of the **ProofPack** Layer 2 platform: the on-chain settlement smart contracts, the off-chain batching and indexing backend, and the interactive web explorer.

---

## 1. Network Targets & Prerequisites

### Target 1: MST Coral Testnet (Official Testnet Target)
- **Network Name:** MST Coral Testnet
- **Chain ID (Decimal):** `54635`
- **Chain ID (Hexadecimal):** `0xd56b`
- **Native Currency:** `tMSTC` (18 decimals)
- **RPC Endpoint:** `https://coralrpc.mstblockchain.com`
- **Block Explorer:** [https://coral.mstscan.com](https://coral.mstscan.com) (also [https://testnet.mstscan.com](https://testnet.mstscan.com))
- **Faucet (Free tMSTC):** [https://coral-faucet.mstblockchain.com/](https://coral-faucet.mstblockchain.com/)
- **Node List / Chainlist:** [https://cryptotools.vip/chainlist/mst-coral-testnet-54635](https://cryptotools.vip/chainlist/mst-coral-testnet-54635)

> [!WARNING]
> **Legacy Testnet Deprecation:** Legacy testnet chain IDs `91562037` and `4545` are deprecated and scheduled for complete shutdown on **January 31, 2027**. All new contracts and services must target Coral Testnet (`54635`).

### Target 2: MST Mainnet (Production L1 Reference)
- **Network Name:** MST Mainnet
- **Chain ID (Decimal):** `4646`
- **Chain ID (Hexadecimal):** `0x1226`
- **Native Currency:** `MSTC` (18 decimals)
- **RPC Endpoint:** `https://mariorpc.mstblockchain.com/` (Backup: `https://craftrpc.mstblockchain.com/`)
- **Block Explorer:** [https://mstscan.com](https://mstscan.com)
- **Mainnet Tokens Distribution:** [https://mstblockchain.com/contact/](https://mstblockchain.com/contact/)
- **Chainlist Entry:** [https://chainlist.org/chain/4646](https://chainlist.org/chain/4646)

### System Requirements
- **Node.js:** v18.18.0 or v20+ LTS
- **Package Manager:** `npm` v9+ (with npm workspaces support)
- **Git:** v2.30+
- **Wallet Extension:** [BridgeKey Wallet](https://bridgekey.io/) or any EIP-1193 EVM browser extension

---

## 2. Environment Setup & Configuration

Clone the repository and install all monorepo dependencies:

```bash
git clone https://github.com/sujeetkulkarni668/ProoPack.git
cd ProoPack
npm install
```

Create your production or testnet environment file:

```bash
cp .env.example .env
```

Edit `.env` with your deployment variables:

```dotenv
# Port Configuration
PORT=4000
VITE_API_URL=http://localhost:4000

# Application Target Network (testnet | mainnet | local)
APP_MODE=testnet

# MST Coral Testnet Parameters
MST_NETWORK_NAME=MST Coral Testnet
MST_CHAIN_ID=54635
MST_CHAIN_ID_HEX=0xd56b
MST_CURRENCY_SYMBOL=tMSTC
MST_RPC_URL=https://coralrpc.mstblockchain.com
MST_EXPLORER_URL=https://coral.mstscan.com
MST_EXPLORER_API_URL=https://coral.mstscan.com/api/v2

# Operator Private Key (Used to submit batch commitments to MST L1)
# 1. Fund this address with tMSTC from https://coral-faucet.mstblockchain.com/
# 2. Never commit actual private keys to Git!
OPERATOR_PRIVATE_KEY=0x...your_funded_private_key...

# Contract Address (Will be populated after Step 3)
MST_SETTLEMENT_CONTRACT=0x...

# Batching Engine Parameters
MAX_BATCH_SIZE=64
MAX_BATCH_WAIT_MS=5000
MIN_BATCH_SIZE=2
ENABLE_MOCK_DATA=false
```

---

## 3. Smart Contract Deployment (`ProofPackSettlement.sol`)

### Step 3.1: Pre-Deployment Runtime Verification
Test that your operator wallet has a non-zero balance on Coral Testnet:

```bash
curl -X POST https://coralrpc.mstblockchain.com \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_getBalance","params":["0xYOUR_OPERATOR_ADDRESS","latest"],"id":1}'
```

### Step 3.2: Compile Contracts
```bash
npm --workspace=contracts run compile
```

### Step 3.3: Run Unit & Integration Tests
Verify that all cryptographic Merkle proof checks pass:
```bash
npm run test:contracts
```

### Step 3.4: Deploy to MST Coral Testnet
Execute the Hardhat deployment script targeting `mstCoralTestnet`:

```bash
npx hardhat run contracts/scripts/deploy.ts --network mstCoralTestnet
```

*Sample Deployment Output:*
```
Deploying ProofPackSettlement to MST Coral Testnet (Chain ID: 54635)...
Deployer Account: 0x98A1B... (Balance: 2.45 tMSTC)
Transaction Hash: 0x8a9c...
ProofPackSettlement deployed to: 0x7bB2594aD3aA12e2bF44e99DbF15c9A0D7c640F8
Setting authorized operator: 0x98A1B...
Deployment successful!
```

Copy the deployed contract address into your `.env` file under `MST_SETTLEMENT_CONTRACT`.

---

## 4. Building the Entire Monorepo

Compile all TypeScript packages and the Vite production web bundle:

```bash
npm run build
```

This compiles:
1. `@proofpack/shared` (Constants, types, error codes)
2. `@proofpack/crypto` (Keccak256 Merkle trees, EIP-712 typed signing)
3. `@proofpack/compression` (LEB128 Varint encoding, address dictionary)
4. `@proofpack/chain-adapters` (BridgeKey wallet adapter, EIP-6963 discovery)
5. `@proofpack/batcher` (L2 transaction queue, batch builder, settler worker)
6. `@proofpack/api` (Fastify REST API & real-time Blockscout sync)
7. `@proofpack/web` (React 18 + Tailwind CSS + 21st.dev Mint Signal UI)

---

## 5. Starting Backend Services in Production

### Option A: Using PM2 (Recommended for Linux/Cloud VMs)
Install PM2 globally:
```bash
npm install -g pm2
```

Start the API and Sequencer Worker:
```bash
pm2 start apps/api/dist/server.js --name "proofpack-api"
pm2 save
pm2 startup
```

### Option B: Systemd Service (`/etc/systemd/system/proofpack.service`)
```ini
[Unit]
Description=ProofPack L2 API and Sequencer Service
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/opt/proofpack
EnvironmentFile=/opt/proofpack/.env
ExecStart=/usr/bin/node apps/api/dist/server.js
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Enable and start the service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable proofpack
sudo systemctl start proofpack
```

---

## 6. Frontend Web Deployment

The frontend build artifact is generated at `apps/web/dist/`.

### Deploy to Vercel:
```bash
npm install -g vercel
vercel --cwd apps/web/dist
```

### Deploy via Nginx:
```nginx
server {
    listen 80;
    server_name explorer.proofpack.io;

    root /opt/proofpack/apps/web/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /v1/ {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 7. Post-Deployment Verification Checklist

| Test Item | Verification Command | Expected Outcome |
| :--- | :--- | :--- |
| **API Health** | `curl -s http://localhost:4000/health` | `{"status":"ok","workerRunning":true}` |
| **Testnet RPC Sync** | `curl -s http://localhost:4000/v1/testnet/status` | `{"status":"healthy","chainId":54635,"verified":true}` |
| **Testnet Tx Stream** | `curl -s http://localhost:4000/v1/testnet/transactions?limit=1` | Returns verified transaction from `coral.mstscan.com` |
| **Mainnet RPC Sync** | `curl -s http://localhost:4000/v1/mainnet/status` | `{"status":"healthy","chainId":4646,"verified":true}` |
| **BridgeKey Wallet** | Open UI -> Click "Connect Wallet" | BridgeKey popup prompts connection without errors |
| **Zero-Gas Signing** | Open UI -> "Send L2 Transfer" -> Submit | Generates valid EIP-712 signature at 0 gas cost |
| **Batch Commitment** | Flush batch -> Check Coral Explorer | `BatchSettled` event visible on `coral.mstscan.com` |

---

## 8. Rollback & Emergency Procedures

1. **Pausing Batch Submissions:**
   If the on-chain RPC experiences heavy network reorganizations, set `ENABLE_WORKER=false` in `.env` and restart the backend. Transactions will continue accumulating safely in the mempool without being broadcast.
2. **Key Rotation:**
   The `ProofPackSettlement` contract supports `setOperator(newOperator)` by the contract owner. If an operator private key is ever exposed, call `setOperator` immediately from a secure cold wallet.
