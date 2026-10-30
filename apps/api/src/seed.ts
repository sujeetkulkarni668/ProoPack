import {
  L2Transaction
} from '@proofpack/shared';
import {
  TransactionQueue,
  BatchBuilder,
  BatchSettler
} from '@proofpack/batcher';

/**
 * Seeder respects real network mode:
 * By default, mock data is removed so the platform strictly reflects live
 * on-chain data and actual wallet submissions with lowest latency.
 */
export async function seedInitialData(
  queue: TransactionQueue,
  builder: BatchBuilder,
  settler: BatchSettler,
  chainId: number
): Promise<void> {
  const enableMock = process.env.ENABLE_MOCK_DATA === 'true';
  if (!enableMock) {
    // Zero mock data - live network mode
    return;
  }
}
