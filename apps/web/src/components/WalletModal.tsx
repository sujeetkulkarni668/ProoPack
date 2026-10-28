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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-[#0e1424] border border-mst-border rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-mst-border flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">Connect Wallet</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Select your Web3 wallet to interact with ProofPack L2
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-gray-800 text-gray-400 hover:text-white flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Options */}
        <div className="p-6 space-y-3">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Option 1: BridgeKey Wallet (Official Masterstroke Technosoft Wallet) */}
          <button
            onClick={() => handleSelect('bridgekey')}
            disabled={isConnecting}
            className="w-full p-4 rounded-xl bg-gradient-to-r from-blue-900/30 to-indigo-950/40 border border-blue-500/30 hover:border-blue-400 text-left transition-all group flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-md shadow-blue-500/30">
                BK
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white group-hover:text-blue-300 transition-colors">
                    BridgeKey Wallet
                  </span>
                  <span className="px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    Official MST
                  </span>
                </div>
                <p className="text-xs text-gray-400">Native non-custodial multi-chain wallet</p>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-blue-400 transition-colors" />
          </button>

          {/* Option 2: Browser Injected (MetaMask / EIP-6963) */}
          <button
            onClick={() => handleSelect('injected')}
            disabled={isConnecting}
            className="w-full p-4 rounded-xl bg-gray-900/40 border border-gray-800 hover:border-gray-700 text-left transition-all group flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center font-bold text-gray-300">
                W3
              </div>
              <div>
                <span className="font-bold text-sm text-gray-200 group-hover:text-white transition-colors">
                  Injected Provider
                </span>
                <p className="text-xs text-gray-400">MetaMask or standard EIP-1193 extension</p>
              </div>
            </div>
          </button>
        </div>

        {/* Footer Note */}
        <div className="p-4 bg-gray-900/50 border-t border-mst-border text-[11px] text-gray-400 flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>ProofPack never stores private keys. All transfers are signed via EIP-712.</span>
        </div>
      </div>
    </div>
  );
};
