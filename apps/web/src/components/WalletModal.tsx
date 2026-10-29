import React, { useState } from 'react';
import { Shield, ExternalLink, AlertCircle, CheckCircle2 } from 'lucide-react';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (walletType: 'bridgekey' | 'injected') => Promise<boolean>;
  isConnecting: boolean;
  error: string | null;
}

export const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  onClose,
  onConnect,
  isConnecting,
  error
}) => {
  if (!isOpen) return null;

  const handleSelect = async (walletType: 'bridgekey' | 'injected') => {
    const success = await onConnect(walletType);
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-white dark:bg-[#0e1424] border border-slate-200 dark:border-mst-border rounded-3xl shadow-2xl overflow-hidden text-slate-900 dark:text-white transition-colors">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-mst-border flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">Connect Wallet</h3>
            <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
              Select your Web3 wallet to interact with ProofPack L2
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-gray-800 text-slate-500 dark:text-gray-400 hover:text-slate-950 dark:hover:text-white flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Options */}
        <div className="p-6 space-y-3">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Option 1: BridgeKey Wallet (Official Masterstroke Technosoft Wallet) */}
          <button
            onClick={() => handleSelect('bridgekey')}
            disabled={isConnecting}
            className="w-full p-4 rounded-2xl bg-blue-50 dark:bg-gradient-to-r dark:from-blue-900/30 dark:to-indigo-950/40 border border-blue-200 dark:border-blue-500/30 hover:border-blue-400 text-left transition-all group flex items-center justify-between shadow-sm"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-md shadow-blue-500/30">
                BK
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">
                    BridgeKey Wallet
                  </span>
                  <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded-md bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/30">
                    MST Official
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
                  Native Masterstroke Technosoft ecosystem wallet
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform">
              →
            </span>
          </button>

          {/* Option 2: Mock Injected Wallet (For Testing & Demo) */}
          <button
            onClick={() => handleSelect('injected')}
            disabled={isConnecting}
            className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-gray-900/40 border border-slate-200 dark:border-gray-800 hover:border-slate-300 dark:hover:border-gray-700 text-left transition-all group flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-gray-800 flex items-center justify-center font-bold text-slate-700 dark:text-gray-300">
                W3
              </div>
              <div>
                <span className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-brand-300 transition-colors">
                  Browser Injected / Dev Key
                </span>
                <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
                  Standard window.ethereum or automated test account
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold text-slate-400 group-hover:translate-x-0.5 transition-transform">
              →
            </span>
          </button>
        </div>

        {/* Footer info */}
        <div className="p-4 bg-slate-50 dark:bg-gray-900/80 border-t border-slate-200 dark:border-mst-border text-[11px] text-slate-500 dark:text-gray-400 flex items-center justify-between">
          <span>Target Chain: MST Testnet (91562037)</span>
          <span className="font-mono text-emerald-600 dark:text-brand-400">EIP-712 Zero Gas</span>
        </div>
      </div>
    </div>
  );
};

export default WalletModal;
