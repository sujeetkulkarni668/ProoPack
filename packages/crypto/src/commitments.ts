import { keccak256, encodePacked, Hex } from 'viem';

export function computeBatchCommitment(
  batchId: number,
  prevBatchRoot: Hex,
  batchRoot: Hex,
  txCount: number
): Hex {
  return keccak256(
    encodePacked(
      ['uint32', 'bytes32', 'bytes32', 'uint32'],
      [batchId, prevBatchRoot, batchRoot, txCount]
    )
  );
}
