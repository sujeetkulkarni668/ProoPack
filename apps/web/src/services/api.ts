import {
  L2Transaction,
  BatchMetadata,
  CostAnalyticsData,
  HealthResponse,
  NetworkStatsResponse,
  NetworkHistoryResponse,
  BlockInfo,
  AddressDetails,
  TokenInfo,
  ProofRecord,
  SettlementRecord,
  WebhookEndpoint,
  ApiUsageStats,
  SearchResult
} from '../types';

const API_BASE = '/';

export async function fetchHealth(): Promise<HealthResponse> {
  const res = await fetch(`${API_BASE}health`);
  if (!res.ok) throw new Error('Failed to fetch health');
  return res.json();
}

export async function fetchConfig(): Promise<any> {
  const res = await fetch(`${API_BASE}config`);
  if (!res.ok) throw new Error('Failed to fetch config');
  return res.json();
}

export async function fetchTransactions(limit = 50, status?: string): Promise<{ transactions: L2Transaction[]; total: number }> {
  let url = `${API_BASE}v1/transactions?limit=${limit}`;
  if (status) url += `&status=${status}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch transactions');
  return res.json();
}

export async function fetchTransactionById(txId: string): Promise<{ transaction: L2Transaction }> {
  const res = await fetch(`${API_BASE}v1/transactions/${txId}`);
  if (!res.ok) throw new Error(`Failed to fetch transaction ${txId}`);
  return res.json();
}

export async function fetchBatches(): Promise<{ batches: BatchMetadata[]; total: number }> {
  const res = await fetch(`${API_BASE}v1/batches`);
  if (!res.ok) throw new Error('Failed to fetch batches');
  return res.json();
}

export async function fetchBatchById(batchId: number): Promise<{
  batch: BatchMetadata;
  transactions?: L2Transaction[];
  merkleRoot?: string;
  hasBuiltBatch?: boolean;
}> {
  const res = await fetch(`${API_BASE}v1/batches/${batchId}`);
  if (!res.ok) throw new Error(`Failed to fetch batch #${batchId}`);
  return res.json();
}

export async function fetchCostAnalytics(): Promise<CostAnalyticsData> {
  const res = await fetch(`${API_BASE}v1/analytics/costs`);
  if (!res.ok) throw new Error('Failed to fetch cost analytics');
  return res.json();
}

export async function fetchNetworkStats(): Promise<NetworkStatsResponse> {
  const res = await fetch(`${API_BASE}v1/network/stats`);
  if (!res.ok) throw new Error('Failed to fetch network statistics');
  return res.json();
}

export async function fetchNetworkHistory(timeframe = '24h'): Promise<NetworkHistoryResponse> {
  const res = await fetch(`${API_BASE}v1/network/history?timeframe=${timeframe}`);
  if (!res.ok) throw new Error('Failed to fetch network history');
  return res.json();
}

export async function fetchBlocks(): Promise<{ blocks: BlockInfo[]; latestBlockNumber: number }> {
  const res = await fetch(`${API_BASE}v1/blocks`);
  if (!res.ok) throw new Error('Failed to fetch blocks');
  return res.json();
}

export async function fetchAddressDetails(address: string): Promise<AddressDetails> {
  const res = await fetch(`${API_BASE}v1/addresses/${address}`);
  if (!res.ok) throw new Error(`Failed to fetch address details for ${address}`);
  return res.json();
}

export async function fetchTokens(): Promise<{ tokens: TokenInfo[] }> {
  const res = await fetch(`${API_BASE}v1/tokens`);
  if (!res.ok) throw new Error('Failed to fetch tokens');
  return res.json();
}

export async function fetchProofs(): Promise<{ proofs: ProofRecord[]; total: number }> {
  const res = await fetch(`${API_BASE}v1/proofs`);
  if (!res.ok) throw new Error('Failed to fetch proofs');
  return res.json();
}

export async function verifyProof(payload: {
  leaf: string;
  proof: string[];
  root: string;
  index: number;
}): Promise<{
  verified: boolean;
  leaf: string;
  root: string;
  index: number;
  verificationDurationMs: number;
}> {
  const res = await fetch(`${API_BASE}v1/proofs/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to verify proof');
  return res.json();
}

export async function fetchSettlements(): Promise<{ settlements: SettlementRecord[]; total: number }> {
  const res = await fetch(`${API_BASE}v1/settlements`);
  if (!res.ok) throw new Error('Failed to fetch settlements');
  return res.json();
}

export async function fetchWebhooks(): Promise<{ endpoints: WebhookEndpoint[]; supportedEvents: Array<{ event: string; description: string }> }> {
  const res = await fetch(`${API_BASE}v1/webhooks`);
  if (!res.ok) throw new Error('Failed to fetch webhooks');
  return res.json();
}

export async function fetchApiUsage(): Promise<ApiUsageStats> {
  const res = await fetch(`${API_BASE}v1/developer/usage`);
  if (!res.ok) throw new Error('Failed to fetch API usage');
  return res.json();
}

export async function searchGlobal(q: string): Promise<SearchResult> {
  const res = await fetch(`${API_BASE}v1/search?q=${encodeURIComponent(q)}`);
  if (!res.ok) throw new Error('Failed to execute search');
  return res.json();
}

export async function submitTransaction(payload: {
  sender: string;
  to: string;
  amount: string;
  fee: string;
  nonce: number;
  validUntil: number;
  signature: string;
}): Promise<{ success: boolean; transaction: L2Transaction }> {
  const res = await fetch(`${API_BASE}v1/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Failed to submit transaction');
  }
  return data;
}

export async function triggerOperatorFlush(): Promise<{ triggered: boolean; batch: BatchMetadata | null }> {
  const res = await fetch(`${API_BASE}v1/operator/flush`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to flush batch');
  return res.json();
}
