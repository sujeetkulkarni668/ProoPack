import {
  L2Transaction,
  MST_NETWORKS
} from '@proofpack/shared';
import { computeTransactionHash } from '@proofpack/crypto';
import {
  TransactionQueue,
  BatchBuilder,
  BatchSettler
} from '@proofpack/batcher';

export async function seedInitialData(
  queue: TransactionQueue,
  builder: BatchBuilder,
  settler: BatchSettler,
  chainId: number
): Promise<void> {
  if (settler.getAllBatches().length > 0 || queue.size() > 0) {
    return;
  }

  const dummySig = '0x' + 'ab'.repeat(65);

  const testAccounts = [
    '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
    '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
    '0x9965507D1a55bcC2695C58ba16FB37d819B0A4df',
    '0x976EA74026E726554dB657fA54763abd0C3a0aa9'
  ];

  const now = Date.now();

  const batchConfigs = [
    {
      batchId: 1,
      createdAt: now - 35 * 60 * 1000,
      settledAt: now - 34 * 60 * 1000,
      txs: [
        { sender: testAccounts[0], to: testAccounts[1], amount: '500000000000000000', fee: '100000000000000', nonce: 0 },
        { sender: testAccounts[1], to: testAccounts[2], amount: '1200000000000000000', fee: '100000000000000', nonce: 0 },
        { sender: testAccounts[2], to: testAccounts[3], amount: '750000000000000000', fee: '100000000000000', nonce: 0 },
        { sender: testAccounts[3], to: testAccounts[0], amount: '250000000000000000', fee: '100000000000000', nonce: 0 }
      ]
    },
    {
      batchId: 2,
      createdAt: now - 18 * 60 * 1000,
      settledAt: now - 17 * 60 * 1000,
      txs: [
        { sender: testAccounts[0], to: testAccounts[4], amount: '2000000000000000000', fee: '120000000000000', nonce: 1 },
        { sender: testAccounts[4], to: testAccounts[5], amount: '450000000000000000', fee: '100000000000000', nonce: 0 },
        { sender: testAccounts[5], to: testAccounts[1], amount: '800000000000000000', fee: '100000000000000', nonce: 0 },
        { sender: testAccounts[1], to: testAccounts[3], amount: '350000000000000000', fee: '100000000000000', nonce: 1 },
        { sender: testAccounts[2], to: testAccounts[0], amount: '1500000000000000000', fee: '110000000000000', nonce: 1 }
      ]
    },
    {
      batchId: 3,
      createdAt: now - 6 * 60 * 1000,
      settledAt: now - 5 * 60 * 1000,
      txs: [
        { sender: testAccounts[3], to: testAccounts[4], amount: '600000000000000000', fee: '100000000000000', nonce: 1 },
        { sender: testAccounts[4], to: testAccounts[2], amount: '900000000000000000', fee: '100000000000000', nonce: 1 },
        { sender: testAccounts[5], to: testAccounts[0], amount: '300000000000000000', fee: '100000000000000', nonce: 1 },
        { sender: testAccounts[0], to: testAccounts[2], amount: '1100000000000000000', fee: '120000000000000', nonce: 2 }
      ]
    }
  ];

  for (const cfg of batchConfigs) {
    const l2Txs: L2Transaction[] = [];
    for (const raw of cfg.txs) {
      const payload = {
        sender: raw.sender,
        to: raw.to,
        amount: raw.amount,
        fee: raw.fee,
        nonce: raw.nonce,
        validUntil: Math.floor(now / 1000) + 86400
      };
      const txId = computeTransactionHash(payload, chainId);
      const l2Tx: L2Transaction = {
        ...payload,
        txId,
        chainId,
        signature: dummySig,
        status: 'QUEUED',
        createdAt: cfg.createdAt
      };
      queue.enqueue(l2Tx);
      l2Txs.push(l2Tx);
    }

    builder.setBatchSequence(cfg.batchId, builder['latestBatchRoot']);
    const builtBatch = builder.build(l2Txs);
    builtBatch.metadata.createdAt = cfg.createdAt;
    await settler.settle(builtBatch);
    const settledMeta = settler.getBatch(cfg.batchId);
    if (settledMeta) {
      settledMeta.createdAt = cfg.createdAt;
      settledMeta.settledAt = cfg.settledAt;
      settledMeta.l1TxHash = `0xmst${cfg.batchId}${Date.now().toString(16)}0000000000000000000000000000000000000000`.slice(0, 66);
      settledMeta.l1BlockNumber = 9840 + cfg.batchId;
    }
  }

  // Update builder to next ID
  builder.setBatchSequence(4, builder['latestBatchRoot']);

  // Add 2 queued transactions waiting in mempool
  const pendingTxs = [
    { sender: testAccounts[1], to: testAccounts[4], amount: '250000000000000000', fee: '100000000000000', nonce: 2 },
    { sender: testAccounts[2], to: testAccounts[5], amount: '500000000000000000', fee: '100000000000000', nonce: 2 }
  ];

  for (const p of pendingTxs) {
    const payload = {
      sender: p.sender,
      to: p.to,
      amount: p.amount,
      fee: p.fee,
      nonce: p.nonce,
      validUntil: Math.floor(now / 1000) + 86400
    };
    const txId = computeTransactionHash(payload, chainId);
    queue.enqueue({
      ...payload,
      txId,
      chainId,
      signature: dummySig,
      status: 'QUEUED',
      createdAt: now - 30 * 1000
    });
  }
}
