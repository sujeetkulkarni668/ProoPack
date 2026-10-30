import { Address, Hex, getAddress } from 'viem';
import { EIP1193Provider, IWalletAdapter, WalletAdapterEvents } from './types';
import { ProofPackError, ErrorCode, TransferPayload, MST_NETWORKS } from '@proofpack/shared';
import { TRANSFER_TYPES, getEIP712Domain } from '@proofpack/crypto';

export class BridgeKeyWalletAdapter implements IWalletAdapter {
  public readonly name = 'BridgeKey Wallet';
  private provider: EIP1193Provider | null = null;
  private currentAddress: Address | null = null;
  private listeners: Map<string, Array<(...args: any[]) => void>> = new Map();
  private announcedProviders: any[] = [];

  constructor(customProvider?: EIP1193Provider) {
    if (customProvider) {
      this.provider = customProvider;
      this.attachListeners();
    } else if (typeof window !== 'undefined') {
      this.initEIP6963Listener();
      this.detectProvider();
    }
  }

  private initEIP6963Listener(): void {
    if (typeof window === 'undefined') return;
    try {
      window.addEventListener('eip6963:announceProvider', (event: any) => {
        if (event.detail && event.detail.provider) {
          this.announcedProviders.push(event.detail);
          const name = event.detail.info?.name?.toLowerCase() || '';
          const rdns = event.detail.info?.rdns?.toLowerCase() || '';
          if (name.includes('bridgekey') || rdns.includes('bridgekey')) {
            this.provider = event.detail.provider;
            this.attachListeners();
          }
        }
      });
      window.dispatchEvent(new Event('eip6963:requestProvider'));
    } catch {
      // EIP-6963 not supported in this environment
    }
  }

  private detectProvider(): EIP1193Provider | null {
    if (this.provider) return this.provider;
    if (typeof window === 'undefined') return null;

    const win = window as any;

    // 1. Check window.bridgekey (lowercase)
    if (win.bridgekey) {
      this.provider = win.bridgekey;
    }
    // 2. Check window.bridgeKey (camelCase)
    else if (win.bridgeKey) {
      this.provider = win.bridgeKey;
    }
    // 3. Check window.BridgeKey (PascalCase)
    else if (win.BridgeKey) {
      this.provider = win.BridgeKey;
    }
    // 4. Check window.ethereum.providers for explicit BridgeKey
    else if (Array.isArray(win.ethereum?.providers)) {
      const bkProvider = win.ethereum.providers.find(
        (p: any) =>
          p.isBridgeKey ||
          p.bridgekey ||
          p.name?.toLowerCase().includes('bridgekey') ||
          p.constructor?.name?.toLowerCase().includes('bridgekey')
      );
      if (bkProvider) {
        this.provider = bkProvider;
      } else {
        // Fallback to primary provider in multi-provider setup
        this.provider = win.ethereum;
      }
    }
    // 5. Check window.ethereum.isBridgeKey
    else if (win.ethereum?.isBridgeKey) {
      this.provider = win.ethereum;
    }
    // 6. Check announced EIP-6963 providers
    else if (this.announcedProviders.length > 0) {
      const announced = this.announcedProviders.find(
        (p: any) =>
          p.info?.name?.toLowerCase().includes('bridgekey') ||
          p.info?.rdns?.toLowerCase().includes('bridgekey')
      );
      if (announced) {
        this.provider = announced.provider;
      }
    }
    // 7. General Web3 EVM fallback (BridgeKey operates as standard EVM injected provider)
    else if (win.ethereum) {
      this.provider = win.ethereum;
    }

    if (this.provider) {
      this.attachListeners();
    }

    return this.provider;
  }

