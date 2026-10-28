import { L2Transaction, ProofPackError, ErrorCode } from '@proofpack/shared';

export class TransactionQueue {
  private mempool: Map<string, L2Transaction> = new Map();
  private accountNonces: Map<string, number> = new Map();

  public enqueue(tx: L2Transaction): void {
    if (this.mempool.has(tx.txId)) {
      throw new ProofPackError(
        ErrorCode.DUPLICATE_TRANSACTION,
        `Transaction ${tx.txId} already exists in mempool`
      );
    }

    const senderKey = tx.sender.toLowerCase();
    const currentNonce = this.accountNonces.get(senderKey) ?? 0;

    // Check nonce: must equal or exceed current processed nonce
    if (tx.nonce < currentNonce) {
      throw new ProofPackError(
        ErrorCode.INVALID_NONCE,
        `Nonce ${tx.nonce} already processed for sender ${tx.sender}. Current nonce: ${currentNonce}`
      );
    }

    tx.status = 'QUEUED';
    this.mempool.set(tx.txId, tx);
  }

  public getPendingTransactions(limit: number): L2Transaction[] {
    const pending: L2Transaction[] = [];
    for (const tx of this.mempool.values()) {
      if (tx.status === 'QUEUED') {
        pending.push(tx);
        if (pending.length >= limit) break;
      }
    }
    // Sort deterministically by nonce then createdAt
    return pending.sort((a, b) => (a.nonce === b.nonce ? a.createdAt - b.createdAt : a.nonce - b.nonce));
  }

  public getTransaction(txId: string): L2Transaction | undefined {
    return this.mempool.get(txId);
  }

  public getAllTransactions(): L2Transaction[] {
    return Array.from(this.mempool.values()).sort((a, b) => b.createdAt - a.createdAt);
  }

  public updateStatus(
    txId: string,
    status: L2Transaction['status'],
    details?: Partial<L2Transaction>
  ): void {
    const tx = this.mempool.get(txId);
    if (!tx) return;

    tx.status = status;
    if (details) {
      Object.assign(tx, details);
    }

    if (status === 'SETTLED') {
      const senderKey = tx.sender.toLowerCase();
      this.accountNonces.set(senderKey, Math.max(this.accountNonces.get(senderKey) ?? 0, tx.nonce + 1));
    }
  }

  public size(): number {
    return Array.from(this.mempool.values()).filter(t => t.status === 'QUEUED').length;
  }

  public clear(): void {
    this.mempool.clear();
    this.accountNonces.clear();
  }
}
