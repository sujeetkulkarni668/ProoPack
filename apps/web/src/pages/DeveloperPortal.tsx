import React, { useState } from 'react';
import { Terminal, Copy, Check, BookOpen } from 'lucide-react';
import { InteractiveLogsTable } from '../components/ui/interactive-logs-table';

export const DeveloperPortalPage: React.FC = () => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const curlExample = `curl -X POST http://localhost:4000/v1/transactions \\
  -H "Content-Type: application/json" \\
  -d '{
    "sender": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    "to": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    "amount": "100000000000000000",
    "fee": "10000000000000",
    "nonce": 0,
    "validUntil": 1793280000,
    "signature": "0x..."
  }'`;

  const tsExample = `import { BridgeKeyWalletAdapter } from '@proofpack/chain-adapters';

const adapter = new BridgeKeyWalletAdapter();
const { address } = await adapter.connect();

// Sign typed transfer via BridgeKey
const signature = await adapter.signTransfer({
  sender: address,
  to: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
  amount: "100000000000000000",
  fee: "10000000000000",
  nonce: 0,
  validUntil: Math.floor(Date.now() / 1000) + 86400
}, 4545, "0x1111111111111111111111111111111111111111");`;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Terminal className="w-5 h-5 text-emerald-400" />
          <span>Developer Portal & SDK Reference</span>
        </h1>
        <p className="text-xs text-gray-400 mt-0.5">
          Integrate ProofPack L2 aggregation into your dApp, automated bots, or backend services
        </p>
      </div>

      {/* Code Snippets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* cURL */}
        <div className="p-5 rounded-2xl bg-[#111827]/90 border border-gray-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-200 font-mono">
              POST /v1/transactions
            </span>
            <button
              onClick={() => copyToClipboard(curlExample, 'curl')}
              className="text-xs text-gray-400 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              {copiedSection === 'curl' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <pre className="p-3.5 rounded-lg bg-black/60 font-mono text-[11px] text-gray-300 overflow-x-auto leading-relaxed border border-gray-800">
            {curlExample}
          </pre>
        </div>

        {/* TypeScript */}
        <div className="p-5 rounded-2xl bg-[#111827]/90 border border-gray-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-200 font-mono">
              TypeScript / BridgeKey SDK
            </span>
            <button
              onClick={() => copyToClipboard(tsExample, 'ts')}
              className="text-xs text-gray-400 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              {copiedSection === 'ts' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <pre className="p-3.5 rounded-lg bg-black/60 font-mono text-[11px] text-gray-300 overflow-x-auto leading-relaxed border border-gray-800">
            {tsExample}
          </pre>
        </div>
      </div>

      {/* Interactive Logs Table Component (moumensoliman/interactive-logs-table-shadcnui) */}
      <InteractiveLogsTable />

      {/* Standard API Endpoints Table */}
      <div className="p-6 rounded-2xl bg-[#111827]/90 border border-gray-800 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-cyan-400" />
          <span>Core REST API Endpoints</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0b1021] text-gray-400 font-semibold border-b border-gray-800">
              <tr>
                <th className="p-3">Method</th>
                <th className="p-3">Path</th>
                <th className="p-3">Description</th>
                <th className="p-3">Auth / Scope</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 font-mono">
              <tr>
                <td className="p-3 text-emerald-400 font-bold">GET</td>
                <td className="p-3 text-white">/health</td>
                <td className="p-3 font-sans text-gray-300">System health, queue depth & MST RPC latency</td>
                <td className="p-3 text-gray-500 font-sans">Public</td>
              </tr>
              <tr>
                <td className="p-3 text-emerald-400 font-bold">GET</td>
                <td className="p-3 text-white">/config</td>
                <td className="p-3 font-sans text-gray-300">Target chain ID, protocol magic & contracts</td>
                <td className="p-3 text-gray-500 font-sans">Public</td>
              </tr>
              <tr>
                <td className="p-3 text-cyan-400 font-bold">POST</td>
                <td className="p-3 text-white">/v1/transactions</td>
                <td className="p-3 font-sans text-gray-300">Submit an authorized EIP-712 transaction</td>
                <td className="p-3 text-gray-500 font-sans">Signed EIP-712</td>
              </tr>
              <tr>
                <td className="p-3 text-emerald-400 font-bold">GET</td>
                <td className="p-3 text-white">/v1/transactions/:txId</td>
                <td className="p-3 font-sans text-gray-300">Get transaction status and batch inclusion</td>
                <td className="p-3 text-gray-500 font-sans">Public</td>
              </tr>
              <tr>
                <td className="p-3 text-emerald-400 font-bold">GET</td>
                <td className="p-3 text-white">/v1/batches/:batchId</td>
                <td className="p-3 font-sans text-gray-300">Inspect batch Merkle root & compressed calldata</td>
                <td className="p-3 text-gray-500 font-sans">Public</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
