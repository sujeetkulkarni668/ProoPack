"use client";

import React, { useState } from "react";
import { Terminal, Search, ChevronDown, ChevronRight, Copy, Check, Filter, Bug, AlertTriangle, Info, CheckCircle2 } from "lucide-react";

export interface LogEntry {
  id: string;
  timestamp: string;
  level: "info" | "warn" | "error" | "debug";
  service: "BATCHER" | "SEQUENCER" | "SETTLEMENT" | "BRIDGEKEY" | "CRYPTO";
  message: string;
  payload?: Record<string, any>;
}

export const DEMO_LOGS: LogEntry[] = [
  {
    id: "l1",
    timestamp: "18:42:01.312",
    level: "info",
    service: "SETTLEMENT",
    message: "Batch #42 confirmed on MST Blockchain (Block #6643944)",
    payload: { batchId: 42, txCount: 64, l1TxHash: "0x7a8f...921c", gasUsed: 163520, savings: "91.2%" }
  },
  {
    id: "l2",
    timestamp: "18:41:58.204",
    level: "info",
    service: "BATCHER",
    message: "Binary Varint compression completed: 64 operations packed into 1,420 bytes",
    payload: { uncompressedBytes: 15360, compressedBytes: 1420, compressionRatio: "90.7%" }
  },
  {
    id: "l3",
    timestamp: "18:41:55.088",
    level: "debug",
    service: "CRYPTO",
    message: "Computed Merkle root and cryptographic state commitment",
    payload: { root: "0x39df...b41a", commitment: "0x81a2...c9f0", durationMs: 4.2 }
  },
  {
    id: "l4",
    timestamp: "18:41:51.642",
    level: "info",
    service: "BRIDGEKEY",
    message: "EIP-712 structured signature verified for account 0xf39F...2266",
    payload: { sender: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", chainId: 4545, nonce: 4 }
  },
  {
    id: "l5",
    timestamp: "18:41:40.119",
    level: "warn",
    service: "SEQUENCER",
    message: "Mempool wait limit reached (3000ms). Triggering partial batch settlement.",
    payload: { pendingCount: 18, minBatchSize: 2 }
  },
  {
    id: "l6",
    timestamp: "18:40:12.890",
    level: "error",
    service: "BATCHER",
    message: "Rejected transaction with stale sequence nonce (nonce: 2, current: 3)",
    payload: { txId: "0x12ab...99fc", sender: "0x7099...79C8", expectedNonce: 3, providedNonce: 2 }
  }
];

export function InteractiveLogsTable({
  logs = DEMO_LOGS,
  className = ""
}: {
  logs?: LogEntry[];
  className?: string;
}) {
  const [filterLevel, setFilterLevel] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredLogs = logs.filter(l => {
    const matchesLevel = filterLevel === "ALL" || l.level.toUpperCase() === filterLevel;
    const matchesQuery =
      l.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.service.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLevel && matchesQuery;
  });

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getLevelBadge = (level: LogEntry["level"]) => {
    switch (level) {
      case "info":
        return <span className="rounded-lg bg-cyan-500/15 px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-cyan-700 dark:text-cyan-400 border border-cyan-500/20">INFO</span>;
      case "warn":
        return <span className="rounded-lg bg-amber-500/15 px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-amber-700 dark:text-amber-400 border border-amber-500/20">WARN</span>;
      case "error":
        return <span className="rounded-lg bg-rose-500/15 px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-rose-700 dark:text-rose-400 border border-rose-500/20">ERR</span>;
      case "debug":
        return <span className="rounded-lg bg-purple-500/15 px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-purple-700 dark:text-purple-400 border border-purple-500/20">DEBUG</span>;
    }
  };

  return (
    <div className={`rounded-3xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-[#111827]/90 p-6 text-slate-900 dark:text-gray-100 shadow-xl transition-all ${className}`}>
      {/* Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 dark:border-gray-800 pb-5">
        <div className="flex items-center gap-2">
          <Terminal className="size-4 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">ProofPack Observability & Event Logs</h3>
          <span className="rounded-full bg-slate-100 dark:bg-gray-800 px-2.5 py-0.5 font-mono text-[11px] text-slate-600 dark:text-gray-400">
            {filteredLogs.length} events
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 size-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-48 rounded-xl border border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-900/80 pl-8 pr-3 py-1.5 font-mono text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:border-emerald-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Level Filter Pills */}
          <div className="flex items-center rounded-xl border border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-900 p-1 font-mono text-[11px]">
            {["ALL", "INFO", "WARN", "ERR", "DEBUG"].map(lvl => (
              <button
                key={lvl}
                onClick={() => setFilterLevel(lvl)}
                className={`rounded-lg px-2 py-0.5 font-bold transition-colors ${
                  filterLevel === lvl
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-sm"
                    : "text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 dark:border-gray-800">
        <table className="w-full text-left font-mono text-xs">
          <thead className="border-b border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-900/60 text-slate-500 dark:text-gray-400">
            <tr>
              <th className="p-3 w-8"></th>
              <th className="p-3">Timestamp</th>
              <th className="p-3">Level</th>
              <th className="p-3">Subsystem</th>
              <th className="p-3">Log Message</th>
              <th className="p-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-gray-800/60">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-400 font-sans">
                  No log entries found.
                </td>
              </tr>
            ) : (
              filteredLogs.map(log => {
                const isExpanded = expandedId === log.id;
                const isCopied = copiedId === log.id;

                return (
                  <React.Fragment key={log.id}>
                    <tr
                      className={`transition-colors hover:bg-slate-50 dark:hover:bg-gray-900/40 cursor-pointer ${
                        isExpanded ? "bg-slate-50 dark:bg-gray-900/30" : ""
                      }`}
                      onClick={() => setExpandedId(isExpanded ? null : log.id)}
                    >
                      <td className="p-3 text-slate-400">
                        {isExpanded ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
                      </td>
                      <td className="p-3 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                        {log.timestamp}
                      </td>
                      <td className="p-3 whitespace-nowrap">{getLevelBadge(log.level)}</td>
                      <td className="p-3 font-semibold text-slate-700 dark:text-gray-300 whitespace-nowrap">
                        <span className="rounded-lg bg-slate-100 dark:bg-gray-800/80 px-2 py-0.5 text-[11px]">
                          {log.service}
                        </span>
                      </td>
                      <td className="p-3 text-slate-800 dark:text-gray-200 font-mono text-xs">
                        {log.message}
                      </td>
                      <td className="p-3 text-right" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => handleCopy(log.id, JSON.stringify(log, null, 2))}
                          className="rounded-lg p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors"
                          title="Copy JSON Payload"
                        >
                          {isCopied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                        </button>
                      </td>
                    </tr>

                    {/* Expanded Payload Inspector */}
                    {isExpanded && log.payload && (
                      <tr className="bg-slate-100/60 dark:bg-gray-950/80">
                        <td colSpan={6} className="p-4 pl-12">
                          <div className="rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3 font-mono text-[11px] text-emerald-600 dark:text-emerald-400">
                            <pre className="overflow-x-auto whitespace-pre-wrap">
                              {JSON.stringify(log.payload, null, 2)}
                            </pre>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default InteractiveLogsTable;
