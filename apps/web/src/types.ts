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
