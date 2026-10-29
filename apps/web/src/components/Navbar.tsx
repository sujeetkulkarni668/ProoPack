import React, { useState } from 'react';
import {
  Cpu,
  Wallet,
  Sun,
  Moon,
  GraduationCap,
  Search,
  RotateCw,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { searchGlobal } from '../services/api';
import { SearchResult } from '../types';
import { PageId } from './Sidebar';

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
  onOpenLearnModal,
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
        color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
      };
    }
    if (id === 91562037 || id === 4545) {
      return {
        name: 'MST Coral Testnet (91562037)',
        color: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30'
      };
    }
    if (id === 31337) {
      return {
        name: 'Local Devnet',
        color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30'
      };
    }
    return {
      name: `Chain ${id || 'Offline'}`,
      color: 'bg-slate-200 dark:bg-gray-800 text-slate-600 dark:text-gray-400 border-slate-300 dark:border-gray-700'
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
    <header className="h-16 border-b border-slate-200 dark:border-gray-800 bg-white/90 dark:bg-[#0a0f1d]/90 backdrop-blur sticky top-0 z-40 px-4 sm:px-6 flex items-center justify-between gap-4 transition-colors">
      {/* Brand */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <Cpu className="w-5 h-5 text-gray-950 font-bold" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
              ProofPack
            </span>
            <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-md bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
              MST L2
            </span>
          </div>
          <p className="hidden sm:block text-[10px] text-slate-500 dark:text-gray-400 font-medium">
            Layer 2 Explorer & Settlement Engine
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
            placeholder="Search Tx Hash, Batch #, Address, Block, Proof..."
            className="w-full pl-9 pr-8 py-1.5 rounded-xl border border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-[#111827] text-xs text-slate-900 dark:text-gray-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <RotateCw className="w-3 h-3 text-emerald-500 animate-spin" />
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
            className="p-1.5 rounded-lg border border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-900 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            title="Refresh network metrics"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-500' : ''}`} />
          </button>
        )}

        {/* Learner Guide Button */}
        {onOpenLearnModal && (
          <button
            onClick={onOpenLearnModal}
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-semibold transition-colors"
            title="Interactive Blockchain & L2 Learning Guide"
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>How L2 Works</span>
          </button>
        )}

        {/* Free Faucet shortcut */}
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
          className="p-1.5 rounded-lg border border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-900 text-slate-700 dark:text-gray-300 hover:text-slate-950 dark:hover:text-white transition-colors"
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
          className="hidden sm:flex px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-gray-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all items-center gap-1.5"
        >
          <span>Submit L2 Tx</span>
        </button>

        {/* Wallet Connect / State Button */}
        {isConnected && address ? (
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl p-1 pr-2.5">
            <div className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center text-[10px] font-bold font-mono">
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
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 hover:border-emerald-500/50 text-slate-700 dark:text-gray-200 hover:text-slate-900 dark:hover:text-white font-semibold text-xs transition-all flex items-center gap-1.5"
          >
            <Wallet className="w-3.5 h-3.5 text-emerald-500" />
            <span className="hidden sm:inline">Connect</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default Navbar;
