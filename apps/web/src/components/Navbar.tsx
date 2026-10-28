import React from 'react';
import { ShieldCheck, Cpu, Wallet, Sun, Moon, GraduationCap } from 'lucide-react';

interface NavbarProps {
  address: string | null;
  chainId: number | null;
  isConnected: boolean;
  isBridgeKey: boolean;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onOpenWalletModal: () => void;
  onDisconnect: () => void;
  onOpenSendModal: () => void;
  onOpenLearnModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  address,
  chainId,
  isConnected,
  isBridgeKey,
  theme,
  onToggleTheme,
  onOpenWalletModal,
  onDisconnect,
  onOpenSendModal,
  onOpenLearnModal
}) => {
  const getNetworkName = (id: number | null) => {
    if (id === 4646) return { name: 'MST Mainnet', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' };
    if (id === 4545) return { name: 'MST Testnet', color: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30' };
    if (id === 31337) return { name: 'Local Devnet', color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30' };
    return { name: `Chain ${id || 'Offline'}`, color: 'bg-slate-200 dark:bg-gray-800 text-slate-600 dark:text-gray-400 border-slate-300 dark:border-gray-700' };
  };

  const net = getNetworkName(chainId);

  return (
    <header className="h-16 border-b border-slate-200 dark:border-mst-border bg-white/90 dark:bg-[#0a0f1d]/90 backdrop-blur sticky top-0 z-40 px-6 flex items-center justify-between transition-colors">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-emerald-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-brand-500/20">
          <Cpu className="w-5 h-5 text-gray-950 font-bold" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
              ProofPack
            </span>
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-brand-500/20 text-brand-700 dark:text-brand-400 border border-brand-500/30">
              L2 Rollup
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-gray-400 font-medium">MST Blockchain Optimization Layer</p>
        </div>
      </div>

      {/* Network & Actions */}
      <div className="flex items-center gap-3">
        {/* Learner Guide Button */}
        {onOpenLearnModal && (
          <button
            onClick={onOpenLearnModal}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-semibold transition-colors"
            title="Interactive Blockchain & L2 Learning Guide"
          >
            <GraduationCap className="w-4 h-4" />
            <span>How L2 Works</span>
          </button>
        )}

        {/* Network Badge */}
        <div className={`px-3 py-1 rounded-lg border text-xs font-semibold flex items-center gap-2 ${net.color}`}>
          <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
          <span>{net.name}</span>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={onToggleTheme}
          aria-label="Toggle theme"
          className="p-2 rounded-lg border border-slate-200 dark:border-gray-800 bg-slate-100 dark:bg-gray-900 text-slate-700 dark:text-gray-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-gray-800 transition-colors"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700" />
          )}
        </button>

        {/* Quick Send Transaction Button */}
        <button
          onClick={onOpenSendModal}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-brand-600 to-emerald-500 hover:from-brand-500 hover:to-emerald-400 text-gray-950 font-bold text-xs shadow-md shadow-brand-500/20 transition-all flex items-center gap-2"
        >
          <span>Submit L2 Tx</span>
        </button>

        {/* Wallet Connect / State Button */}
        {isConnected && address ? (
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-mst-card border border-slate-200 dark:border-mst-border rounded-lg p-1 pr-3">
            <div className="w-7 h-7 rounded-md bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center text-xs font-bold font-mono">
              {isBridgeKey ? 'BK' : 'W3'}
            </div>
            <div className="text-left text-xs">
              <p className="font-mono font-medium text-slate-800 dark:text-gray-200">
                {address.slice(0, 6)}...{address.slice(-4)}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-gray-400">{isBridgeKey ? 'BridgeKey Wallet' : 'Injected'}</p>
            </div>
            <button
              onClick={onDisconnect}
              className="ml-2 text-slate-400 hover:text-rose-500 text-xs transition-colors"
              title="Disconnect"
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenWalletModal}
            className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-mst-card border border-slate-200 dark:border-mst-border hover:border-brand-500/50 text-slate-700 dark:text-gray-200 hover:text-slate-900 dark:hover:text-white font-semibold text-xs transition-all flex items-center gap-2"
          >
            <Wallet className="w-4 h-4 text-brand-500 dark:text-brand-400" />
            <span>Connect Wallet</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default Navbar;
