import React, { useState, useEffect } from 'react';
import {
  Scale,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  RotateCw,
  Search,
  Filter,
  Copy,
  Check
} from 'lucide-react';
import { SettlementRecord } from '../types';
import { fetchSettlements } from '../services/api';

interface SettlementHistoryProps {
  onSelectBatch?: (batchId: number) => void;
}

export const SettlementHistoryPage: React.FC<SettlementHistoryProps> = ({ onSelectBatch }) => {
  const [settlements, setSettlements] = useState<SettlementRecord[]>([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadSettlements = async () => {
    setIsLoading(true);
    try {
      const res = await fetchSettlements();
      setSettlements(res.settlements);
    } catch (err) {
      console.error('Failed to load settlements:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSettlements();
  }, []);

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const filtered = settlements.filter(s => {
    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
    const matchesSearch =
      !search ||
      s.settlementTxHash.toLowerCase().includes(search.toLowerCase()) ||
      s.batchId.toString().includes(search);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-gray-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Scale className="w-5 h-5 text-emerald-500" />
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              L1 Settlement History & On-Chain Finality
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-gray-400">
            Audit on-chain commitments to ProofPackSettlement.sol on MST Blockchain (Chain ID: 54635)
          </p>
        </div>

        <button
          onClick={loadSettlements}
          className="p-2 rounded-xl border border-slate-200 dark:border-gray-800 bg-slate-100 dark:bg-gray-900 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors self-start sm:self-auto"
        >
          <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-500' : ''}`} />
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-[#111827]">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Confirmed Batches</span>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            {settlements.filter(s => s.status === 'CONFIRMED').length}
          </div>
          <span className="text-[10px] text-slate-500">100% Finalized on MST EVM</span>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-[#111827]">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Pending Settlements</span>
          <div className="text-2xl font-bold font-mono text-amber-500 mt-1">
            {settlements.filter(s => s.status === 'PENDING').length}
          </div>
          <span className="text-[10px] text-slate-500">Mempool threshold accumulator</span>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-[#111827]">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Failed Settlements</span>
          <div className="text-2xl font-bold font-mono text-slate-400 mt-1">
            0
          </div>
          <span className="text-[10px] text-slate-500">Zero chain reorganizations</span>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-[#111827]">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Settlement Destination</span>
          <div className="text-sm font-bold font-mono text-cyan-600 dark:text-cyan-400 mt-1 truncate">
            MST Coral Testnet
          </div>
          <span className="text-[10px] text-slate-500">Chain ID: 54635</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-[#111827] flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by settlement Tx hash or batch ID..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-900 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-900 text-xs font-medium text-slate-700 dark:text-gray-300 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="PENDING">Pending</option>
          </select>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          {filtered.length} Records
        </div>
      </div>

      {/* Settlements Table */}
      <div className="rounded-3xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-[#111827] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-gray-800/60 text-[11px] font-semibold text-slate-500 dark:text-gray-400 border-b border-slate-200 dark:border-gray-800">
              <tr>
                <th className="py-3 px-4">Batch ID</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Destination Chain</th>
                <th className="py-3 px-4">Settlement Tx Hash</th>
                <th className="py-3 px-4">L1 Block #</th>
                <th className="py-3 px-4">Gas Consumed</th>
                <th className="py-3 px-4">Confirmation Delay</th>
                <th className="py-3 px-4">MST Explorer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-gray-800/60 font-mono">
              {filtered.map(s => {
                const delayMs = s.confirmedAt - s.submittedAt;
                return (
                  <tr key={s.settlementId} className="hover:bg-slate-50 dark:hover:bg-gray-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <button
                        onClick={() => onSelectBatch?.(s.batchId)}
                        className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                      >
                        Batch #{s.batchId}
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-gray-300 font-sans">
                      {s.destinationChain}
                    </td>
                    <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-bold">
                      <div className="flex items-center gap-1.5">
                        <span>{s.settlementTxHash.slice(0, 10)}...{s.settlementTxHash.slice(-6)}</span>
                        <button
                          onClick={() => copyHash(s.settlementTxHash)}
                          className="text-slate-400 hover:text-emerald-500"
                          title="Copy hash"
                        >
                          {copiedHash === s.settlementTxHash ? (
                            <Check className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-900 dark:text-white font-bold">
                      #{s.blockNumber}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {s.gasUsed.toLocaleString()} Gas
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-gray-300">
                      {(delayMs / 1000).toFixed(1)}s
                    </td>
                    <td className="py-3 px-4">
                      <a
                        href={s.explorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
                      >
                        <span>MSTScan</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
