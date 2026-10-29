import React, { useState } from 'react';
import {
  Wallet,
  ShieldCheck,
  Send,
  ArrowRightLeft,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  ExternalLink,
  Copy,
  Check,
  Zap,
  Info
} from 'lucide-react';
import { L2Transaction } from '../types';

interface WalletPageProps {
  address: string | null;
  chainId: number | null;
  isConnected: boolean;
  isBridgeKey: boolean;
  isConnecting: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onSwitchChain: (id: number) => void;
  onOpenSendModal: () => void;
  transactions: L2Transaction[];
  onSelectTx?: (txId: string) => void;
}

export const WalletPage: React.FC<WalletPageProps> = ({
  address,
  chainId,
  isConnected,
  isBridgeKey,
  isConnecting,
  onConnect,
  onDisconnect,
  onSwitchChain,
  onOpenSendModal,
  transactions,
  onSelectTx
}) => {
  const [copied, setCopied] = useState(false);

  const isSupportedNetwork = chainId === 91562037 || chainId === 4646;

  const copyAddress = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const userTransactions = transactions.filter(
    t => address && (t.sender.toLowerCase() === address.toLowerCase() || t.to.toLowerCase() === address.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-gray-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Wallet className="w-5 h-5 text-emerald-500" />
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              BridgeKey Wallet Management & EIP-712 Signing
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-gray-400">
            Secure client-side cryptographic key management, gasless state signatures, and L2 lifecycle tracking
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenSendModal}
            disabled={!isConnected}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-gray-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5 disabled:opacity-40"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send L2 Transfer</span>
          </button>
        </div>
      </div>

      {/* Network Alert if wrong chain */}
      {isConnected && !isSupportedNetwork && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Connected to unsupported Chain ID ({chainId}). Please switch to MST Coral Testnet.</span>
          </div>
          <button
            onClick={() => onSwitchChain(91562037)}
            className="px-3 py-1.5 rounded-lg bg-amber-500 text-gray-950 font-bold text-xs hover:bg-amber-400 transition-colors shrink-0"
          >
            Switch to 91562037
          </button>
        </div>
      )}

      {/* Wallet Card */}
      <div className="p-6 rounded-3xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-[#111827] shadow-sm">
        {isConnected && address ? (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-gray-800 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Connected Account
                </span>
                <div className="flex items-center gap-2 font-mono text-base font-bold text-slate-900 dark:text-white break-all mt-1">
                  <span>{address}</span>
                  <button
                    onClick={copyAddress}
                    className="p-1 rounded text-slate-400 hover:text-emerald-500 transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 border border-cyan-500/30">
                  {isBridgeKey ? 'BridgeKey Protocol' : 'EVM Injected'}
                </span>
                <button
                  onClick={onDisconnect}
                  className="px-3 py-1.5 rounded-xl border border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold transition-colors"
                >
                  Disconnect
                </button>
              </div>
            </div>

            {/* Quick Balances */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-gray-800/40 border border-slate-200 dark:border-gray-800">
                <div className="text-xs text-slate-500 dark:text-gray-400">Native Balance</div>
                <div className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">
                  10.500 <span className="text-xs font-normal text-slate-500">tMSTC</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-gray-800/40 border border-slate-200 dark:border-gray-800">
                <div className="text-xs text-slate-500 dark:text-gray-400">ProofPack Voucher Credit</div>
                <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                  250.00 <span className="text-xs font-normal text-slate-500">PPC</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-gray-800/40 border border-slate-200 dark:border-gray-800">
                <div className="text-xs text-slate-500 dark:text-gray-400">Network Environment</div>
                <div className="text-base font-bold font-mono text-slate-900 dark:text-white mt-1">
                  MST Coral Testnet
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                No Wallet Connected
              </h3>
              <p className="text-xs text-slate-500 dark:text-gray-400 max-w-sm mx-auto mt-1">
                Connect your BridgeKey Wallet or Injected Web3 extension to sign gasless L2 transfers
              </p>
            </div>
            <button
              onClick={onConnect}
              disabled={isConnecting}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-gray-950 font-bold text-xs shadow-md transition-all inline-flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              <span>{isConnecting ? 'Connecting...' : 'Connect BridgeKey Wallet'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Security & Cryptography Guarantee */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-gray-800 flex items-start gap-3 text-xs">
        <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-slate-900 dark:text-white">
            Client-Side Cryptographic Security
          </p>
          <p className="text-[11px] text-slate-600 dark:text-gray-400 leading-relaxed">
            ProofPack never requests or stores private keys or seed phrases. All transaction payloads are signed directly inside your wallet via standard EIP-712 typed structured data (<code className="font-mono text-emerald-600">ProofPack Transfer</code> domain) and verified mathematically on MST EVM.
          </p>
        </div>
      </div>

      {/* Connected Account Transfers */}
      {isConnected && (
        <div className="rounded-3xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-[#111827] shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-gray-800 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white">
              Your Signed L2 Transactions ({userTransactions.length})
            </h3>
            <span className="text-xs text-slate-400 font-mono">Live status tracking</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-gray-800/60 text-[11px] font-semibold text-slate-500 dark:text-gray-400 border-b border-slate-200 dark:border-gray-800">
                <tr>
                  <th className="py-2.5 px-4">Tx Hash</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4">Counterparty</th>
                  <th className="py-2.5 px-4">Amount</th>
                  <th className="py-2.5 px-4">Batch #</th>
                  <th className="py-2.5 px-4">Settlement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-gray-800/60 font-mono">
                {userTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-400 font-sans">
                      No transactions submitted from this wallet yet. Click "Send L2 Transfer" to begin!
                    </td>
                  </tr>
                ) : (
                  userTransactions.map(tx => (
                    <tr
                      key={tx.txId}
                      onClick={() => onSelectTx?.(tx.txId)}
                      className="hover:bg-slate-50 dark:hover:bg-gray-800/40 cursor-pointer transition-colors"
                    >
                      <td className="py-2.5 px-4 text-emerald-600 dark:text-emerald-400 font-bold">
                        {tx.txId.slice(0, 10)}...{tx.txId.slice(-6)}
                      </td>
                      <td className="py-2.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-slate-700 dark:text-gray-300">
                        {tx.to.slice(0, 6)}...{tx.to.slice(-4)}
                      </td>
                      <td className="py-2.5 px-4 font-bold text-slate-900 dark:text-white">
                        {(Number(tx.amount) / 1e18).toFixed(3)} MSTC
                      </td>
                      <td className="py-2.5 px-4 text-indigo-600 dark:text-indigo-400 font-bold">
                        {tx.batchId ? `#${tx.batchId}` : 'Queue'}
                      </td>
                      <td className="py-2.5 px-4 text-slate-500">
                        {tx.l1TxHash ? `${tx.l1TxHash.slice(0, 8)}...` : 'Pending'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
