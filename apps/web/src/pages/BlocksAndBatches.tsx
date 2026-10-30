import React, { useState, useEffect } from 'react';
import {
  Blocks,
  Boxes,
  Layers,
  ArrowRightLeft,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  TrendingDown,
  X,
  Copy,
  Check,
  RotateCw
} from 'lucide-react';
import { BatchMetadata, BlockInfo, L2Transaction } from '../types';
import { fetchBlocks, fetchBatchById } from '../services/api';

interface BlocksAndBatchesProps {
  batches: BatchMetadata[];
  onSelectTx?: (txId: string) => void;
  onRefresh?: () => void;
}

export const BlocksAndBatchesPage: React.FC<BlocksAndBatchesProps> = ({
  batches,
  onSelectTx,
  onRefresh
}) => {
  const [activeTab, setActiveTab] = useState<'batches' | 'blocks'>('batches');
  const [blocks, setBlocks] = useState<BlockInfo[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState<number | null>(null);
  const [selectedBatchDetails, setSelectedBatchDetails] = useState<{
    batch: BatchMetadata;
    transactions?: L2Transaction[];
  } | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadBlocks = async () => {
      try {
        const res = await fetchBlocks();
        setBlocks(res.blocks);
      } catch (err) {
        console.error('Failed to load blocks:', err);
      }
    };
    loadBlocks();
  }, []);

  const openBatchDetails = async (bId: number) => {
    setSelectedBatchId(bId);
    setIsLoading(true);
    try {
      const res = await fetchBatchById(bId);
      setSelectedBatchDetails({
        batch: res.batch,
        transactions: res.transactions
      });
    } catch {
      const fallback = batches.find(b => b.batchId === bId);
      if (fallback) setSelectedBatchDetails({ batch: fallback });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(id);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-gray-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Blocks className="w-5 h-5 text-emerald-500" />
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Blocks & ProofPack Batches
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-gray-400">
            Clear separation between ProofPack L2 aggregation batches and underlying MST Blockchain EVM blocks
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center rounded-xl border border-slate-200 dark:border-gray-800 p-0.5 bg-slate-100 dark:bg-gray-900 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('batches')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'batches'
                ? 'bg-emerald-500 text-gray-950 font-bold shadow-sm'
                : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Boxes className="w-3.5 h-3.5" />
            <span>ProofPack Batches ({batches.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('blocks')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'blocks'
                ? 'bg-emerald-500 text-gray-950 font-bold shadow-sm'
                : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Blocks className="w-3.5 h-3.5" />
            <span>Underlying MST Blocks ({blocks.length})</span>
          </button>
        </div>
      </div>

      {/* Tab 1: ProofPack Batches */}
      {activeTab === 'batches' && (
        <div className="rounded-3xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-[#111827] shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-gray-800 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              Aggregated L2 Batches
            </span>
            <span className="text-xs font-mono text-slate-400">
              Click any batch for payload breakdown
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-gray-800/60 text-[11px] font-semibold text-slate-500 dark:text-gray-400 border-b border-slate-200 dark:border-gray-800">
                <tr>
                  <th className="py-3 px-4">Batch ID</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Transactions</th>
                  <th className="py-3 px-4">Payload Size</th>
                  <th className="py-3 px-4">Compression</th>
                  <th className="py-3 px-4">Merkle Batch Root</th>
                  <th className="py-3 px-4">Settlement Tx (MST)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-gray-800/60 font-mono">
                {batches.map(b => {
                  const ratio =
                    b.compressedBytes > 0
                      ? (b.uncompressedBytes / b.compressedBytes).toFixed(2)
                      : '2.86';
                  return (
                    <tr
                      key={b.batchId}
                      onClick={() => openBatchDetails(b.batchId)}
                      className="hover:bg-slate-50 dark:hover:bg-gray-800/40 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4 font-bold text-indigo-600 dark:text-indigo-400">
                        #{b.batchId}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                          {b.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white font-sans">
                        {b.txCount} txs
                      </td>
                      <td className="py-3 px-4 text-slate-500 dark:text-gray-400">
                        {b.compressedBytes} B (raw {b.uncompressedBytes} B)
                      </td>
                      <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-bold">
                        {ratio}x
                      </td>
                      <td className="py-3 px-4 text-slate-700 dark:text-gray-300">
                        {b.batchRoot.slice(0, 10)}...{b.batchRoot.slice(-6)}
                      </td>
                      <td className="py-3 px-4 text-cyan-600 dark:text-cyan-400">
                        {b.l1TxHash ? `${b.l1TxHash.slice(0, 8)}...` : '0xpending'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Underlying MST Blocks */}
      {activeTab === 'blocks' && (
        <div className="rounded-3xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-[#111827] shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-gray-800 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              MST Blockchain EVM Blocks (Mainnet: 4646 / Coral Testnet: 54635)
            </span>
            <span className="text-xs font-mono text-slate-400">
              Live Layer 1 carrier blocks
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-gray-800/60 text-[11px] font-semibold text-slate-500 dark:text-gray-400 border-b border-slate-200 dark:border-gray-800">
                <tr>
                  <th className="py-3 px-4">Block Height</th>
                  <th className="py-3 px-4">Age</th>
                  <th className="py-3 px-4">Tx Count</th>
                  <th className="py-3 px-4">Proposer / Miner</th>
                  <th className="py-3 px-4">Gas Used / Limit</th>
                  <th className="py-3 px-4">Finality</th>
                  <th className="py-3 px-4">MST Explorer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-gray-800/60 font-mono">
                {blocks.map(blk => (
                  <tr key={blk.blockNumber} className="hover:bg-slate-50 dark:hover:bg-gray-800/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-cyan-600 dark:text-cyan-400">
                      #{blk.blockNumber}
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-sans">
                      {Math.floor((Date.now() - blk.timestamp) / 1000)}s ago
                    </td>
                    <td className="py-3 px-4 text-slate-900 dark:text-white font-bold font-sans">
                      {blk.txCount} txs
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-gray-300">
                      {blk.proposer.slice(0, 6)}...{blk.proposer.slice(-4)}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {blk.gasUsed.toLocaleString()} / {blk.gasLimit.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                        {blk.finality}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <a
                        href={`https://mstscan.com/block/${blk.blockNumber}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
                      >
                        <span>MSTScan</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Batch Details Modal */}
      {selectedBatchDetails && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-gray-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-gray-800 pb-4 mb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Boxes className="w-4 h-4 text-indigo-500" />
                  <span>Batch #{selectedBatchDetails.batch.batchId} Inspection</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-gray-400 font-mono">
                  State Commitment Root: {selectedBatchDetails.batch.batchRoot}
                </p>
              </div>
              <button
                onClick={() => setSelectedBatchDetails(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Batch Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs mb-5">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-gray-800/40 border border-slate-200 dark:border-gray-800">
                <span className="text-[10px] text-slate-400 uppercase">Transactions</span>
                <div className="text-base font-bold font-mono text-slate-900 dark:text-white mt-0.5">
                  {selectedBatchDetails.batch.txCount}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-gray-800/40 border border-slate-200 dark:border-gray-800">
                <span className="text-[10px] text-slate-400 uppercase">Compressed Payload</span>
                <div className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {selectedBatchDetails.batch.compressedBytes} Bytes
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-gray-800/40 border border-slate-200 dark:border-gray-800">
                <span className="text-[10px] text-slate-400 uppercase">Original Size</span>
                <div className="text-base font-bold font-mono text-slate-400 mt-0.5">
                  {selectedBatchDetails.batch.uncompressedBytes} Bytes
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-gray-800/40 border border-slate-200 dark:border-gray-800">
                <span className="text-[10px] text-slate-400 uppercase">Compression Ratio</span>
                <div className="text-base font-bold font-mono text-teal-600 dark:text-teal-400 mt-0.5">
                  {(selectedBatchDetails.batch.uncompressedBytes / selectedBatchDetails.batch.compressedBytes).toFixed(2)}x
                </div>
              </div>
            </div>

            {/* Included Transactions List */}
            {selectedBatchDetails.transactions && selectedBatchDetails.transactions.length > 0 && (
              <div className="mb-5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Included Transactions in Batch ({selectedBatchDetails.transactions.length})
                </h4>
                <div className="divide-y divide-slate-100 dark:divide-gray-800/60 rounded-xl border border-slate-200 dark:border-gray-800 overflow-hidden">
                  {selectedBatchDetails.transactions.map((tx, idx) => (
                    <div
                      key={tx.txId}
                      onClick={() => {
                        setSelectedBatchDetails(null);
                        onSelectTx?.(tx.txId);
                      }}
                      className="p-2.5 flex items-center justify-between text-xs hover:bg-slate-50 dark:hover:bg-gray-800/40 cursor-pointer font-mono"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400">#{idx}</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                          {tx.txId.slice(0, 10)}...{tx.txId.slice(-6)}
                        </span>
                      </div>
                      <span className="text-slate-900 dark:text-white font-bold">
                        {(Number(tx.amount) / 1e18).toFixed(3)} MSTC
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Settlement reference */}
            {selectedBatchDetails.batch.l1TxHash && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-gray-800/40 border border-slate-200 dark:border-gray-800 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-slate-400 uppercase">MST Blockchain Settlement Tx</span>
                  <a
                    href={`https://mstscan.com/tx/${selectedBatchDetails.batch.l1TxHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    <span>View on MSTScan</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="font-mono font-semibold text-slate-800 dark:text-gray-200 break-all">
                  {selectedBatchDetails.batch.l1TxHash}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
