import { useState, useEffect } from 'react';
import { PortfolioPerformanceMetrics, PortfolioAnalyticsService } from '../services/portfolioAnalyticsService';
import { useStockData } from './useStockData';
import { useTransactions } from './useTransactions';
import { useCashTransactions } from './useCashTransactions';
import { usePortfolioData } from './usePortfolioData';

export const usePerformanceMetrics = () => {
  const [performanceMetrics, setPerformanceMetrics] = useState<PortfolioPerformanceMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get data from existing hooks
  const { stockDataMap, isLoading: stockLoading } = useStockData();
  const { transactions, isLoading: transactionLoading } = useTransactions();
  const { cashTransactions, isLoading: cashLoading } = useCashTransactions();
  const { holdings, isLoading: portfolioLoading } = usePortfolioData({ stockDataMap });

  useEffect(() => {
    const calculateMetrics = async () => {
      // Wait for all data to be loaded
      if (stockLoading || transactionLoading || cashLoading || portfolioLoading) {
        return;
      }

      try {
        setIsLoading(true);
        
        // Calculate initial cash from cash transactions
        const initialCash = cashTransactions.reduce((total, tx) => 
          total + (tx.transactionType === 'Deposit' ? tx.amount : -tx.amount), 0
        );

        // Calculate comprehensive performance metrics
        const metrics = PortfolioAnalyticsService.calculatePortfolioMetrics(
          transactions,
          holdings,
          stockDataMap,
          initialCash
        );

        setPerformanceMetrics(metrics);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to calculate performance metrics');
      } finally {
        setIsLoading(false);
      }
    };

    calculateMetrics();
  }, [stockLoading, transactionLoading, cashLoading, portfolioLoading, 
      transactions, cashTransactions, holdings, stockDataMap]);

  return {
    performanceMetrics,
    isLoading,
    error
  };
};