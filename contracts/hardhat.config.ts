import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox-viem';

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.28',
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000
      }
    }
  },
  networks: {
    hardhat: {
      chainId: 31337
    },
    // Official target testnet: MST Coral Testnet
    mstCoralTestnet: {
      url: process.env.MST_RPC_URL || 'https://coralrpc.mstblockchain.com',
      chainId: 54635,
      accounts: process.env.OPERATOR_PRIVATE_KEY ? [process.env.OPERATOR_PRIVATE_KEY] : []
    },
    // Default testnet alias pointing to MST Coral Testnet
    mstTestnet: {
      url: process.env.MST_RPC_URL || 'https://coralrpc.mstblockchain.com',
      chainId: 54635,
      accounts: process.env.OPERATOR_PRIVATE_KEY ? [process.env.OPERATOR_PRIVATE_KEY] : []
    },
    // Legacy testnet (Deprecated, scheduled for shutdown Jan 31, 2027)
    mstLegacyTestnet: {
      url: 'https://testnetrpc.mstblockchain.com',
      chainId: 91562037,
      accounts: process.env.OPERATOR_PRIVATE_KEY ? [process.env.OPERATOR_PRIVATE_KEY] : []
    },
    mstMainnet: {
      url: process.env.MST_RPC_URL || 'https://mariorpc.mstblockchain.com',
      chainId: 4646,
      accounts: process.env.OPERATOR_PRIVATE_KEY ? [process.env.OPERATOR_PRIVATE_KEY] : []
    }
  },
  paths: {
    sources: './src',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts'
  }
};

export default config;
