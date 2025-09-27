import { useState, useEffect } from 'react';
import { StockHolding, PortfolioSummary, CurrentStockData } from '../types';
import { transactionService } from '../services/transactionService';

interface UsePortfolioDataParams {
  stockDataMap?: Map<string, CurrentStockData>;
}

export const usePortfolioData = ({ stockDataMap }: UsePortfolioDataParams = {}) => {
  const [holdings, setHoldings] = useState<StockHolding[]>([]);
  const [portfolioSummary, setPortfolioSummary] = useState<PortfolioSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPortfolioData = async () => {
      if (!stockDataMap || stockDataMap.size === 0) {
        setIsLoading(true);
        return;
      }

      try {
        setIsLoading(true);
        
        // Get portfolio summary and holdings in parallel
        const [summary, currentHoldings] = await Promise.all([
          transactionService.getPortfolioSummary(stockDataMap),
          transactionService.calculateHoldings(stockDataMap)
        ]);

        setPortfolioSummary(summary);
        setHoldings(currentHoldings);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch portfolio data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPortfolioData();
  }, [stockDataMap]);

  return {
    holdings,
    portfolioSummary,
    isLoading,
    error
  };
};