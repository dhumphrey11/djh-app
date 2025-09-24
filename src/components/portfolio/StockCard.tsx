import React from 'react';
import { Stock } from '../../types';
import './StockCard.css';

interface StockCardProps {
  stock: Stock;
}

const StockCard: React.FC<StockCardProps> = ({ stock }) => {
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

  const getGainLossClass = (gainLoss: number) => {
    if (gainLoss > 0) return 'gain-loss positive';
    if (gainLoss < 0) return 'gain-loss negative';
    return 'gain-loss neutral';
  };

  return (
    <div className="stock-card">
      <div className="stock-header">
        <div>
          <h3 className="stock-symbol">{stock.symbol}</h3>
          <p className="stock-name">{stock.name}</p>
        </div>
        <div className="stock-price">
          {formatCurrency(stock.currentPrice)}
        </div>
      </div>
      
      <div className="stock-details">
        <div className="detail-row">
          <span>Shares:</span>
          <span>{stock.shares}</span>
        </div>
        <div className="detail-row">
          <span>Purchase Price:</span>
          <span>{formatCurrency(stock.purchasePrice)}</span>
        </div>
        <div className="detail-row">
          <span>Total Value:</span>
          <span>{formatCurrency(stock.totalValue)}</span>
        </div>
        <div className="detail-row">
          <span>Gain/Loss:</span>
          <span className={getGainLossClass(stock.gainLoss)}>
            {formatCurrency(stock.gainLoss)} ({formatPercentage(stock.gainLossPercentage)})
          </span>
        </div>
      </div>
    </div>
  );
};

export default StockCard;