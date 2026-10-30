export type TransactionStatus =
  | 'SUBMITTED'
  | 'QUEUED'
  | 'BATCHED'
  | 'COMMITTED'
  | 'SETTLING'
  | 'SETTLED'
  | 'FAILED';

export interface L2Transaction {
  txId: string;
  sender: string;
  to: string;
  amount: string;
  fee: string;
  nonce: number;
  validUntil: number;
  chainId: number;
  signature: string;
  status: TransactionStatus;
  batchId?: number;
  createdAt: number;
  settledAt?: number;
  l1TxHash?: string;
  l1BlockNumber?: number;
  errorMessage?: string;
}

export interface BatchMetadata {
  batchId: number;
  txCount: number;
  previousBatchRoot: string;
  batchRoot: string;
  stateCommitment: string;
  encodedPayload: string;
  compressedBytes: number;
  uncompressedBytes: number;
  status: string;
  l1TxHash?: string;
  l1BlockNumber?: number;
  totalFees: string;
  createdAt: number;
  settledAt?: number;
  error?: string;
}

export interface CostAnalyticsData {
  totalSettledBatches: number;
  totalTransactionsSettled: number;
  directL1GasBaseline: number;
  proofPackGasActual: number;
  gasSavingsPercentage: number;
  compressionRatioPercentage: number;
  averageCostPerTxMSTC: string;
}

export interface HealthResponse {
  status: string;
  timestamp: number;
  mempoolQueueSize: number;
  mstRpc: {
    status: 'healthy' | 'unreachable';
    latencyMs: number;
    blockNumber?: string;
  };
  workerRunning: boolean;
}

export interface NetworkStatsResponse {
  totalTransactions: number;
  settledTransactions: number;
  queuedTransactions: number;
  tps: {
    current: number;
    average: number;
    peak: number;
  };
  batches: {
    total: number;
    settled: number;
    queued: number;
    failed: number;
  };
  proofSuccessRate: number;
  confirmationTime: {
    l2ProcessingMs: number;
    l1SettlementSec: number;
  };
  compression: {
    ratio: number;
    sizeReductionPct: number;
    totalBytesProcessed: number;
    totalBytesSaved: number;
  };
  savings: {
    percentage: number;
    baselineGasPerTx: number;
    proofPackGasPerTx: number;
    averageFeeMSTC: string;
  };
}

export interface NetworkHistoryPoint {
  timestamp: number;
  label: string;
  transactions: number;
  batches: number;
  tps: number;
  avgFeeMSTC: number;
  compressionRatio: number;
  avgConfirmationMs: number;
  proofsVerified: number;
  settlementSuccessRate: number;
}

export interface NetworkHistoryResponse {
  timeframe: string;
  history: NetworkHistoryPoint[];
}

export interface BlockInfo {
  blockNumber: number;
  blockHash: string;
  parentHash: string;
  timestamp: number;
  txCount: number;
  proposer: string;
  gasUsed: number;
  gasLimit: number;
  finality: string;
  isSettlementCarrier: boolean;
}

export interface AddressDetails {
  address: string;
  addressType: string;
  nativeBalanceMSTC: string;
  tokenBalances: Array<{
    symbol: string;
    name: string;
    balance: string;
    decimals: number;
  }>;
  txCountIncoming: number;
  txCountOutgoing: number;
  transactions: L2Transaction[];
  associatedBatches: number[];
}

export interface TokenInfo {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  totalSupply: string;
  holderCount: number;
  transferCount: number;
  isNative: boolean;
  faucetUrl?: string;
}

export interface ProofRecord {
  proofId: string;
  batchId: number;
  txIndex: number;
  txId: string;
  sender: string;
  recipient: string;
  amount: string;
  leafHash: string;
  batchRoot: string;
  proofLength: number;
  proofSiblings: string[];
  proofType: string;
  verifierContract: string;
  verified: boolean;
  verificationDurationMs: number;
  timestamp: number;
  l1TxHash?: string;
}

export interface SettlementRecord {
  settlementId: string;
  batchId: number;
  destinationChain: string;
  settlementTxHash: string;
  blockNumber: number;
  submittedAt: number;
  confirmedAt: number;
  status: string;
  retries: number;
  gasUsed: number;
  explorerUrl: string;
}

export interface WebhookEndpoint {
  id: string;
  url: string;
  events: string[];
  status: string;
  successRate: string;
  lastDeliveredAt: number;
}

export interface ApiUsageStats {
  quota: {
    limitPerMinute: number;
    currentUsage: number;
    resetInSeconds: number;
  };
  stats24h: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageLatencyMs: number;
    p95LatencyMs: number;
  };
  endpointBreakdown: Array<{
    endpoint: string;
    requests: number;
    sharePct: number;
  }>;
}

export interface SearchResult {
  found: boolean;
  type?: 'transaction' | 'batch' | 'address' | 'settlement' | 'proof';
  id?: string | number;
  data?: any;
  message?: string;
}

export interface VerifiedMainnetTx {
  hash: string;
  blockNumber: number;
  from: string;
  to: string;
  value: string;
  valueFormatted: string;
  timestamp: string;
  timestampMs: number;
  result: 'success' | 'failure' | 'pending';
  status: 'ok' | 'error' | 'pending';
  fee: string;
  feeFormatted: string;
  gasUsed: string;
  gasPrice: string;
  confirmations: number;
  revertReason: string | null;
  method: string | null;
  explorerUrl: string;
}

export interface MainnetTransactionsResponse {
  items: VerifiedMainnetTx[];
  total: number;
  nextPageParams?: {
    block_number: number;
    index: number;
    items_count: number;
  } | null;
  syncedAt: number;
  source: string;
  chainId: number;
  network: string;
}

export interface MainnetStatusResponse {
  status: string;
  rpcUrl?: string;
  explorerUrl?: string;
  chainId?: number;
  expectedChainId: number;
  latencyMs?: number;
  verified?: boolean;
  blockNumber?: number;
}
