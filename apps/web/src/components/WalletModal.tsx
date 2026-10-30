import React, { useState } from 'react';
import { Shield, ExternalLink, AlertCircle, CheckCircle2, Download, Zap } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-md bg-[#0C1424] border border-white/10 rounded-3xl shadow-2xl overflow-hidden text-white transition-colors">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2">
              <span>Connect Wallet</span>
              <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-[#00F5A0]/15 text-[#00F5A0] border border-[#00F5A0]/30">
                EIP-712 Gasless
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Connect BridgeKey or Web3 provider to interact with ProofPack L2
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Options */}
        <div className="p-6 space-y-3">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex flex-col gap-2">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
              <div className="flex items-center gap-3 pl-6 pt-1">
                <a
                  href="https://bridgekey.io/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#00F5A0] hover:underline font-bold flex items-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  <span>Get BridgeKey Wallet</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}

          {/* Option 1: BridgeKey Wallet (Official Masterstroke Technosoft Wallet) */}
          <button
            onClick={() => handleSelect('bridgekey')}
            disabled={isConnecting}
            className="w-full p-4 rounded-2xl bg-[#070C18] border border-white/10 hover:border-[#00F5A0]/50 hover:bg-white/[0.03] text-left transition-all group flex items-center justify-between shadow-sm"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#00F5A0]/15 border border-[#00F5A0]/30 flex items-center justify-center font-bold text-[#00F5A0] shadow-md shadow-[#00F5A0]/10">
                BK
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white group-hover:text-[#00F5A0] transition-colors">
                    BridgeKey Wallet
                  </span>
                  <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded-md bg-[#00F5A0]/15 text-[#00F5A0] border border-[#00F5A0]/30">
                    MST Official
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Native Masterstroke Technosoft ecosystem wallet
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold text-[#00F5A0] group-hover:translate-x-1 transition-transform">
              {isConnecting ? 'Connecting...' : '→'}
            </span>
          </button>

          {/* Option 2: Browser Injected Wallet (MetaMask, Rabby, etc.) */}
          <button
            onClick={() => handleSelect('injected')}
            disabled={isConnecting}
            className="w-full p-4 rounded-2xl bg-[#070C18] border border-white/10 hover:border-white/20 hover:bg-white/[0.03] text-left transition-all group flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-slate-300">
                W3
              </div>
              <div>
                <span className="font-bold text-sm text-white group-hover:text-slate-200 transition-colors">
                  Browser Injected (window.ethereum)
                </span>
                <p className="text-xs text-slate-400 mt-0.5">
                  Standard EVM injected wallet extension
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold text-slate-400 group-hover:translate-x-1 transition-transform">
              →
            </span>
          </button>
        </div>

        {/* Footer info */}
        <div className="p-4 bg-[#070C18] border-t border-white/10 text-[11px] text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-2 font-mono">
            <span>Target:</span>
            <span className="text-[#00F5A0]">Coral (54635)</span>
            <span>·</span>
            <span className="text-slate-300">Mainnet (4646)</span>
          </div>
          <span className="font-mono text-[#00F5A0]">Zero Gas EIP-712</span>
        </div>
      </div>
    </div>
  );
};

export default WalletModal;
