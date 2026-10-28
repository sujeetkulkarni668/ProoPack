export const PROTOCOL_CONSTANTS = {
  MAGIC_BYTES: 0x5050, // 'PP' in ASCII
  VERSION: 1,
  DEFAULT_MAX_BATCH_SIZE: 64,
  MAX_BATCH_SIZE_UPPER_BOUND: 128,
  MIN_BATCH_SIZE: 2,
  DEFAULT_MAX_WAIT_TIME_MS: 5000,
  MAX_PAYLOAD_BYTES: 65536,
  BASE_TRANSACTION_GAS: 21000,
  NON_ZERO_BYTE_GAS: 16,
  ZERO_BYTE_GAS: 4
} as const;

export const MST_NETWORKS = {
  MAINNET: {
    chainId: 4646,
    hexChainId: '0x1226',
    name: 'MST Mainnet',
    currency: {
      name: 'MST Coin',
      symbol: 'MSTC',
      decimals: 18
    },
    rpcUrls: [
      'https://mariorpc.mstblockchain.com',
      'https://craftrpc.mstblockchain.com'
    ],
    blockExplorerUrls: ['https://mstscan.com']
  },
  TESTNET: {
    chainId: 4545,
    hexChainId: '0x11F1',
    name: 'MST Testnet',
    currency: {
      name: 'Testnet MST Coin',
      symbol: 'tMSTC',
      decimals: 18
    },
    rpcUrls: ['https://testnetrpc.mstblockchain.com'],
    blockExplorerUrls: ['https://testnet.mstscan.com']
  },
  LOCAL: {
    chainId: 31337,
    hexChainId: '0x7A69',
    name: 'ProofPack Local Devnet',
    currency: {
      name: 'Local MSTC',
      symbol: 'tMSTC',
      decimals: 18
    },
    rpcUrls: ['http://127.0.0.1:8545'],
    blockExplorerUrls: ['http://localhost:4000/explorer']
  }
} as const;

export const EIP712_DOMAIN_NAME = 'ProofPack L2';
export const EIP712_DOMAIN_VERSION = '1.0';
