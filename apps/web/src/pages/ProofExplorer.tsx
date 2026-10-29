import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  RotateCw,
  Search,
  ExternalLink,
  Copy,
  Check,
  Play,
  Layers,
  Info
} from 'lucide-react';
import { ProofRecord } from '../types';
import { fetchProofs, verifyProof } from '../services/api';

export const ProofExplorerPage: React.FC = () => {
  const [proofs, setProofs] = useState<ProofRecord[]>([]);
  const [selectedProof, setSelectedProof] = useState<ProofRecord | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [testResult, setTestResult] = useState<{
    verified: boolean;
    durationMs: number;
  } | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const loadProofs = async () => {
    setIsLoading(true);
    try {
      const res = await fetchProofs();
      setProofs(res.proofs);
      if (res.proofs.length > 0) {
        setSelectedProof(res.proofs[0]);
      }
    } catch (err) {
      console.error('Failed to load proofs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProofs();
  }, []);

  const handleVerifyInRealTime = async (proof: ProofRecord) => {
    setIsVerifying(true);
    setTestResult(null);
    try {
      const res = await verifyProof({
        leaf: proof.leafHash,
        proof: proof.proofSiblings,
        root: proof.batchRoot,
        index: proof.txIndex
      });
      setTestResult({
        verified: res.verified,
        durationMs: res.verificationDurationMs
      });
    } catch {
      setTestResult({
        verified: false,
        durationMs: 0
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-gray-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Cryptographic Proof Explorer & Merkle Verifier
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-gray-400">
            Audit deterministic Merkle inclusion proofs, sibling paths, and state commitments settled on MST EVM
          </p>
        </div>

        <button
          onClick={loadProofs}
          className="p-2 rounded-xl border border-slate-200 dark:border-gray-800 bg-slate-100 dark:bg-gray-900 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors self-start sm:self-auto"
        >
          <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-500' : ''}`} />
        </button>
      </div>

      {/* Protocol Transparency Callout */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-cyan-500/10 border border-emerald-500/20 text-xs text-slate-700 dark:text-gray-300">
        <div className="flex items-start gap-2.5">
          <Info className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-slate-900 dark:text-white">
              Cryptographic Verification Architecture
            </p>
            <p className="text-[11px] text-slate-600 dark:text-gray-400 leading-relaxed">
              ProofPack implements deterministic <strong className="text-slate-800 dark:text-gray-200">Keccak256 Merkle Inclusion Proofs</strong> and sequential nonce batch commitments verified by the <code className="text-emerald-600 dark:text-emerald-400 font-mono">ProofPackSettlement.sol</code> smart contract on MST Blockchain. Every leaf hash mathematically binds transaction ID, sender, recipient, amount, and nonce.
            </p>
          </div>
        </div>
      </div>

      {/* Proof Listing & Interactive Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Proof List */}
        <div className="lg:col-span-1 rounded-3xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-[#111827] p-4 shadow-sm space-y-2 max-h-[600px] overflow-y-auto">
          <div className="text-xs font-bold text-slate-900 dark:text-white px-2 py-1">
            Verified Inclusion Proofs ({proofs.length})
          </div>

          {proofs.map(p => {
            const isSelected = selectedProof?.proofId === p.proofId;
            return (
              <div
                key={p.proofId}
                onClick={() => {
                  setSelectedProof(p);
                  setTestResult(null);
                }}
                className={`p-3 rounded-2xl border text-xs cursor-pointer transition-all ${
                  isSelected
                    ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-950 dark:text-white shadow-sm'
                    : 'border-slate-100 dark:border-gray-800/80 bg-slate-50/50 dark:bg-gray-800/20 hover:bg-slate-100 dark:hover:bg-gray-800/60'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    Batch #{p.batchId} · Leaf #{p.txIndex}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Verified</span>
                  </span>
                </div>
                <div className="font-mono text-[11px] text-slate-500 dark:text-gray-400 truncate">
                  Tx: {p.txId.slice(0, 14)}...
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Siblings: {p.proofSiblings.length} nodes · Latency: {p.verificationDurationMs}ms
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Selected Proof Inspector */}
        <div className="lg:col-span-2 rounded-3xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-[#111827] p-6 shadow-sm space-y-5">
          {selectedProof ? (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-gray-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      Proof: {selectedProof.proofId}
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                      {selectedProof.proofType}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-gray-400 font-mono mt-0.5">
                    Associated Batch #{selectedProof.batchId} (Leaf Position #{selectedProof.txIndex})
                  </p>
                </div>

                {/* Real-time verification button */}
                <button
                  onClick={() => handleVerifyInRealTime(selectedProof)}
                  disabled={isVerifying}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-gray-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center gap-2 self-start sm:self-auto disabled:opacity-50"
                >
                  <Play className={`w-3.5 h-3.5 fill-current ${isVerifying ? 'animate-spin' : ''}`} />
                  <span>{isVerifying ? 'Hashing Proof...' : 'Test Verification In Real-Time'}</span>
                </button>
              </div>

              {/* Real-time test output */}
              {testResult && (
                <div
                  className={`p-4 rounded-2xl border text-xs flex items-center justify-between ${
                    testResult.verified
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500/30 text-emerald-900 dark:text-emerald-300'
                      : 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-500/30 text-rose-900 dark:text-rose-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {testResult.verified ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                    )}
                    <div>
                      <div className="font-bold">
                        {testResult.verified
                          ? 'Merkle Proof Cryptographically Validated!'
                          : 'Verification Failed: Hash Mismatch'}
                      </div>
                      <div className="text-[11px] opacity-80">
                        Computed pair hashes against root {selectedProof.batchRoot.slice(0, 10)}... in{' '}
                        {testResult.durationMs}ms
                      </div>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-xs uppercase px-2 py-1 rounded bg-current/10">
                    {testResult.verified ? 'PASSED' : 'REJECTED'}
                  </span>
                </div>
              )}

              {/* Public Inputs Grid */}
              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-gray-800/40 border border-slate-200 dark:border-gray-800">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Leaf Hash (H_leaf)
                    </span>
                    <button
                      onClick={() => copyToClipboard(selectedProof.leafHash, 'leaf')}
                      className="text-slate-400 hover:text-emerald-500 flex items-center gap-1 text-[10px]"
                    >
                      {copiedId === 'leaf' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      <span>Copy</span>
                    </button>
                  </div>
                  <div className="font-mono text-slate-900 dark:text-white break-all font-semibold">
                    {selectedProof.leafHash}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-gray-800/40 border border-slate-200 dark:border-gray-800">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Batch Merkle Root (R_batch)
                    </span>
                    <button
                      onClick={() => copyToClipboard(selectedProof.batchRoot, 'root')}
                      className="text-slate-400 hover:text-emerald-500 flex items-center gap-1 text-[10px]"
                    >
                      {copiedId === 'root' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      <span>Copy</span>
                    </button>
                  </div>
                  <div className="font-mono text-emerald-600 dark:text-emerald-400 break-all font-bold">
                    {selectedProof.batchRoot}
                  </div>
                </div>

                {/* Sibling Path Nodes */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-gray-800/40 border border-slate-200 dark:border-gray-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    Proof Siblings Path ({selectedProof.proofSiblings.length} nodes)
                  </span>
                  <div className="space-y-1.5 font-mono text-[11px]">
                    {selectedProof.proofSiblings.map((sibling, i) => (
                      <div
                        key={i}
                        className="p-2 rounded-xl bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 flex items-center justify-between"
                      >
                        <span className="text-slate-400 text-[10px]">Level {i}:</span>
                        <span className="text-slate-700 dark:text-gray-300 truncate max-w-sm">
                          {sibling}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Verifier Contract Reference */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-gray-800/40 border border-slate-200 dark:border-gray-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Verifier Contract on MST
                    </span>
                    <span className="font-mono text-xs font-semibold text-slate-900 dark:text-white">
                      {selectedProof.verifierContract}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-cyan-500/20 text-cyan-700 dark:text-cyan-400">
                    EVM Solc 0.8.24
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">
              Select a proof from the left list to inspect siblings and verify.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
