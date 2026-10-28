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
    message: "Batch #42 confirmed on MST Blockchain (Block #1528934)",
    payload: { batchId: 42, txCount: 64, l1TxHash: "0x7a8f...921c", gasUsed: 135800, savings: "79.6%" }
  },
  {
    id: "l2",
    timestamp: "18:41:58.204",
    level: "info",
    service: "BATCHER",
    message: "Binary Varint compression completed: 64 operations packed into 3,842 bytes",
    payload: { uncompressedBytes: 15360, compressedBytes: 3842, compressionRatio: "75.0%" }
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
        return <span className="rounded bg-cyan-500/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-cyan-400 border border-cyan-500/20">INFO</span>;
      case "warn":
        return <span className="rounded bg-amber-500/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-amber-400 border border-amber-500/20">WARN</span>;
      case "error":
        return <span className="rounded bg-rose-500/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-rose-400 border border-rose-500/20">ERR</span>;
      case "debug":
        return <span className="rounded bg-purple-500/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-purple-400 border border-purple-500/20">DEBUG</span>;
    }
  };

  return (
    <div className={`rounded-2xl border border-gray-800 bg-[#111827]/90 p-5 text-gray-100 shadow-xl backdrop-blur ${className}`}>
      {/* Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-800 pb-4">
        <div className="flex items-center gap-2">
          <Terminal className="size-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-white">ProofPack Observability & Event Logs</h3>
          <span className="rounded-full bg-gray-800 px-2 py-0.5 font-mono text-[11px] text-gray-400">
            {filteredLogs.length} events
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 size-3.5 text-gray-500" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-48 rounded-lg border border-gray-800 bg-gray-900/80 pl-8 pr-3 py-1.5 font-mono text-xs text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Level Filter Pills */}
          <div className="flex rounded-lg border border-gray-800 bg-gray-900 p-0.5 text-xs font-mono">
            {["ALL", "INFO", "WARN", "ERROR", "DEBUG"].map(lvl => (
              <button
                key={lvl}
                onClick={() => setFilterLevel(lvl)}
                className={`rounded px-2.5 py-1 text-[11px] transition-colors ${
                  filterLevel === lvl
                    ? "bg-emerald-500 text-gray-950 font-bold"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="mt-4 divide-y divide-gray-800/60 font-mono text-xs">
        {filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No logs matching query</div>
        ) : (
          filteredLogs.map(log => {
            const isExpanded = expandedId === log.id;
            return (
              <div key={log.id} className="transition-colors hover:bg-gray-900/40">
                <div
                  onClick={() => setExpandedId(isExpanded ? null : log.id)}
                  className="flex cursor-pointer items-center justify-between gap-4 p-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-gray-500">{isExpanded ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}</span>
                    <span className="text-[11px] text-gray-500">{log.timestamp}</span>
                    {getLevelBadge(log.level)}
                    <span className="rounded bg-gray-800/80 px-2 py-0.5 text-[10px] font-semibold text-gray-300">
                      {log.service}
                    </span>
                    <span className="truncate text-gray-200 font-sans text-xs">
                      {log.message}
                    </span>
                  </div>
                  {log.payload && (
                    <span className="shrink-0 text-[10px] text-gray-500 hover:text-gray-300">
                      {isExpanded ? "Collapse" : "JSON"}
                    </span>
                  )}
                </div>

                {/* Expanded Payload */}
                {isExpanded && log.payload && (
                  <div className="bg-black/60 p-4 border-t border-gray-800/80 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-gray-400">
                      <span>Event Metadata Payload</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(log.id, JSON.stringify(log.payload, null, 2));
                        }}
                        className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300"
                      >
                        {copiedId === log.id ? <Check className="size-3" /> : <Copy className="size-3" />}
                        <span>{copiedId === log.id ? "Copied" : "Copy JSON"}</span>
                      </button>
                    </div>
                    <pre className="rounded-lg bg-gray-950 p-3 text-[11px] text-emerald-300/90 overflow-x-auto border border-gray-800">
                      {JSON.stringify(log.payload, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default InteractiveLogsTable;
