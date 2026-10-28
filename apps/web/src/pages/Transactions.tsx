import React from 'react';
import { LeadsDataTable } from '../components/ui/leads-data-table';
import { L2Transaction } from '../types';
import { triggerOperatorFlush } from '../services/api';

interface TransactionsPageProps {
  transactions: L2Transaction[];
  onSelectBatch: (batchId: number) => void;
  onRefresh?: () => void;
}

export const TransactionsPage: React.FC<TransactionsPageProps> = ({
  transactions,
  onSelectBatch,
  onRefresh
}) => {
  const handleFlushSelected = async (txIds: string[]) => {
    try {
      await triggerOperatorFlush();
      onRefresh?.();
    } catch (e: any) {
      alert(`Flush failed: ${e.message}`);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <LeadsDataTable
        transactions={transactions}
        onSelectBatch={onSelectBatch}
        onFlushSelected={handleFlushSelected}
      />
    </div>
  );
};
