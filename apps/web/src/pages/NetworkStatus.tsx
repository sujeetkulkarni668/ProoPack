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
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            <span>Network Health & Infrastructure Telemetry</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
            Real-time monitoring of MST Blockchain RPC node, sequencer mempool, and worker status
          </p>
        </div>

        <button
          onClick={onRefresh}
          className="p-2 rounded-xl bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors shadow-sm"
          title="Refresh Telemetry"
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
      <div className="p-6 rounded-3xl bg-white dark:bg-[#111827]/90 border border-slate-200 dark:border-gray-800 space-y-4 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Server className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>MST Blockchain Network Specifications</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-gray-900/60 border border-slate-200 dark:border-gray-800 space-y-2">
            <span className="text-slate-500 dark:text-gray-400 text-[11px] uppercase tracking-wider block font-sans font-semibold">
              MST Testnet Configuration (Verified Coral Testnet)
            </span>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-gray-400">Chain ID:</span>
              <span className="text-slate-900 dark:text-white font-bold">91562037 (0x5752035)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-gray-400">Native Asset:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">tMSTC</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-gray-400">RPC Endpoint:</span>
              <span className="text-slate-700 dark:text-gray-300 truncate max-w-[200px]">https://testnetrpc.mstblockchain.com</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-gray-400">Consensus:</span>
              <span className="text-cyan-600 dark:text-cyan-400">PoSA (~3.0s Block Time)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-gray-400">Explorer:</span>
              <a href="https://testnet.mstscan.com" target="_blank" rel="noopener noreferrer" className="text-cyan-600 dark:text-cyan-400 hover:underline">
                https://testnet.mstscan.com
              </a>
            </div>
            <div className="pt-2 flex flex-wrap gap-2 font-sans">
              <a
                href="https://coral-faucet.mstblockchain.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold hover:bg-emerald-500/25 transition-colors"
              >
                🚰 Coral Faucet (Free tMSTC)
              </a>
              <a
                href="https://chainlist.org/chain/91562037"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-700 dark:text-cyan-400 text-xs font-bold hover:bg-cyan-500/25 transition-colors"
              >
                🔗 Chainlist Testnet (91562037)
              </a>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-gray-900/60 border border-slate-200 dark:border-gray-800 space-y-2">
            <span className="text-slate-500 dark:text-gray-400 text-[11px] uppercase tracking-wider block font-sans font-semibold">
              MST Mainnet Configuration (Verified)
            </span>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-gray-400">Chain ID:</span>
              <span className="text-slate-900 dark:text-white font-bold">4646 (0x1226)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-gray-400">Native Asset:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">MSTC</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-gray-400">Primary RPC:</span>
              <span className="text-slate-700 dark:text-gray-300 truncate max-w-[200px]">https://mariorpc.mstblockchain.com</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-gray-400">Explorer:</span>
              <a href="https://mstscan.com" target="_blank" rel="noopener noreferrer" className="text-cyan-600 dark:text-cyan-400 hover:underline">
                https://mstscan.com
              </a>
            </div>
            <div className="pt-2 flex flex-wrap gap-2 font-sans">
              <a
                href="https://chainlist.org/chain/4646"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold hover:bg-emerald-500/25 transition-colors"
              >
                🔗 Chainlist Mainnet (4646)
              </a>
              <a
                href="https://mstblockchain.com/contact/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-700 dark:text-indigo-400 text-xs font-bold hover:bg-indigo-500/25 transition-colors"
              >
                📝 Request Mainnet Tokens
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkStatusPage;
