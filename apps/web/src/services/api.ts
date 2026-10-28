import { L2Transaction, BatchMetadata, CostAnalyticsData, HealthResponse } from '../types';

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

export async function fetchBatches(): Promise<{ batches: BatchMetadata[]; total: number }> {
  const res = await fetch(`${API_BASE}v1/batches`);
  if (!res.ok) throw new Error('Failed to fetch batches');
  return res.json();
}

export async function fetchBatchById(batchId: number): Promise<{ batch: BatchMetadata }> {
  const res = await fetch(`${API_BASE}v1/batches/${batchId}`);
  if (!res.ok) throw new Error(`Failed to fetch batch #${batchId}`);
  return res.json();
}

export async function fetchCostAnalytics(): Promise<CostAnalyticsData> {
  const res = await fetch(`${API_BASE}v1/analytics/costs`);
  if (!res.ok) throw new Error('Failed to fetch cost analytics');
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
