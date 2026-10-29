import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Copy,
  Check,
  ArrowDownLeft,
  ArrowUpRight,
  Boxes,
  Coins,
  ShieldCheck,
  ExternalLink,
  RotateCw
} from 'lucide-react';
import { AddressDetails } from '../types';
import { fetchAddressDetails } from '../services/api';

interface AddressesPageProps {
  initialAddress?: string | null;
  onSelectTx?: (txId: string) => void;
  onSelectBatch?: (batchId: number) => void;
}

export const AddressesPage: React.FC<AddressesPageProps> = ({
  initialAddress,
  onSelectTx,
  onSelectBatch
}) => {
  const defaultAddress = initialAddress || '0x70997970C51812dc3A010C7d01b50e0d17dc79C8';
  const [searchAddr, setSearchAddr] = useState(defaultAddress);
  const [currentAddress, setCurrentAddress] = useState(defaultAddress);
  const [details, setDetails] = useState<AddressDetails | null>(null);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAddress = async (addr: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchAddressDetails(addr);
      setDetails(res);
      setCurrentAddress(addr);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch address details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAddress(defaultAddress);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchAddr.trim()) return;
    loadAddress(searchAddr.trim());
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(currentAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-gray-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-5 h-5 text-emerald-500" />
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Address Ledger & Account Balances
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-gray-400">
            Lookup any EVM account, native MST balance, ProofPack vouchers, and L2 transaction history
          </p>
        </div>
      </div>

      {/* Address Search Bar */}
      <div className="p-4 rounded-2xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-[#111827] shadow-sm">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchAddr}
              onChange={e => setSearchAddr(e.target.value)}
              placeholder="Enter 0x... EVM address to inspect balances and history"
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-900 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
          >
            {isLoading ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <span>Search</span>}
          </button>
        </form>

        {error && (
          <div className="mt-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs">
            {error}
          </div>
        )}
      </div>

      {/* Account Overview Cards */}
      {details && (
        <>
          <div className="p-6 rounded-3xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-[#111827] shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-gray-800 pb-4 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                    {details.addressType}
                  </span>
                  <span className="text-xs text-slate-400">MST Coral Testnet (91562037)</span>
                </div>
                <div className="flex items-center gap-2 font-mono text-sm sm:text-base font-bold text-slate-900 dark:text-white break-all">
                  <span>{details.address}</span>
                  <button
                    onClick={copyAddress}
                    className="p-1 rounded text-slate-400 hover:text-emerald-500 transition-colors shrink-0"
                    title="Copy full address"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <a
                href={`https://testnet.mstscan.com/address/${details.address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 self-start md:self-auto"
              >
                <span>MSTScan Explorer</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Token Balances Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {details.tokenBalances.map(tb => (
                <div
                  key={tb.symbol}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-800/40"
                >
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-gray-400 mb-1">
                    <span className="font-semibold">{tb.name}</span>
                    <Coins className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                  <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                    {tb.balance} <span className="text-xs font-normal text-slate-500">{tb.symbol}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-[#111827]">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Incoming Txs</span>
              <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                <ArrowDownLeft className="w-5 h-5" />
                <span>{details.txCountIncoming}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-[#111827]">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Outgoing Txs</span>
              <div className="text-2xl font-bold font-mono text-cyan-600 dark:text-cyan-400 mt-1 flex items-center gap-1">
                <ArrowUpRight className="w-5 h-5" />
                <span>{details.txCountOutgoing}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-[#111827]">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Total Transfers</span>
              <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">
                {details.transactions.length}
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-[#111827]">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Associated Batches</span>
              <div className="text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400 mt-1">
                {details.associatedBatches.length} Batches
              </div>
            </div>
          </div>

          {/* Transfer History Table */}
          <div className="rounded-3xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-[#111827] shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-gray-800">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                Account Transfer History ({details.transactions.length})
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-gray-800/60 text-[11px] font-semibold text-slate-500 dark:text-gray-400 border-b border-slate-200 dark:border-gray-800">
                  <tr>
                    <th className="py-2.5 px-4">Direction</th>
                    <th className="py-2.5 px-4">Tx Hash</th>
                    <th className="py-2.5 px-4">Counterparty</th>
                    <th className="py-2.5 px-4">Amount</th>
                    <th className="py-2.5 px-4">Batch #</th>
                    <th className="py-2.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-gray-800/60 font-mono">
                  {details.transactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-400 font-sans">
                        No transactions recorded for this address yet.
                      </td>
                    </tr>
                  ) : (
                    details.transactions.map(tx => {
                      const isIncoming = tx.to.toLowerCase() === currentAddress.toLowerCase();
                      const counterparty = isIncoming ? tx.sender : tx.to;
                      return (
                        <tr
                          key={tx.txId}
                          onClick={() => onSelectTx?.(tx.txId)}
                          className="hover:bg-slate-50 dark:hover:bg-gray-800/40 cursor-pointer transition-colors"
                        >
                          <td className="py-2.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                isIncoming
                                  ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                                  : 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-400'
                              }`}
                            >
                              {isIncoming ? (
                                <>
                                  <ArrowDownLeft className="w-3 h-3" /> IN
                                </>
                              ) : (
                                <>
                                  <ArrowUpRight className="w-3 h-3" /> OUT
                                </>
                              )}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-emerald-600 dark:text-emerald-400 font-bold">
                            {tx.txId.slice(0, 10)}...{tx.txId.slice(-6)}
                          </td>
                          <td className="py-2.5 px-4 text-slate-700 dark:text-gray-300">
                            {counterparty.slice(0, 6)}...{counterparty.slice(-4)}
                          </td>
                          <td className="py-2.5 px-4 font-bold text-slate-900 dark:text-white">
                            {(Number(tx.amount) / 1e18).toFixed(3)} MSTC
                          </td>
                          <td className="py-2.5 px-4 text-indigo-600 dark:text-indigo-400 font-bold">
                            {tx.batchId ? `#${tx.batchId}` : 'Queue'}
                          </td>
                          <td className="py-2.5 px-4">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                              {tx.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
