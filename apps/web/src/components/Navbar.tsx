import React from 'react';
import { ShieldCheck, Cpu, Wallet, ExternalLink, ChevronDown } from 'lucide-react';

interface NavbarProps {
  address: string | null;
  chainId: number | null;
  isConnected: boolean;
  isBridgeKey: boolean;
  onOpenWalletModal: () => void;
  onDisconnect: () => void;
  onOpenSendModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  address,
  chainId,
  isConnected,
  isBridgeKey,
  onOpenWalletModal,
  onDisconnect,
  onOpenSendModal
}) => {
  const getNetworkName = (id: number | null) => {
    if (id === 4646) return { name: 'MST Mainnet', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
    if (id === 4545) return { name: 'MST Testnet', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' };
    if (id === 31337) return { name: 'Local Devnet', color: 'bg-purple-500/10 text-purple-400 border-purple-500/30' };
    return { name: `Chain ${id || 'Offline'}`, color: 'bg-gray-800 text-gray-400 border-gray-700' };
  };

  const net = getNetworkName(chainId);

  return (
    <header className="h-16 border-b border-mst-border bg-[#0a0f1d]/90 backdrop-blur sticky top-0 z-40 px-6 flex items-center justify-between">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-emerald-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-brand-500/20">
          <Cpu className="w-5 h-5 text-gray-950 font-bold" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-gray-100 to-gray-400 bg-clip-text text-transparent">
              ProofPack
            </span>
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-brand-500/20 text-brand-400 border border-brand-500/30">
              L2 Engine
            </span>
          </div>
          <p className="text-[11px] text-gray-400 font-medium">MST Blockchain Optimization Layer</p>
        </div>
      </div>

      {/* Network & Actions */}
      <div className="flex items-center gap-3">
        {/* Network Badge */}
        <div className={`px-3 py-1 rounded-lg border text-xs font-semibold flex items-center gap-2 ${net.color}`}>
          <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
          <span>{net.name}</span>
        </div>

        {/* Quick Send Transaction Button */}
        <button
          onClick={onOpenSendModal}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-brand-600 to-emerald-500 hover:from-brand-500 hover:to-emerald-400 text-gray-950 font-bold text-xs shadow-md shadow-brand-500/20 transition-all flex items-center gap-2"
        >
          <span>Submit L2 Tx</span>
        </button>

        {/* Wallet Connect / State Button */}
        {isConnected && address ? (
          <div className="flex items-center gap-2 bg-mst-card border border-mst-border rounded-lg p-1 pr-3">
            <div className="w-7 h-7 rounded-md bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-bold font-mono">
              {isBridgeKey ? 'BK' : 'W3'}
            </div>
            <div className="text-left text-xs">
              <p className="font-mono font-medium text-gray-200">
                {address.slice(0, 6)}...{address.slice(-4)}
              </p>
              <p className="text-[10px] text-gray-400">{isBridgeKey ? 'BridgeKey Wallet' : 'Injected'}</p>
            </div>
            <button
              onClick={onDisconnect}
              className="ml-2 text-gray-400 hover:text-rose-400 text-xs transition-colors"
              title="Disconnect"
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenWalletModal}
            className="px-4 py-2 rounded-lg bg-mst-card border border-mst-border hover:border-brand-500/50 text-gray-200 hover:text-white font-semibold text-xs transition-all flex items-center gap-2"
          >
            <Wallet className="w-4 h-4 text-brand-400" />
            <span>Connect Wallet</span>
          </button>
        )}
      </div>
    </header>
  );
};
