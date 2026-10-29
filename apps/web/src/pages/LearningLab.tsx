import React, { useState } from 'react';
import {
  GraduationCap,
  Zap,
  TrendingDown,
  Layers,
  ShieldCheck,
  Cpu,
  Key,
  Boxes,
  Database,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  HelpCircle,
  Copy,
  Check
} from 'lucide-react';

export const LearningLab: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [simBatchSize, setSimBatchSize] = useState<number>(64);
  const [hasSimulatedSign, setHasSimulatedSign] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Calculations for interactive slider
  const directL1GasPerTx = 29000;
  const l2BaseGas = 21000;
  const l2CalldataGasPerTx = 24 * 16; // 24 bytes * 16 gas
  const l2ContractOverhead = 45000;
  const totalL2Gas = l2BaseGas + l2ContractOverhead + (l2CalldataGasPerTx * simBatchSize);
  const l2GasPerTx = Math.round(totalL2Gas / simBatchSize);
  const totalL1Gas = directL1GasPerTx * simBatchSize;
  const savingsPct = (((totalL1Gas - totalL2Gas) / totalL1Gas) * 100).toFixed(1);
  const treeDepth = Math.ceil(Math.log2(simBatchSize));

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const steps = [
    {
      num: 1,
      title: "1. Off-Chain Signature (Zero Gas)",
      icon: Key,
      desc: "User signs typed data using BridgeKey wallet without sending an on-chain transaction."
    },
    {
      num: 2,
      title: "2. L2 Mempool & Sequencer",
      icon: Cpu,
      desc: "Transactions gather off-chain and are strictly ordered by sequential nonces."
    },
    {
      num: 3,
      title: "3. Varint & Dict Compression",
      icon: Database,
      desc: "Payload shrinks by ~85% using variable-length integers and address dictionary indices."
    },
    {
      num: 4,
      title: "4. Cryptographic Merkle Tree",
      icon: Boxes,
      desc: "Keccak-256 hashes bind all transactions into a single 32-byte deterministic root."
    },
    {
      num: 5,
      title: "5. MST Blockchain Settlement",
      icon: ShieldCheck,
      desc: "The batch commits to ProofPackSettlement.sol on MST L1, amortizing gas across all users."
    }
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="rounded-3xl border border-slate-200 dark:border-gray-800 bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-indigo-500/10 p-6 sm:p-8 backdrop-blur">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30">
              <GraduationCap className="size-4" /> Blockchain Learner Lab
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Understanding Layer 2 Rollups on MST Blockchain
            </h1>
            <p className="text-sm text-slate-600 dark:text-gray-300 leading-relaxed">
              New to Layer 2 and transaction optimization? This interactive guide takes you step-by-step through how ProofPack turns expensive, congested MST L1 transactions into fast, micro-cost, zero-gas signatures with <strong>up to 92.9% gas savings</strong>.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-[#111827] p-5 shrink-0 shadow-sm">
            <span className="text-xs text-slate-500 dark:text-gray-400 font-semibold block">Quick Metric</span>
            <span className="font-mono text-3xl font-black text-emerald-600 dark:text-emerald-400 block mt-1">
              {savingsPct}%
            </span>
            <span className="text-[11px] text-slate-500 dark:text-gray-400">Gas Saved at {simBatchSize} txs</span>
          </div>
        </div>
      </div>

      {/* Step Navigation Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
        {steps.map(s => {
          const Icon = s.icon;
          const isActive = activeStep === s.num;
          return (
            <button
              key={s.num}
              onClick={() => setActiveStep(s.num)}
              className={`p-3.5 rounded-2xl border text-left transition-all ${
                isActive
                  ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 shadow-sm'
                  : 'border-slate-200 dark:border-gray-800 bg-white dark:bg-[#111827] text-slate-600 dark:text-gray-400 hover:border-slate-300 dark:hover:border-gray-700'
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <Icon className={`size-4 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                <span className="text-xs font-bold font-mono">Step {s.num}</span>
              </div>
              <p className="text-xs font-semibold text-slate-900 dark:text-gray-200 truncate">{s.title.split('. ')[1]}</p>
            </button>
          );
        })}
      </div>

      {/* Step Content Container */}
      <div className="rounded-3xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-[#111827] p-6 sm:p-8 shadow-sm">
        {/* Step 1 */}
        {activeStep === 1 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-gray-800 pb-4">
              <div className="size-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Step 1: Off-Chain EIP-712 Signing (Why You Pay Zero Gas)
                </h2>
                <p className="text-xs text-slate-500 dark:text-gray-400">
                  Standard Ethereum / MST transfers require paying gas just to submit. In Layer 2, you sign off-chain instead.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">How It Works:</h3>
                <ul className="space-y-2.5 text-xs text-slate-600 dark:text-gray-300 leading-relaxed">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>EIP-712 Typed Data:</strong> You authorize a transfer by signing a structured message: sender, recipient, amount of MSTC, and nonce.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>Cryptographic ECDSA:</strong> Your private key signs the hash of this message producing <code className="font-mono text-emerald-600 dark:text-emerald-400">(v, r, s)</code>.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>Zero Gas Cost:</strong> Signing happens locally inside your browser / BridgeKey wallet. No node executes anything, so you pay <strong>0 MSTC</strong>!</span>
                  </li>
                </ul>

                <div className="pt-2">
                  <button
                    onClick={() => setHasSimulatedSign(true)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
                  >
                    <Key className="size-3.5" />
                    <span>Simulate Off-Chain EIP-712 Sign</span>
                  </button>
                </div>
              </div>

              {/* Live Payload Visualizer */}
              <div className="rounded-2xl border border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-900/90 p-4 font-mono text-xs">
                <div className="flex items-center justify-between text-slate-500 dark:text-gray-400 pb-2 border-b border-slate-200 dark:border-gray-800 mb-2">
                  <span>EIP-712 Structured Payload</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400">Gas: 0 MSTC</span>
                </div>
                <pre className="text-[11px] text-slate-800 dark:text-gray-300 overflow-x-auto leading-relaxed">
{`{
  "types": {
    "Transfer": [
      { "name": "from", "type": "address" },
      { "name": "to", "type": "address" },
      { "name": "amount", "type": "uint256" },
      { "name": "nonce", "type": "uint256" }
    ]
  },
  "domain": {
    "name": "ProofPack L2",
    "version": "1",
    "chainId": 91562037
  },
  "message": {
    "from": "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    "to": "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    "amount": "1000000000000000000",
    "nonce": 0
  }
}`}
                </pre>
                {hasSimulatedSign && (
                  <div className="mt-3 p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-[11px] animate-in fade-in">
                    ✓ <strong>Signed Signature:</strong> 0x7fa289...31c9 (ECDSA r,s,v valid)
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {activeStep === 2 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-gray-800 pb-4">
              <div className="size-10 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Step 2: L2 Mempool & Sequencer Ordering
                </h2>
                <p className="text-xs text-slate-500 dark:text-gray-400">
                  Transactions from hundreds of users arrive at ProofPack's mempool to be ordered and batched.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4 text-xs text-slate-600 dark:text-gray-300 leading-relaxed">
                <p>
                  <strong>What is a Mempool?</strong> A mempool (memory pool) is a temporary staging area where valid signed transactions wait until an operator packages them into a batch.
                </p>
                <div className="rounded-xl border border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-900/60 p-3.5 space-y-2">
                  <span className="font-bold text-slate-900 dark:text-white block">Sequential Nonce Protection:</span>
                  <p>
                    Every account has an incrementing counter (<code className="font-mono text-emerald-600 dark:text-emerald-400">nonce: 0, 1, 2...</code>).
                    If an attacker tries to resend an old transaction, ProofPack rejects it because that nonce has already been settled.
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-900/60 p-3.5 space-y-2">
                  <span className="font-bold text-slate-900 dark:text-white block">Batch Trigger Rules:</span>
                  <p>
                    The Batcher triggers settlement as soon as:
                    <br />• <strong>64 transactions</strong> accumulate (Threshold Flush), OR
                    <br />• <strong>3,000 milliseconds</strong> elapse without new transactions (Time Flush).
                  </p>
                </div>
              </div>

              {/* Visual Queue Graphic */}
              <div className="space-y-2.5">
                <span className="text-xs font-semibold text-slate-500 dark:text-gray-400">Incoming Mempool Queue:</span>
                {[
                  { id: "tx_01", from: "0x90F7...b906", nonce: 0, val: "0.5 MSTC", state: "Ready" },
                  { id: "tx_02", from: "0x3C44...93BC", nonce: 1, val: "1.2 MSTC", state: "Ready" },
                  { id: "tx_03", from: "0x15d3...6a55", nonce: 4, val: "0.1 MSTC", state: "Ready" }
                ].map(q => (
                  <div key={q.id} className="p-3 rounded-xl border border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-900 flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="font-bold text-slate-800 dark:text-gray-200">{q.from}</span>
                    </div>
                    <span className="text-slate-500">Nonce {q.nonce}</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{q.val}</span>
                    <span className="rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 text-[10px] font-bold font-sans">
                      {q.state}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {activeStep === 3 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-gray-800 pb-4">
              <div className="size-10 rounded-xl bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Step 3: Binary Varint & Address Dictionary Compression
                </h2>
                <p className="text-xs text-slate-500 dark:text-gray-400">
                  On Ethereum/MST L1, every non-zero byte costs 16 gas. Compressing bytes directly slashes L1 costs.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4 text-xs text-slate-600 dark:text-gray-300 leading-relaxed">
                <div className="rounded-2xl border border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-900/60 p-4 space-y-2">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">Technique A: Variable-Length Varint (LEB128)</h4>
                  <p>
                    Standard EVM stores integers as <strong>32 bytes (256 bits)</strong> even if the number is just <code className="font-mono text-emerald-500">5</code>:
                  </p>
                  <div className="p-2 rounded bg-slate-200 dark:bg-gray-950 font-mono text-[10px] text-rose-500 break-all">
                    0000000000000000000000000000000000000000000000000000000000000005 (32 bytes!)
                  </div>
                  <p>
                    ProofPack's Varint encoder strips all leading zeros, encoding <code className="font-mono text-emerald-500">5</code> in exactly <strong>1 single byte</strong>: <code className="font-mono text-emerald-500">[0x05]</code>!
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-900/60 p-4 space-y-2">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">Technique B: Address Dictionary Deduplication</h4>
                  <p>
                    A standard blockchain address is <strong>20 bytes</strong>. In a batch of 64 transactions, addresses frequently repeat.
                    ProofPack builds an in-batch dictionary: the first time an address appears, it is assigned an index (<code className="font-mono text-emerald-500">0, 1, 2...</code>).
                    Subsequent references only need <strong>1 byte</strong> instead of 20 bytes!
                  </p>
                </div>
              </div>

              {/* Side-by-side comparison */}
              <div className="rounded-2xl border border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-900/90 p-5 font-mono text-xs space-y-4">
                <h4 className="font-bold text-slate-900 dark:text-white font-sans text-sm">Byte Size Comparison:</h4>

                <div className="space-y-1">
                  <div className="flex justify-between text-slate-500 text-[11px]">
                    <span>Raw Uncompressed Transaction</span>
                    <span className="text-rose-500 font-bold">160 Bytes (~2,560 gas)</span>
                  </div>
                  <div className="h-4 w-full rounded-full bg-rose-500/20 overflow-hidden">
                    <div className="h-full bg-rose-500 w-full" />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-slate-500 text-[11px]">
                    <span>ProofPack Compressed Binary</span>
                    <span className="text-emerald-500 font-bold">24 Bytes (~384 gas)</span>
                  </div>
                  <div className="h-4 w-full rounded-full bg-emerald-500/20 overflow-hidden">
                    <div className="h-full bg-emerald-500 w-[15%]" />
                  </div>
                </div>

                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/15 p-3 text-emerald-700 dark:text-emerald-300 text-xs font-sans">
                  ✨ <strong>85% Calldata Reduction!</strong> Less data published to MST L1 means dramatically lower fees for all participants.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4 */}
        {activeStep === 4 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-gray-800 pb-4">
              <div className="size-10 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                4
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Step 4: Cryptographic Keccak-256 Merkle Trees
                </h2>
                <p className="text-xs text-slate-500 dark:text-gray-400">
                  How can a smart contract verify 64 transactions with only a single 32-byte hash?
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4 text-xs text-slate-600 dark:text-gray-300 leading-relaxed">
                <p>
                  A <strong>Merkle Tree</strong> is a binary cryptographic structure where every leaf node is a hash of a transaction, and every non-leaf node is the Keccak-256 hash of its two children.
                </p>
                <div className="rounded-xl border border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-900/60 p-3.5 space-y-2">
                  <span className="font-bold text-slate-900 dark:text-white block">The Merkle Root:</span>
                  <p>
                    At the top of the tree sits the single 32-byte <strong>Merkle Root</strong>. If even 1 bit of any transaction in the entire batch changes, the Merkle root changes completely!
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-900/60 p-3.5 space-y-2">
                  <span className="font-bold text-slate-900 dark:text-white block">Logarithmic Inclusion Proofs:</span>
                  <p>
                    To prove transaction #3 is included in a batch of 64 transactions, you do NOT need to reveal all 64 transactions. You only need <strong>6 sibling hashes</strong> (<code className="font-mono text-emerald-500">log2(64) = 6</code>).
                  </p>
                </div>
              </div>

              {/* Visual Merkle Tree Graphic */}
              <div className="rounded-2xl border border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-900/90 p-5 text-center font-mono text-xs">
                <span className="text-xs font-semibold text-slate-500 dark:text-gray-400 block mb-3 font-sans">
                  Interactive Merkle Tree Hierarchy (4 Txs Example):
                </span>

                {/* Root */}
                <div className="inline-block p-2 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-700 dark:text-purple-300 font-bold mb-2">
                  Merkle Root R (32 bytes)
                </div>

                <div className="text-slate-400 text-sm">│ &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; │</div>

                {/* Level 1 */}
                <div className="flex justify-around mb-2">
                  <div className="p-1.5 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-700 dark:text-indigo-300 text-[11px]">
                    H01 = Keccak(H0, H1)
                  </div>
                  <div className="p-1.5 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-700 dark:text-indigo-300 text-[11px]">
                    H23 = Keccak(H2, H3)
                  </div>
                </div>

                <div className="flex justify-around text-slate-400 text-xs">
                  <span>┌──┴──┐</span>
                  <span>┌──┴──┐</span>
                </div>

                {/* Leaves */}
                <div className="grid grid-cols-4 gap-1.5 mt-1 font-mono text-[10px]">
                  <div className="p-1.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                    Tx 0
                  </div>
                  <div className="p-1.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                    Tx 1
                  </div>
                  <div className="p-1.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                    Tx 2
                  </div>
                  <div className="p-1.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                    Tx 3
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 5 */}
        {activeStep === 5 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-gray-800 pb-4">
              <div className="size-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                5
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Step 5: On-Chain Settlement on MST Blockchain
                </h2>
                <p className="text-xs text-slate-500 dark:text-gray-400">
                  The operator executes one single L1 transaction on MST Blockchain to commit the batch.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4 text-xs text-slate-600 dark:text-gray-300 leading-relaxed">
                <p>
                  Instead of 64 separate transactions hitting the MST Blockchain, the ProofPack operator invokes:
                </p>
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-gray-900 font-mono text-[11px] text-emerald-600 dark:text-emerald-400 border border-slate-200 dark:border-gray-800 overflow-x-auto">
                  settlement.commitBatch(sequenceNumber, txCount, batchRoot, stateCommitment, compressedCalldata);
                </div>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>1 Base Fee:</strong> The 21,000 gas base transaction cost is paid once, dividing the burden by 64.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>Data Availability:</strong> The compressed calldata is published on-chain, allowing anyone to reconstruct the L2 state.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>Verifiable Proofs:</strong> Users can query <code className="font-mono text-emerald-500">verifyTransactionProof</code> on-chain anytime to prove payment.</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-2xl border border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-900/90 p-5 space-y-4 font-mono text-xs">
                <h4 className="font-bold text-slate-900 dark:text-white font-sans text-sm">Gas Settlement Math (64 Txs):</h4>
                <div className="flex justify-between py-1 border-b border-slate-200 dark:border-gray-800">
                  <span className="text-slate-500">Direct L1 Cost (64 × 29,000):</span>
                  <span className="text-rose-500 font-bold">1,856,000 gas</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200 dark:border-gray-800">
                  <span className="text-slate-500">ProofPack L2 Cost (1 Batch):</span>
                  <span className="text-emerald-500 font-bold">163,520 gas</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200 dark:border-gray-800">
                  <span className="text-slate-500">Effective Gas per User:</span>
                  <span className="text-emerald-500 font-bold">2,555 gas / tx</span>
                </div>
                <div className="pt-2 text-right">
                  <span className="text-base font-black text-emerald-600 dark:text-emerald-400 font-sans">
                    ⚡ 91.19% Gas Savings
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step Forward / Backward Controls */}
        <div className="mt-8 pt-4 border-t border-slate-200 dark:border-gray-800 flex items-center justify-between">
          <button
            onClick={() => setActiveStep(prev => Math.max(1, prev - 1))}
            disabled={activeStep === 1}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-gray-800 text-xs font-semibold disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors"
          >
            ← Previous Step
          </button>
          <span className="text-xs font-mono text-slate-400">Step {activeStep} of 5</span>
          <button
            onClick={() => setActiveStep(prev => Math.min(5, prev + 1))}
            disabled={activeStep === 5}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold disabled:opacity-40 transition-colors flex items-center gap-1.5"
          >
            <span>Next Step</span>
            <ChevronRight className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Interactive Sandbox & Gas Slider */}
      <div className="rounded-3xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-[#111827] p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="size-5 text-amber-500" />
            Interactive Batch Sizing & Gas Savings Sandbox
          </h2>
          <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
            Drag the slider to see how batch size dynamically affects L1 amortized gas, compression metrics, and Merkle tree depth.
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-600 dark:text-gray-400 font-sans">Batch Size (Transactions):</span>
            <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">{simBatchSize} Txs</span>
          </div>
          <input
            type="range"
            min={4}
            max={128}
            step={4}
            value={simBatchSize}
            onChange={e => setSimBatchSize(Number(e.target.value))}
            className="w-full accent-emerald-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-400">
            <span>4 txs</span>
            <span>16 txs</span>
            <span>32 txs</span>
            <span>64 txs</span>
            <span>128 txs</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-900 text-center">
            <span className="text-[11px] text-slate-500 dark:text-gray-400 block">Amortized Gas / Tx</span>
            <span className="font-mono text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
              {l2GasPerTx.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400">vs 29,000 L1 direct</span>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-900 text-center">
            <span className="text-[11px] text-slate-500 dark:text-gray-400 block">Total Gas Saved</span>
            <span className="font-mono text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
              {savingsPct}%
            </span>
            <span className="text-[10px] text-slate-400">Cost reduction</span>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-900 text-center">
            <span className="text-[11px] text-slate-500 dark:text-gray-400 block">Merkle Tree Depth</span>
            <span className="font-mono text-xl sm:text-2xl font-black text-purple-600 dark:text-purple-400 mt-1 block">
              {treeDepth} levels
            </span>
            <span className="text-[10px] text-slate-400">log2({simBatchSize})</span>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-900 text-center">
            <span className="text-[11px] text-slate-500 dark:text-gray-400 block">Total Batch Calldata</span>
            <span className="font-mono text-xl sm:text-2xl font-black text-cyan-600 dark:text-cyan-400 mt-1 block">
              {(simBatchSize * 24).toLocaleString()} B
            </span>
            <span className="text-[10px] text-slate-400">Compressed size</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningLab;
