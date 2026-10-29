import React, { useState } from 'react';
import { Code2, Copy, Check, Terminal } from 'lucide-react';

export const DeveloperSdkPage: React.FC = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyCode = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const installCmd = 'npm install @proofpack/chain-adapters @proofpack/crypto viem';

  const submitExample = `import { BridgeKeyWalletAdapter, MSTClient } from '@proofpack/chain-adapters';
import { computeTransactionHash } from '@proofpack/crypto';

// 1. Initialize BridgeKey Wallet
const wallet = new BridgeKeyWalletAdapter({
  supportedChains: [91562037] // MST Coral Testnet
});
await wallet.connect();

// 2. Sign EIP-712 L2 Transfer
const transferPayload = {
  sender: wallet.getAddress(),
  to: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
  amount: '1000000000000000000', // 1.0 MSTC
  fee: '100000000000000',        // 0.0001 MSTC
  nonce: 0,
  validUntil: Math.floor(Date.now() / 1000) + 86400
};

const signature = await wallet.signTransfer(transferPayload);

// 3. Post to ProofPack API Mempool
const res = await fetch('http://localhost:4000/v1/transactions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ ...transferPayload, signature })
});
const { transaction } = await res.json();
console.log('Submitted L2 Tx ID:', transaction.txId);`;

  const verifyExample = `import { MerkleTree } from '@proofpack/crypto';

// Verify inclusion proof client-side
const isValid = MerkleTree.verify(
  leafHash,    // 32-byte leaf hash
  proofSiblings, // Sibling nodes array
  batchRoot,   // Merkle batch root
  leafIndex    // Position in batch
);
console.log('Proof mathematically valid:', isValid);`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-gray-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Code2 className="w-5 h-5 text-emerald-500" />
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              ProofPack TypeScript SDK & Integration
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-gray-400">
            Native BridgeKey wallet adapters, EIP-712 typed signing, and client-side proof validation
          </p>
        </div>
      </div>

      {/* Installation */}
      <div className="p-5 rounded-3xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-[#111827] shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-900 dark:text-white">Package Installation</span>
          <button
            onClick={() => copyCode(installCmd, 'install')}
            className="text-xs text-slate-400 hover:text-emerald-500 flex items-center gap-1 font-mono"
          >
            {copiedId === 'install' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copy</span>
          </button>
        </div>
        <pre className="p-3.5 rounded-xl bg-slate-900 text-emerald-400 font-mono text-xs overflow-x-auto">
          {installCmd}
        </pre>
      </div>

      {/* Code Snippet 1 */}
      <div className="p-5 rounded-3xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-[#111827] shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-900 dark:text-white">
            1. Submitting a Signed EIP-712 L2 Transfer
          </span>
          <button
            onClick={() => copyCode(submitExample, 'submit')}
            className="text-xs text-slate-400 hover:text-emerald-500 flex items-center gap-1 font-mono"
          >
            {copiedId === 'submit' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copy Code</span>
          </button>
        </div>
        <pre className="p-4 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] overflow-x-auto leading-relaxed">
          {submitExample}
        </pre>
      </div>

      {/* Code Snippet 2 */}
      <div className="p-5 rounded-3xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-[#111827] shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-900 dark:text-white">
            2. Verifying Merkle Inclusion Proofs Client-Side
          </span>
          <button
            onClick={() => copyCode(verifyExample, 'verify')}
            className="text-xs text-slate-400 hover:text-emerald-500 flex items-center gap-1 font-mono"
          >
            {copiedId === 'verify' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copy Code</span>
          </button>
        </div>
        <pre className="p-4 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] overflow-x-auto leading-relaxed">
          {verifyExample}
        </pre>
      </div>
    </div>
  );
};
