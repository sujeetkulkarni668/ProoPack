import {
  createPublicClient,
  createWalletClient,
  http,
  Hex,
  Address,
  PublicClient,
  WalletClient
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { MST_NETWORKS, ProofPackError, ErrorCode } from '@proofpack/shared';

export interface IMSTClientConfig {
  chainId: number;
  rpcUrl?: string;
  operatorPrivateKey?: Hex;
}

export class MSTClient {
  public readonly chainId: number;
  public readonly rpcUrl: string;
  public readonly publicClient: PublicClient;
  public readonly walletClient?: WalletClient;

  constructor(config: IMSTClientConfig) {
    this.chainId = config.chainId;

    let defaultRpc = 'http://127.0.0.1:8545';
    if (this.chainId === MST_NETWORKS.MAINNET.chainId) {
      defaultRpc = MST_NETWORKS.MAINNET.rpcUrls[0];
    } else if (this.chainId === MST_NETWORKS.TESTNET.chainId) {
      defaultRpc = MST_NETWORKS.TESTNET.rpcUrls[0];
    }

    this.rpcUrl = config.rpcUrl || defaultRpc;

    this.publicClient = createPublicClient({
      transport: http(this.rpcUrl)
    });

    if (config.operatorPrivateKey) {
      const account = privateKeyToAccount(config.operatorPrivateKey);
      this.walletClient = createWalletClient({
        account,
        transport: http(this.rpcUrl)
      });
    }
  }

  public async getBlockNumber(): Promise<bigint> {
    try {
      return await this.publicClient.getBlockNumber();
    } catch (err: any) {
      throw new ProofPackError(
        ErrorCode.NETWORK_MISMATCH,
        `Failed to reach MST RPC at ${this.rpcUrl}: ${err.message}`
      );
    }
  }

  public async getBalance(address: Address): Promise<bigint> {
    return await this.publicClient.getBalance({ address });
  }

  public async getGasPrice(): Promise<bigint> {
    return await this.publicClient.getGasPrice();
  }

  public async checkHealth(): Promise<{ status: 'healthy' | 'unreachable'; latencyMs: number; blockNumber?: string }> {
    const start = Date.now();
    try {
      const block = await this.publicClient.getBlockNumber();
      return {
        status: 'healthy',
        latencyMs: Date.now() - start,
        blockNumber: block.toString()
      };
    } catch {
      return {
        status: 'unreachable',
        latencyMs: Date.now() - start
      };
    }
  }
}
