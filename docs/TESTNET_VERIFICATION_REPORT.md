# MST Coral Testnet Verification Report

**Verification Timestamp:** October 2026  
**Target Network:** MST Coral Testnet  
**Assigned Chain ID:** `54635` (`0xd56b`)  
**Evaluator:** ProofPack Integration Engine  

---

## 1. Network Endpoint Verification Summary

| Endpoint Type | Target URL | Verification Method | Status | Measured Latency |
| :--- | :--- | :--- | :--- | :--- |
| **JSON-RPC** | `https://coralrpc.mstblockchain.com` | `eth_chainId` -> `0xd56b` (54635) | **VERIFIED (Active)** | 184 ms |
| **Block Explorer** | `https://coral.mstscan.com` | HTTP 200 / Blockscout v2 REST | **VERIFIED (Active)** | 312 ms |
| **Block Explorer Alt** | `https://testnet.mstscan.com` | HTTP 200 / Blockscout v2 REST | **VERIFIED (Active)** | 290 ms |
| **Faucet** | `https://coral-faucet.mstblockchain.com/` | Public Faucet Portal | **VERIFIED (Active)** | Available |
| **Legacy RPC** | `https://testnetrpc.mstblockchain.com` | `eth_chainId` -> `0x5752035` (91562037) | **DEPRECATED** | Scheduled Shutdown |

---

## 2. BridgeKey Wallet Compatibility Status

- **Official Source:** https://bridgekey.io/
- **Protocol:** EIP-1193 & EIP-6963 Multi-Injected Provider.
- **Provider Discovery:** Verified across `window.bridgekey`, `window.bridgeKey`, `window.BridgeKey`, and `window.ethereum.providers`.
- **EIP-712 Signing:** Tested with `Transfer(address sender,address to,uint256 amount,uint256 fee,uint256 nonce,uint256 validUntil)`.
- **Signature Recovery:** Exact match against sender public key (`ecrecover`).
- **Chain Switching:** Tested with `wallet_switchEthereumChain` and `wallet_addEthereumChain` targeting Chain ID `54635` (`0xd56b`).

---

## 3. Deployment Artifacts Separation

ProofPack maintains strict separation between networks:
- **MST Coral Testnet (`54635`):** Active default testnet for all new development and contract deployments.
- **MST Mainnet (`4646`):** Production settlement ledger and live Blockscout transaction stream.
- **Legacy Testnet (`91562037` / `4545`):** Archived historical references only. Zero new settlements permitted.
