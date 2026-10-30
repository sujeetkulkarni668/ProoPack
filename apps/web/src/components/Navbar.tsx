import React, { useState } from 'react';
import {
  Cpu,
  Wallet,
  Sun,
  Moon,
  Search,
  RotateCw,
  ExternalLink
} from 'lucide-react';
import { searchGlobal } from '../services/api';

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
  onRefresh?: () => void;
  isRefreshing?: boolean;
  onNavigateToEntity?: (type: 'transaction' | 'batch' | 'address' | 'settlement' | 'proof', id: any) => void;
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
  onRefresh,
  isRefreshing = false,
  onNavigateToEntity
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const getNetworkName = (id: number | null) => {
    if (id === 4646) {
      return {
        name: 'MST Mainnet (4646)',
        color: 'bg-[#00F5A0]/10 text-[#00F5A0] border-[#00F5A0]/40 shadow-[0_0_10px_rgba(0,245,160,0.15)]'
      };
    }
    if (id === 54635) {
      return {
        name: 'MST Coral Testnet (54635)',
        color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
      };
    }
    if (id === 91562037 || id === 4545) {
      return {
        name: 'Legacy Testnet (Deprecated)',
        color: 'bg-amber-500/10 text-amber-400 border-amber-500/30'
      };
    }
    if (id === 31337) {
      return {
        name: 'Local Devnet',
        color: 'bg-purple-500/10 text-purple-400 border-purple-500/30'
      };
    }
    return {
      name: `MST Mainnet (${id || 4646})`,
      color: 'bg-[#00F5A0]/10 text-[#00F5A0] border-[#00F5A0]/30'
    };
  };

  const net = getNetworkName(chainId);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchError(null);
    try {
      const res = await searchGlobal(searchQuery.trim());
      if (res.found && res.type && onNavigateToEntity) {
        onNavigateToEntity(res.type, res.id);
        setSearchQuery('');
      } else {
        setSearchError(res.message || 'No matching entity found');
        setTimeout(() => setSearchError(null), 3500);
      }
    } catch {
      setSearchError('Search failed to respond');
      setTimeout(() => setSearchError(null), 3000);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <header className="h-16 border-b border-slate-200 dark:border-[#16233b] bg-white/90 dark:bg-[#070c18]/90 backdrop-blur sticky top-0 z-40 px-4 sm:px-6 flex items-center justify-between gap-4 transition-colors">
      {/* Brand with 21st.dev Mint Signal Accent */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#00A86B] via-[#00D287] to-[#00F5A0] flex items-center justify-center shadow-lg shadow-[#00F5A0]/25">
          <Cpu className="w-5 h-5 text-gray-950 font-extrabold" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
              ProofPack
            </span>
            <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-md bg-[#00F5A0]/20 text-[#00F5A0] border border-[#00F5A0]/40">
              MST Mainnet
            </span>
          </div>
          <p className="hidden sm:block text-[10px] text-slate-500 dark:text-gray-400 font-medium">
            Layer 2 Explorer & Real-Time Settlement Engine
          </p>
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="flex-1 max-w-md relative">
        <form onSubmit={handleSearch} className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search Mainnet Tx Hash, Block #, Address, Batch..."
            className="w-full pl-9 pr-8 py-1.5 rounded-xl border border-slate-200 dark:border-[#16233b] bg-slate-50 dark:bg-[#0c1424] text-xs text-slate-900 dark:text-gray-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00F5A0]/50 transition-all font-mono"
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <RotateCw className="w-3 h-3 text-[#00F5A0] animate-spin" />
            </div>
          )}
        </form>
        {searchError && (
          <div className="absolute top-full mt-1.5 left-0 right-0 bg-rose-50 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-[11px] p-2 rounded-lg shadow-lg z-50">
            {searchError}
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Refresh button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-[#16233b] bg-slate-50 dark:bg-[#0c1424] text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            title="Refresh network metrics"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#00F5A0]' : ''}`} />
          </button>
        )}

        {/* Free Faucet shortcut for Testnet */}
        <a
          href="https://coral-faucet.mstblockchain.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 text-xs font-semibold transition-colors"
          title="Claim Free Testnet Tokens from Coral Faucet"
        >
          <span>Faucet</span>
          <ExternalLink className="w-2.5 h-2.5 opacity-70" />
        </a>

        {/* Network Badge */}
        <div className={`hidden sm:flex px-2.5 py-1 rounded-lg border text-xs font-semibold items-center gap-2 ${net.color}`}>
          <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
          <span>{net.name}</span>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={onToggleTheme}
          aria-label="Toggle theme"
          className="p-1.5 rounded-lg border border-slate-200 dark:border-[#16233b] bg-slate-50 dark:bg-[#0c1424] text-slate-700 dark:text-gray-300 hover:text-slate-950 dark:hover:text-white transition-colors"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
        >
          {theme === 'dark' ? (
            <Sun className="w-3.5 h-3.5 text-amber-400" />
          ) : (
            <Moon className="w-3.5 h-3.5 text-slate-700" />
          )}
        </button>

        {/* Quick Send Transaction Button */}
        <button
          onClick={onOpenSendModal}
          className="hidden sm:flex px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#00D287] to-[#00F5A0] hover:from-[#00F5A0] hover:to-[#00D287] text-gray-950 font-bold text-xs shadow-md shadow-[#00F5A0]/25 transition-all items-center gap-1.5"
        >
          <span>Submit L2 Tx</span>
        </button>

        {/* Wallet Connect / State Button */}
        {isConnected && address ? (
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-[#0c1424] border border-slate-200 dark:border-[#16233b] rounded-xl p-1 pr-2.5">
            <div className="w-6 h-6 rounded-lg bg-[#00F5A0]/20 text-[#00F5A0] flex items-center justify-center text-[10px] font-bold font-mono">
              {isBridgeKey ? 'BK' : 'W3'}
            </div>
            <div className="text-left text-xs">
              <p className="font-mono font-medium text-slate-800 dark:text-gray-200 leading-tight">
                {address.slice(0, 6)}...{address.slice(-4)}
              </p>
            </div>
            <button
              onClick={onDisconnect}
              className="ml-1 text-slate-400 hover:text-rose-500 text-xs transition-colors"
              title="Disconnect"
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenWalletModal}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#0c1424] border border-slate-200 dark:border-[#16233b] hover:border-[#00F5A0]/50 text-slate-700 dark:text-gray-200 hover:text-slate-900 dark:hover:text-white font-semibold text-xs transition-all flex items-center gap-1.5"
          >
            <Wallet className="w-3.5 h-3.5 text-[#00F5A0]" />
            <span className="hidden sm:inline">Connect</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default Navbar;
