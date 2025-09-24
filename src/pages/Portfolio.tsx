import React, { useState, useEffect } from 'react';
import StockCard from '../components/portfolio/StockCard';
import { StockHolding, CurrentStockData } from '../types';
import { transactionService } from '../services/transactionService';
import { stockDataService } from '../services/stockDataService';
import './Portfolio.css';

const Portfolio: React.FC = () => {
  const [holdings, setHoldings] = useState<StockHolding[]>([]);
  const [cashBalance, setCashBalance] = useState<number>(0);
  const [availableCash, setAvailableCash] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPortfolio = async () => {
      try {
        setIsLoading(true);
        // Load current stock data
        const stockData = await stockDataService.getAllStockData();
        console.log('Loaded stock data:', stockData);
        
        // Create a map of stock data for easy lookup
        const stockDataMap = new Map<string, CurrentStockData>();
        stockData.forEach(stock => stockDataMap.set(stock.stockSymbol, stock));
        console.log('Stock data map:', Array.from(stockDataMap.entries()));
        
        // Get portfolio summary including holdings and cash
        const portfolioSummary = await transactionService.getPortfolioSummary(stockDataMap);
        const currentHoldings = await transactionService.calculateHoldings(stockDataMap);
        
        setHoldings(currentHoldings);
        setCashBalance(portfolioSummary.cashBalance);
        setAvailableCash(portfolioSummary.availableCash);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load portfolio');
      } finally {
        setIsLoading(false);
      }
    };

    loadPortfolio();
  }, []);

  const calculateTotals = (stocksList: StockHolding[]) => {
    const totalValue = stocksList.reduce((sum: number, stock: StockHolding) => sum + stock.totalValue, 0);
    const totalGainLoss = stocksList.reduce((sum: number, stock: StockHolding) => sum + stock.gainLoss, 0);
    const totalGainLossPercentage = totalValue > 0 ? (totalGainLoss / (totalValue - totalGainLoss)) * 100 : 0;
    
    return { totalValue, totalGainLoss, totalGainLossPercentage };
  };

  const { totalValue, totalGainLoss, totalGainLossPercentage } = calculateTotals(holdings);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercentage = (percentage: number) => {
    const sign = percentage >= 0 ? '+' : '';
    return `${sign}${percentage.toFixed(2)}%`;
  };

  if (isLoading) {
    return (
      <div className="Portfolio">
        <div className="loading">Loading portfolio...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="Portfolio">
        <div className="error-state">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="Portfolio">
      <div className="Portfolio-header">
        <h1>My Portfolio</h1>
        <div className="portfolio-summary">
          <div className="summary-item">
            <span className="label">Total Value:</span>
            <span className="value">{formatCurrency(totalValue)}</span>
          </div>
          <div className="summary-item">
            <span className="label">Total Gain/Loss:</span>
            <span className={`value ${totalGainLoss >= 0 ? 'positive' : 'negative'}`}>
              {formatCurrency(totalGainLoss)} ({formatPercentage(totalGainLossPercentage)})
            </span>
          </div>
          <div className="summary-item">
            <span className="label">Holdings:</span>
            <span className="value">{holdings.length} stocks</span>
          </div>
          <div className="summary-item">
            <span className="label">Cash Balance:</span>
            <span className="value">{formatCurrency(cashBalance)}</span>
          </div>
          <div className="summary-item">
            <span className="label">Available Cash:</span>
            <span className="value">{formatCurrency(availableCash)}</span>
          </div>
        </div>
      </div>

      <div className="stocks-grid">
        {holdings.map((holding: StockHolding) => (
          <StockCard key={holding.stockSymbol} stock={holding} />
        ))}
      </div>

      {holdings.length === 0 && (
        <div className="empty-state">
          <p>No stocks in your portfolio yet. Start by adding some investments!</p>
        </div>
      )}
    </div>
  );
};

export default Portfolio;
