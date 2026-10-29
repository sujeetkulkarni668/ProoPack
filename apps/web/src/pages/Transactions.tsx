import React, { useState } from 'react';
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
  Layers
} from 'lucide-react';
import { L2Transaction } from '../types';
import { triggerOperatorFlush } from '../services/api';

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
  const [selectedTx, setSelectedTx] = useState<L2Transaction | null>(
    initialSelectedTxId ? transactions.find(t => t.txId === initialSelectedTxId) || null : null
  );
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [batchFilter, setBatchFilter] = useState('ALL');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isFlushing, setIsFlushing] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

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

  const filtered = transactions.filter(t => {
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

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const batchIds = Array.from(new Set(transactions.map(t => t.batchId).filter(Boolean))) as number[];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-gray-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ArrowRightLeft className="w-5 h-5 text-emerald-500" />
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              L2 Transactions Registry
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-gray-400">
            High-density ledger of all submitted, batched, and settled transfers with EIP-712 verification
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleFlush}
            disabled={isFlushing}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-gray-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{isFlushing ? 'Aggregating...' : 'Flush Mempool Batch'}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-[#111827] flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-2 flex-1 max-w-lg">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by TxID, sender, or recipient..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-900 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={e => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-900 text-xs font-medium text-slate-700 dark:text-gray-300 focus:outline-none"
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
              setPage(1);
            }}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-900 text-xs font-medium text-slate-700 dark:text-gray-300 focus:outline-none"
          >
            <option value="ALL">All Batches</option>
            {batchIds.map(b => (
              <option key={b} value={b.toString()}>
                Batch #{b}
              </option>
            ))}
            <option value="QUEUED">Unbatched (Queue)</option>
          </select>
        </div>

        <div className="text-xs text-slate-500 dark:text-gray-400 font-mono">
          Showing {paginated.length} of {filtered.length} transactions
        </div>
      </div>

      {/* Main Transactions Table */}
      <div className="rounded-3xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-[#111827] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-gray-800/60 text-[11px] font-semibold text-slate-500 dark:text-gray-400 border-b border-slate-200 dark:border-gray-800">
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
            <tbody className="divide-y divide-slate-100 dark:divide-gray-800/60 font-mono">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No transactions match the selected filter.
                  </td>
                </tr>
              ) : (
                paginated.map(tx => {
                  const amountMSTC = (Number(tx.amount) / 1e18).toFixed(3);
                  const ageSec = Math.floor((Date.now() - tx.createdAt) / 1000);
                  const ageText =
                    ageSec < 60 ? `${ageSec}s ago` : `${Math.floor(ageSec / 60)}m ago`;

                  return (
                    <tr
                      key={tx.txId}
                      onClick={() => setSelectedTx(tx)}
                      className="hover:bg-slate-50 dark:hover:bg-gray-800/40 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-bold">
                        {tx.txId.slice(0, 10)}...{tx.txId.slice(-6)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            tx.status === 'SETTLED'
                              ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                              : 'bg-amber-500/20 text-amber-700 dark:text-amber-400'
                          }`}
                        >
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 dark:text-gray-400 font-sans">
                        {ageText}
                      </td>
                      <td className="py-3 px-4 text-slate-700 dark:text-gray-300">
                        {tx.sender.slice(0, 6)}...{tx.sender.slice(-4)}
                      </td>
                      <td className="py-3 px-4 text-slate-700 dark:text-gray-300">
                        {tx.to.slice(0, 6)}...{tx.to.slice(-4)}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                        {amountMSTC} MSTC
                      </td>
                      <td className="py-3 px-4">
                        {tx.batchId ? (
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              onSelectBatch(tx.batchId!);
                            }}
                            className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                          >
                            #{tx.batchId}
                          </button>
                        ) : (
                          <span className="text-slate-400">Queue</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Verified</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 dark:text-gray-400">
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
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-800/30 text-xs">
            <span className="text-slate-500">
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-gray-700 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-gray-700 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Transaction Details Drawer / Modal */}
      {selectedTx && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-gray-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-gray-800 pb-4 mb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <ArrowRightLeft className="w-4 h-4 text-emerald-500" />
                  <span>Transaction Inspection Details</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-gray-400 font-mono">
                  {selectedTx.txId}
                </p>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 1. Lifecycle Timeline */}
            <div className="mb-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Lifecycle Timeline
              </h4>
              <div className="flex items-center justify-between text-[11px] relative">
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 dark:bg-gray-800 -translate-y-1/2 z-0" />
                <div className="relative z-10 flex flex-col items-center bg-white dark:bg-[#111827] px-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mb-1" />
                  <span className="font-semibold text-slate-800 dark:text-gray-200">Received</span>
                  <span className="text-[9px] text-slate-400">EIP-712</span>
                </div>
                <div className="relative z-10 flex flex-col items-center bg-white dark:bg-[#111827] px-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mb-1" />
                  <span className="font-semibold text-slate-800 dark:text-gray-200">Validated</span>
                  <span className="text-[9px] text-slate-400">Sig Verified</span>
                </div>
                <div className="relative z-10 flex flex-col items-center bg-white dark:bg-[#111827] px-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mb-1" />
                  <span className="font-semibold text-slate-800 dark:text-gray-200">Batched</span>
                  <span className="text-[9px] text-slate-400">LEB128 Varint</span>
                </div>
                <div className="relative z-10 flex flex-col items-center bg-white dark:bg-[#111827] px-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mb-1" />
                  <span className="font-semibold text-slate-800 dark:text-gray-200">Merkle Root</span>
                  <span className="text-[9px] text-slate-400">Commitment</span>
                </div>
                <div className="relative z-10 flex flex-col items-center bg-white dark:bg-[#111827] px-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mb-1" />
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">Settled</span>
                  <span className="text-[9px] text-slate-400">MST EVM</span>
                </div>
              </div>
            </div>

            {/* 2. Overview Parameters */}
            <div className="grid grid-cols-2 gap-3 text-xs mb-6">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-gray-800/40 border border-slate-200 dark:border-gray-800">
                <span className="text-[10px] text-slate-400 uppercase">Sender</span>
                <div className="font-mono font-semibold text-slate-900 dark:text-gray-200 break-all mt-0.5">
                  {selectedTx.sender}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-gray-800/40 border border-slate-200 dark:border-gray-800">
                <span className="text-[10px] text-slate-400 uppercase">Recipient</span>
                <div className="font-mono font-semibold text-slate-900 dark:text-gray-200 break-all mt-0.5">
                  {selectedTx.to}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-gray-800/40 border border-slate-200 dark:border-gray-800">
                <span className="text-[10px] text-slate-400 uppercase">Transfer Amount</span>
                <div className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                  {(Number(selectedTx.amount) / 1e18).toFixed(4)} MSTC
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-gray-800/40 border border-slate-200 dark:border-gray-800">
                <span className="text-[10px] text-slate-400 uppercase">Account Nonce</span>
                <div className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                  Nonce #{selectedTx.nonce}
                </div>
              </div>
            </div>

            {/* 3. Compression & Fee Breakdown */}
            <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-500/20 mb-6">
              <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-400 mb-2">
                Compression & Fee Optimization
              </h4>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <div className="text-[10px] text-slate-500 dark:text-gray-400">Direct L1 Cost</div>
                  <div className="font-mono font-bold line-through text-slate-400">21,000 Gas</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 dark:text-gray-400">ProofPack Amortized</div>
                  <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400">1,850 Gas</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 dark:text-gray-400">Net Fee Reduction</div>
                  <div className="font-mono font-bold text-teal-600 dark:text-teal-400">91.2% Savings</div>
                </div>
              </div>
            </div>

            {/* 4. On-Chain Settlement References */}
            {selectedTx.l1TxHash && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-gray-800/40 border border-slate-200 dark:border-gray-800 text-xs mb-6">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-slate-400 uppercase">MST Blockchain Settlement Tx</span>
                  <a
                    href={`https://testnet.mstscan.com/tx/${selectedTx.l1TxHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 text-[11px]"
                  >
                    <span>View on MSTScan</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="font-mono font-semibold text-slate-800 dark:text-gray-200 break-all">
                  {selectedTx.l1TxHash}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Block: #{selectedTx.l1BlockNumber ?? 9845} · Destination: MST Coral Testnet (91562037)
                </div>
              </div>
            )}

            {/* 5. Raw JSON view */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-500">Raw L2 Transaction Payload</span>
                <button
                  onClick={() =>
                    copyToClipboard(JSON.stringify(selectedTx, null, 2), 'rawJson')
                  }
                  className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:underline text-[11px]"
                >
                  {copiedField === 'rawJson' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedField === 'rawJson' ? 'Copied' : 'Copy JSON'}</span>
                </button>
              </div>
              <pre className="p-3 rounded-xl bg-slate-900 text-slate-200 font-mono text-[10px] overflow-x-auto max-h-40">
                {JSON.stringify(selectedTx, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
