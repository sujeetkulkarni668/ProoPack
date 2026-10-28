"use client";

import React, { useState, useEffect } from "react";
import {
  Activity,
  Cpu,
  HardDrive,
  Wifi,
  ChevronDown,
  ChevronUp,
  Server,
  Layers,
  Zap,
  Clock,
  ArrowUp,
  ArrowDown,
  Terminal,
  RefreshCw,
  Sliders,
  CheckCircle2,
  GraduationCap
} from "lucide-react";

export interface AgentProcess {
  id: string;
  name: string;
  role: string;
  cpu: number;
  memory: string;
  status: "active" | "idle" | "busy";
  uptime: string;
}

export interface SystemMonitorProps {
  mstRpcLatency?: number;
  mempoolSize?: number;
  workerActive?: boolean;
  className?: string;
}

export function SystemMonitor({
  mstRpcLatency = 42,
  mempoolSize = 6,
  workerActive = true,
  className = ""
}: SystemMonitorProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [cpuHistory, setCpuHistory] = useState<number[]>([18, 24, 22, 35, 28, 30, 26, 32, 29, 31, 28, 34]);
  const [latencyHistory, setLatencyHistory] = useState<number[]>([38, 45, 41, 52, 40, 44, 42, 39, 41, 42, 40, 43]);
  const [cpuCurrent, setCpuCurrent] = useState(28.4);
  const [memCurrent, setMemCurrent] = useState(1.42); // GB
  const [networkIn, setNetworkIn] = useState(48.2); // KB/s
  const [networkOut, setNetworkOut] = useState(114.6); // KB/s

  const [processes, setProcesses] = useState<AgentProcess[]>([
    { id: "p1", name: "proofpack-batcher-worker", role: "Varint Compression & Aggregation", cpu: 14.2, memory: "412 MB", status: "active", uptime: "4h 18m" },
    { id: "p2", name: "mst-posa-rpc-sync", role: "MST Testnet JSON-RPC Sync (4545)", cpu: 6.8, memory: "256 MB", status: "active", uptime: "18h 02m" },
    { id: "p3", name: "bridgekey-auth-verifier", role: "EIP-712 ECDSA Signature Pipeline", cpu: 4.1, memory: "188 MB", status: "idle", uptime: "4h 18m" },
    { id: "p4", name: "merkle-tree-prover", role: "Keccak256 State Tree Commitment", cpu: 3.3, memory: "144 MB", status: "idle", uptime: "2d 11h" },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCpuHistory(prev => {
        const next = Math.max(12, Math.min(65, Math.round(prev[prev.length - 1] + (Math.random() - 0.5) * 8)));
        setCpuCurrent(next);
        return [...prev.slice(1), next];
      });

      setLatencyHistory(prev => {
        const next = Math.max(20, Math.min(85, Math.round(mstRpcLatency + (Math.random() - 0.5) * 6)));
        return [...prev.slice(1), next];
      });

      setMemCurrent(prev => Number((Math.max(1.1, Math.min(2.4, prev + (Math.random() - 0.5) * 0.05))).toFixed(2)));
      setNetworkIn(prev => Number((Math.max(20, Math.min(120, prev + (Math.random() - 0.5) * 12))).toFixed(1)));
      setNetworkOut(prev => Number((Math.max(80, Math.min(260, prev + (Math.random() - 0.5) * 20))).toFixed(1)));

      setProcesses(prev =>
        prev.map(p => ({
          ...p,
          cpu: Number(Math.max(1.5, Math.min(30, p.cpu + (Math.random() - 0.5) * 3)).toFixed(1))
        }))
      );
    }, 2000);

    return () => clearInterval(interval);
  }, [mstRpcLatency]);

  // SVG Sparkline generator
  const renderSparkline = (data: number[], color: string, maxVal = 70) => {
    const width = 160;
    const height = 36;
    const step = width / (data.length - 1);
    const points = data.map((val, idx) => {
      const x = idx * step;
      const y = height - (val / maxVal) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(" ");

    return (
      <svg width={width} height={height} className="overflow-visible">
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
        <circle
          cx={(data.length - 1) * step}
          cy={height - (data[data.length - 1] / maxVal) * height}
          r="3"
          fill={color}
          className="animate-ping"
        />
        <circle
          cx={(data.length - 1) * step}
          cy={height - (data[data.length - 1] / maxVal) * height}
          r="3"
          fill={color}
        />
      </svg>
    );
  };

  return (
    <div className={`rounded-3xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-[#0c101d] p-6 text-slate-900 dark:text-gray-100 shadow-xl transition-all ${className}`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-gray-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-md">
            <Activity className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">ProofPack System Monitor</h2>
              <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 font-mono text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-gray-400 font-medium">
              Real-time resource telemetry & active ProofPack L2 worker threads
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-900/60 px-3 py-1.5">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-700 dark:text-gray-300 font-semibold">MST PoSA: Healthy</span>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-900 px-3 py-1.5 text-slate-600 dark:text-gray-400 hover:text-slate-950 dark:hover:text-white transition-colors"
          >
            <span>{isExpanded ? "Collapse Processes" : "Expand Processes"}</span>
            {isExpanded ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Grid: 4 Core Resource Tiles */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tile 1: CPU Utilization */}
        <div className="rounded-2xl border border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-950/60 p-4 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-gray-400">
            <span className="font-semibold flex items-center gap-1.5">
              <Cpu className="size-3.5 text-emerald-500" />
              <span>Sequencer CPU</span>
            </span>
            <span className="font-mono text-[11px] text-slate-400">8 Cores</span>
          </div>

          <div className="flex items-baseline justify-between">
            <div>
              <p className="font-mono text-2xl font-black text-slate-900 dark:text-white">{cpuCurrent}%</p>
              <p className="font-mono text-[10px] text-slate-400">3.40 GHz nominal</p>
            </div>
            <div className="overflow-visible pl-2">
              {renderSparkline(cpuHistory, "#10b981", 70)}
            </div>
          </div>

          <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-gray-800 overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${Math.min(100, cpuCurrent)}%` }}
            />
          </div>
        </div>

        {/* Tile 2: Memory / Buffer */}
        <div className="rounded-2xl border border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-950/60 p-4 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-gray-400">
            <span className="font-semibold flex items-center gap-1.5">
              <HardDrive className="size-3.5 text-cyan-500" />
              <span>Mempool Memory</span>
            </span>
            <span className="font-mono text-[11px] text-slate-400">4.0 GB Cap</span>
          </div>

          <div className="flex items-baseline justify-between">
            <div>
              <p className="font-mono text-2xl font-black text-slate-900 dark:text-white">{memCurrent} GB</p>
              <p className="font-mono text-[10px] text-slate-400">
                {((memCurrent / 4.0) * 100).toFixed(0)}% utilized
              </p>
            </div>
            <span className="rounded-full bg-cyan-500/15 border border-cyan-500/30 px-2 py-0.5 font-mono text-[10px] font-bold text-cyan-700 dark:text-cyan-400">
              BUFFER OK
            </span>
          </div>

          <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-gray-800 overflow-hidden">
            <div
              className="h-full bg-cyan-500 transition-all duration-500"
              style={{ width: `${(memCurrent / 4.0) * 100}%` }}
            />
          </div>
        </div>

        {/* Tile 3: MST RPC Latency */}
        <div className="rounded-2xl border border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-950/60 p-4 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-gray-400">
            <span className="font-semibold flex items-center gap-1.5">
              <Wifi className="size-3.5 text-purple-500" />
              <span>MST RPC Latency</span>
            </span>
            <span className="font-mono text-[11px] text-slate-400">Mario Node</span>
          </div>

          <div className="flex items-baseline justify-between">
            <div>
              <p className="font-mono text-2xl font-black text-slate-900 dark:text-white">
                {latencyHistory[latencyHistory.length - 1]} ms
              </p>
              <p className="font-mono text-[10px] text-slate-400">Target &lt; 100ms</p>
            </div>
            <div className="overflow-visible pl-2">
              {renderSparkline(latencyHistory, "#a855f7", 90)}
            </div>
          </div>

          <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-gray-800 overflow-hidden">
            <div
              className="h-full bg-purple-500 transition-all duration-500"
              style={{ width: `${Math.min(100, (latencyHistory[latencyHistory.length - 1] / 100) * 100)}%` }}
            />
          </div>
        </div>

        {/* Tile 4: Calldata Wire Throughput */}
        <div className="rounded-2xl border border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-950/60 p-4 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-gray-400">
            <span className="font-semibold flex items-center gap-1.5">
              <Server className="size-3.5 text-amber-500" />
              <span>Calldata Bandwidth</span>
            </span>
            <span className="font-mono text-[11px] text-slate-400">L1 Pipeline</span>
          </div>

          <div className="flex items-center justify-between font-mono">
            <div>
              <div className="flex items-center gap-1 text-slate-700 dark:text-gray-200 text-xs">
                <ArrowDown className="size-3 text-emerald-500" />
                <span>IN: {networkIn} KB/s</span>
              </div>
              <div className="flex items-center gap-1 text-slate-700 dark:text-gray-200 text-xs mt-1">
                <ArrowUp className="size-3 text-cyan-500" />
                <span>OUT: {networkOut} KB/s</span>
              </div>
            </div>
            <div className="text-right">
              <span className="rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 px-2 py-1 text-[10px] font-bold font-mono">
                ~85% COMPRESSED
              </span>
            </div>
          </div>

          <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-gray-800 overflow-hidden">
            <div
              className="h-full bg-amber-500 transition-all duration-500"
              style={{ width: "42%" }}
            />
          </div>
        </div>
      </div>

      {/* Expandable Processes Table */}
      {isExpanded && (
        <div className="mt-6 border-t border-slate-200 dark:border-gray-800 pt-5 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400">
              Active ProofPack Subsystems ({processes.length})
            </h3>
            <span className="text-[11px] font-mono text-slate-400">Polled every 2,000ms</span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-gray-800">
            <table className="w-full text-left font-mono text-xs">
              <thead className="border-b border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-900/80 text-slate-500 dark:text-gray-400">
                <tr>
                  <th className="p-3">Process ID</th>
                  <th className="p-3">Role / Responsibility</th>
                  <th className="p-3">CPU Usage</th>
                  <th className="p-3">Memory</th>
                  <th className="p-3">Uptime</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-gray-800/80">
                {processes.map(proc => (
                  <tr key={proc.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-gray-900/40">
                    <td className="p-3 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <span className="size-2 rounded-full bg-emerald-500" />
                      <span>{proc.name}</span>
                    </td>
                    <td className="p-3 text-slate-600 dark:text-gray-300 font-sans">{proc.role}</td>
                    <td className="p-3 text-emerald-600 dark:text-emerald-400 font-bold">{proc.cpu}%</td>
                    <td className="p-3 text-slate-700 dark:text-gray-300">{proc.memory}</td>
                    <td className="p-3 text-slate-400">{proc.uptime}</td>
                    <td className="p-3">
                      <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase">
                        {proc.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default SystemMonitor;
