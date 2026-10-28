"use client";

import * as React from "react";
import {
  Zap,
  TrendingDown,
  Layers,
  ShieldCheck,
  Cpu,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  Database,
  Lock,
  Boxes,
  HelpCircle
} from "lucide-react";
import { L2Transaction, BatchMetadata, CostAnalyticsData, HealthResponse } from "../../types";

/* ------------------------------------------------------------------ */
/*  Types & Interfaces                                                 */
/* ------------------------------------------------------------------ */

export interface Web3Activity {
  id: string;
  kind: "transfer" | "batch" | "settlement";
  title: string;
  detail: string;
  amount: string;
  status: "confirmed" | "pending" | "failed";
  time: string;
}

export interface Web3BentoProps {
  account?: string;
  network?: string;
  transactions?: L2Transaction[];
  batches?: BatchMetadata[];
  analytics?: CostAnalyticsData | null;
  health?: HealthResponse | null;
  onOpenSendModal?: () => void;
  onSelectBatch?: (batchId: number) => void;
  activity?: Web3Activity[];
  accent?: string;
  accent2?: string;
  className?: string;
}

function cx(...classes: Array<string | boolean | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

/* ------------------------------------------------------------------ */
/*  Helpers & Animations                                               */
/* ------------------------------------------------------------------ */

const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

function useMounted() {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  return mounted;
}

function useCountUp(target: number, enabled = true, duration = 1200) {
  const [v, setV] = React.useState(enabled ? 0 : target);
  React.useEffect(() => {
    if (!enabled) return setV(target);
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / duration);
      setV(target * (1 - Math.pow(1 - p, 4)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, enabled, duration]);
  return v;
}

/* ------------------------------------------------------------------ */
/*  Tile Container Component                                           */
/* ------------------------------------------------------------------ */

function Tile({
  title,
  action,
  className,
  style,
  children
}: {
  title?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cx(
        "relative flex min-w-0 flex-col overflow-hidden rounded-[26px] border border-slate-200 dark:border-gray-800 bg-white dark:bg-[#111827] p-5 text-slate-900 dark:text-gray-100 shadow-sm transition-all hover:shadow-md",
        className
      )}
      style={style}
    >
      {(title || action) && (
        <header className="mb-4 flex items-center justify-between gap-3">
          {title && <h3 className="text-[13px] font-semibold text-slate-500 dark:text-gray-400">{title}</h3>}
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  1. Hero Tile: L2 Rollup Net Performance & PnL Strip               */
/* ------------------------------------------------------------------ */

function HeroTile({
  account,
  network,
  totalTxs,
  savingsPercent,
  accent,
  accent2
}: {
  account: string;
  network: string;
  totalTxs: number;
  savingsPercent: number;
  accent: string;
  accent2: string;
}) {
  const mounted = useMounted();
  const txCountAnimated = useCountUp(totalTxs || 142);
  const savingsAnimated = useCountUp(savingsPercent || 88.5);

  // 30 intervals of L2 batch savings throughput
  const mockDaily = [
    72, 75, 78, 82, 85, 80, 84, 88, 86, 89,
    91, 88, 90, 92, 91, 89, 93, 91, 92, 90,
    91, 93, 92, 94, 91, 92, 90, 93, 92, Math.round(savingsPercent || 91)
  ];
  const [hoverIndex, setHoverIndex] = React.useState<number | null>(null);

  return (
    <Tile className="sm:col-span-2 lg:col-span-2 lg:col-start-1 lg:row-start-1 bg-gradient-to-br from-white via-slate-50 to-emerald-50/20 dark:from-[#111827] dark:via-[#0f172a] dark:to-emerald-950/20">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              <Zap className="size-3" /> ProofPack L2 Active
            </span>
            <span className="text-xs text-slate-500 dark:text-gray-400 font-mono">{network}</span>
          </div>
          <p className="text-[26px] sm:text-[32px] font-extrabold leading-[1.1] tracking-tight">
            gm, <span className="text-emerald-600 dark:text-emerald-400 font-mono">{account}</span>
          </p>
          <div className="mt-3 flex items-baseline gap-3">
            <span className="font-mono text-[30px] sm:text-[38px] font-black tracking-tight text-slate-900 dark:text-white">
              {savingsAnimated.toFixed(1)}%
            </span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              Avg Gas Reduction
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
            {Math.round(txCountAnimated)} transactions batched via Varint + Address Dict compression
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 p-3 text-right">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-gray-400 block">Settlement Asset</span>
          <span className="text-base font-extrabold font-mono text-emerald-600 dark:text-emerald-400">MSTC Native</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">PoSA ~3.0s Finality</span>
        </div>
      </div>

      {/* Throughput & Savings Strip */}
      <div className="mt-6 flex flex-1 flex-col">
        <div className="flex flex-1 items-end gap-[3px]" style={{ minHeight: 64 }} onPointerLeave={() => setHoverIndex(null)}>
          {mockDaily.map((val, i) => {
            const heightPercent = (val / 100) * 100;
            return (
              <button
                key={i}
                type="button"
                onPointerEnter={() => setHoverIndex(i)}
                aria-label={`Interval ${i + 1}: ${val}% saved`}
                className="relative flex-1 rounded-[4px] focus-visible:outline-none transition-all"
                style={{
                  height: mounted ? `${heightPercent}%` : "10%",
                  background: val >= 85 ? accent : accent2,
                  opacity: hoverIndex === null ? 0.45 + (val / 100) * 0.55 : hoverIndex === i ? 1 : 0.25,
                  transition: `height 800ms ${EASE} ${i * 12}ms, opacity 180ms ease`
                }}
              />
            );
          })}
        </div>
        <div className="mt-2 flex items-center justify-between font-mono text-[11px] text-slate-500 dark:text-gray-400">
          <span>Day 1</span>
          <span className="font-semibold text-slate-800 dark:text-gray-200">
            {hoverIndex !== null ? `Batch Interval ${hoverIndex + 1} · ${mockDaily[hoverIndex]}% Gas Saved` : "30-Day Batch Savings Curve"}
          </span>
          <span>Today</span>
        </div>
      </div>
    </Tile>
  );
}

/* ------------------------------------------------------------------ */
/*  2. L2 Batch Stack Tile (Replaces Credit Cards)                     */
/* ------------------------------------------------------------------ */

function BatchCardsTile({
  batches = [],
  onSelectBatch
}: {
  batches?: BatchMetadata[];
  onSelectBatch?: (id: number) => void;
}) {
  const [activeIdx, setActiveIdx] = React.useState(0);

  const normalizedBatches = (batches && batches.length > 0 ? batches.slice(0, 3) : []).map(b => ({
    id: b.batchId,
    txCount: b.txCount,
    root: b.batchRoot || "0x0000000000000000000000000000000000000000",
    ratio: b.uncompressedBytes > 0 ? Number(((1 - b.compressedBytes / b.uncompressedBytes) * 100).toFixed(1)) : 85.0,
    gas: b.txCount * 2555 + 21000
  }));

  const fallbackBatches = [
    { id: 14, txCount: 64, root: "0x8fa12c904e5d89201bc4703a9f91e326b47c0a8e32d561fb04899c72e11a684b", ratio: 90.7, gas: 163520 },
    { id: 13, txCount: 32, root: "0x39df5b128c94017fae2981bc502f6183e9204c8872b5091a13e2f012485cc120", ratio: 86.3, gas: 127760 },
    { id: 12, txCount: 16, root: "0x7b210948acfe1298510ba395f8e028470a91285b739185a0c918ef9213859012", ratio: 79.6, gas: 94880 }
  ];

  const displayBatches = normalizedBatches.length > 0 ? normalizedBatches : fallbackBatches;

  return (
    <Tile
      title={
        <div className="flex items-center gap-1.5">
          <Boxes className="size-4 text-emerald-600 dark:text-emerald-400" />
          <span>Settled L2 Batches (Stack)</span>
        </div>
      }
      className="sm:col-span-2 lg:col-span-1 lg:col-start-3 lg:row-start-1"
    >
      <div className="relative h-[220px] w-full flex items-center justify-center">
        {displayBatches.map((b, i) => {
          const isTop = i === activeIdx;
          const offset = (i - activeIdx) * 16;
          const scale = 1 - Math.abs(i - activeIdx) * 0.06;
          const zIndex = 10 - Math.abs(i - activeIdx);

          return (
            <div
              key={b.id}
              onClick={() => {
                setActiveIdx(i);
                onSelectBatch?.(b.id);
              }}
              style={{
                transform: `translateY(${offset}px) scale(${scale})`,
                zIndex,
                transition: "all 400ms cubic-bezier(0.16, 1, 0.3, 1)"
              }}
              className={cx(
                "absolute inset-x-2 top-2 rounded-2xl p-4 cursor-pointer border shadow-lg transition-transform",
                i === 0
                  ? "bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-900 text-white border-emerald-400/40"
                  : i === 1
                  ? "bg-gradient-to-br from-indigo-700 via-purple-800 to-slate-900 text-white border-indigo-400/30"
                  : "bg-gradient-to-br from-slate-800 via-slate-900 to-gray-950 text-white border-slate-700"
              )}
            >
              <div className="flex items-center justify-between border-b border-white/15 pb-2">
                <span className="font-mono text-xs font-bold uppercase tracking-wider">
                  Batch #{b.id}
                </span>
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold">
                  {b.txCount} Txs
                </span>
              </div>

              <div className="mt-3 space-y-1">
                <div className="text-[10px] opacity-75 font-mono">Merkle Root</div>
                <div className="font-mono text-xs font-semibold truncate text-white/95">
                  {b.root.slice(0, 14)}...{b.root.slice(-8)}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-xs pt-2 border-t border-white/10">
                <div>
                  <span className="text-[10px] opacity-75 block">Compression</span>
                  <span className="font-mono font-bold">{b.ratio}%</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] opacity-75 block">L1 Gas</span>
                  <span className="font-mono font-bold">{(b.gas / 1000).toFixed(1)}k</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-center text-[11px] text-slate-500 dark:text-gray-400 font-mono">
        Click card to view Merkle proof & inclusion tree
      </p>
    </Tile>
  );
}

/* ------------------------------------------------------------------ */
/*  3. Gas Savings Tile (Replaces Ethereum Gwei)                       */
/* ------------------------------------------------------------------ */

function GasTile({ accent }: { accent: string }) {
  const directL1Gas = 29000;
  const l2BatchedGas = 2555;
  const savingsPct = 91.2;

  return (
    <Tile
      title={
        <div className="flex items-center gap-1.5">
          <TrendingDown className="size-4 text-emerald-600 dark:text-emerald-400" />
          <span>MST Gas Fee Comparison</span>
        </div>
      }
      className="lg:col-span-1 lg:col-start-4 lg:row-start-1"
    >
      <div className="flex flex-col justify-between h-full space-y-4">
        <div>
          <span className="text-xs text-slate-500 dark:text-gray-400 font-medium">Direct MST L1 Execution</span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="font-mono text-2xl font-black text-rose-500 line-through">
              29,000
            </span>
            <span className="text-xs text-slate-500">gas / tx</span>
          </div>
        </div>

        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3">
          <span className="text-xs text-emerald-700 dark:text-emerald-300 font-semibold flex items-center gap-1">
            <Zap className="size-3.5" /> ProofPack L2 Amortized
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-mono text-3xl font-black text-emerald-600 dark:text-emerald-400">
              2,555
            </span>
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">gas / tx</span>
          </div>
          <div className="mt-2 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
            ⚡ {savingsPct}% gas savings achieved
          </div>
        </div>

        <div className="text-[11px] text-slate-500 dark:text-gray-400 leading-snug">
          <strong>Learner Tip:</strong> 64 users share 1 fixed 21,000 gas L1 base cost. Varint encoding strips leading zeros.
        </div>
      </div>
    </Tile>
  );
}

/* ------------------------------------------------------------------ */
/*  4. L2 Throughput & Savings Chart                                   */
/* ------------------------------------------------------------------ */

function ChartTile({ accent }: { accent: string }) {
  const points = [22, 35, 48, 62, 55, 78, 92, 115, 130, 142];
  const max = Math.max(...points);

  return (
    <Tile
      title={
        <div className="flex items-center gap-1.5">
          <Layers className="size-4 text-emerald-600 dark:text-emerald-400" />
          <span>Cumulative L2 Batch Volume</span>
        </div>
      }
      className="sm:col-span-2 lg:col-span-2"
    >
      <div className="flex items-center justify-between mb-2">
        <div>
          <span className="font-mono text-2xl font-extrabold text-slate-900 dark:text-white">142 Txs</span>
          <span className="text-xs text-slate-500 dark:text-gray-400 ml-2">Processed Off-Chain</span>
        </div>
        <div className="flex items-center gap-1 rounded-full border border-slate-200 dark:border-gray-800 p-0.5 text-xs font-mono">
          <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-bold">Live</span>
          <span className="px-2 py-0.5 text-slate-500">MST Testnet</span>
        </div>
      </div>

      {/* SVG Path visualizer */}
      <div className="h-28 w-full flex items-end pt-4">
        <svg viewBox="0 0 400 100" className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="l2grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M 0,85 Q 50,60 100,55 T 200,40 T 300,20 T 400,8 L 400,100 L 0,100 Z"
            fill="url(#l2grad)"
          />
          <path
            d="M 0,85 Q 50,60 100,55 T 200,40 T 300,20 T 400,8"
            fill="none"
            stroke="#10b981"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-slate-400 dark:text-gray-400">
        <span>Batch #1</span>
        <span>Batch #7</span>
        <span>Batch #14 (Current)</span>
      </div>
    </Tile>
  );
}

/* ------------------------------------------------------------------ */
/*  5. Compression Allocation Tile                                     */
/* ------------------------------------------------------------------ */

function AllocationTile() {
  const parts = [
    { label: "Varint Encodings", pct: 38.2, color: "bg-emerald-500" },
    { label: "Address Dict Lookups", pct: 26.4, color: "bg-teal-400" },
    { label: "Merkle Tree Proofs", pct: 21.0, color: "bg-indigo-500" },
    { label: "Batch Header Meta", pct: 14.4, color: "bg-purple-500" }
  ];

  return (
    <Tile
      title={
        <div className="flex items-center gap-1.5">
          <Database className="size-4 text-emerald-600 dark:text-emerald-400" />
          <span>Calldata Compression Breakdown</span>
        </div>
      }
      className="sm:col-span-1 lg:col-span-1"
    >
      <div className="space-y-3">
        <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-gray-800">
          {parts.map(p => (
            <div key={p.label} style={{ width: `${p.pct}%` }} className={p.color} />
          ))}
        </div>

        <div className="space-y-2 pt-1 font-mono text-xs">
          {parts.map(p => (
            <div key={p.label} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`size-2.5 rounded-full ${p.color}`} />
                <span className="text-slate-600 dark:text-gray-300 font-sans text-[11px]">{p.label}</span>
              </div>
              <span className="font-bold text-slate-800 dark:text-gray-200">{p.pct}%</span>
            </div>
          ))}
        </div>

        <div className="mt-3 rounded-lg bg-slate-100 dark:bg-gray-900 p-2 text-[10px] text-slate-500 dark:text-gray-400">
          160 raw bytes → 24 compressed bytes per operation
        </div>
      </div>
    </Tile>
  );
}

/* ------------------------------------------------------------------ */
/*  6. MST Settlement Contract Tile (Replaces Lido Staking)            */
/* ------------------------------------------------------------------ */

function SettlementContractTile() {
  return (
    <Tile
      title={
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
          <span>MST Settlement Contract</span>
        </div>
      }
      className="sm:col-span-1 lg:col-span-1"
    >
      <div className="space-y-3">
        <div>
          <span className="text-[11px] text-slate-500 dark:text-gray-400">Contract File</span>
          <p className="font-mono text-xs font-bold text-slate-900 dark:text-white">ProofPackSettlement.sol</p>
        </div>

        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-500 dark:text-gray-400">Consensus</span>
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">MST PoSA EVM</span>
        </div>

        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-500 dark:text-gray-400">Target Chain</span>
          <span className="font-semibold">4545 (Testnet)</span>
        </div>

        <div className="rounded-lg border border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-900/60 p-2.5 text-[11px]">
          <span className="text-slate-500 dark:text-gray-400 block mb-1">State Security</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="size-3.5" /> ReentrancyGuard & Pausable
          </span>
        </div>
      </div>
    </Tile>
  );
}

/* ------------------------------------------------------------------ */
/*  7. Mempool Pipeline Buffer Tile (Replaces Uniswap LP)             */
/* ------------------------------------------------------------------ */

function MempoolPipelineTile({
  mempoolSize = 0,
  onFlush
}: {
  mempoolSize?: number;
  onFlush?: () => void;
}) {
  const maxCap = 64;
  const pct = Math.min(100, Math.round((mempoolSize / maxCap) * 100));

  return (
    <Tile
      title={
        <div className="flex items-center gap-1.5">
          <Cpu className="size-4 text-emerald-600 dark:text-emerald-400" />
          <span>Mempool Pipeline Buffer</span>
        </div>
      }
      className="sm:col-span-1 lg:col-span-1"
    >
      <div className="space-y-3">
        <div className="flex items-baseline justify-between">
          <span className="font-mono text-2xl font-black text-slate-900 dark:text-white">{mempoolSize} txs</span>
          <span className="text-xs text-slate-500 font-mono">/ {maxCap} max</span>
        </div>

        <div className="h-2.5 w-full rounded-full bg-slate-200 dark:bg-gray-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-500"
            style={{ width: `${Math.max(8, pct)}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-gray-400">
          <span>Worker Interval</span>
          <span className="font-mono font-semibold">3,000 ms</span>
        </div>

        <div className="pt-1">
          <button
            onClick={onFlush}
            className="w-full py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold transition-colors"
          >
            Force Flush Batch Now
          </button>
        </div>
      </div>
    </Tile>
  );
}

/* ------------------------------------------------------------------ */
/*  8. MST Node Health Tile (Replaces Ethereum Block 21M)              */
/* ------------------------------------------------------------------ */

function MSTNodeHealthTile({
  blockNumber,
  latencyMs
}: {
  blockNumber?: string;
  latencyMs?: number;
}) {
  return (
    <Tile
      title={
        <div className="flex items-center gap-1.5">
          <Clock className="size-4 text-emerald-600 dark:text-emerald-400" />
          <span>MST Node & RPC Status</span>
        </div>
      }
      className="sm:col-span-1 lg:col-span-1"
    >
      <div className="space-y-3">
        <div>
          <span className="text-[11px] text-slate-500 dark:text-gray-400">MST Testnet Block</span>
          <div className="font-mono text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span>#{blockNumber || "6643944"}</span>
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-500 dark:text-gray-400">Mario RPC Latency</span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400">{latencyMs || 42} ms</span>
        </div>

        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-500 dark:text-gray-400">Block Interval</span>
          <span className="font-semibold text-slate-700 dark:text-gray-300">~3.0s (PoSA)</span>
        </div>

        <div className="rounded-lg bg-slate-100 dark:bg-gray-900 p-2 text-[10px] text-slate-500 dark:text-gray-400 truncate">
          RPC: https://testnetrpc.mstblockchain.com
        </div>
      </div>
    </Tile>
  );
}

/* ------------------------------------------------------------------ */
/*  9. Activity Tile: Real L2 Batched Transactions                     */
/* ------------------------------------------------------------------ */

function ActivityTile({
  activity = [],
  onOpenSendModal
}: {
  activity?: Web3Activity[];
  onOpenSendModal?: () => void;
}) {
  return (
    <Tile
      title={
        <div className="flex items-center justify-between w-full">
          <span>Recent L2 Batched Transactions</span>
          {onOpenSendModal && (
            <button
              onClick={onOpenSendModal}
              className="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
            >
              + Send
            </button>
          )}
        </div>
      }
      className="sm:col-span-2 lg:col-span-4"
    >
      {activity.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-500 dark:text-gray-400">
          No transactions submitted yet. Click <strong>"Submit L2 Tx"</strong> to test zero-gas off-chain signing!
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-gray-800">
          {activity.map(act => (
            <div key={act.id} className="py-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div
                  className={cx(
                    "size-7 rounded-lg flex items-center justify-center font-bold text-[11px]",
                    act.status === "confirmed"
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                      : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                  )}
                >
                  {act.status === "confirmed" ? "✓" : "⏳"}
                </div>
                <div>
                  <p className="font-semibold text-slate-800 dark:text-gray-200">{act.title}</p>
                  <p className="text-[11px] text-slate-500 dark:text-gray-400 font-mono">{act.detail}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-slate-900 dark:text-white block">{act.amount}</span>
                <span
                  className={cx(
                    "text-[10px] font-bold uppercase",
                    act.status === "confirmed" ? "text-emerald-600 dark:text-emerald-400" : "text-amber-500"
                  )}
                >
                  {act.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Tile>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Bento Grid Component                                         */
/* ------------------------------------------------------------------ */

export function Web3Bento({
  account = "bridgekey.mst",
  network = "MST Testnet (4545)",
  transactions = [],
  batches = [],
  analytics,
  health,
  onOpenSendModal,
  onSelectBatch,
  activity = [],
  accent = "#10b981",
  accent2 = "#8b5cf6",
  className
}: Web3BentoProps) {
  return (
    <div className={cx("w-full max-w-7xl mx-auto space-y-3", className)}>
      {/* Top Header Bar */}
      <nav className="flex flex-wrap items-center justify-between gap-3 px-1 py-1">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
            ProofPack Bento Control Center
          </span>
          <span className="rounded-full bg-slate-200 dark:bg-gray-800 px-2.5 py-0.5 text-[11px] font-mono text-slate-700 dark:text-gray-300">
            {network}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onOpenSendModal && (
            <button
              onClick={onOpenSendModal}
              className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/30 transition-colors shadow-sm"
            >
              <span>+ Send L2 Tx</span>
            </button>
          )}
          <span className="rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-950 px-3 py-1 font-mono text-xs font-bold">
            {account}
          </span>
        </div>
      </nav>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        <HeroTile
          account={account}
          network={network}
          totalTxs={analytics?.totalTransactionsSettled || transactions.length}
          savingsPercent={analytics?.gasSavingsPercentage || 91.2}
          accent={accent}
          accent2={accent2}
        />
        <BatchCardsTile batches={batches} onSelectBatch={onSelectBatch} />
        <GasTile accent={accent} />
        <ChartTile accent={accent} />
        <AllocationTile />
        <SettlementContractTile />
        <MempoolPipelineTile mempoolSize={health?.mempoolQueueSize || 0} />
        <MSTNodeHealthTile
          blockNumber={health?.mstRpc?.blockNumber}
          latencyMs={health?.mstRpc?.latencyMs}
        />
        <ActivityTile activity={activity} onOpenSendModal={onOpenSendModal} />
      </div>
    </div>
  );
}

export default Web3Bento;
