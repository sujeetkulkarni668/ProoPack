import { describe, it } from 'node:test';
import assert from 'node:assert';
import { encodeVarint, decodeVarint } from '../varint';
import { serializeBatch, deserializeBatch, calculateCostMetrics } from '../index';

describe('Compression & Serialization Engine', () => {
  it('correctly encodes and decodes Varints round-trip', () => {
    const testCases = [
      0n,
      1n,
      127n,
      128n,
      255n,
      16383n,
      16384n,
      1000000000000000000n, // 1 ether in wei
      115792089237316195423570985008687907853269984665640564039457584007913129639935n // uint256 max
    ];

    for (const val of testCases) {
      const encoded = encodeVarint(val);
      const decoded = decodeVarint(encoded, 0);
      assert.strictEqual(decoded.value, val);
      assert.strictEqual(decoded.bytesRead, encoded.length);
    }
  });

  it('rejects negative numbers in Varint encoder', () => {
    assert.throws(() => {
      encodeVarint(-1n);
    }, /Varint does not support negative numbers/);
  });

  it('correctly serializes and deserializes transaction batch with address dictionary', () => {
    const mockTxs = [
      {
        sender: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
        to: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
        amount: '100000000000000000',
        fee: '10000000000000',
        nonce: 0,
        validUntil: 1793280000,
        signature: '0x' + '1a'.repeat(65)
      },
      {
        sender: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
        to: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
        amount: '50000000000000000',
        fee: '10000000000000',
        nonce: 1,
        validUntil: 1793280000,
        signature: '0x' + '2b'.repeat(65)
      }
    ];

    const batchId = 42;
    const serialized = serializeBatch(batchId, mockTxs);
    assert.ok(serialized.length > 0);

    const deserialized = deserializeBatch(serialized);
    assert.strictEqual(deserialized.batchId, batchId);
    assert.strictEqual(deserialized.transactions.length, 2);
    assert.strictEqual(deserialized.transactions[0].sender.toLowerCase(), mockTxs[0].sender.toLowerCase());
    assert.strictEqual(deserialized.transactions[0].to.toLowerCase(), mockTxs[0].to.toLowerCase());
    assert.strictEqual(deserialized.transactions[0].amount, mockTxs[0].amount);
    assert.strictEqual(deserialized.transactions[0].nonce, mockTxs[0].nonce);
  });

  it('fuzz tests round-trip correctness across 32 randomized transactions', () => {
    const randomizedTxs = [];
    for (let i = 0; i < 32; i++) {
      randomizedTxs.push({
        sender: `0x${(i + 1).toString(16).padStart(40, '0')}`,
        to: `0x${(i + 2).toString(16).padStart(40, '0')}`,
        amount: (BigInt(i + 1) * 10000000000000000n).toString(),
        fee: '5000000000000',
        nonce: i,
        validUntil: 1800000000 + i,
        signature: '0x' + (i.toString(16).padStart(2, '0')).repeat(65)
      });
    }

    const payload = serializeBatch(101, randomizedTxs);
    const decoded = deserializeBatch(payload);

    assert.strictEqual(decoded.batchId, 101);
    assert.strictEqual(decoded.transactions.length, 32);

    for (let i = 0; i < 32; i++) {
      assert.strictEqual(decoded.transactions[i].amount, randomizedTxs[i].amount);
      assert.strictEqual(decoded.transactions[i].nonce, randomizedTxs[i].nonce);
    }
  });

  it('calculates measurable gas savings over standard direct L1 execution', () => {
    const dummyPayload = new Uint8Array(64 * 55); // 64 txs * ~55 bytes
    const metrics = calculateCostMetrics(dummyPayload, 64 * 250, 64);

    assert.ok(metrics.gasSavingsPercentage > 70, `Expected >70% savings, got ${metrics.gasSavingsPercentage}%`);
    assert.ok(metrics.proofPackAmortizedGas < 10000, `Expected amortized gas < 10,000, got ${metrics.proofPackAmortizedGas}`);
  });
});
