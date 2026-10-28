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
    mstTestnet: {
      url: process.env.MST_RPC_URL || 'https://testnetrpc.mstblockchain.com',
      chainId: 4545,
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
