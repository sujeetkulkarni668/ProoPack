import { TransactionQueue } from './queue';
import { BatchBuilder, BuiltBatch } from './batch-builder';
import { BatchSettler } from './settler';
import { BatchMetadata, PROTOCOL_CONSTANTS } from '@proofpack/shared';

export interface BatcherWorkerOptions {
  maxBatchSize?: number;
  minBatchSize?: number;
  maxWaitMs?: number;
  pollIntervalMs?: number;
}

export class BatcherWorker {
  private queue: TransactionQueue;
  private builder: BatchBuilder;
  private settler: BatchSettler;
  private isRunning: boolean = false;
  private timer: NodeJS.Timeout | null = null;

  public readonly maxBatchSize: number;
  public readonly minBatchSize: number;
  public readonly maxWaitMs: number;
  public readonly pollIntervalMs: number;

  constructor(
    queue: TransactionQueue,
    builder: BatchBuilder,
    settler: BatchSettler,
    opts: BatcherWorkerOptions = {}
  ) {
    this.queue = queue;
    this.builder = builder;
    this.settler = settler;
    this.maxBatchSize = opts.maxBatchSize ?? PROTOCOL_CONSTANTS.DEFAULT_MAX_BATCH_SIZE;
    this.minBatchSize = opts.minBatchSize ?? PROTOCOL_CONSTANTS.MIN_BATCH_SIZE;
    this.maxWaitMs = opts.maxWaitMs ?? PROTOCOL_CONSTANTS.DEFAULT_MAX_WAIT_TIME_MS;
    this.pollIntervalMs = opts.pollIntervalMs ?? 1000;
  }

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.tick();
  }

  public stop(): void {
    this.isRunning = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  public async processNow(): Promise<BatchMetadata | null> {
    const pending = this.queue.getPendingTransactions(this.maxBatchSize);
    if (pending.length === 0) {
      return null;
    }

    const built = this.builder.build(pending);
    const settled = await this.settler.settle(built);

    this.builder.setBatchSequence(settled.batchId + 1, settled.batchRoot as any);
    return settled;
  }

  private async tick(): Promise<void> {
    if (!this.isRunning) return;

    try {
      const pending = this.queue.getPendingTransactions(this.maxBatchSize);
      if (pending.length >= this.maxBatchSize) {
        await this.processNow();
      } else if (pending.length >= this.minBatchSize) {
        const oldest = pending[0];
        const age = Date.now() - oldest.createdAt;
        if (age >= this.maxWaitMs) {
          await this.processNow();
        }
      }
    } catch (e) {
      console.error('Batcher worker error during tick:', e);
    } finally {
      if (this.isRunning) {
        this.timer = setTimeout(() => this.tick(), this.pollIntervalMs);
      }
    }
  }
}
