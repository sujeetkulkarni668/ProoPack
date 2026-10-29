import React, { useState } from 'react';
import { BookOpen, Copy, Check, Terminal, ExternalLink } from 'lucide-react';

export const DeveloperDocsPage: React.FC = () => {
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);

  const copyCode = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(id);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  const endpoints = [
    {
      method: 'GET',
      path: '/v1/network/stats',
      desc: 'Retrieve real-time network statistics, TPS, and compression ratio',
      response: `{
  "totalTransactions": 15,
  "tps": { "current": 12.4, "average": 8.6, "peak": 48.2 },
  "batches": { "total": 4, "settled": 4, "queued": 0, "failed": 0 },
  "proofSuccessRate": 100,
  "compression": { "ratio": 2.86, "sizeReductionPct": 65.1 }
}`
    },
    {
      method: 'POST',
      path: '/v1/transactions',
      desc: 'Submit a cryptographically signed EIP-712 Layer 2 transfer',
      body: `{
  "sender": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
  "to": "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
  "amount": "500000000000000000",
  "fee": "100000000000000",
  "nonce": 0,
  "validUntil": 1793331354,
  "signature": "0x..."
}`,
      response: `{
  "success": true,
  "transaction": {
    "txId": "0x9774fe58c5c87487c8334671296f0a6901c20ade9664aed03e8539abc79f736b",
    "status": "QUEUED"
  }
}`
    },
    {
      method: 'GET',
      path: '/v1/batches/:batchId',
      desc: 'Fetch full batch metadata, Merkle root, and binary encoded payload',
      response: `{
  "batch": {
    "batchId": 1,
    "txCount": 4,
    "batchRoot": "0x3e18a2d1f95304...",
    "compressedBytes": 118,
    "uncompressedBytes": 420,
    "status": "SETTLED",
    "l1TxHash": "0xmock..."
  }
}`
    },
    {
      method: 'POST',
      path: '/v1/proofs/verify',
      desc: 'Verify a 32-byte leaf hash against a batch Merkle root in real-time',
      body: `{
  "leaf": "0x8912e7...",
  "proof": ["0xabc...", "0xdef..."],
  "root": "0x3e18a2d1f9...",
  "index": 0
}`,
      response: `{
  "verified": true,
  "verificationDurationMs": 0.8
}`
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-gray-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-5 h-5 text-emerald-500" />
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              REST API Reference & Endpoints
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-gray-400">
            Base URL: <code className="text-emerald-600 dark:text-emerald-400 font-mono">http://localhost:4000</code> · Targeting MST Chain ID: 91562037
          </p>
        </div>
      </div>

      {/* Endpoints List */}
      <div className="space-y-4">
        {endpoints.map((ep, i) => (
          <div
            key={i}
            className="p-5 rounded-3xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-[#111827] shadow-sm space-y-3"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 font-mono text-xs">
                <span
                  className={`px-2 py-0.5 rounded font-bold uppercase ${
                    ep.method === 'GET'
                      ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                      : 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-400'
                  }`}
                >
                  {ep.method}
                </span>
                <span className="font-bold text-slate-900 dark:text-white">{ep.path}</span>
              </div>

              <button
                onClick={() => copyCode(`curl -X ${ep.method} http://localhost:4000${ep.path}`, `curl-${i}`)}
                className="text-xs text-slate-400 hover:text-emerald-500 flex items-center gap-1 font-mono"
              >
                {copiedEndpoint === `curl-${i}` ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy cURL</span>
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-gray-400">{ep.desc}</p>

            {ep.body && (
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Request Payload (JSON)
                </span>
                <pre className="p-3 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] overflow-x-auto">
                  {ep.body}
                </pre>
              </div>
            )}

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Response Example (200 OK)
              </span>
              <pre className="p-3 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] overflow-x-auto">
                {ep.response}
              </pre>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
