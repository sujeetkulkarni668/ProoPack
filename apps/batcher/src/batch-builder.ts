import {
  L2Transaction,
  BatchMetadata,
  PROTOCOL_CONSTANTS
} from '@proofpack/shared';
import {
  serializeBatch,
  bufferToHex,
  calculateCostMetrics
} from '@proofpack/compression';
import {
  computeLeafHash,
  MerkleTree,
  computeBatchCommitment
} from '@proofpack/crypto';
import { Hex, Address } from 'viem';

export interface BuiltBatch {
  metadata: BatchMetadata;
  merkleTree: MerkleTree;
  transactions: L2Transaction[];
}

export class BatchBuilder {
  private currentBatchId: number = 1;
  private latestBatchRoot: Hex = ('0x' + '0'.repeat(64)) as Hex;

  constructor(initialBatchId: number = 1, initialRoot?: Hex) {
    this.currentBatchId = initialBatchId;
    if (initialRoot) {
      this.latestBatchRoot = initialRoot;
    }
  }

  public setBatchSequence(nextId: number, latestRoot: Hex): void {
    this.currentBatchId = nextId;
    this.latestBatchRoot = latestRoot;
  }

  public build(transactions: L2Transaction[]): BuiltBatch {
    if (transactions.length === 0) {
      throw new Error('Cannot build batch with zero transactions');
    }

    const batchId = this.currentBatchId;

    // 1. Pack and compress transactions
    const rawTxArray = transactions.map(t => ({
      sender: t.sender,
      to: t.to,
      amount: t.amount,
      fee: t.fee,
      nonce: t.nonce,
      validUntil: t.validUntil,
      signature: t.signature
    }));

    const compressedPayload = serializeBatch(batchId, rawTxArray);
    const encodedPayloadHex = bufferToHex(compressedPayload);

    // Approximate uncompressed JSON size
    const uncompressedBytes = Buffer.byteLength(JSON.stringify(rawTxArray), 'utf8');

    // 2. Compute Merkle tree leaves
    const leaves: Hex[] = transactions.map(tx => {
      const cleanTxId = tx.txId.startsWith('0x') ? tx.txId.slice(2) : tx.txId;
      const txHash32 = ('0x' + cleanTxId.padStart(64, '0').slice(0, 64)) as Hex;
      return computeLeafHash(
        txHash32,
        tx.sender as Address,
        tx.to as Address,
        BigInt(tx.amount),
        BigInt(tx.nonce)
      );
    });

    const merkleTree = new MerkleTree(leaves);
    const batchRoot = merkleTree.getRoot();

    // 3. Compute State Commitment
    const stateCommitment = computeBatchCommitment(
      batchId,
      this.latestBatchRoot,
      batchRoot,
      transactions.length
    );

    // 4. Calculate total fees
    const totalFees = transactions
      .reduce((sum, tx) => sum + BigInt(tx.fee), 0n)
      .toString();

    const metadata: BatchMetadata = {
      batchId,
      txCount: transactions.length,
      previousBatchRoot: this.latestBatchRoot,
      batchRoot,
      stateCommitment,
      encodedPayload: encodedPayloadHex,
      compressedBytes: compressedPayload.length,
      uncompressedBytes,
      status: 'COMMITTED',
      totalFees,
      createdAt: Date.now()
    };

    return {
      metadata,
      merkleTree,
      transactions
    };
  }
}
