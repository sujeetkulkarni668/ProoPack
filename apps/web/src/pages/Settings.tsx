import React, { useState } from 'react';
import { Settings, Save, Shield, Sliders } from 'lucide-react';

interface SettingsProps {
  onSwitchChain: (chainId: number) => Promise<void>;
  currentChainId: number | null;
}

export const SettingsPage: React.FC<SettingsProps> = ({ onSwitchChain, currentChainId }) => {
  const [maxBatchSize, setMaxBatchSize] = useState(64);
  const [maxWaitMs, setMaxWaitMs] = useState(5000);
  const [selectedChain, setSelectedChain] = useState(currentChainId || 4545);
  const [saved, setSaved] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedChain !== currentChainId) {
      await onSwitchChain(selectedChain);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-gray-400" />
          <span>Protocol Configuration & Settings</span>
        </h1>
        <p className="text-xs text-gray-400 mt-0.5">
          Configure active network targets, sequencer parameters, and operator preferences
        </p>
      </div>

      <form onSubmit={handleSave} className="p-6 rounded-2xl bg-mst-card border border-mst-border space-y-5">
        {saved && (
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
            Settings updated successfully!
          </div>
        )}

        {/* Network Target */}
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1.5">
            Target Blockchain Network
          </label>
          <select
            value={selectedChain}
            onChange={e => setSelectedChain(parseInt(e.target.value, 10))}
            className="w-full px-3.5 py-2.5 rounded-lg bg-gray-900 border border-mst-border text-xs text-white focus:outline-none focus:border-brand-500"
          >
            <option value={4545}>MST Testnet (Chain ID 4545, tMSTC)</option>
            <option value={4646}>MST Mainnet (Chain ID 4646, MSTC)</option>
            <option value={31337}>ProofPack Local Devnet (Chain ID 31337)</option>
          </select>
        </div>

        {/* Max Batch Size */}
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1.5">
            Maximum Batch Size (Transactions per Batch)
          </label>
          <input
            type="number"
            min={2}
            max={128}
            value={maxBatchSize}
            onChange={e => setMaxBatchSize(parseInt(e.target.value, 10))}
            className="w-full px-3.5 py-2.5 rounded-lg bg-gray-900 border border-mst-border text-xs font-mono text-white focus:outline-none focus:border-brand-500"
          />
          <p className="text-[11px] text-gray-400 mt-1">Recommended: 64 operations for optimal gas amortization.</p>
        </div>

        {/* Max Wait Time */}
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1.5">
            Maximum Batch Wait Time (Milliseconds)
          </label>
          <input
            type="number"
            min={500}
            max={30000}
            step={500}
            value={maxWaitMs}
            onChange={e => setMaxWaitMs(parseInt(e.target.value, 10))}
            className="w-full px-3.5 py-2.5 rounded-lg bg-gray-900 border border-mst-border text-xs font-mono text-white focus:outline-none focus:border-brand-500"
          />
          <p className="text-[11px] text-gray-400 mt-1">
            Batch flushes automatically after this duration even if max size is not reached.
          </p>
        </div>

        <div className="pt-3 border-t border-mst-border flex justify-end">
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-500 hover:from-brand-500 hover:to-emerald-400 text-gray-950 font-bold text-xs shadow-md shadow-brand-500/20 transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
};
