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
  CheckCircle2
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
    <div className={`rounded-2xl border border-gray-800 bg-[#0c101d] p-5 text-gray-100 shadow-2xl backdrop-blur ${className}`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-md shadow-emerald-500/10">
            <Activity className="size-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-extrabold tracking-tight text-white">System Monitor</h2>
              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-400">
                ACTIVE
              </span>
            </div>
            <p className="text-[11px] text-gray-400 font-medium">
              Real-time resource telemetry & active ProofPack L2 worker threads
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="flex items-center gap-1.5 rounded-lg border border-gray-800 bg-gray-900/60 px-3 py-1.5">
            <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-gray-300 font-semibold">MST PoSA: Healthy</span>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 rounded-lg border border-gray-800 bg-gray-900 px-3 py-1.5 text-gray-400 hover:text-white transition-colors"
          >
            <span>{isExpanded ? "Collapse Processes" : "Expand Processes"}</span>
            {isExpanded ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Grid: 4 Core Resource Tiles */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tile 1: CPU Utilization */}
        <div className="rounded-xl border border-gray-800/90 bg-gray-950/60 p-4 space-y-3">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span className="font-semibold flex items-center gap-1.5">
              <Cpu className="size-3.5 text-emerald-400" />
              <span>Sequencer CPU</span>
            </span>
            <span className="font-mono text-[11px] text-gray-500">8 Cores</span>
          </div>

          <div className="flex items-baseline justify-between">
            <div>
              <p className="font-mono text-2xl font-black text-white">{cpuCurrent}%</p>
              <p className="font-mono text-[10px] text-gray-500">3.40 GHz nominal</p>
            </div>
            <div className="overflow-visible pl-2">
              {renderSparkline(cpuHistory, "#22c55e", 70)}
            </div>
          </div>

          <div className="h-1.5 w-full rounded-full bg-gray-800/80 overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-400 transition-all duration-500"
              style={{ width: `${cpuCurrent}%` }}
            />
          </div>
        </div>

        {/* Tile 2: Memory & Heap */}
        <div className="rounded-xl border border-gray-800/90 bg-gray-950/60 p-4 space-y-3">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span className="font-semibold flex items-center gap-1.5">
              <HardDrive className="size-3.5 text-cyan-400" />
              <span>System Memory</span>
            </span>
            <span className="font-mono text-[11px] text-gray-500">8.0 GB RAM</span>
          </div>

          <div>
            <div className="flex items-baseline justify-between">
              <p className="font-mono text-2xl font-black text-white">{memCurrent} <span className="text-xs font-normal text-gray-400">GB</span></p>
              <span className="font-mono text-xs text-cyan-400 font-bold">{Math.round((memCurrent / 8) * 100)}%</span>
            </div>
            <p className="font-mono text-[10px] text-gray-500 mt-0.5">
              Mempool buffer: {mempoolSize} txs queued
            </p>
          </div>

          <div className="h-1.5 w-full rounded-full bg-gray-800/80 overflow-hidden">
            <div
              className="h-full rounded-full bg-cyan-400 transition-all duration-500"
              style={{ width: `${(memCurrent / 8) * 100}%` }}
            />
          </div>
        </div>

        {/* Tile 3: MST Network RPC Latency */}
        <div className="rounded-xl border border-gray-800/90 bg-gray-950/60 p-4 space-y-3">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span className="font-semibold flex items-center gap-1.5">
              <Wifi className="size-3.5 text-purple-400" />
              <span>MST RPC Ping</span>
            </span>
            <span className="font-mono text-[11px] text-gray-500">Chain 4545</span>
          </div>

          <div className="flex items-baseline justify-between">
            <div>
              <p className="font-mono text-2xl font-black text-white">
                {latencyHistory[latencyHistory.length - 1]} <span className="text-xs font-normal text-gray-400">ms</span>
              </p>
              <p className="font-mono text-[10px] text-purple-300">Fast finality target</p>
            </div>
            <div className="overflow-visible pl-2">
              {renderSparkline(latencyHistory, "#a855f7", 80)}
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-gray-500">
            <span>Min: 22ms</span>
            <span>Avg: 41ms</span>
            <span>Max: 56ms</span>
          </div>
        </div>

        {/* Tile 4: Bandwidth In / Out */}
        <div className="rounded-xl border border-gray-800/90 bg-gray-950/60 p-4 space-y-3">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span className="font-semibold flex items-center gap-1.5">
              <Server className="size-3.5 text-amber-400" />
              <span>L2 Wire Throughput</span>
            </span>
            <span className="font-mono text-[11px] text-emerald-400 font-bold">~76% compressed</span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="text-gray-400 flex items-center gap-1">
                <ArrowDown className="size-3 text-cyan-400" /> Ingress
              </span>
              <span className="font-bold text-white">{networkIn} KB/s</span>
            </div>
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="text-gray-400 flex items-center gap-1">
                <ArrowUp className="size-3 text-emerald-400" /> Egress
              </span>
              <span className="font-bold text-white">{networkOut} KB/s</span>
            </div>
          </div>

          <p className="text-[10px] font-mono text-gray-500 pt-1 border-t border-gray-800/60">
            Binary calldata broadcast to MST L1
          </p>
        </div>
      </div>

      {/* Expandable Processes & Workers List */}
      {isExpanded && (
        <div className="mt-5 border-t border-gray-800/80 pt-4 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-400">
            <span className="flex items-center gap-1.5">
              <Terminal className="size-3.5 text-emerald-400" />
              <span>Active Sequencer Daemons & Worker Threads</span>
            </span>
            <span className="font-mono text-[11px]">{processes.length} active threads</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="border-b border-gray-800 bg-gray-900/50 text-[11px] text-gray-500">
                <tr>
                  <th className="p-2.5">Daemon Name</th>
                  <th className="p-2.5">Module Role</th>
                  <th className="p-2.5">CPU %</th>
                  <th className="p-2.5">Memory</th>
                  <th className="p-2.5">Uptime</th>
                  <th className="p-2.5 text-right">State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 text-[11px]">
                {processes.map(proc => (
                  <tr key={proc.id} className="hover:bg-gray-900/30 transition-colors">
                    <td className="p-2.5 font-bold text-gray-200">{proc.name}</td>
                    <td className="p-2.5 font-sans text-gray-400">{proc.role}</td>
                    <td className="p-2.5 text-emerald-400 font-semibold">{proc.cpu}%</td>
                    <td className="p-2.5 text-gray-300">{proc.memory}</td>
                    <td className="p-2.5 text-gray-500">{proc.uptime}</td>
                    <td className="p-2.5 text-right">
                      <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[9px] font-bold text-emerald-400 uppercase">
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
