import { Address, Hex, getAddress } from 'viem';
import { EIP1193Provider, IWalletAdapter, WalletAdapterEvents } from './types';
import { ProofPackError, ErrorCode, TransferPayload, MST_NETWORKS } from '@proofpack/shared';
import { TRANSFER_TYPES, getEIP712Domain } from '@proofpack/crypto';

export class BridgeKeyWalletAdapter implements IWalletAdapter {
  public readonly name = 'BridgeKey Wallet';
  private provider: EIP1193Provider | null = null;
  private currentAddress: Address | null = null;
  private listeners: Map<string, Array<(...args: any[]) => void>> = new Map();

  constructor(customProvider?: EIP1193Provider) {
    if (customProvider) {
      this.provider = customProvider;
      this.attachListeners();
    } else if (typeof window !== 'undefined') {
      this.detectProvider();
    }
  }

  private detectProvider(): void {
    const win = window as any;
    if (win.bridgekey) {
      this.provider = win.bridgekey;
    } else if (win.ethereum?.isBridgeKey) {
      this.provider = win.ethereum;
    } else if (win.ethereum) {
      // Fallback to standard injected provider if BridgeKey is selected in multi-wallet environment
      this.provider = win.ethereum;
    }
    if (this.provider) {
      this.attachListeners();
    }
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
      return !!(win.bridgekey || win.ethereum);
    }
    return false;
  }

  public async connect(): Promise<{ address: Address; chainId: number }> {
    if (!this.provider) {
      this.detectProvider();
    }

    if (!this.provider) {
      throw new ProofPackError(
        ErrorCode.WALLET_NOT_CONNECTED,
        'BridgeKey Wallet extension not detected. Please install BridgeKey Wallet.'
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
        ErrorCode.NETWORK_MISMATCH,
        `Wallet is on chain ${currentChain}, but transaction targets chain ${chainId}. Switch chain first.`
      );
    }

    const domain = getEIP712Domain(chainId, verifyingContract);

    const message = {
      sender: getAddress(payload.sender),
      to: getAddress(payload.to),
      amount: payload.amount.toString(),
      fee: payload.fee.toString(),
      nonce: payload.nonce.toString(),
      validUntil: payload.validUntil.toString()
    };

    const dataToSign = JSON.stringify({
      types: {
        EIP712Domain: [
          { name: 'name', type: 'string' },
          { name: 'version', type: 'string' },
          { name: 'chainId', type: 'uint256' },
          { name: 'verifyingContract', type: 'address' }
        ],
        Transfer: TRANSFER_TYPES.Transfer
      },
      primaryType: 'Transfer',
      domain,
      message
    });

    try {
      const signature = (await this.provider.request({
        method: 'eth_signTypedData_v4',
        params: [this.currentAddress, dataToSign]
      })) as Hex;

      return signature;
    } catch (err: any) {
      if (err.code === 4001 || err.message?.includes('User rejected')) {
        throw new ProofPackError(ErrorCode.USER_REJECTED, 'Signature rejected by user');
      }
      throw new ProofPackError(
        ErrorCode.INVALID_SIGNATURE,
        `BridgeKey signing failed: ${err.message}`
      );
    }
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
          console.error(`Error in ${event} listener:`, e);
        }
      }
    }
  }
}
