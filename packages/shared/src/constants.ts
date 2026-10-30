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
    blockExplorerUrls: ['https://mstscan.com'],
    chainlistUrl: 'https://chainlist.org/chain/4646',
    tokenRequestUrl: 'https://mstblockchain.com/contact/'
  },
  // Official active target testnet: MST Coral Testnet
  TESTNET: {
    chainId: 54635,
    hexChainId: '0xd56b',
    name: 'MST Coral Testnet',
    currency: {
      name: 'Testnet MST Coin',
      symbol: 'tMSTC',
      decimals: 18
    },
    rpcUrls: [
      'https://coralrpc.mstblockchain.com'
    ],
    blockExplorerUrls: [
      'https://coral.mstscan.com',
      'https://testnet.mstscan.com'
    ],
    faucetUrls: [
      'https://coral-faucet.mstblockchain.com/'
    ],
    chainlistUrl: 'https://cryptotools.vip/chainlist/mst-coral-testnet-54635'
  },
  // Legacy testnet (Deprecated, scheduled for shutdown January 31, 2027)
  LEGACY_TESTNET: {
    chainId: 91562037,
    hexChainId: '0x5752035',
    name: 'MST Legacy Testnet',
    deprecated: true,
    shutdownDeadline: '2027-01-31',
    currency: {
      name: 'Legacy Testnet MST Coin',
      symbol: 'tMSTC',
      decimals: 18
    },
    rpcUrls: ['https://testnetrpc.mstblockchain.com'],
    blockExplorerUrls: ['https://testnet.mstscan.com'],
    faucetUrls: ['https://coral-faucet.mstblockchain.com/'],
    chainlistUrl: 'https://chainlist.org/chain/91562037'
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
