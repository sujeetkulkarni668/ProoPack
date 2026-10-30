# ProofPack — Layer 2 Transaction Optimization Platform for MST Blockchain

<p align="center">
  <a href="https://coral.mstscan.com/address/0x8bdc4026a90297bf225761923488a34d0073c8e4"><img src="https://img.shields.io/badge/On--Chain%20Contract-Coral%20Testnet%20(54635)-00F5A0?style=for-the-badge&logo=solidity&logoColor=black" alt="On-Chain Contract" height="28" /></a>
  &nbsp;
  <a href="https://proofpack-peach.vercel.app/"><img src="https://img.shields.io/badge/Live%20Demo-Vercel%20Production-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo" height="28" /></a>
  &nbsp;
  <a href="VID_WEBSCAN.mp4"><img src="https://img.shields.io/badge/Demo%20Video-VID__WEBSCAN.mp4-E50914?style=for-the-badge&logo=youtube&logoColor=white" alt="Demo Video" height="28" /></a>
  &nbsp;
  <a href="https://bridgekey.io"><img src="https://img.shields.io/badge/Wallet-BridgeKey%20EIP--712-4F46E5?style=for-the-badge&logo=walletconnect&logoColor=white" alt="BridgeKey Wallet" height="28" /></a>
  &nbsp;
  <a href="https://mstblockchain.com"><img src="https://img.shields.io/badge/EVM-MST%20Blockchain-0284C7?style=for-the-badge&logo=ethereum&logoColor=white" alt="MST Blockchain" height="28" /></a>
  &nbsp;
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-059669?style=for-the-badge" alt="License: MIT" height="28" /></a>
</p>

**ProofPack** is an end-to-end Layer 2 transaction aggregation and settlement platform engineered for **MST Blockchain** (Chain ID: `4646` Mainnet, `54635` Coral Testnet).

ProofPack addresses blockchain transaction bottlenecks by bundling, compressing, and committing micro-transactions off-chain, settling them deterministically onto MST Blockchain in verifiable batches.

---

## 🌐 Project Links & On-Chain Deployment

| Resource | Link | Description |
|---|---|---|
| 🎥 **Demo Walkthrough Video** | [`VID_WEBSCAN.mp4`](VID_WEBSCAN.mp4) | Comprehensive video demonstration of ProofPack & MST integration |
| 🚀 **Live Web Application** | [proofpack-peach.vercel.app](https://proofpack-peach.vercel.app/) | Production Layer 2 Explorer & BridgeKey Interface |
| 📜 **Deployed Smart Contract** | [`0x8bdc...c8e4` on Coral Explorer](https://coral.mstscan.com/address/0x8bdc4026a90297bf225761923488a34d0073c8e4) | `ProofPackSettlement.sol` on MST Coral Testnet |
| 🔗 **Deployment Transaction** | [`0x8d23...d9b1` on Explorer](https://coral.mstscan.com/tx/0x8d23f4bc2fdabd81fc7fab6a18e3c51e2198920d7379ac92a5d9445dd530d9b1) | Confirmed in block `405557` (873,085 gas) |
| 💻 **GitHub Repository** | [github.com/sujeetkulkarni668/ProoPack](https://github.com/sujeetkulkarni668/ProoPack) | Full Monorepo Source Code (MIT Licensed) |
| 🚰 **MST Coral Testnet Faucet** | [coral-faucet.mstblockchain.com](https://coral-faucet.mstblockchain.com/) | Official Faucet for `tMSTC` Gas Tokens |
| 🔍 **MST Coral Block Explorer** | [coral.mstscan.com](https://coral.mstscan.com) | Official Coral Testnet Blockscout v2 Explorer |
| 🏛️ **MST Mainnet Explorer** | [mstscan.com](https://mstscan.com) | MST Blockchain L1 Mainnet Explorer |
| 🔑 **BridgeKey Wallet** | [bridgekey.io](https://bridgekey.io) | Official MST Ecosystem Web3 Wallet |
| 📚 **MST Chainlist (54635)** | [cryptotools.vip/chainlist/mst-coral-testnet-54635](https://cryptotools.vip/chainlist/mst-coral-testnet-54635) | RPC and Network Configuration Metadata |

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

| Network | Chain ID (Dec) | Native Coin | Public RPC Endpoint | Explorer & Faucets | Chainlist |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **MST Mainnet** | `4646` | MSTC | `https://mariorpc.mstblockchain.com`<br>`https://craftrpc.mstblockchain.com` | [mstscan.com](https://mstscan.com)<br>[Request Tokens](https://mstblockchain.com/contact/) | [chainlist.org/chain/4646](https://chainlist.org/chain/4646) |
| **MST Coral Testnet** | `54635` | tMSTC | `https://coralrpc.mstblockchain.com` | [coral.mstscan.com](https://coral.mstscan.com)<br>[Coral Faucet](https://coral-faucet.mstblockchain.com/) | [cryptotools.vip/chainlist/mst-coral-testnet-54635](https://cryptotools.vip/chainlist/mst-coral-testnet-54635) |
| **Local Devnet**| `31337`| tMSTC | `http://127.0.0.1:8545` | Local / In-memory | N/A |

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
│   ├── ARCHITECTURE.md              # Layer 2 aggregation architecture
│   ├── DEPLOYMENT_GUIDE.md          # Live production & on-chain rollout guide
│   ├── OVERVIEW.md                  # Comprehensive architectural and system overview
│   ├── APPLNFLOW.md                 # User zero-gas flow & sequencer responsibilities
│   ├── WORKFLOW.md                  # Protocol state machine & data lifecycle
│   ├── TODO.md                      # Production release roadmap & readiness audit
│   ├── MST_COMPATIBILITY_REPORT.md  # Official MST & BridgeKey verification
│   ├── THREAT_MODEL.md              # Security model & attack mitigation
│   ├── PROTOCOL_SPEC.md             # Wire format & state commitments
│   ├── BENCHMARKS.md                # Measured gas & compression benchmarks
│   ├── API.md                       # REST API specification
│   ├── LOCAL_DEVELOPMENT.md         # Setup and run guide
│   └── LOG.md                       # Complete engineering trajectory log
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
