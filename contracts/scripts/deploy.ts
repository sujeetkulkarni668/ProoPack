import { viem } from 'hardhat';
import * as dotenv from 'dotenv';
dotenv.config();

async function main() {
  console.log('====================================================');
  console.log('🚀 ProofPack Smart Contract On-Chain Deployment');
  console.log('====================================================\n');

  const publicClient = await viem.getPublicClient();
  const [deployer] = await viem.getWalletClients();

  const chainId = await publicClient.getChainId();
  console.log(`Target Chain ID: ${chainId} (Hex: 0x${chainId.toString(16)})`);
  console.log(`Deployer Address: ${deployer.account.address}`);

  const balance = await publicClient.getBalance({ address: deployer.account.address });
  console.log(`Deployer Balance: ${balance.toString()} wei (${Number(balance) / 1e18} tokens)`);

  if (balance === 0n) {
    console.error('\n❌ ERROR: Deployer balance is 0!');
    console.error('Please fund your deployer address before deploying:');
    if (chainId === 54635) {
      console.error('👉 Coral Testnet Faucet: https://coral-faucet.mstblockchain.com/');
    } else {
      console.error('👉 MST Token Request: https://mstblockchain.com/contact/');
    }
    process.exit(1);
  }

  // Operator address (can be deployer or dedicated sequencer address)
  const operatorAddress = deployer.account.address;
  console.log(`Assigning Operator: ${operatorAddress}\n`);

  console.log('📦 Deploying ProofPackSettlement.sol to MST Blockchain...');
  const settlement = await viem.deployContract('ProofPackSettlement', [operatorAddress]);

  console.log('\n====================================================');
  console.log('🎉 CONTRACT SUCCESSFULLY DEPLOYED ON-CHAIN!');
  console.log('====================================================');
  console.log(`Contract Address: ${settlement.address}`);
  console.log(`Chain ID:         ${chainId}`);
  
  if (chainId === 54635) {
    console.log(`Explorer Link:    https://coral.mstscan.com/address/${settlement.address}`);
  } else if (chainId === 4646) {
    console.log(`Explorer Link:    https://mstscan.com/address/${settlement.address}`);
  }

  console.log('\n👉 Next Step: Update your .env file:');
  console.log(`MST_SETTLEMENT_CONTRACT=${settlement.address}\n`);
}

main().catch((error) => {
  console.error('\n❌ Deployment failed:', error);
  process.exit(1);
});
