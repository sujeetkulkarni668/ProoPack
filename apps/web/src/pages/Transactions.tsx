import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowRightLeft,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Boxes,
  Zap,
  ExternalLink,
  Copy,
  Check,
  X,
  ShieldCheck,
  TrendingDown,
  Layers,
  RotateCw,
  Radio,
  Globe2,
  AlertCircle,
  Hash,
  Database
} from 'lucide-react';
import { L2Transaction, VerifiedMainnetTx } from '../types';
import {
  triggerOperatorFlush,
  fetchMainnetTransactions,
  fetchMainnetStatus
} from '../services/api';

interface TransactionsPageProps {
  transactions: L2Transaction[];
  selectedTxId?: string | null;
  onSelectBatch: (batchId: number) => void;
  onRefresh?: () => void;
}

export const TransactionsPage: React.FC<TransactionsPageProps> = ({
  transactions,
  selectedTxId: initialSelectedTxId,
  onSelectBatch,
  onRefresh
}) => {
  // Tab: 'mainnet' (MST Mainnet) vs 'l2' (ProofPack L2 Rollup)
  const [activeTab, setActiveTab] = useState<'mainnet' | 'l2'>('mainnet');

  // Mainnet state
  const [mainnetTxs, setMainnetTxs] = useState<VerifiedMainnetTx[]>([]);
  const [isMainnetLoading, setIsMainnetLoading] = useState(true);
  const [mainnetError, setMainnetError] = useState<string | null>(null);
  const [mainnetPage, setMainnetPage] = useState(1);
  const [selectedMainnetTx, setSelectedMainnetTx] = useState<VerifiedMainnetTx | null>(null);
  const [autoRefreshMainnet, setAutoRefreshMainnet] = useState(true);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

  // L2 state
  const [selectedTx, setSelectedTx] = useState<L2Transaction | null>(
    initialSelectedTxId ? transactions.find(t => t.txId === initialSelectedTxId) || null : null
  );
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [batchFilter, setBatchFilter] = useState('ALL');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isFlushing, setIsFlushing] = useState(false);
  const [l2Page, setL2Page] = useState(1);

  const pageSize = 12;
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Fetch Mainnet transactions
  const loadMainnetTransactions = async (force = false) => {
    try {
      if (mainnetTxs.length === 0) setIsMainnetLoading(true);
      const res = await fetchMainnetTransactions(40, force);
      if (res && res.items) {
        setMainnetTxs(res.items);
        setLastSyncedAt(new Date());
        setMainnetError(null);
      }
    } catch (err: any) {
      console.error('Error fetching MST Mainnet transactions:', err);
      if (mainnetTxs.length === 0) {
        setMainnetError(err.message || 'Failed to retrieve MST Mainnet transactions');
      }
    } finally {
      setIsMainnetLoading(false);
    }
  };

  // Auto-polling for Mainnet transactions
  useEffect(() => {
    loadMainnetTransactions();
    if (autoRefreshMainnet) {
      pollTimerRef.current = setInterval(() => {
        loadMainnetTransactions();
      }, 4000);
    }
    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [autoRefreshMainnet]);

  // Flush mempool handler
  const handleFlush = async () => {
    setIsFlushing(true);
    try {
      await triggerOperatorFlush();
      onRefresh?.();
    } catch (err: any) {
      alert(`Flush failed: ${err.message}`);
    } finally {
      setIsFlushing(false);
    }
  };

  // Mainnet filter
  const filteredMainnet = mainnetTxs.filter(tx => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      tx.hash.toLowerCase().includes(s) ||
      tx.from.toLowerCase().includes(s) ||
      (tx.to && tx.to.toLowerCase().includes(s)) ||
      (tx.blockNumber && tx.blockNumber.toString().includes(s))
    );
  });

  const mainnetTotalPages = Math.max(1, Math.ceil(filteredMainnet.length / pageSize));
  const paginatedMainnet = filteredMainnet.slice(
    (mainnetPage - 1) * pageSize,
    mainnetPage * pageSize
  );

  // L2 filter
  const filteredL2 = transactions.filter(t => {
    const s = search.toLowerCase();
    const matchesSearch =
      !search ||
      t.txId.toLowerCase().includes(s) ||
      t.sender.toLowerCase().includes(s) ||
      t.to.toLowerCase().includes(s);
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchesBatch =
      batchFilter === 'ALL' ||
      (batchFilter === 'QUEUED' && !t.batchId) ||
      (t.batchId && t.batchId.toString() === batchFilter);
    return matchesSearch && matchesStatus && matchesBatch;
  });

  const l2TotalPages = Math.max(1, Math.ceil(filteredL2.length / pageSize));
  const paginatedL2 = filteredL2.slice((l2Page - 1) * pageSize, l2Page * pageSize);
  const batchIds = Array.from(new Set(transactions.map(t => t.batchId).filter(Boolean))) as number[];

  // Format MSTC from Wei
  const formatMstc = (valueWei?: string) => {
    if (!valueWei || valueWei === '0') return '0.0000';
    try {
      const num = Number(BigInt(valueWei)) / 1e18;
      return num < 0.0001 ? '< 0.0001' : num.toFixed(4);
    } catch {
      return '0.0000';
    }
  };

  // Format time relative
  const formatTimeAgo = (isoTime: string) => {
    const diff = Math.floor((Date.now() - new Date(isoTime).getTime()) / 1000);
    if (diff < 10) return 'Just now';
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Network Stats Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-8 h-8 rounded-xl bg-[#00F5A0]/10 border border-[#00F5A0]/30 flex items-center justify-center text-[#00F5A0]">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <span>Transactions Registry</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-[#00F5A0]/15 text-[#00F5A0] border border-[#00F5A0]/30">
                MST Mainnet (Chain 4646)
              </span>
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            Real-time verified transaction stream synced directly from the MST Blockchain Mainnet & ProofPack L2 Rollup
          </p>
        </div>

        {/* Action Buttons & Sync Status */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Live Sync Status */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0C1424] border border-white/10 text-xs">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00F5A0] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00F5A0]"></span>
            </span>
            <span className="text-slate-300 font-medium text-[11px]">
              {autoRefreshMainnet ? 'Live Sync Active (4s)' : 'Sync Paused'}
            </span>
            <button
              onClick={() => setAutoRefreshMainnet(!autoRefreshMainnet)}
              className="text-[10px] font-bold text-[#00F5A0] hover:underline ml-1"
            >
              {autoRefreshMainnet ? 'Pause' : 'Resume'}
            </button>
          </div>

          <button
            onClick={() => loadMainnetTransactions(true)}
            className="p-2 rounded-xl border border-white/10 bg-[#0C1424] hover:bg-[#121c33] text-slate-300 hover:text-white transition-all text-xs flex items-center gap-1.5"
            title="Force refresh MST Mainnet transactions"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium hidden sm:inline">Refresh</span>
          </button>

          {activeTab === 'l2' && (
            <button
              onClick={handleFlush}
              disabled={isFlushing}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#00F5A0] to-[#00D287] hover:opacity-90 text-gray-950 font-bold text-xs shadow-lg shadow-[#00F5A0]/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{isFlushing ? 'Aggregating...' : 'Flush Mempool Batch'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Tab Selector: MST Mainnet vs ProofPack L2 */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActiveTab('mainnet');
              setSearch('');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'mainnet'
                ? 'bg-[#00F5A0]/15 text-[#00F5A0] border border-[#00F5A0]/40 shadow-sm shadow-[#00F5A0]/10'
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            <Globe2 className="w-4 h-4" />
            <span>MST Mainnet Verified Transactions</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#00F5A0]/20 text-[#00F5A0] font-mono">
              {mainnetTxs.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('l2');
              setSearch('');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'l2'
                ? 'bg-[#00F5A0]/15 text-[#00F5A0] border border-[#00F5A0]/40 shadow-sm shadow-[#00F5A0]/10'
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>ProofPack L2 Rollup Queue</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300 font-mono">
              {transactions.length}
            </span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400 font-mono">
          <span>Target RPC:</span>
          <span className="text-[#00F5A0]">mariorpc.mstblockchain.com</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl border border-white/10 bg-[#0C1424] flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex flex-wrap items-center gap-2 flex-1 max-w-xl">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setMainnetPage(1);
                setL2Page(1);
              }}
              placeholder={
                activeTab === 'mainnet'
                  ? 'Search by Tx Hash, From/To address, or Block number...'
                  : 'Search by TxID, sender, or recipient...'
              }
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-white/10 bg-[#070C18] text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#00F5A0] focus:ring-1 focus:ring-[#00F5A0]/40"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {activeTab === 'l2' && (
            <>
              {/* Status filter */}
              <select
                value={statusFilter}
                onChange={e => {
                  setStatusFilter(e.target.value);
                  setL2Page(1);
                }}
                className="px-3 py-1.5 rounded-xl border border-white/10 bg-[#070C18] text-xs font-medium text-slate-300 focus:outline-none focus:border-[#00F5A0]"
              >
                <option value="ALL">All Statuses</option>
                <option value="SETTLED">Settled</option>
                <option value="QUEUED">Queued / Mempool</option>
                <option value="COMMITTED">Committed</option>
                <option value="FAILED">Failed</option>
              </select>

              {/* Batch filter */}
              <select
                value={batchFilter}
                onChange={e => {
                  setBatchFilter(e.target.value);
                  setL2Page(1);
                }}
                className="px-3 py-1.5 rounded-xl border border-white/10 bg-[#070C18] text-xs font-medium text-slate-300 focus:outline-none focus:border-[#00F5A0]"
              >
                <option value="ALL">All Batches</option>
                {batchIds.map(b => (
                  <option key={b} value={b.toString()}>
                    Batch #{b}
                  </option>
                ))}
                <option value="QUEUED">Unbatched (Queue)</option>
              </select>
            </>
          )}
        </div>

        <div className="text-xs text-slate-400 font-mono">
          {activeTab === 'mainnet' ? (
            <span>
              Showing {paginatedMainnet.length} of {filteredMainnet.length} Mainnet transactions
            </span>
          ) : (
            <span>
              Showing {paginatedL2.length} of {filteredL2.length} L2 transactions
            </span>
          )}
        </div>
      </div>

      {/* TAB 1: MST MAINNET VERIFIED TRANSACTIONS */}
      {activeTab === 'mainnet' && (
        <div className="rounded-3xl border border-white/10 bg-[#0C1424] shadow-xl overflow-hidden">
          {mainnetError && (
            <div className="p-4 bg-rose-500/10 border-b border-rose-500/20 text-rose-400 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{mainnetError}</span>
              </div>
              <button
                onClick={() => loadMainnetTransactions(true)}
                className="px-2.5 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold"
              >
                Retry
              </button>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#070C18]/80 text-[11px] font-semibold text-slate-400 border-b border-white/10 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Tx Hash</th>
                  <th className="py-3 px-4">Method / Status</th>
                  <th className="py-3 px-4">Block #</th>
                  <th className="py-3 px-4">Age</th>
                  <th className="py-3 px-4">From</th>
                  <th className="py-3 px-4">To</th>
                  <th className="py-3 px-4">Value</th>
                  <th className="py-3 px-4">Tx Fee</th>
                  <th className="py-3 px-4 text-right">Explorer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {isMainnetLoading && mainnetTxs.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <RotateCw className="w-6 h-6 text-[#00F5A0] animate-spin" />
                        <span className="text-xs">Connecting to MST Mainnet API & mariorpc (Chain 4646)...</span>
                      </div>
                    </td>
                  </tr>
                ) : paginatedMainnet.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <ArrowRightLeft className="w-8 h-8 text-slate-600" />
                        <span className="text-sm font-semibold text-slate-300">No Transactions Found</span>
                        <span className="text-xs text-slate-500">
                          {search
                            ? `No Mainnet transactions match "${search}"`
                            : 'Waiting for new Mainnet blocks...'}
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedMainnet.map(tx => {
                    const isSuccess =
                      tx.result === 'success' ||
                      tx.status === 'ok' ||
                      (tx as any).status === '1';

                    return (
                      <tr
                        key={tx.hash}
                        onClick={() => setSelectedMainnetTx(tx)}
                        className="hover:bg-white/[0.03] cursor-pointer transition-colors"
                      >
                        {/* Tx Hash */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[#00F5A0] font-bold hover:underline">
                              {tx.hash.slice(0, 10)}...{tx.hash.slice(-6)}
                            </span>
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                copyToClipboard(tx.hash, tx.hash);
                              }}
                              className="text-slate-500 hover:text-white transition-colors"
                              title="Copy transaction hash"
                            >
                              {copiedField === tx.hash ? (
                                <Check className="w-3 h-3 text-[#00F5A0]" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isSuccess
                                ? 'bg-[#00F5A0]/15 text-[#00F5A0] border border-[#00F5A0]/30'
                                : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                            }`}
                          >
                            <ShieldCheck className="w-3 h-3" />
                            <span>{isSuccess ? 'Success' : 'Failed'}</span>
                          </span>
                        </td>

                        {/* Block */}
                        <td className="py-3.5 px-4 text-slate-300">
                          <span className="text-indigo-400 font-semibold">
                            #{tx.blockNumber?.toLocaleString() ?? 'Pending'}
                          </span>
                        </td>

                        {/* Age */}
                        <td className="py-3.5 px-4 text-slate-400 font-sans text-xs">
                          {tx.timestamp ? formatTimeAgo(tx.timestamp) : '—'}
                        </td>

                        {/* From */}
                        <td className="py-3.5 px-4 text-slate-300">
                          <span title={tx.from}>
                            {tx.from.slice(0, 6)}...{tx.from.slice(-4)}
                          </span>
                        </td>

                        {/* To */}
                        <td className="py-3.5 px-4 text-slate-300">
                          {tx.to ? (
                            <span title={tx.to}>
                              {tx.to.slice(0, 6)}...{tx.to.slice(-4)}
                            </span>
                          ) : (
                            <span className="text-amber-400 text-[10px] font-mono">Contract Creation</span>
                          )}
                        </td>

                        {/* Value */}
                        <td className="py-3.5 px-4 font-bold text-white">
                          {tx.valueFormatted || formatMstc(tx.value)}
                        </td>

                        {/* Fee */}
                        <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                          {tx.feeFormatted || '< 0.0001 MSTC'}
                        </td>

                        {/* Explorer Link */}
                        <td className="py-3.5 px-4 text-right">
                          <a
                            href={`https://mstscan.com/tx/${tx.hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-[11px] text-[#00F5A0] hover:text-[#00D287] hover:underline"
                          >
                            <span>MSTScan</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {mainnetTotalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-white/10 bg-[#070C18]/60 text-xs">
              <span className="text-slate-400">
                Page {mainnetPage} of {mainnetTotalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMainnetPage(p => Math.max(1, p - 1))}
                  disabled={mainnetPage === 1}
                  className="px-3 py-1 rounded-lg border border-white/10 bg-[#0C1424] text-slate-300 hover:text-white disabled:opacity-40 transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => setMainnetPage(p => Math.min(mainnetTotalPages, p + 1))}
                  disabled={mainnetPage === mainnetTotalPages}
                  className="px-3 py-1 rounded-lg border border-white/10 bg-[#0C1424] text-slate-300 hover:text-white disabled:opacity-40 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PROOFPACK L2 ROLLUP QUEUE & BATCHES */}
      {activeTab === 'l2' && (
        <div className="rounded-3xl border border-white/10 bg-[#0C1424] shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#070C18]/80 text-[11px] font-semibold text-slate-400 border-b border-white/10 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Transaction Hash</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Age</th>
                  <th className="py-3 px-4">Sender</th>
                  <th className="py-3 px-4">Recipient</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Batch #</th>
                  <th className="py-3 px-4">Proof Status</th>
                  <th className="py-3 px-4">Settlement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {paginatedL2.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      No L2 transactions match the selected filter.
                    </td>
                  </tr>
                ) : (
                  paginatedL2.map(tx => {
                    const amountMSTC = (Number(tx.amount) / 1e18).toFixed(3);
                    const ageSec = Math.floor((Date.now() - tx.createdAt) / 1000);
                    const ageText =
                      ageSec < 60 ? `${ageSec}s ago` : `${Math.floor(ageSec / 60)}m ago`;

                    return (
                      <tr
                        key={tx.txId}
                        onClick={() => setSelectedTx(tx)}
                        className="hover:bg-white/[0.03] cursor-pointer transition-colors"
                      >
                        <td className="py-3 px-4 text-[#00F5A0] font-bold">
                          {tx.txId.slice(0, 10)}...{tx.txId.slice(-6)}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              tx.status === 'SETTLED'
                                ? 'bg-[#00F5A0]/20 text-[#00F5A0]'
                                : 'bg-amber-500/20 text-amber-400'
                            }`}
                          >
                            {tx.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-400 font-sans">
                          {ageText}
                        </td>
                        <td className="py-3 px-4 text-slate-300">
                          {tx.sender.slice(0, 6)}...{tx.sender.slice(-4)}
                        </td>
                        <td className="py-3 px-4 text-slate-300">
                          {tx.to.slice(0, 6)}...{tx.to.slice(-4)}
                        </td>
                        <td className="py-3 px-4 font-bold text-white">
                          {amountMSTC} MSTC
                        </td>
                        <td className="py-3 px-4">
                          {tx.batchId ? (
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                onSelectBatch(tx.batchId!);
                              }}
                              className="text-indigo-400 font-bold hover:underline"
                            >
                              #{tx.batchId}
                            </button>
                          ) : (
                            <span className="text-slate-500">Queue</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className="flex items-center gap-1 text-[10px] text-[#00F5A0]">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Verified</span>
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-400">
                          {tx.l1TxHash ? `${tx.l1TxHash.slice(0, 6)}...` : 'Pending'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination controls */}
          {l2TotalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-white/10 bg-[#070C18]/60 text-xs">
              <span className="text-slate-400">
                Page {l2Page} of {l2TotalPages}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setL2Page(p => Math.max(1, p - 1))}
                  disabled={l2Page === 1}
                  className="px-2.5 py-1 rounded-lg border border-white/10 text-slate-300 hover:text-white disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  onClick={() => setL2Page(p => Math.min(l2TotalPages, p + 1))}
                  disabled={l2Page === l2TotalPages}
                  className="px-2.5 py-1 rounded-lg border border-white/10 text-slate-300 hover:text-white disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: MST MAINNET TRANSACTION DETAILS */}
      {selectedMainnetTx && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0C1424] border border-white/10 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#00F5A0]/10 border border-[#00F5A0]/30 flex items-center justify-center text-[#00F5A0]">
                  <Globe2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    <span>MST Mainnet Transaction</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#00F5A0]/15 text-[#00F5A0] border border-[#00F5A0]/30">
                      Chain 4646
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    {selectedMainnetTx.hash}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedMainnetTx(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status Banner */}
            <div className="p-3.5 rounded-2xl bg-[#00F5A0]/10 border border-[#00F5A0]/25 flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#00F5A0]" />
                <div>
                  <div className="text-xs font-bold text-white">
                    Confirmed on MST Blockchain Mainnet
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Block #{selectedMainnetTx.blockNumber?.toLocaleString()} · Confirmed via mariorpc.mstblockchain.com
                  </div>
                </div>
              </div>

              <a
                href={selectedMainnetTx.explorerUrl || `https://mstscan.com/tx/${selectedMainnetTx.hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-[#00F5A0] hover:bg-[#00D287] text-gray-950 font-bold text-xs flex items-center gap-1 shadow-md transition-all"
              >
                <span>View on MSTScan</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Grid of parameters */}
            <div className="grid grid-cols-2 gap-3 text-xs mb-5">
              <div className="p-3.5 rounded-xl bg-[#070C18] border border-white/5">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">From (Sender)</span>
                <div className="font-mono font-semibold text-white break-all mt-1">
                  {selectedMainnetTx.from}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#070C18] border border-white/5">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">To (Recipient)</span>
                <div className="font-mono font-semibold text-white break-all mt-1">
                  {selectedMainnetTx.to || 'Contract Creation'}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#070C18] border border-white/5">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Value</span>
                <div className="font-mono font-bold text-[#00F5A0] text-sm mt-1">
                  {selectedMainnetTx.valueFormatted || `${formatMstc(selectedMainnetTx.value)} MSTC`}
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  {selectedMainnetTx.value || '0'} Wei
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#070C18] border border-white/5">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Transaction Fee</span>
                <div className="font-mono font-bold text-white text-sm mt-1">
                  {selectedMainnetTx.feeFormatted || '< 0.0001 MSTC'}
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  Gas: {selectedMainnetTx.gasUsed || '21000'} · Price: {selectedMainnetTx.gasPrice || '1000000000'} Wei
                </div>
              </div>
            </div>

            {/* Raw JSON */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-400">Raw Explorer Response (Blockscout v2 Schema)</span>
                <button
                  onClick={() =>
                    copyToClipboard(JSON.stringify(selectedMainnetTx, null, 2), 'rawMainnetJson')
                  }
                  className="flex items-center gap-1 text-[#00F5A0] hover:underline text-[11px]"
                >
                  {copiedField === 'rawMainnetJson' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedField === 'rawMainnetJson' ? 'Copied' : 'Copy JSON'}</span>
                </button>
              </div>
              <pre className="p-3.5 rounded-xl bg-[#070C18] border border-white/5 text-slate-300 font-mono text-[10px] overflow-x-auto max-h-48">
                {JSON.stringify(selectedMainnetTx, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: PROOFPACK L2 TRANSACTION DETAILS */}
      {selectedTx && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0C1424] border border-white/10 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <ArrowRightLeft className="w-4 h-4 text-[#00F5A0]" />
                  <span>L2 Transaction Lifecycle</span>
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  {selectedTx.txId}
                </p>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Lifecycle Timeline */}
            <div className="mb-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                ProofPack Lifecycle Pipeline
              </h4>
              <div className="flex items-center justify-between text-[11px] relative">
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/10 -translate-y-1/2 z-0" />
                <div className="relative z-10 flex flex-col items-center bg-[#0C1424] px-1">
                  <CheckCircle2 className="w-4 h-4 text-[#00F5A0] mb-1" />
                  <span className="font-semibold text-slate-200">Received</span>
                  <span className="text-[9px] text-slate-400">EIP-712</span>
                </div>
                <div className="relative z-10 flex flex-col items-center bg-[#0C1424] px-1">
                  <CheckCircle2 className="w-4 h-4 text-[#00F5A0] mb-1" />
                  <span className="font-semibold text-slate-200">Validated</span>
                  <span className="text-[9px] text-slate-400">Sig Verified</span>
                </div>
                <div className="relative z-10 flex flex-col items-center bg-[#0C1424] px-1">
                  <CheckCircle2 className="w-4 h-4 text-[#00F5A0] mb-1" />
                  <span className="font-semibold text-slate-200">Batched</span>
                  <span className="text-[9px] text-slate-400">LEB128 Varint</span>
                </div>
                <div className="relative z-10 flex flex-col items-center bg-[#0C1424] px-1">
                  <CheckCircle2 className="w-4 h-4 text-[#00F5A0] mb-1" />
                  <span className="font-semibold text-slate-200">Merkle Root</span>
                  <span className="text-[9px] text-slate-400">Commitment</span>
                </div>
                <div className="relative z-10 flex flex-col items-center bg-[#0C1424] px-1">
                  <CheckCircle2 className="w-4 h-4 text-[#00F5A0] mb-1" />
                  <span className="font-semibold text-[#00F5A0]">Settled</span>
                  <span className="text-[9px] text-slate-400">MST EVM</span>
                </div>
              </div>
            </div>

            {/* Parameters */}
            <div className="grid grid-cols-2 gap-3 text-xs mb-6">
              <div className="p-3 rounded-xl bg-[#070C18] border border-white/5">
                <span className="text-[10px] text-slate-400 uppercase">Sender</span>
                <div className="font-mono font-semibold text-white break-all mt-0.5">
                  {selectedTx.sender}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#070C18] border border-white/5">
                <span className="text-[10px] text-slate-400 uppercase">Recipient</span>
                <div className="font-mono font-semibold text-white break-all mt-0.5">
                  {selectedTx.to}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#070C18] border border-white/5">
                <span className="text-[10px] text-slate-400 uppercase">Transfer Amount</span>
                <div className="font-mono font-bold text-white mt-0.5">
                  {(Number(selectedTx.amount) / 1e18).toFixed(4)} MSTC
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#070C18] border border-white/5">
                <span className="text-[10px] text-slate-400 uppercase">Account Nonce</span>
                <div className="font-mono font-bold text-white mt-0.5">
                  Nonce #{selectedTx.nonce}
                </div>
              </div>
            </div>

            {/* Compression savings */}
            <div className="p-4 rounded-2xl bg-[#00F5A0]/10 border border-[#00F5A0]/20 mb-6">
              <h4 className="text-xs font-bold text-[#00F5A0] mb-2">
                Compression & Fee Optimization
              </h4>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <div className="text-[10px] text-slate-400">Direct L1 Cost</div>
                  <div className="font-mono font-bold line-through text-slate-500">21,000 Gas</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">ProofPack Amortized</div>
                  <div className="font-mono font-bold text-[#00F5A0]">1,850 Gas</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Net Fee Reduction</div>
                  <div className="font-mono font-bold text-[#00D287]">91.2% Savings</div>
                </div>
              </div>
            </div>

            {/* Raw JSON */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-400">Raw L2 Transaction Payload</span>
                <button
                  onClick={() =>
                    copyToClipboard(JSON.stringify(selectedTx, null, 2), 'rawJson')
                  }
                  className="flex items-center gap-1 text-[#00F5A0] hover:underline text-[11px]"
                >
                  {copiedField === 'rawJson' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedField === 'rawJson' ? 'Copied' : 'Copy JSON'}</span>
                </button>
              </div>
              <pre className="p-3 rounded-xl bg-[#070C18] border border-white/5 text-slate-300 font-mono text-[10px] overflow-x-auto max-h-40">
                {JSON.stringify(selectedTx, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
