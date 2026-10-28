import React from 'react';
import {
  LayoutDashboard,
  ArrowRightLeft,
  Boxes,
  TrendingDown,
  Terminal,
  Activity,
  Settings,
  Layers
} from 'lucide-react';

export type PageId =
  | 'overview'
  | 'transactions'
  | 'batches'
  | 'analytics'
  | 'developers'
  | 'status'
  | 'settings';

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
  const menuItems = [
    { id: 'overview' as PageId, label: 'Overview', icon: LayoutDashboard },
    {
      id: 'transactions' as PageId,
      label: 'Transactions',
      icon: ArrowRightLeft,
      badge: pendingCount > 0 ? pendingCount : undefined
    },
    { id: 'batches' as PageId, label: 'Batch Explorer', icon: Boxes },
    { id: 'analytics' as PageId, label: 'Cost Analytics', icon: TrendingDown },
    { id: 'developers' as PageId, label: 'Developer Portal', icon: Terminal },
    { id: 'status' as PageId, label: 'Network & System', icon: Activity },
    { id: 'settings' as PageId, label: 'Settings', icon: Settings }
  ];

  return (
    <aside className="w-64 border-r border-mst-border bg-[#0b1021]/80 p-4 flex flex-col justify-between shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="space-y-1">
        <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
          Protocol Modules
        </p>
        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectPage(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-brand-500/10 text-brand-400 border border-brand-500/30 font-semibold'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/40'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-brand-400' : 'text-gray-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-brand-500/20 text-brand-300">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Protocol Architecture Card */}
      <div className="p-3.5 rounded-xl bg-gradient-to-b from-gray-900 to-mst-card border border-mst-border">
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-300 mb-1">
          <Layers className="w-4 h-4 text-brand-400" />
          <span>MST Compression Engine</span>
        </div>
        <p className="text-[11px] text-gray-400 leading-relaxed">
          Aggregates EIP-712 micro-transfers with binary Varint serialization & Merkle commitments.
        </p>
        <div className="mt-3 pt-2.5 border-t border-gray-800 flex items-center justify-between text-[11px]">
          <span className="text-gray-400">Target Efficiency</span>
          <span className="font-mono text-emerald-400 font-bold">~76% Savings</span>
        </div>
      </div>
    </aside>
  );
};
