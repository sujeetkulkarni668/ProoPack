# Local Development Guide — ProofPack

## Prerequisites

- **Node.js**: v20+ or v22+ (`node -v`)
- **npm**: v10+ (`npm -v`)
- **Docker & Docker Compose** (Optional, for persistent PostgreSQL and Redis)

---

## 1. Quickstart

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Build All Monorepo Packages
```bash
npm run build
```

### Step 3: Run Contract & Core Engine Tests
```bash
npm run test:all
```

### Step 4: Run Empirical Benchmarks
```bash
npm run benchmark
```

---

## 2. Running Local Services

### Start the ProofPack L2 API & Ingestion Engine:
```bash
npm run dev:api
```
The Fastify server starts on `http://localhost:4000`.

### Start the Frontend Web Dashboard:
```bash
npm run dev:web
```
The Vite development server starts on `http://localhost:3000`.

---

## 3. Connecting BridgeKey Wallet

1. Install the official **BridgeKey Wallet** browser extension from [bridgekey.io](https://bridgekey.io).
2. Open the ProofPack Dashboard at `http://localhost:3000`.
3. Click **Connect Wallet** in the top-right corner.
4. Select **BridgeKey Wallet**.
5. Approve the connection. ProofPack automatically detects whether your wallet is on MST Mainnet (4646), MST Coral Testnet (91562037), or prompts you to switch.
6. Click **Submit L2 Tx** to compose and sign a gasless EIP-712 transaction!
