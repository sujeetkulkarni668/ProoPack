import https from 'https';
import { formatEther } from 'viem';

export interface VerifiedMainnetTx {
  hash: string;
  blockNumber: number;
  from: string;
  to: string;
  value: string;
  valueFormatted: string;
  timestamp: string;
  timestampMs: number;
  result: 'success' | 'failure' | 'pending';
  status: 'ok' | 'error' | 'pending';
  fee: string;
  feeFormatted: string;
  gasUsed: string;
  gasPrice: string;
  confirmations: number;
  revertReason: string | null;
  method: string | null;
  explorerUrl: string;
}

export interface VerifiedMainnetBlock {
  height: number;
  hash: string;
  parentHash: string;
  timestamp: string;
  timestampMs: number;
  txCount: number;
  miner: string;
  gasUsed: string;
  gasLimit: string;
  explorerUrl: string;
}

export interface MainnetTransactionsResponse {
  items: VerifiedMainnetTx[];
  total: number;
  nextPageParams?: {
    block_number: number;
    index: number;
    items_count: number;
  } | null;
  syncedAt: number;
  source: 'mstscan_v2';
}

export class MSTMainnetService {
  private readonly explorerApiBase: string = 'https://mstscan.com/api/v2';
  private readonly rpcUrl: string = 'https://mariorpc.mstblockchain.com/';
  private readonly expectedChainId: number = 4646;

  // In-memory cache for ultra-low latency & deduplication
  private cachedTxs: Map<string, VerifiedMainnetTx> = new Map();
  private cachedBlocks: Map<number, VerifiedMainnetBlock> = new Map();
  private lastFetchTime: number = 0;
  private isFetching: boolean = false;
  private syncTimer?: NodeJS.Timeout;

  constructor() {
    // Proactively prefetch on startup and periodically sync
    this.startBackgroundSync();
  }

  public startBackgroundSync(intervalMs = 8000): void {
    // Immediate initial sync
    this.syncFromExplorer().catch(() => {});
    if (!this.syncTimer) {
      this.syncTimer = setInterval(() => {
        this.syncFromExplorer().catch(() => {});
      }, intervalMs);
    }
  }

