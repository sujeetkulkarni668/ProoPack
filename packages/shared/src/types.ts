export type TransactionStatus =
  | 'SUBMITTED'
  | 'QUEUED'
  | 'BATCHED'
  | 'COMMITTED'
  | 'SETTLING'
  | 'SETTLED'
  | 'FAILED';

export type BatchStatus =
  | 'PENDING'
  | 'COMMITTED'
  | 'SUBMITTED_TO_L1'
  | 'SETTLED'
  | 'FAILED';

export interface L2Transaction {
  txId: string;
  sender: string;
  to: string;
  amount: string; // in wei / stringified uint256
  fee: string;    // in wei
  nonce: number;
  validUntil: number;
  chainId: number;
  signature: string; // 65-byte hex string (r, s, v)
  status: TransactionStatus;
  batchId?: number;
  createdAt: number;
  settledAt?: number;
  l1TxHash?: string;
  l1BlockNumber?: number;
  errorMessage?: string;
}

export interface EIP712Domain {
  name: string;
  version: string;
  chainId: number;
  verifyingContract: string;
}

export interface TransferPayload {
  sender: string;
  to: string;
  amount: string;
  fee: string;
  nonce: number;
  validUntil: number;
}

export interface BatchMetadata {
  batchId: number;
  txCount: number;
  previousBatchRoot: string;
  batchRoot: string;
  stateCommitment: string;
  encodedPayload: string; // Hex-encoded binary calldata
  compressedBytes: number;
  uncompressedBytes: number;
  status: BatchStatus;
  l1TxHash?: string;
  l1BlockNumber?: number;
  totalFees: string;
  createdAt: number;
  settledAt?: number;
  error?: string;
}

export interface NetworkConfig {
  chainId: number;
  name: string;
  currencySymbol: string;
  rpcUrl: string;
  explorerUrl: string;
  settlementContractAddress: string;
}

export interface CostAnalytics {
  individualL1Gas: number;
  proofPackAmortizedGas: number;
  gasSavingsPercentage: number;
  compressionRatio: number;
  txsCount: number;
}