  /**
   * Polls briefly to wait for asynchronous extension injection
   */
  private async waitForProvider(timeoutMs = 1200): Promise<EIP1193Provider | null> {
    if (this.detectProvider()) return this.provider;

    const start = Date.now();
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        const found = this.detectProvider();
        if (found || Date.now() - start >= timeoutMs) {
          clearInterval(interval);
          resolve(found);
        }
      }, 80);
    });
  }

  private attachListeners(): void {
    if (!this.provider || typeof this.provider.on !== 'function') return;

    this.provider.on('accountsChanged', (accounts: string[]) => {
      if (!accounts || accounts.length === 0) {
        this.currentAddress = null;
        this.emit('disconnect');
      } else {
        this.currentAddress = getAddress(accounts[0]);
        this.emit('accountsChanged', [this.currentAddress]);
      }
    });

    this.provider.on('chainChanged', (chainIdHex: string) => {
      const chainId = parseInt(chainIdHex, 16);
      this.emit('chainChanged', chainId);
    });

    this.provider.on('disconnect', () => {
      this.currentAddress = null;
      this.emit('disconnect');
    });
  }

  public isAvailable(): boolean {
    if (this.provider) return true;
    if (typeof window !== 'undefined') {
      const win = window as any;
      return !!(win.bridgekey || win.bridgeKey || win.BridgeKey || win.ethereum);
    }
    return false;
  }

  public async connect(): Promise<{ address: Address; chainId: number }> {
    if (!this.provider) {
      await this.waitForProvider(1200);
    }

    if (!this.provider) {
      throw new ProofPackError(
        ErrorCode.WALLET_NOT_CONNECTED,
        'BridgeKey Wallet extension not detected. Please install BridgeKey from https://bridgekey.io/ or enable your Web3 extension.'
      );
    }

    try {
      const accounts = (await this.provider.request({
        method: 'eth_requestAccounts'
      })) as string[];

      if (!accounts || accounts.length === 0) {
        throw new ProofPackError(ErrorCode.WALLET_NOT_CONNECTED, 'No accounts returned by BridgeKey');
      }

      this.currentAddress = getAddress(accounts[0]);
      const chainId = await this.getChainId();

      return {
        address: this.currentAddress,
        chainId
      };
    } catch (err: any) {
      if (err.code === 4001 || err.message?.includes('User rejected')) {
        throw new ProofPackError(ErrorCode.USER_REJECTED, 'User rejected the connection request');
      }
      throw new ProofPackError(
        ErrorCode.WALLET_NOT_CONNECTED,
        err.message || 'Failed to connect BridgeKey Wallet'
      );
    }
  }

  public async disconnect(): Promise<void> {
    this.currentAddress = null;
    this.emit('disconnect');
  }

  public getAddress(): Address | null {
    return this.currentAddress;
  }

  public async getChainId(): Promise<number> {
    if (!this.provider) {
      throw new ProofPackError(ErrorCode.WALLET_NOT_CONNECTED, 'Wallet provider unavailable');
    }
    const hex = (await this.provider.request({ method: 'eth_chainId' })) as string;
    return parseInt(hex, 16);
  }

  public async switchChain(targetChainId: number): Promise<void> {
    if (!this.provider) {
      throw new ProofPackError(ErrorCode.WALLET_NOT_CONNECTED, 'Wallet provider unavailable');
    }

    const hexChainId = `0x${targetChainId.toString(16)}`;

    try {
      await this.provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: hexChainId }]
      });
    } catch (switchError: any) {
      // 4902 indicates chain not added yet
      if (switchError.code === 4902) {
        let netConfig: any = null;
        if (targetChainId === MST_NETWORKS.MAINNET.chainId) {
          netConfig = MST_NETWORKS.MAINNET;
        } else if (targetChainId === MST_NETWORKS.TESTNET.chainId) {
          netConfig = MST_NETWORKS.TESTNET;
        } else if (targetChainId === (MST_NETWORKS as any).LEGACY_TESTNET?.chainId) {
          netConfig = (MST_NETWORKS as any).LEGACY_TESTNET;
        }

        if (netConfig) {
          await this.provider.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: hexChainId,
                chainName: netConfig.name,
                nativeCurrency: netConfig.currency,
                rpcUrls: netConfig.rpcUrls,
                blockExplorerUrls: netConfig.blockExplorerUrls
              }
            ]
          });
          return;
        }
      }
      throw new ProofPackError(
        ErrorCode.UNSUPPORTED_CHAIN,
        `Failed to switch to chain ${targetChainId}: ${switchError.message}`
      );
    }
  }

  public async signTransfer(
    payload: TransferPayload,
    chainId: number,
    verifyingContract: Address
  ): Promise<Hex> {
    if (!this.provider || !this.currentAddress) {
      throw new ProofPackError(ErrorCode.WALLET_NOT_CONNECTED, 'Wallet not connected');
    }

    const currentChain = await this.getChainId();
    if (currentChain !== chainId) {
      throw new ProofPackError(
        ErrorCode.UNSUPPORTED_CHAIN,
        `Connected to chain ${currentChain}, but transfer requires chain ${chainId}`
      );
    }

    const domain = getEIP712Domain(chainId, verifyingContract);

    const dataToSign = JSON.stringify({
      types: TRANSFER_TYPES,
      primaryType: 'Transfer',
      domain,
      message: {
        sender: getAddress(payload.sender),
        to: getAddress(payload.to),
        amount: payload.amount.toString(),
        fee: payload.fee.toString(),
        nonce: payload.nonce.toString(),
        validUntil: payload.validUntil.toString()
      }
    });

    try {
      const signature = (await this.provider.request({
        method: 'eth_signTypedData_v4',
        params: [this.currentAddress, dataToSign]
      })) as Hex;

      return signature;
    } catch (err: any) {
      if (err.code === 4001 || err.message?.includes('User rejected')) {
        throw new ProofPackError(ErrorCode.USER_REJECTED, 'User rejected signing transfer');
      }
      throw new ProofPackError(
        ErrorCode.INVALID_SIGNATURE,
        err.message || 'BridgeKey signature request failed'
      );
    }
  }

  public on<K extends keyof WalletAdapterEvents>(
    event: K,
    callback: WalletAdapterEvents[K]
  ): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  public off<K extends keyof WalletAdapterEvents>(
    event: K,
    callback: WalletAdapterEvents[K]
  ): void {
    const list = this.listeners.get(event);
    if (!list) return;
    this.listeners.set(
      event,
      list.filter((cb) => cb !== callback)
    );
  }

  private emit<K extends keyof WalletAdapterEvents>(
    event: K,
    ...args: Parameters<WalletAdapterEvents[K]>
  ): void {
    const list = this.listeners.get(event);
    if (list) {
      list.forEach((cb) => {
        try {
          (cb as any)(...args);
        } catch (e) {
          console.error(`Error in BridgeKey ${event} listener:`, e);
        }
      });
    }
  }
}
