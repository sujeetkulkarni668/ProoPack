import React, { useState } from 'react';
import { Boxes, Zap, Layers, RefreshCw, CheckCircle2, ChevronRight } from 'lucide-react';
import { BatchMetadata } from '../types';
import { triggerOperatorFlush } from '../services/api';

interface BatchExplorerProps {
  batches: BatchMetadata[];
  selectedBatchId: number | null;
  onRefresh: () => void;
}

export const BatchExplorer: React.FC<BatchExplorerProps> = ({
  batches,
  selectedBatchId,
  onRefresh
}) => {
  const [activeBatchId, setActiveBatchId] = useState<number | null>(selectedBatchId);
  const [flushing, setFlushing] = useState(false);

  const activeBatch = batches.find(b => b.batchId === (activeBatchId || batches[0]?.batchId));

  const handleFlush = async () => {
    try {
      setFlushing(true);
      await triggerOperatorFlush();
      onRefresh();
    } catch (e: any) {
      alert(`Flush failed: ${e.message}`);
    } finally {
      setFlushing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Boxes className="w-5 h-5 text-purple-400" />
            <span>Batch Explorer</span>
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Cryptographic batch commitments, Merkle roots, and data availability payloads
          </p>
        </div>

        <button
          onClick={handleFlush}
          disabled={flushing}
          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-purple-500/20 transition-all flex items-center gap-2"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>{flushing ? 'Settling Batch...' : 'Trigger Sequencer Settlement'}</span>
        </button>
      </div>

      {/* Grid: Batches list on left, detail viewer on right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Batches List */}
        <div className="space-y-2.5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">
            Settlement Sequence
          </p>

          {batches.length === 0 ? (
            <div className="p-8 text-center bg-mst-card border border-mst-border rounded-xl text-gray-400 text-xs">
              No batches created yet.
            </div>
          ) : (
            batches.map(b => {
              const isSelected = activeBatch?.batchId === b.batchId;
              return (
                <div
                  key={b.batchId}
                  onClick={() => setActiveBatchId(b.batchId)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-purple-950/20 border-purple-500/50 shadow-lg shadow-purple-500/10'
                      : 'bg-mst-card border-mst-border hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white font-mono">
                      Batch #{b.batchId}
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-300">
                      {b.status}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
                    <span>{b.txCount} transactions</span>
                    <span className="font-mono text-purple-300">{b.compressedBytes} bytes</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Batch Detail Inspector */}
        <div className="lg:col-span-2">
          {activeBatch ? (
            <div className="p-6 rounded-2xl bg-mst-card border border-mst-border space-y-5">
              <div className="flex items-center justify-between border-b border-mst-border pb-4">
                <div>
                  <h2 className="text-lg font-bold text-white font-mono">
                    Batch #{activeBatch.batchId} Inspection
                  </h2>
                  <p className="text-xs text-gray-400">
                    Committed to MST Blockchain at Block #{activeBatch.l1BlockNumber || 'Pending'}
                  </p>
                </div>
                <span className="px-3 py-1 text-xs font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {activeBatch.status}
                </span>
              </div>

              {/* Hashes & Roots */}
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-gray-400 font-medium">Merkle Root (batchRoot)</span>
                  <p className="font-mono text-emerald-400 break-all p-2.5 rounded-lg bg-black/40 mt-1">
                    {activeBatch.batchRoot}
                  </p>
                </div>

                <div>
                  <span className="text-gray-400 font-medium">Previous Batch Root</span>
                  <p className="font-mono text-gray-300 break-all p-2.5 rounded-lg bg-black/40 mt-1">
                    {activeBatch.previousBatchRoot}
                  </p>
                </div>

                <div>
                  <span className="text-gray-400 font-medium">
                    State Commitment Hash (keccak256(batchId || prevRoot || root || count))
                  </span>
                  <p className="font-mono text-cyan-300 break-all p-2.5 rounded-lg bg-black/40 mt-1">
                    {activeBatch.stateCommitment}
                  </p>
                </div>
              </div>

              {/* Compression Metrics */}
              <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-gray-900/40 border border-gray-800">
                <div>
                  <span className="text-[11px] text-gray-400">Transactions</span>
                  <p className="text-base font-bold text-white font-mono">{activeBatch.txCount}</p>
                </div>
                <div>
                  <span className="text-[11px] text-gray-400">Compressed Wire Size</span>
                  <p className="text-base font-bold text-brand-400 font-mono">
                    {activeBatch.compressedBytes} B
                  </p>
                </div>
                <div>
                  <span className="text-[11px] text-gray-400">Uncompressed Size</span>
                  <p className="text-base font-bold text-gray-300 font-mono">
                    {activeBatch.uncompressedBytes} B
                  </p>
                </div>
              </div>

              {/* Encoded Calldata Preview */}
              <div>
                <span className="text-xs text-gray-400 font-medium">
                  Calldata Payload Published on MST L1 (Hex Encoded)
                </span>
                <p className="font-mono text-[11px] text-gray-400 break-all p-3 rounded-lg bg-black/50 mt-1 max-h-32 overflow-y-auto">
                  {activeBatch.encodedPayload}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-mst-card border border-mst-border rounded-2xl text-gray-400 text-xs">
              Select a batch from the list to inspect cryptographic roots and compressed calldata.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
