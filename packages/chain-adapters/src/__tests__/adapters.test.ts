import { describe, it } from 'node:test';
import assert from 'node:assert';
import { MockWalletAdapter } from '../wallets/mock';
import { verifyTransferSignature } from '@proofpack/crypto';
import { Address, Hex } from 'viem';

describe('Chain Adapters & BridgeKey Interface', () => {
  const verifyingContract = '0x1111111111111111111111111111111111111111' as Address;

  it('connects and retrieves active account and network', async () => {
    const adapter = new MockWalletAdapter();
    const res = await adapter.connect();

    assert.ok(res.address.startsWith('0x'));
    assert.strictEqual(res.chainId, 54635);
    assert.strictEqual(adapter.getAddress(), res.address);
  });

  it('signs EIP-712 typed transfer and verifies signature cryptographically', async () => {
    const adapter = new MockWalletAdapter();
    const { address } = await adapter.connect();

    const payload = {
      sender: address,
      to: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8' as Address,
      amount: '100000000000000000',
      fee: '10000000000000',
      nonce: 0,
      validUntil: 1800000000
    };

    const signature = await adapter.signTransfer(payload, 54635, verifyingContract);
    assert.ok(signature.startsWith('0x'));
    assert.strictEqual(signature.length, 132);

    // Verify signature using our crypto recovery
    const isValid = await verifyTransferSignature(payload, signature as Hex, 54635, verifyingContract);
    assert.strictEqual(isValid, true, 'Recovered address must match sender');
  });

  it('rejects signing when target chain does not match wallet chain', async () => {
    const adapter = new MockWalletAdapter();
    const { address } = await adapter.connect();

    const payload = {
      sender: address,
      to: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8' as Address,
      amount: '100000000000000000',
      fee: '10000000000000',
      nonce: 0,
      validUntil: 1800000000
    };

    await assert.rejects(async () => {
      // Wallet is on 54635, but request targets 4646
      await adapter.signTransfer(payload, 4646, verifyingContract);
    }, /Mock chain 54635 != expected 4646/);
  });

  it('handles user rejection gracefully with typed error', async () => {
    const adapter = new MockWalletAdapter();
    adapter.setShouldReject(true);

    await assert.rejects(async () => {
      await adapter.connect();
    }, /User rejected mock connection/);
  });

  it('emits chainChanged event when switching networks', async () => {
    const adapter = new MockWalletAdapter();
    await adapter.connect();

    let observedChain = 0;
    adapter.on('chainChanged', (newChain) => {
      observedChain = newChain;
    });

    await adapter.switchChain(4646);
    assert.strictEqual(observedChain, 4646);
    assert.strictEqual(await adapter.getChainId(), 4646);
  });
});
