import React, { useState, useEffect } from 'react';
import {
  History,
  Calendar,
  Layers,
  ArrowRightLeft,
  Boxes,
  TrendingDown,
  Clock,
  ShieldCheck,
  RotateCw
} from 'lucide-react';
import { NetworkHistoryPoint } from '../types';
import { fetchNetworkHistory } from '../services/api';

interface NetworkHistoryProps {
  onSelectBatch?: (batchId: number) => void;
}

export const NetworkHistoryPage: React.FC<NetworkHistoryProps> = ({ onSelectBatch }) => {
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [aggregation, setAggregation] = useState<'hourly' | 'daily'>('hourly');
  const [history, setHistory] = useState<NetworkHistoryPoint[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<NetworkHistoryPoint | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const res = await fetchNetworkHistory(timeRange);
      setHistory(res.history);
      if (res.history.length > 0) {
        setSelectedPoint(res.history[res.history.length - 1]);
      }
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [timeRange]);

  const maxVal = Math.max(...history.map(p => p.transactions), 10);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-gray-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <History className="w-5 h-5 text-emerald-500" />
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Historical Network Analytics & Settlement Logs
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-gray-400">
            Historical transaction volume, batch frequencies, compression performance, and settlement finality
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Aggregation */}
          <div className="flex items-center rounded-xl border border-slate-200 dark:border-gray-800 p-0.5 bg-slate-100 dark:bg-gray-900 text-xs font-semibold">
            <button
              onClick={() => setAggregation('hourly')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                aggregation === 'hourly'
                  ? 'bg-white dark:bg-gray-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-gray-400'
              }`}
            >
              Hourly
            </button>
            <button
              onClick={() => setAggregation('daily')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                aggregation === 'daily'
                  ? 'bg-white dark:bg-gray-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-gray-400'
              }`}
            >
              Daily
            </button>
          </div>

          {/* Time Range */}
          <div className="flex items-center rounded-xl border border-slate-200 dark:border-gray-800 p-0.5 bg-slate-100 dark:bg-gray-900 text-xs font-semibold">
            {(['1h', '24h', '7d', '30d'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTimeRange(t)}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  timeRange === t
                    ? 'bg-emerald-500 text-gray-950 font-bold shadow-sm'
                    : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <button
            onClick={loadHistory}
            className="p-2 rounded-xl border border-slate-200 dark:border-gray-800 bg-slate-100 dark:bg-gray-900 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Historical Chart */}
      <div className="p-6 rounded-3xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-[#111827] shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Historical Volume & Settlement Timeline
            </h3>
            <p className="text-xs text-slate-500 dark:text-gray-400">
              Hover over any point to inspect historical batch settlement parameters
            </p>
          </div>
          {selectedPoint && (
            <div className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
              Selected: {selectedPoint.label} · {selectedPoint.transactions} Txs
            </div>
          )}
        </div>

        <div className="h-56 flex items-end gap-1.5 pt-6 pb-2">
          {history.map((pt, idx) => {
            const isSelected = selectedPoint?.timestamp === pt.timestamp;
            return (
              <div
                key={idx}
                onClick={() => setSelectedPoint(pt)}
                className="flex-1 flex flex-col items-center justify-end h-full group relative cursor-pointer"
              >
                <div
                  style={{ height: `${Math.max(12, (pt.transactions / maxVal) * 100)}%` }}
                  className={`w-full rounded-t-md transition-all ${
                    isSelected
                      ? 'bg-emerald-500 shadow-lg shadow-emerald-500/40'
                      : 'bg-emerald-500/25 group-hover:bg-emerald-500/70'
                  }`}
                />
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-gray-800">
          <span>{history[0]?.label || 'Start'}</span>
          <span>Timeline Progression ({timeRange})</span>
          <span>{history[history.length - 1]?.label || 'Present'}</span>
        </div>
      </div>

      {/* Selected Historical Checkpoint Detail Cards */}
      {selectedPoint && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-[#111827]">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Timestamp / Period</div>
            <div className="text-base font-bold font-mono text-slate-900 dark:text-white mt-1">
              {selectedPoint.label}
            </div>
            <span className="text-[10px] text-slate-500">Epoch checkpoint</span>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-[#111827]">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Transactions & Batches</div>
            <div className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
              {selectedPoint.transactions} Txs · {selectedPoint.batches} Batches
            </div>
            <span className="text-[10px] text-slate-500">100% inclusion rate</span>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-[#111827]">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Historical Compression</div>
            <div className="text-base font-bold font-mono text-teal-600 dark:text-teal-400 mt-1">
              {selectedPoint.compressionRatio}x Ratio
            </div>
            <span className="text-[10px] text-slate-500">LEB128 serialization</span>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-[#111827]">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Avg Settlement Fee</div>
            <div className="text-base font-bold font-mono text-slate-900 dark:text-white mt-1">
              {selectedPoint.avgFeeMSTC.toFixed(6)} MSTC
            </div>
            <span className="text-[10px] text-slate-500">Settled to MST EVM</span>
          </div>
        </div>
      )}

      {/* Historical Data Table */}
      <div className="rounded-3xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-[#111827] p-5 shadow-sm overflow-hidden">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
          Historical Settlement Checkpoints
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-gray-800/50 text-[11px] font-semibold text-slate-500 dark:text-gray-400 border-b border-slate-200 dark:border-gray-800">
              <tr>
                <th className="py-2.5 px-3">Period</th>
                <th className="py-2.5 px-3">Transactions</th>
                <th className="py-2.5 px-3">Batches</th>
                <th className="py-2.5 px-3">TPS</th>
                <th className="py-2.5 px-3">Compression Ratio</th>
                <th className="py-2.5 px-3">Confirmation Time</th>
                <th className="py-2.5 px-3">Settlement Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-gray-800/60 font-mono">
              {history.map((pt, i) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-gray-800/40 transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-gray-200">{pt.label}</td>
                  <td className="py-2.5 px-3 text-emerald-600 dark:text-emerald-400 font-bold">{pt.transactions}</td>
                  <td className="py-2.5 px-3 text-slate-700 dark:text-gray-300">{pt.batches}</td>
                  <td className="py-2.5 px-3 text-cyan-600 dark:text-cyan-400">{pt.tps} TPS</td>
                  <td className="py-2.5 px-3 text-teal-600 dark:text-teal-400">{pt.compressionRatio}x</td>
                  <td className="py-2.5 px-3 text-slate-700 dark:text-gray-300">{pt.avgConfirmationMs} ms</td>
                  <td className="py-2.5 px-3 text-emerald-600 dark:text-emerald-400 font-bold">{pt.settlementSuccessRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
