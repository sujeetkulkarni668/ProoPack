import { Hex, Address } from 'viem';
import { TransferPayload } from '@proofpack/shared';

export interface EIP1193Provider {
  request(args: { method: string; params?: unknown[] | Record<string, unknown> }): Promise<unknown>;
  on(event: string, listener: (...args: any[]) => void): void;
  removeListener(event: string, listener: (...args: any[]) => void): void;
  isBridgeKey?: boolean;
}

export interface WalletState {
  isConnected: boolean;
  address: Address | null;
  chainId: number | null;
  walletName: string;
}

export interface WalletAdapterEvents {
  accountsChanged: (accounts: Address[]) => void;
  chainChanged: (chainId: number) => void;
  disconnect: () => void;
}

export interface IWalletAdapter {
  readonly name: string;
  isAvailable(): boolean;
  connect(): Promise<{ address: Address; chainId: number }>;
  disconnect(): Promise<void>;
  getAddress(): Address | null;
  getChainId(): Promise<number>;
  switchChain(chainId: number): Promise<void>;
  signTransfer(payload: TransferPayload, chainId: number, verifyingContract: Address): Promise<Hex>;
  on<K extends keyof WalletAdapterEvents>(event: K, listener: WalletAdapterEvents[K]): void;
  off<K extends keyof WalletAdapterEvents>(event: K, listener: WalletAdapterEvents[K]): void;
}
