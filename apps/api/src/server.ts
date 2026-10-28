import { buildApp } from './app';
import { MST_NETWORKS } from '@proofpack/shared';

const PORT = parseInt(process.env.PORT || '4000', 10);
const CHAIN_ID = parseInt(process.env.MST_CHAIN_ID || `${MST_NETWORKS.TESTNET.chainId}`, 10);
const RPC_URL = process.env.MST_RPC_URL;
const VERIFYING_CONTRACT = process.env.MST_SETTLEMENT_CONTRACT;

async function start() {
  const app = buildApp({
    chainId: CHAIN_ID,
    rpcUrl: RPC_URL,
    verifyingContract: VERIFYING_CONTRACT,
    enableWorker: true
  });

  try {
    await app.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`ProofPack L2 API Server running at http://localhost:${PORT}`);
    console.log(`Targeting MST Chain ID: ${CHAIN_ID}`);
  } catch (err) {
    console.error('Failed to start API server:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  start();
}
