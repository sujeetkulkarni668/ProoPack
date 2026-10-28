import React, { useState } from 'react';
import { Settings, Save, Shield, Sliders } from 'lucide-react';

interface SettingsProps {
  onSwitchChain: (chainId: number) => Promise<void>;
  currentChainId: number | null;
}

export const SettingsPage: React.FC<SettingsProps> = ({ onSwitchChain, currentChainId }) => {
  const [maxBatchSize, setMaxBatchSize] = useState(64);
  const [maxWaitMs, setMaxWaitMs] = useState(3000);
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
        <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-slate-500 dark:text-gray-400" />
          <span>Protocol Configuration & Settings</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
          Configure active network targets, sequencer parameters, and operator preferences
        </p>
      </div>

      <form onSubmit={handleSave} className="p-6 rounded-3xl bg-white dark:bg-mst-card border border-slate-200 dark:border-mst-border space-y-5 shadow-sm">
        {saved && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold animate-in fade-in">
            ✓ Settings updated successfully!
          </div>
        )}

        {/* Network Target */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1.5">
            Target Blockchain Network
          </label>
          <select
            value={selectedChain}
            onChange={e => setSelectedChain(parseInt(e.target.value, 10))}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-mst-border text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-500 transition-colors"
          >
            <option value={4545}>MST Testnet (Chain ID 4545, tMSTC)</option>
            <option value={4646}>MST Mainnet (Chain ID 4646, MSTC)</option>
            <option value={31337}>ProofPack Local Devnet (Chain ID 31337)</option>
          </select>
        </div>

        {/* Max Batch Size */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1.5">
            Maximum Batch Size (Transactions per Batch)
          </label>
          <input
            type="number"
            min={2}
            max={128}
            value={maxBatchSize}
            onChange={e => setMaxBatchSize(parseInt(e.target.value, 10))}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-mst-border text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-brand-500 transition-colors"
          />
          <p className="text-[11px] text-slate-500 dark:text-gray-400 mt-1">Recommended: 64 operations for optimal gas amortization.</p>
        </div>

        {/* Max Wait Time */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1.5">
            Maximum Batch Wait Time (Milliseconds)
          </label>
          <input
            type="number"
            min={500}
            max={30000}
            step={500}
            value={maxWaitMs}
            onChange={e => setMaxWaitMs(parseInt(e.target.value, 10))}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-mst-border text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-brand-500 transition-colors"
          />
          <p className="text-[11px] text-slate-500 dark:text-gray-400 mt-1">
            Batch flushes automatically after this duration even if max size is not reached.
          </p>
        </div>

        <div className="pt-3 border-t border-slate-200 dark:border-mst-border flex justify-end">
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-500 hover:from-brand-500 hover:to-emerald-400 text-gray-950 font-bold text-xs shadow-md transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;
