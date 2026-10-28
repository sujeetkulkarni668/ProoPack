import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar, PageId } from './components/Sidebar';
import { WalletModal } from './components/WalletModal';
import { SendTransferModal } from './components/SendTransferModal';
import { Overview } from './pages/Overview';
import { LearningLab } from './pages/LearningLab';
import { TransactionsPage } from './pages/Transactions';
import { BatchExplorer } from './pages/BatchExplorer';
import { CostAnalyticsPage } from './pages/CostAnalytics';
import { DeveloperPortalPage } from './pages/DeveloperPortal';
import { NetworkStatusPage } from './pages/NetworkStatus';
import { SettingsPage } from './pages/Settings';
import { useWallet } from './hooks/useWallet';
import { useTheme } from './hooks/useTheme';
import {
  fetchHealth,
  fetchTransactions,
  fetchBatches,
  fetchCostAnalytics
} from './services/api';
import { L2Transaction, BatchMetadata, CostAnalyticsData, HealthResponse } from './types';

export const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageId>('overview');
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState<number | null>(null);

  // Theme Hook (Dark & Light)
  const { theme, toggleTheme } = useTheme();

  // Data states
  const [transactions, setTransactions] = useState<L2Transaction[]>([]);
  const [batches, setBatches] = useState<BatchMetadata[]>([]);
  const [analytics, setAnalytics] = useState<CostAnalyticsData | null>(null);
  const [health, setHealth] = useState<HealthResponse | null>(null);

  // Wallet
  const {
    address,
    chainId,
    isConnected,
    isBridgeKey,
    isConnecting,
    error: walletError,
    connect,
    disconnect,
    switchChain,
    signTransfer
  } = useWallet();

  const loadData = useCallback(async () => {
    try {
      const [txRes, batchRes, analyticsRes, healthRes] = await Promise.allSettled([
        fetchTransactions(50),
        fetchBatches(),
        fetchCostAnalytics(),
        fetchHealth()
      ]);

      if (txRes.status === 'fulfilled') setTransactions(txRes.value.transactions);
      if (batchRes.status === 'fulfilled') setBatches(batchRes.value.batches);
      if (analyticsRes.status === 'fulfilled') setAnalytics(analyticsRes.value);
      if (healthRes.status === 'fulfilled') setHealth(healthRes.value);
    } catch (e) {
      console.error('Data load error:', e);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 4000);
    return () => clearInterval(interval);
  }, [loadData]);

  const handleSelectBatch = (batchId: number) => {
    setSelectedBatchId(batchId);
    setCurrentPage('batches');
  };

  const pendingCount = transactions.filter(t => t.status === 'QUEUED' || t.status === 'SUBMITTED').length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0f1d] text-slate-900 dark:text-gray-100 flex flex-col transition-colors">
      <Navbar
        address={address}
        chainId={chainId}
        isConnected={isConnected}
        isBridgeKey={isBridgeKey}
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenWalletModal={() => setIsWalletModalOpen(true)}
        onDisconnect={disconnect}
        onOpenSendModal={() => setIsSendModalOpen(true)}
        onOpenLearnModal={() => setCurrentPage('learn')}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          currentPage={currentPage}
          onSelectPage={setCurrentPage}
          pendingCount={pendingCount}
        />

        <main className="flex-1 overflow-y-auto p-6 sm:p-8 max-w-7xl mx-auto w-full">
          {currentPage === 'overview' && (
            <Overview
              transactions={transactions}
              batches={batches}
              analytics={analytics}
              health={health}
              onRefresh={loadData}
              onOpenSendModal={() => setIsSendModalOpen(true)}
              onSelectBatch={handleSelectBatch}
              address={address}
              chainId={chainId}
            />
          )}

          {currentPage === 'learn' && <LearningLab />}

          {currentPage === 'transactions' && (
            <TransactionsPage
              transactions={transactions}
              onSelectBatch={handleSelectBatch}
              onRefresh={loadData}
            />
          )}

          {currentPage === 'batches' && (
            <BatchExplorer
              batches={batches}
              selectedBatchId={selectedBatchId}
              onRefresh={loadData}
            />
          )}

          {currentPage === 'analytics' && <CostAnalyticsPage analytics={analytics} />}

          {currentPage === 'developers' && <DeveloperPortalPage />}

          {currentPage === 'status' && (
            <NetworkStatusPage health={health} onRefresh={loadData} />
          )}

          {currentPage === 'settings' && (
            <SettingsPage onSwitchChain={switchChain} currentChainId={chainId} />
          )}
        </main>
      </div>

      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        onConnect={connect}
        isConnecting={isConnecting}
        error={walletError}
      />

      <SendTransferModal
        isOpen={isSendModalOpen}
        onClose={() => setIsSendModalOpen(false)}
        senderAddress={address}
        chainId={chainId}
        onSignTransfer={signTransfer}
        onSuccess={() => {
          loadData();
        }}
      />
    </div>
  );
};

export default App;
