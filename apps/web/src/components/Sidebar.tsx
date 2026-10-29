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
  BookOpen,
  Code2,
  Webhook,
  ActivitySquare,
  Server,
  Settings,
  ChevronLeft,
  ChevronRight,
  GraduationCap
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
  | 'wallet'
  | 'developer-docs'
  | 'developer-sdk'
  | 'developer-webhooks'
  | 'developer-usage'
  | 'system-status'
  | 'settings'
  | 'learn';

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
    },
    {
      title: 'Developer Tools',
      items: [
        { id: 'developer-docs', label: 'API Documentation', icon: BookOpen },
        { id: 'developer-sdk', label: 'SDK & Integration', icon: Code2 },
        { id: 'developer-webhooks', label: 'Webhooks', icon: Webhook },
        { id: 'developer-usage', label: 'API Usage', icon: ActivitySquare }
      ]
    },
    {
      title: 'System',
      items: [
        { id: 'system-status', label: 'System Status', icon: Server },
        { id: 'settings', label: 'Settings', icon: Settings },
        {
          id: 'learn',
          label: 'How L2 Works',
          icon: GraduationCap,
          badgeText: 'Guide'
        }
      ]
    }
  ];

  return (
    <aside
      className={`border-r border-slate-200 dark:border-gray-800 bg-white/95 dark:bg-[#0b1021]/95 transition-all duration-300 flex flex-col justify-between shrink-0 z-30 min-h-[calc(100vh-4rem)] ${
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
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-gray-200 hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors ml-auto"
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
                    } py-2 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 font-semibold shadow-sm'
                        : 'text-slate-600 dark:text-gray-400 hover:text-slate-950 dark:hover:text-gray-100 hover:bg-slate-100 dark:hover:bg-gray-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-slate-400 dark:text-gray-400'
                        }`}
                      />
                      {!isCollapsed && <span>{item.label}</span>}
                    </div>

                    {!isCollapsed && (
                      <div className="flex items-center gap-1.5">
                        {item.badge !== undefined && (
                          <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                            {item.badge}
                          </span>
                        )}
                        {item.badgeText && (
                          <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                            {item.badgeText}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Compact Network Info */}
      {!isCollapsed && (
        <div className="p-3 border-t border-slate-200 dark:border-gray-800/80 m-3 rounded-2xl bg-slate-50 dark:bg-[#111827]/80 border text-[11px]">
          <div className="flex items-center justify-between text-slate-500 dark:text-gray-400 mb-1">
            <span className="font-semibold text-slate-700 dark:text-gray-300">MST Coral Testnet</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="text-[10px] text-slate-400 font-mono">Chain ID: 91562037</div>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
            Settlement: Live EVM Batching
          </div>
        </div>
      )}
    </aside>
  );
};