  public stopBackgroundSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = undefined;
    }
  }

  /**
   * HTTPS fetch with exponential backoff & 15s timeout
   */
  private async fetchWithRetry(url: string, retries = 2, delayMs = 600): Promise<any> {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await new Promise((resolve, reject) => {
          const req = https.get(
            url,
            {
              headers: {
                'User-Agent':
                  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                Accept: 'application/json'
              },
              timeout: 15000
            },
            res => {
              if (res.statusCode && (res.statusCode < 200 || res.statusCode >= 300)) {
                return reject(new Error(`HTTP ${res.statusCode} from ${url}`));
              }
              let data = '';
              res.on('data', chunk => (data += chunk));
              res.on('end', () => {
                try {
                  const json = JSON.parse(data);
                  resolve(json);
                } catch (e: any) {
                  reject(new Error(`Malformed JSON response from ${url}: ${e.message}`));
                }
              });
            }
          );

          req.on('timeout', () => {
            req.destroy();
            reject(new Error(`Timeout fetching ${url}`));
          });

          req.on('error', err => reject(err));
        });
      } catch (err) {
        if (attempt === retries) throw err;
        await new Promise(r => setTimeout(r, delayMs * Math.pow(2, attempt)));
      }
    }
  }

  /**
   * Background sync worker that pulls and validates MST Mainnet transactions
   */
  public async syncFromExplorer(): Promise<number> {
    if (this.isFetching) return this.cachedTxs.size;
    this.isFetching = true;

    try {
      const data = await this.fetchWithRetry(`${this.explorerApiBase}/transactions`);
      const rawItems = data?.items || [];
      const now = Date.now();

      for (const raw of rawItems) {
        // Enforce verified status: must be success / ok
        const isSuccess = raw.result === 'success' || raw.status === 'ok';
        if (!isSuccess) continue;

        const valWei = raw.value ? raw.value.toString() : '0';
        let valFormatted = '0.0000';
        try {
          valFormatted = Number(formatEther(BigInt(valWei))).toFixed(4);
        } catch {
          valFormatted = '0.0000';
        }

        const feeWei = raw.fee?.value ? raw.fee.value.toString() : '0';
        let feeFormatted = '0.0000';
        try {
          feeFormatted = Number(formatEther(BigInt(feeWei))).toFixed(6);
        } catch {
          feeFormatted = '0.0000';
        }

        const sender = raw.from?.hash || raw.from || '0x0000000000000000000000000000000000000000';
        const recipient = raw.to ? (raw.to.hash || raw.to) : 'Contract Deployment';
        const timestampMs = raw.timestamp ? new Date(raw.timestamp).getTime() : now;

        const item: VerifiedMainnetTx = {
          hash: raw.hash,
          blockNumber: raw.block_number || 0,
          from: sender,
          to: recipient,
          value: valWei,
          valueFormatted: `${valFormatted} MSTC`,
          timestamp: raw.timestamp,
          timestampMs,
          result: 'success',
          status: 'ok',
          fee: feeWei,
          feeFormatted: `${feeFormatted} MSTC`,
          gasUsed: raw.gas_used ? raw.gas_used.toString() : '21000',
          gasPrice: raw.gas_price ? raw.gas_price.toString() : '1000000000',
          confirmations: raw.confirmations || 1,
          revertReason: raw.revert_reason || null,
          method: raw.method || null,
          explorerUrl: `https://mstscan.com/tx/${raw.hash}`
        };

        // Deduplicate into cache
        this.cachedTxs.set(raw.hash, item);
      }

      this.lastFetchTime = now;
      return this.cachedTxs.size;
    } finally {
      this.isFetching = false;
    }
  }

  /**
   * Verifies the MST Mainnet RPC chain ID matches 4646
   */
  public async verifyRpcChainId(): Promise<{ verified: boolean; chainId: number; latencyMs: number }> {
    const startTime = Date.now();
    return new Promise((resolve, reject) => {
      const payload = JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_chainId',
        params: []
      });

      const req = https.request(
        this.rpcUrl,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload)
          },
          timeout: 6000
        },
        res => {
          let data = '';
          res.on('data', chunk => (data += chunk));
          res.on('end', () => {
            try {
              const json = JSON.parse(data);
              const hexId = json.result;
              const decId = parseInt(hexId, 16);
              resolve({
                verified: decId === this.expectedChainId,
                chainId: decId,
                latencyMs: Date.now() - startTime
              });
            } catch (e: any) {
              reject(e);
            }
          });
        }
      );

      req.on('timeout', () => {
        req.destroy();
        reject(new Error(`Timeout connecting to MST RPC at ${this.rpcUrl}`));
      });

      req.on('error', err => reject(err));
      req.write(payload);
      req.end();
    });
  }

  /**
   * Retrieves verified, successfully completed transactions from MST Mainnet
   */
  public async getLatestTransactions(params?: {
    limit?: number;
    forceRefresh?: boolean;
  }): Promise<MainnetTransactionsResponse> {
    const limit = params?.limit || 30;

    // If cache is empty, wait for sync
    if (this.cachedTxs.size === 0 || params?.forceRefresh) {
      await this.syncFromExplorer();
    }

    const sorted = Array.from(this.cachedTxs.values())
      .sort((a, b) => (b.blockNumber === a.blockNumber ? b.timestampMs - a.timestampMs : b.blockNumber - a.blockNumber))
      .slice(0, limit);

    return {
      items: sorted,
      total: sorted.length,
      syncedAt: this.lastFetchTime || Date.now(),
      source: 'mstscan_v2'
    };
  }

  /**
   * Retrieves single transaction by hash directly from MST Mainnet Explorer
   */
  public async getTransactionByHash(hash: string): Promise<VerifiedMainnetTx | null> {
    if (this.cachedTxs.has(hash)) {
      return this.cachedTxs.get(hash)!;
    }

    try {
      const raw = await this.fetchWithRetry(`${this.explorerApiBase}/transactions/${hash}`);
      if (!raw || !raw.hash) return null;

      const valWei = raw.value ? raw.value.toString() : '0';
      let valFormatted = '0.0000';
      try {
        valFormatted = Number(formatEther(BigInt(valWei))).toFixed(4);
      } catch {
        valFormatted = '0.0000';
      }

      const feeWei = raw.fee?.value ? raw.fee.value.toString() : '0';
      let feeFormatted = '0.0000';
      try {
        feeFormatted = Number(formatEther(BigInt(feeWei))).toFixed(6);
      } catch {
        feeFormatted = '0.0000';
      }

      const sender = raw.from?.hash || raw.from || '0x0000000000000000000000000000000000000000';
      const recipient = raw.to ? (raw.to.hash || raw.to) : 'Contract Deployment';
      const timestampMs = raw.timestamp ? new Date(raw.timestamp).getTime() : Date.now();

      const tx: VerifiedMainnetTx = {
        hash: raw.hash,
        blockNumber: raw.block_number || 0,
        from: sender,
        to: recipient,
        value: valWei,
        valueFormatted: `${valFormatted} MSTC`,
        timestamp: raw.timestamp,
        timestampMs,
        result: raw.result === 'success' ? 'success' : 'failure',
        status: raw.status === 'ok' ? 'ok' : 'error',
        fee: feeWei,
        feeFormatted: `${feeFormatted} MSTC`,
        gasUsed: raw.gas_used ? raw.gas_used.toString() : '21000',
        gasPrice: raw.gas_price ? raw.gas_price.toString() : '1000000000',
        confirmations: raw.confirmations || 1,
        revertReason: raw.revert_reason || null,
        method: raw.method || null,
        explorerUrl: `https://mstscan.com/tx/${raw.hash}`
      };

      this.cachedTxs.set(tx.hash, tx);
      return tx;
    } catch {
      return null;
    }
  }

  /**
   * Retrieves latest verified blocks from MST Mainnet
   */
  public async getLatestBlocks(limit = 10): Promise<VerifiedMainnetBlock[]> {
    try {
      const data = await this.fetchWithRetry(`${this.explorerApiBase}/blocks`);
      const rawBlocks = data?.items || [];
      const blocks: VerifiedMainnetBlock[] = [];

      for (const b of rawBlocks.slice(0, limit)) {
        const height = b.height;
        const minerAddr = b.miner?.hash || b.miner || '0x0000000000000000000000000000000000000000';
        const blockItem: VerifiedMainnetBlock = {
          height,
          hash: b.hash,
          parentHash: b.parent_hash,
          timestamp: b.timestamp,
          timestampMs: b.timestamp ? new Date(b.timestamp).getTime() : Date.now(),
          txCount: b.transactions_count || b.transaction_count || 0,
          miner: minerAddr,
          gasUsed: b.gas_used ? b.gas_used.toString() : '0',
          gasLimit: b.gas_limit ? b.gas_limit.toString() : '30000000',
          explorerUrl: `https://mstscan.com/block/${height}`
        };

        this.cachedBlocks.set(height, blockItem);
        blocks.push(blockItem);
      }

      return blocks;
    } catch {
      return Array.from(this.cachedBlocks.values()).slice(0, limit);
    }
  }
}
