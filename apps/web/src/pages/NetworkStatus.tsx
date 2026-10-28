import React from 'react';
import { Activity, Server, RefreshCw } from 'lucide-react';
import { HealthResponse } from '../types';
import { SystemMonitor } from '../components/ui/system-monitor';

interface NetworkStatusProps {
  health: HealthResponse | null;
  onRefresh: () => void;
}

export const NetworkStatusPage: React.FC<NetworkStatusProps> = ({ health, onRefresh }) => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            <span>Network Health & Infrastructure Telemetry</span>
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Real-time monitoring of MST Blockchain RPC node, sequencer mempool, and worker status
          </p>
        </div>

        <button
          onClick={onRefresh}
          className="p-2 rounded-lg bg-gray-900 border border-gray-800 text-gray-400 hover:text-white transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Network Health Monitor Widget (isaiahbjork/system-monitor) */}
      <SystemMonitor
        mstRpcLatency={health?.mstRpc?.latencyMs || 42}
        mempoolSize={health?.mempoolQueueSize || 0}
        workerActive={health?.workerRunning !== false}
      />

      {/* MST Chain Parameters */}
      <div className="p-6 rounded-2xl bg-[#111827]/90 border border-gray-800 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Server className="w-4 h-4 text-emerald-400" />
          <span>MST Blockchain Network Specifications</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-800 space-y-2">
            <span className="text-gray-400 text-[11px] uppercase tracking-wider block font-sans font-semibold">
              MST Testnet Configuration (Verified)
            </span>
            <div className="flex justify-between">
              <span className="text-gray-400">Chain ID:</span>
              <span className="text-white font-bold">4545 (0x11F1)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Native Asset:</span>
              <span className="text-emerald-400 font-bold">tMSTC</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">RPC Endpoint:</span>
              <span className="text-gray-300 truncate max-w-[200px]">https://testnetrpc.mstblockchain.com</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Consensus:</span>
              <span className="text-cyan-400">PoSA (~3.0s Block Time)</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-800 space-y-2">
            <span className="text-gray-400 text-[11px] uppercase tracking-wider block font-sans font-semibold">
              MST Mainnet Configuration (Verified)
            </span>
            <div className="flex justify-between">
              <span className="text-gray-400">Chain ID:</span>
              <span className="text-white font-bold">4646 (0x1226)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Native Asset:</span>
              <span className="text-emerald-400 font-bold">MSTC</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Primary RPC:</span>
              <span className="text-gray-300 truncate max-w-[200px]">https://mariorpc.mstblockchain.com</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Explorer:</span>
              <span className="text-cyan-400">https://mstscan.com</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
