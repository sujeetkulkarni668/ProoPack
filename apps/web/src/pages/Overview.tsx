import React from 'react';
import { Web3Bento, Web3Activity } from '../components/ui/web3-bento';
import { L2Transaction, BatchMetadata, CostAnalyticsData, HealthResponse } from '../types';

interface OverviewProps {
  transactions: L2Transaction[];
  batches: BatchMetadata[];
  analytics: CostAnalyticsData | null;
  health: HealthResponse | null;
  onRefresh: () => void;
  onOpenSendModal: () => void;
  onSelectBatch: (id: number) => void;
  address?: string | null;
  chainId?: number | null;
}

export const Overview: React.FC<OverviewProps> = ({
  transactions,
  batches,
  analytics,
  health,
  onRefresh,
  onOpenSendModal,
  onSelectBatch,
  address,
  chainId
}) => {
  // Transform real L2 transactions into Web3Activity items
  const activities: Web3Activity[] = transactions.slice(0, 6).map(t => ({
    id: t.txId,
    kind: t.status === 'SETTLED' ? 'settlement' : 'transfer',
    title: `L2 Transfer · ${(Number(t.amount) / 1e18).toFixed(3)} MSTC`,
    detail: `To ${t.to.slice(0, 6)}...${t.to.slice(-4)} · Nonce ${t.nonce}`,
    amount: `−${(Number(t.amount) / 1e18).toFixed(3)} MSTC`,
    status: t.status === 'SETTLED' ? 'confirmed' : t.status === 'FAILED' ? 'failed' : 'pending',
    time: 'Recent'
  }));

  const networkLabel =
    chainId === 4646
      ? 'MST Mainnet (4646)'
      : chainId === 91562037 || chainId === 4545
      ? 'MST Testnet (91562037)'
      : 'ProofPack Devnet (31337)';

  const accountDisplay = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : 'bridgekey.mst';

  return (
    <div className="space-y-6">
      <Web3Bento
        account={accountDisplay}
        network={networkLabel}
        transactions={transactions}
        batches={batches}
        analytics={analytics}
        health={health}
        onOpenSendModal={onOpenSendModal}
        onSelectBatch={onSelectBatch}
        activity={activities.length > 0 ? activities : undefined}
      />
    </div>
  );
};

export default Overview;
