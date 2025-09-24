import React, { useState, useEffect } from 'react';
import StockCard from '../components/portfolio/StockCard';
import { Stock } from '../types';
import './Portfolio.css';

const Portfolio: React.FC = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);

  useEffect(() => {
    // Mock data - replace with actual Firebase data fetching
    const mockStocks: Stock[] = [
      {
        id: '1',
        symbol: 'AAPL',
        name: 'Apple Inc.',
        currentPrice: 175.50,
        shares: 100,
        purchasePrice: 150.25,
        purchaseDate: '2025-08-15',
        totalValue: 17550.00,
        gainLoss: 2525.00,
        gainLossPercentage: 16.80,
      },
      {
        id: '2',
        symbol: 'GOOGL',
        name: 'Alphabet Inc.',
        currentPrice: 2850.75,
        shares: 25,
        purchasePrice: 2750.00,
        purchaseDate: '2025-07-20',
        totalValue: 71268.75,
        gainLoss: 2518.75,
        gainLossPercentage: 3.66,
      },
      {
        id: '3',
        symbol: 'TSLA',
        name: 'Tesla, Inc.',
        currentPrice: 245.30,
        shares: 50,
        purchasePrice: 280.00,
        purchaseDate: '2025-06-10',
        totalValue: 12265.00,
        gainLoss: -1735.00,
        gainLossPercentage: -12.39,
      },
    ];
    
    setStocks(mockStocks);
  }, []);

  const calculateTotals = () => {
    const totalValue = stocks.reduce((sum, stock) => sum + stock.totalValue, 0);
    const totalGainLoss = stocks.reduce((sum, stock) => sum + stock.gainLoss, 0);
    const totalGainLossPercentage = totalValue > 0 ? (totalGainLoss / (totalValue - totalGainLoss)) * 100 : 0;
    
    return { totalValue, totalGainLoss, totalGainLossPercentage };
  };

  const { totalValue, totalGainLoss, totalGainLossPercentage } = calculateTotals();

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
            <span className="value">{stocks.length} stocks</span>
          </div>
        </div>
      </div>

      <div className="stocks-grid">
        {stocks.map((stock) => (
          <StockCard key={stock.id} stock={stock} />
        ))}
      </div>

      {stocks.length === 0 && (
        <div className="empty-state">
          <p>No stocks in your portfolio yet. Start by adding some investments!</p>
        </div>
      )}
    </div>
  );
};

export default Portfolio;