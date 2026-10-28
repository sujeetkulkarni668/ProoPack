import assert from 'node:assert';
import hre from 'hardhat';
import { keccak256, encodePacked, Hex } from 'viem';

describe('ProofPackSettlement Smart Contract', () => {
  it('deploys, verifies permissions, settles batches, and checks Merkle proofs', async () => {
    const [owner, operator, user] = await hre.viem.getWalletClients();
    const publicClient = await hre.viem.getPublicClient();

    // 1. Deploy ProofPackSettlement
    const settlement = await hre.viem.deployContract('ProofPackSettlement', [
      owner.account.address,
      operator.account.address
    ]);

    // Check initial sequence
    const nextId = await settlement.read.nextBatchId();
    assert.strictEqual(Number(nextId), 1);

    const isOp = await settlement.read.isOperator([operator.account.address]);
    assert.strictEqual(isOp, true);

    // 2. Prepare Batch Data
    const batchId = 1;
    const prevBatchRoot = ('0x' + '0'.repeat(64)) as Hex;

    // Create 2 leaves
    const leaf0 = keccak256(encodePacked(['string'], ['tx_alpha']));
    const leaf1 = keccak256(encodePacked(['string'], ['tx_beta']));
    const batchRoot = keccak256(encodePacked(['bytes32', 'bytes32'], [leaf0, leaf1]));

    const dummyPayload = '0x505001' as Hex;

    // 3. Unauthorized user attempt must fail
    const settlementAsUser = await hre.viem.getContractAt(
      'ProofPackSettlement',
      settlement.address,
      { client: { wallet: user } }
    );

    await assert.rejects(async () => {
      await settlementAsUser.write.settleBatch([
        batchId,
        prevBatchRoot,
        batchRoot,
        2,
        dummyPayload
      ]);
    });

    // 4. Authorized operator settles batch
    const settlementAsOp = await hre.viem.getContractAt(
      'ProofPackSettlement',
      settlement.address,
      { client: { wallet: operator } }
    );

    const txHash = await settlementAsOp.write.settleBatch([
      batchId,
      prevBatchRoot,
      batchRoot,
      2,
      dummyPayload
    ]);

    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
    assert.strictEqual(receipt.status, 'success');

    // 5. Verify batch record stored
    const record = await settlement.read.batches([batchId]);
    assert.strictEqual(record[0].toLowerCase(), batchRoot.toLowerCase());
    assert.strictEqual(record[2], 2); // txCount

    const nextIdAfter = await settlement.read.nextBatchId();
    assert.strictEqual(Number(nextIdAfter), 2);

    // 6. On-chain Merkle proof verification
    // For leaf0, sibling is leaf1 at index 0
    const isValidLeaf0 = await settlement.read.verifyTransactionInBatch([
      batchId,
      leaf0,
      [leaf1],
      0n
    ]);
    assert.strictEqual(isValidLeaf0, true);

    // Fake leaf verification must fail
    const fakeLeaf = keccak256(encodePacked(['string'], ['fake_leaf']));
    const isFakeValid = await settlement.read.verifyTransactionInBatch([
      batchId,
      fakeLeaf,
      [leaf1],
      0n
    ]);
    assert.strictEqual(isFakeValid, false);

    // 7. Test Emergency Pause
    await settlement.write.pause();
    await assert.rejects(async () => {
      await settlementAsOp.write.settleBatch([
        2,
        batchRoot,
        batchRoot,
        1,
        dummyPayload
      ]);
    });

    await settlement.write.unpause();
  });
});
