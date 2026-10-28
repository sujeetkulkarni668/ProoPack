import { BatchMetadata, L2Transaction, ProofPackError, ErrorCode } from '@proofpack/shared';
import { BuiltBatch } from './batch-builder';
import { TransactionQueue } from './queue';
import { Hex, Address } from 'viem';

export interface ISettlementProvider {
  settleBatch(
    batchId: number,
    prevBatchRoot: Hex,
    batchRoot: Hex,
    txCount: number,
    compressedPayload: Hex
  ): Promise<{ txHash: string; blockNumber: number }>;
}

export class BatchSettler {
  private queue: TransactionQueue;
  private provider?: ISettlementProvider;
  private batches: Map<number, BatchMetadata> = new Map();

  constructor(queue: TransactionQueue, provider?: ISettlementProvider) {
    this.queue = queue;
    this.provider = provider;
  }

  public setProvider(provider: ISettlementProvider): void {
    this.provider = provider;
  }

  public async settle(batch: BuiltBatch): Promise<BatchMetadata> {
    const meta = batch.metadata;
    meta.status = 'SUBMITTED_TO_L1';

    for (const tx of batch.transactions) {
      this.queue.updateStatus(tx.txId, 'COMMITTED', { batchId: meta.batchId });
    }

    try {
      let txHash = `0xmock${Date.now().toString(16)}${meta.batchId.toString(16).padStart(8, '0')}`.padEnd(66, 'f');
      let blockNumber = 1000 + meta.batchId;

      if (this.provider) {
        const res = await this.provider.settleBatch(
          meta.batchId,
          meta.previousBatchRoot as Hex,
          meta.batchRoot as Hex,
          meta.txCount,
          meta.encodedPayload as Hex
        );
        txHash = res.txHash;
        blockNumber = res.blockNumber;
      }

      meta.status = 'SETTLED';
      meta.l1TxHash = txHash;
      meta.l1BlockNumber = blockNumber;
      meta.settledAt = Date.now();

      // Update all transactions in queue
      for (const tx of batch.transactions) {
        this.queue.updateStatus(tx.txId, 'SETTLED', {
          batchId: meta.batchId,
          l1TxHash: txHash,
          l1BlockNumber: blockNumber,
          settledAt: meta.settledAt
        });
      }

      this.batches.set(meta.batchId, meta);
      return meta;
    } catch (err: any) {
      meta.status = 'FAILED';
      meta.error = err.message;
      for (const tx of batch.transactions) {
        this.queue.updateStatus(tx.txId, 'FAILED', { errorMessage: err.message });
      }
      this.batches.set(meta.batchId, meta);
      throw new ProofPackError(ErrorCode.SETTLEMENT_FAILED, `Settlement failed: ${err.message}`);
    }
  }

  public getBatch(batchId: number): BatchMetadata | undefined {
    return this.batches.get(batchId);
  }

  public getAllBatches(): BatchMetadata[] {
    return Array.from(this.batches.values()).sort((a, b) => b.batchId - a.batchId);
  }
}
