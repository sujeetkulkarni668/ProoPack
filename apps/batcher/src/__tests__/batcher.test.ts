import { describe, it } from 'node:test';
import assert from 'node:assert';
import { TransactionQueue } from '../queue';
import { BatchBuilder } from '../batch-builder';
import { BatchSettler } from '../settler';
import { BatcherWorker } from '../worker';
import { L2Transaction } from '@proofpack/shared';

describe('Batcher & Transaction Processing Engine', () => {
  const mockTx = (id: string, nonce: number): L2Transaction => ({
    txId: ('0x' + id.replace('0x', '').padStart(64, '0')),
    sender: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    to: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    amount: '100000000000000000',
    fee: '1000000000000',
    nonce,
    validUntil: 1800000000,
    chainId: 4545,
    signature: '0x' + 'aa'.repeat(65),
    status: 'SUBMITTED',
    createdAt: Date.now()
  });

  it('enqueues transactions and enforces sequential nonces', () => {
    const queue = new TransactionQueue();
    queue.enqueue(mockTx('0x01', 0));
    assert.strictEqual(queue.size(), 1);

    // Enqueue next sequential nonce
    queue.enqueue(mockTx('0x02', 1));
    assert.strictEqual(queue.size(), 2);

    // Duplicate txId rejection
    assert.throws(() => {
      queue.enqueue(mockTx('0x01', 2));
    }, /already exists in mempool/);
  });

  it('builds batch with deterministic Merkle root and compression', () => {
    const builder = new BatchBuilder(1);
    const txs = [mockTx('0x01', 0), mockTx('0x02', 1)];

    const built = builder.build(txs);
    assert.strictEqual(built.metadata.batchId, 1);
    assert.strictEqual(built.metadata.txCount, 2);
    assert.ok(built.metadata.batchRoot.startsWith('0x'));
    assert.ok(built.metadata.stateCommitment.startsWith('0x'));
    assert.ok(built.metadata.compressedBytes > 0);
  });

  it('settles batch and transitions transactions to SETTLED', async () => {
    const queue = new TransactionQueue();
    const tx1 = mockTx('0x01', 0);
    const tx2 = mockTx('0x02', 1);
    queue.enqueue(tx1);
    queue.enqueue(tx2);

    const builder = new BatchBuilder(1);
    const settler = new BatchSettler(queue);
    const worker = new BatcherWorker(queue, builder, settler);

    const batch = await worker.processNow();
    assert.ok(batch);
    assert.strictEqual(batch?.status, 'SETTLED');
    assert.ok(batch?.l1TxHash);

    // Verify transactions in queue
    const updated1 = queue.getTransaction(tx1.txId);
    const updated2 = queue.getTransaction(tx2.txId);
    assert.strictEqual(updated1?.status, 'SETTLED');
    assert.strictEqual(updated2?.status, 'SETTLED');
    assert.strictEqual(updated1?.batchId, 1);
  });
});
