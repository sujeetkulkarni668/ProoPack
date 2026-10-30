import React, { useState } from 'react';
import {
  LayoutDashboard,
  BarChart3,
  History,
  ArrowRightLeft,
  Blocks,
  Users,
  Coins,
  Boxes,
  ShieldCheck,
  TrendingDown,
  Scale,
  Wallet,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export type PageId =
  | 'dashboard'
  | 'network-statistics'
  | 'network-history'
  | 'transactions'
  | 'blocks-batches'
  | 'addresses'
  | 'tokens-transfers'
  | 'batch-explorer'
  | 'proof-explorer'
  | 'compression-analytics'
  | 'settlement-history'
  | 'wallet';

interface NavItem {
  id: PageId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  badgeText?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

interface SidebarProps {
  currentPage: PageId;
  onSelectPage: (page: PageId) => void;
  pendingCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onSelectPage,
  pendingCount
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const sections: NavSection[] = [
    {
      title: 'Overview',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'network-statistics', label: 'Network Statistics', icon: BarChart3 },
        { id: 'network-history', label: 'Network History', icon: History }
      ]
    },
    {
      title: 'Explorer',
      items: [
        {
          id: 'transactions',
          label: 'Transactions',
          icon: ArrowRightLeft,
          badge: pendingCount > 0 ? pendingCount : undefined
        },
        { id: 'blocks-batches', label: 'Blocks & Batches', icon: Blocks },
        { id: 'addresses', label: 'Addresses', icon: Users },
        { id: 'tokens-transfers', label: 'Tokens & Transfers', icon: Coins }
      ]
    },
    {
      title: 'ProofPack Technology',
      items: [
        { id: 'batch-explorer', label: 'Batch Explorer', icon: Boxes },
        { id: 'proof-explorer', label: 'Proof Explorer', icon: ShieldCheck },
        { id: 'compression-analytics', label: 'Compression Analytics', icon: TrendingDown },
        { id: 'settlement-history', label: 'Settlement History', icon: Scale }
      ]
    },
    {
      title: 'Wallet',
      items: [
        { id: 'wallet', label: 'BridgeKey Wallet', icon: Wallet }
      ]
    }
  ];

  return (
    <aside
      className={`border-r border-slate-200 dark:border-[#16233b] bg-white/95 dark:bg-[#070c18]/95 transition-all duration-300 flex flex-col justify-between shrink-0 z-30 min-h-[calc(100vh-4rem)] ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Header & Collapse Toggle */}
      <div className="flex flex-col flex-1 overflow-y-auto px-3 py-4">
        <div className="flex items-center justify-between px-2 mb-3">
          {!isCollapsed && (
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-gray-400">
              Explorer Navigation
            </span>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-gray-200 hover:bg-slate-100 dark:hover:bg-[#0c1424] transition-colors ml-auto"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Section List */}
        <div className="space-y-4">
          {sections.map(section => (
            <div key={section.title} className="space-y-1">
              {!isCollapsed && (
                <div className="px-2 pt-1 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-gray-500">
                  {section.title}
                </div>
              )}
              {section.items.map(item => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectPage(item.id)}
                    title={isCollapsed ? item.label : undefined}
                    className={`w-full flex items-center ${
                      isCollapsed ? 'justify-center px-2' : 'justify-between px-3'
                    } py-2.5 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-[#00F5A0]/10 text-[#00F5A0] border border-[#00F5A0]/40 font-semibold shadow-sm shadow-[#00F5A0]/15'
                        : 'text-slate-600 dark:text-gray-400 hover:text-slate-950 dark:hover:text-gray-100 hover:bg-slate-100 dark:hover:bg-[#0c1424]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive
                            ? 'text-[#00F5A0]'
                            : 'text-slate-400 dark:text-gray-400'
                        }`}
                      />
                      {!isCollapsed && <span>{item.label}</span>}
                    </div>

                    {!isCollapsed && item.badge !== undefined && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-[#00F5A0]/20 text-[#00F5A0] border border-[#00F5A0]/30 font-mono">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Network Signal Card */}
      {!isCollapsed && (
        <div className="p-3 border-t border-slate-200 dark:border-[#16233b] m-3 rounded-2xl bg-slate-50 dark:bg-[#0c1424] border text-[11px] shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-gray-400 mb-1">
            <span className="font-semibold text-slate-800 dark:text-gray-200">MST Network Status</span>
            <span className="w-2 h-2 rounded-full bg-[#00F5A0] animate-pulse shadow-[0_0_8px_#00F5A0]" />
          </div>
          <div className="text-[10px] text-slate-400 font-mono">Mainnet 4646 · Coral 54635</div>
          <div className="text-[10px] text-[#00F5A0] font-medium mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00F5A0]" />
            <span>Live Blockscout v2 Sync</span>
          </div>
        </div>
      )}
    </aside>
  );
};
