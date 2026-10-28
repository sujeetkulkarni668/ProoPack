import { describe, it } from 'node:test';
import assert from 'node:assert';
import { MerkleTree } from '../merkle';
import { computeBatchCommitment } from '../commitments';
import { computeTransactionHash, computeLeafHash } from '../signatures';
import { Hex, keccak256, encodePacked } from 'viem';

describe('Cryptographic Engine & Merkle Trees', () => {
  it('correctly constructs deterministic Merkle root from leaves', () => {
    const leaves: Hex[] = [
      keccak256(encodePacked(['string'], ['tx_0'])),
      keccak256(encodePacked(['string'], ['tx_1'])),
      keccak256(encodePacked(['string'], ['tx_2'])),
      keccak256(encodePacked(['string'], ['tx_3']))
    ];

    const tree = new MerkleTree(leaves);
    const root = tree.getRoot();

    assert.ok(root.startsWith('0x'), 'Root must be a valid hex');
    assert.strictEqual(root.length, 66, 'Root must be 32 bytes hex string');

    // Reproducible root check
    const tree2 = new MerkleTree(leaves);
    assert.strictEqual(tree.getRoot(), tree2.getRoot());
  });

  it('generates and validates inclusion proofs for all leaf indices', () => {
    const leaves: Hex[] = [
      keccak256(encodePacked(['string'], ['leaf_a'])),
      keccak256(encodePacked(['string'], ['leaf_b'])),
      keccak256(encodePacked(['string'], ['leaf_c'])),
      keccak256(encodePacked(['string'], ['leaf_d'])),
      keccak256(encodePacked(['string'], ['leaf_e'])) // Odd count test
    ];

    const tree = new MerkleTree(leaves);
    const root = tree.getRoot();

    for (let i = 0; i < leaves.length; i++) {
      const proof = tree.getProof(i);
      const isValid = MerkleTree.verify(leaves[i], proof, root, i);
      assert.strictEqual(isValid, true, `Proof verification failed for leaf index ${i}`);
    }
  });

  it('rejects tampered leaf data or altered roots', () => {
    const leaves: Hex[] = [
      keccak256(encodePacked(['string'], ['tx_real_1'])),
      keccak256(encodePacked(['string'], ['tx_real_2']))
    ];

    const tree = new MerkleTree(leaves);
    const root = tree.getRoot();
    const proof = tree.getProof(0);

    const fakeLeaf = keccak256(encodePacked(['string'], ['tx_tampered']));
    const isValid = MerkleTree.verify(fakeLeaf, proof, root, 0);
    assert.strictEqual(isValid, false, 'Tampered leaf must fail verification');

    const fakeRoot = '0x1234567890123456789012345678901234567890123456789012345678901234' as Hex;
    const isValidFakeRoot = MerkleTree.verify(leaves[0], proof, fakeRoot, 0);
    assert.strictEqual(isValidFakeRoot, false, 'Tampered root must fail verification');
  });

  it('computes deterministic batch commitment binding sequence and roots', () => {
    const batchId = 1;
    const prevRoot = ('0x' + '0'.repeat(64)) as Hex;
    const batchRoot = keccak256(encodePacked(['string'], ['test_root']));
    const txCount = 64;

    const commitment = computeBatchCommitment(batchId, prevRoot, batchRoot, txCount);
    assert.ok(commitment.startsWith('0x'));
    assert.strictEqual(commitment.length, 66);
  });
});
