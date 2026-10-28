"use client";

import React, { useState } from "react";
import { ArrowUpDown, Search, CheckSquare, Square, Download, Zap, ExternalLink, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { L2Transaction } from "../../types";

export interface LeadsDataTableProps {
  transactions: L2Transaction[];
  onSelectBatch?: (batchId: number) => void;
  onFlushSelected?: (txIds: string[]) => void;
  className?: string;
}

export function LeadsDataTable({
  transactions,
  onSelectBatch,
  onFlushSelected,
  className = ""
}: LeadsDataTableProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filtered = transactions.filter(t => {
    const matchesSearch =
      t.txId.toLowerCase().includes(search.toLowerCase()) ||
      t.sender.toLowerCase().includes(search.toLowerCase()) ||
      t.to.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const toggleSelectAll = () => {
    if (selectedIds.length === paginated.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginated.map(t => t.txId));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleExportCSV = () => {
    const rows = filtered.map(t => `${t.txId},${t.sender},${t.to},${t.amount},${t.nonce},${t.status}`);
    const csvContent = "data:text/csv;charset=utf-8,TxID,Sender,Recipient,Amount,Nonce,Status\n" + rows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `proofpack-transactions-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`rounded-2xl border border-gray-800 bg-[#111827]/90 p-5 text-gray-100 shadow-xl backdrop-blur ${className}`}>
      {/* Top action bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-800 pb-4">
        <div>
          <h3 className="text-base font-bold text-white">ProofPack L2 Transaction Registry</h3>
          <p className="text-xs text-gray-400">
            High-density ledger with batch allocation and settlement status
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 size-3.5 text-gray-500" />
            <input
              type="text"
              placeholder="Search hash or address..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-56 rounded-lg border border-gray-800 bg-gray-900/80 pl-8 pr-3 py-1.5 font-mono text-xs text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-800 bg-gray-900 px-3 py-1.5 text-xs text-gray-300 focus:outline-none"
          >
            <option value="ALL">All States</option>
            <option value="QUEUED">Queued</option>
            <option value="COMMITTED">Committed</option>
            <option value="SETTLED">Settled</option>
          </select>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-lg border border-gray-800 bg-gray-900 px-3 py-1.5 text-xs font-semibold text-gray-300 hover:text-white"
          >
            <Download className="size-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Floating Bulk Action Bar (when rows selected) */}
      {selectedIds.length > 0 && (
        <div className="my-3 flex items-center justify-between rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-4 py-2.5 text-xs text-emerald-300 animate-in fade-in">
          <span className="font-semibold">{selectedIds.length} operations selected</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onFlushSelected?.(selectedIds)}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1 font-bold text-gray-950 shadow-md hover:bg-emerald-400"
            >
              <Zap className="size-3.5" />
              <span>Prioritize into Next Batch</span>
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="text-gray-400 hover:text-white"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left font-mono text-xs">
          <thead className="border-b border-gray-800 bg-gray-900/60 text-gray-400">
            <tr>
              <th className="p-3 w-10">
                <button onClick={toggleSelectAll} className="text-gray-400 hover:text-white">
                  {selectedIds.length > 0 && selectedIds.length === paginated.length ? (
                    <CheckSquare className="size-4 text-emerald-400" />
                  ) : (
                    <Square className="size-4" />
                  )}
                </button>
              </th>
              <th className="p-3">Tx Hash</th>
              <th className="p-3">Sender → Recipient</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Nonce</th>
              <th className="p-3">Batch</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/60">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-500 font-sans">
                  No transactions match the selected criteria.
                </td>
              </tr>
            ) : (
              paginated.map(tx => {
                const isSelected = selectedIds.includes(tx.txId);
                return (
                  <tr
                    key={tx.txId}
                    className={`transition-colors hover:bg-gray-900/40 ${
                      isSelected ? "bg-emerald-500/5" : ""
                    }`}
                  >
                    <td className="p-3">
                      <button
                        onClick={() => toggleSelectOne(tx.txId)}
                        className="text-gray-400 hover:text-white"
                      >
                        {isSelected ? (
                          <CheckSquare className="size-4 text-emerald-400" />
                        ) : (
                          <Square className="size-4" />
                        )}
                      </button>
                    </td>
                    <td className="p-3 font-semibold text-emerald-400">
                      {tx.txId.slice(0, 10)}...{tx.txId.slice(-6)}
                    </td>
                    <td className="p-3 text-gray-300">
                      {tx.sender.slice(0, 6)}...{tx.sender.slice(-4)} → {tx.to.slice(0, 6)}...{tx.to.slice(-4)}
                    </td>
                    <td className="p-3 font-bold text-white">
                      {(Number(tx.amount) / 1e18).toFixed(4)} MSTC
                    </td>
                    <td className="p-3 text-gray-400">{tx.nonce}</td>
                    <td className="p-3">
                      {tx.batchId ? (
                        <button
                          onClick={() => onSelectBatch?.(tx.batchId!)}
                          className="rounded bg-purple-500/10 px-2 py-0.5 text-purple-400 hover:bg-purple-500/20 font-bold"
                        >
                          #{tx.batchId}
                        </button>
                      ) : (
                        <span className="text-gray-600">—</span>
                      )}
                    </td>
                    <td className="p-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          tx.status === "SETTLED"
                            ? "bg-emerald-500/20 text-emerald-300"
                            : tx.status === "COMMITTED"
                            ? "bg-cyan-500/20 text-cyan-300"
                            : "bg-amber-500/20 text-amber-300"
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between border-t border-gray-800 pt-3 text-xs text-gray-400 font-sans">
        <span>
          Showing {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, filtered.length)} of {filtered.length}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded p-1 text-gray-400 hover:text-white disabled:opacity-40"
          >
            <ChevronLeft className="size-4" />
          </button>
          <span className="font-mono text-gray-300">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="rounded p-1 text-gray-400 hover:text-white disabled:opacity-40"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default LeadsDataTable;
