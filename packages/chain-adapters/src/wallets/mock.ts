import { Address, Hex, getAddress, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { IWalletAdapter, WalletAdapterEvents } from './types';
import { ProofPackError, ErrorCode, TransferPayload } from '@proofpack/shared';
import { TRANSFER_TYPES, getEIP712Domain } from '@proofpack/crypto';

export class MockWalletAdapter implements IWalletAdapter {
  public readonly name = 'Mock BridgeKey Wallet';
  private account: ReturnType<typeof privateKeyToAccount>;
  private currentChainId: number;
  private connected: boolean = false;
  private shouldReject: boolean = false;
  private listeners: Map<string, Array<(...args: any[]) => void>> = new Map();

  constructor(
    privateKey: Hex = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
    initialChainId: number = 54635
  ) {
    this.account = privateKeyToAccount(privateKey);
    this.currentChainId = initialChainId;
  }

  public setShouldReject(reject: boolean): void {
    this.shouldReject = reject;
  }

  public setAccount(privateKey: Hex): void {
    this.account = privateKeyToAccount(privateKey);
    this.emit('accountsChanged', [this.account.address]);
  }

  public isAvailable(): boolean {
    return true;
  }

  public async connect(): Promise<{ address: Address; chainId: number }> {
    if (this.shouldReject) {
      throw new ProofPackError(ErrorCode.USER_REJECTED, 'User rejected mock connection');
    }
    this.connected = true;
    return {
      address: this.account.address,
      chainId: this.currentChainId
    };
  }

  public async disconnect(): Promise<void> {
    this.connected = false;
    this.emit('disconnect');
  }

  public getAddress(): Address | null {
    return this.connected ? this.account.address : null;
  }

  public async getChainId(): Promise<number> {
    return this.currentChainId;
  }

  public async switchChain(chainId: number): Promise<void> {
    this.currentChainId = chainId;
    this.emit('chainChanged', chainId);
  }

  public async signTransfer(
    payload: TransferPayload,
    chainId: number,
    verifyingContract: Address
  ): Promise<Hex> {
    if (!this.connected) {
      throw new ProofPackError(ErrorCode.WALLET_NOT_CONNECTED, 'Mock wallet not connected');
    }
    if (this.shouldReject) {
      throw new ProofPackError(ErrorCode.USER_REJECTED, 'User rejected mock signing');
    }
    if (this.currentChainId !== chainId) {
      throw new ProofPackError(
        ErrorCode.NETWORK_MISMATCH,
        `Mock chain ${this.currentChainId} != expected ${chainId}`
      );
    }

    const domain = getEIP712Domain(chainId, verifyingContract);

    const signature = await this.account.signTypedData({
      domain,
      types: TRANSFER_TYPES,
      primaryType: 'Transfer',
      message: {
        sender: getAddress(payload.sender),
        to: getAddress(payload.to),
        amount: BigInt(payload.amount),
        fee: BigInt(payload.fee),
        nonce: BigInt(payload.nonce),
        validUntil: BigInt(payload.validUntil)
      }
    });

    return signature;
  }

  public on<K extends keyof WalletAdapterEvents>(event: K, listener: WalletAdapterEvents[K]): void {
    const existing = this.listeners.get(event) || [];
    existing.push(listener as any);
    this.listeners.set(event, existing);
  }

  public off<K extends keyof WalletAdapterEvents>(event: K, listener: WalletAdapterEvents[K]): void {
    const existing = this.listeners.get(event);
    if (!existing) return;
    this.listeners.set(event, existing.filter(l => l !== (listener as any)));
  }

  private emit<K extends keyof WalletAdapterEvents>(event: K, ...args: any[]): void {
    const list = this.listeners.get(event);
    if (list) {
      for (const fn of list) {
        try {
          fn(...args);
        } catch (e) {
          console.error(`Error in ${event} mock listener:`, e);
        }
      }
    }
  }
}
