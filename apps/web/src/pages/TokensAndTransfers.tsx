import React, { useState, useEffect } from 'react';
import {
  Coins,
  ArrowRightLeft,
  ExternalLink,
  ShieldCheck,
  Zap,
  RotateCw,
  Copy,
  Check
} from 'lucide-react';
import { TokenInfo, L2Transaction } from '../types';
import { fetchTokens } from '../services/api';

interface TokensAndTransfersProps {
  transactions: L2Transaction[];
  onSelectTx?: (txId: string) => void;
}

export const TokensAndTransfersPage: React.FC<TokensAndTransfersProps> = ({
  transactions,
  onSelectTx
}) => {
  const [tokens, setTokens] = useState<TokenInfo[]>([]);
  const [selectedToken, setSelectedToken] = useState<TokenInfo | null>(null);
  const [copiedAddr, setCopiedAddr] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTokens = async () => {
      try {
        const res = await fetchTokens();
        setTokens(res.tokens);
        if (res.tokens.length > 0) {
          setSelectedToken(res.tokens[0]);
        }
      } catch (err) {
        console.error('Failed to load tokens:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadTokens();
  }, []);

  const copyAddress = (addr: string) => {
    navigator.clipboard.writeText(addr);
    setCopiedAddr(addr);
    setTimeout(() => setCopiedAddr(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-gray-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Coins className="w-5 h-5 text-emerald-500" />
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Tokens & Transfer Activity
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-gray-400">
            Native MST gas asset, ProofPack Rollup Vouchers, and bridged ERC-20 token registry
          </p>
        </div>

        <a
          href="https://coral-faucet.mstblockchain.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="px-3.5 py-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 text-xs font-semibold transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <span>Claim Free Testnet Tokens</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Token Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tokens.map(token => {
          const isSelected = selectedToken?.symbol === token.symbol;
          return (
            <div
              key={token.symbol}
              onClick={() => setSelectedToken(token)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                isSelected
                  ? 'border-emerald-500/50 bg-emerald-500/5 shadow-md shadow-emerald-500/10'
                  : 'border-slate-200 dark:border-gray-800 bg-white dark:bg-[#111827] hover:border-slate-300 dark:hover:border-gray-700'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-gray-800 flex items-center justify-center font-bold font-mono text-emerald-600 dark:text-emerald-400 text-sm">
                  {token.symbol}
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    token.isNative
                      ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                      : 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-400'
                  }`}
                >
                  {token.isNative ? 'Native Gas' : 'L2 Token'}
                </span>
              </div>

              <div className="text-base font-extrabold text-slate-900 dark:text-white">
                {token.name}
              </div>
              <div className="text-xs text-slate-500 dark:text-gray-400 font-mono mt-0.5">
                Supply: {token.totalSupply} · {token.decimals} Decimals
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-gray-800/80 text-xs">
                <span className="text-slate-500">{token.holderCount.toLocaleString()} Holders</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {token.transferCount.toLocaleString()} Transfers
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Token Inspector */}
      {selectedToken && (
        <div className="p-6 rounded-3xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-[#111827] shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 dark:border-gray-800 pb-4 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {selectedToken.name} ({selectedToken.symbol})
                </h3>
                {selectedToken.isNative && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                    MST Blockchain Native Gas Token
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-gray-400 mt-1">
                <span>Contract: {selectedToken.address}</span>
                <button
                  onClick={() => copyAddress(selectedToken.address)}
                  className="p-1 rounded text-slate-400 hover:text-emerald-500"
                >
                  {copiedAddr === selectedToken.address ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {selectedToken.faucetUrl && (
              <a
                href={selectedToken.faucetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 text-xs font-semibold flex items-center gap-1.5 self-start md:self-auto"
              >
                <span>Request Free {selectedToken.symbol}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          {/* Transfers Table for this Token */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Recent Transfers in {selectedToken.symbol}
            </h4>
            <div className="rounded-2xl border border-slate-200 dark:border-gray-800 overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-gray-800/60 text-[11px] font-semibold text-slate-500 dark:text-gray-400 border-b border-slate-200 dark:border-gray-800">
                  <tr>
                    <th className="py-2.5 px-3">Transaction ID</th>
                    <th className="py-2.5 px-3">From</th>
                    <th className="py-2.5 px-3">To</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">Batch #</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-gray-800/60 font-mono">
                  {transactions.slice(0, 8).map(tx => (
                    <tr
                      key={tx.txId}
                      onClick={() => onSelectTx?.(tx.txId)}
                      className="hover:bg-slate-50 dark:hover:bg-gray-800/40 cursor-pointer transition-colors"
                    >
                      <td className="py-2.5 px-3 text-emerald-600 dark:text-emerald-400 font-bold">
                        {tx.txId.slice(0, 10)}...{tx.txId.slice(-6)}
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 dark:text-gray-300">
                        {tx.sender.slice(0, 6)}...{tx.sender.slice(-4)}
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 dark:text-gray-300">
                        {tx.to.slice(0, 6)}...{tx.to.slice(-4)}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">
                        {(Number(tx.amount) / 1e18).toFixed(3)} {selectedToken.symbol}
                      </td>
                      <td className="py-2.5 px-3 text-indigo-600 dark:text-indigo-400 font-bold">
                        {tx.batchId ? `#${tx.batchId}` : 'Queue'}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
