import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar, PageId } from './components/Sidebar';
import { WalletModal } from './components/WalletModal';
import { SendTransferModal } from './components/SendTransferModal';

// Pages
import { Dashboard } from './pages/Dashboard';
import { NetworkStatisticsPage } from './pages/NetworkStatistics';
import { NetworkHistoryPage } from './pages/NetworkHistory';
import { TransactionsPage } from './pages/Transactions';
import { BlocksAndBatchesPage } from './pages/BlocksAndBatches';
import { AddressesPage } from './pages/Addresses';
import { TokensAndTransfersPage } from './pages/TokensAndTransfers';
import { BatchExplorer } from './pages/BatchExplorer';
import { ProofExplorerPage } from './pages/ProofExplorer';
import { CostAnalyticsPage } from './pages/CostAnalytics';
import { SettlementHistoryPage } from './pages/SettlementHistory';
import { WalletPage } from './pages/WalletPage';

// Hooks & Services
import { useWallet } from './hooks/useWallet';
import { useTheme } from './hooks/useTheme';
import {
  fetchHealth,
  fetchTransactions,
  fetchBatches,
  fetchCostAnalytics
} from './services/api';
import {
  L2Transaction,
  BatchMetadata,
  CostAnalyticsData,
  HealthResponse
} from './types';

export const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard');
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState<number | null>(null);
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null);
  const [targetAddress, setTargetAddress] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Theme Hook (Dark & Light)
  const { theme, toggleTheme } = useTheme();

  // Data states
  const [transactions, setTransactions] = useState<L2Transaction[]>([]);
  const [batches, setBatches] = useState<BatchMetadata[]>([]);
  const [analytics, setAnalytics] = useState<CostAnalyticsData | null>(null);
  const [health, setHealth] = useState<HealthResponse | null>(null);

  // Wallet Hook
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
    setIsRefreshing(true);
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
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [loadData]);

  const handleSelectBatch = (batchId: number) => {
    setSelectedBatchId(batchId);
    setCurrentPage('batch-explorer');
  };

  const handleSelectTx = (txId: string) => {
    setSelectedTxId(txId);
    setCurrentPage('transactions');
  };

  const handleNavigateToEntity = (
    type: 'transaction' | 'batch' | 'address' | 'settlement' | 'proof',
    id: any
  ) => {
    if (type === 'transaction') {
      setSelectedTxId(id);
      setCurrentPage('transactions');
    } else if (type === 'batch') {
      setSelectedBatchId(typeof id === 'number' ? id : parseInt(id, 10));
      setCurrentPage('blocks-batches');
    } else if (type === 'address') {
      setTargetAddress(id);
      setCurrentPage('addresses');
    } else if (type === 'settlement') {
      setCurrentPage('settlement-history');
    } else if (type === 'proof') {
      setCurrentPage('proof-explorer');
    }
  };

  const pendingCount = transactions.filter(
    t => t.status === 'QUEUED' || t.status === 'SUBMITTED'
  ).length;

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
        onRefresh={loadData}
        isRefreshing={isRefreshing}
        onNavigateToEntity={handleNavigateToEntity}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          currentPage={currentPage}
          onSelectPage={setCurrentPage}
          pendingCount={pendingCount}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {/* A. Overview */}
          {currentPage === 'dashboard' && (
            <Dashboard
              transactions={transactions}
              batches={batches}
              analytics={analytics}
              health={health}
              onRefresh={loadData}
              onOpenSendModal={() => setIsSendModalOpen(true)}
              onSelectBatch={handleSelectBatch}
              onSelectTx={handleSelectTx}
              address={address}
              chainId={chainId}
            />
          )}

          {currentPage === 'network-statistics' && <NetworkStatisticsPage />}

          {currentPage === 'network-history' && (
            <NetworkHistoryPage onSelectBatch={handleSelectBatch} />
          )}

          {/* B. Explorer */}
          {currentPage === 'transactions' && (
            <TransactionsPage
              transactions={transactions}
              selectedTxId={selectedTxId}
              onSelectBatch={handleSelectBatch}
              onRefresh={loadData}
            />
          )}

          {currentPage === 'blocks-batches' && (
            <BlocksAndBatchesPage
              batches={batches}
              onSelectTx={handleSelectTx}
              onRefresh={loadData}
            />
          )}

          {currentPage === 'addresses' && (
            <AddressesPage
              initialAddress={targetAddress || address}
              onSelectTx={handleSelectTx}
              onSelectBatch={handleSelectBatch}
            />
          )}

          {currentPage === 'tokens-transfers' && (
            <TokensAndTransfersPage
              transactions={transactions}
              onSelectTx={handleSelectTx}
            />
          )}

          {/* C. ProofPack Technology */}
          {currentPage === 'batch-explorer' && (
            <BatchExplorer
              batches={batches}
              selectedBatchId={selectedBatchId}
              onRefresh={loadData}
            />
          )}

          {currentPage === 'proof-explorer' && <ProofExplorerPage />}

          {currentPage === 'compression-analytics' && (
            <CostAnalyticsPage analytics={analytics} />
          )}

          {currentPage === 'settlement-history' && (
            <SettlementHistoryPage onSelectBatch={handleSelectBatch} />
          )}

          {/* D. Wallet */}
          {currentPage === 'wallet' && (
            <WalletPage
              address={address}
              chainId={chainId}
              isConnected={isConnected}
              isBridgeKey={isBridgeKey}
              isConnecting={isConnecting}
              onConnect={() => setIsWalletModalOpen(true)}
              onDisconnect={disconnect}
              onSwitchChain={switchChain}
              onOpenSendModal={() => setIsSendModalOpen(true)}
              transactions={transactions}
              onSelectTx={handleSelectTx}
            />
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
