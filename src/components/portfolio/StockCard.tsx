import React from 'react';
import { StockHolding } from '../../types';
import './StockCard.css';

interface StockCardProps {
  stock: StockHolding;
}

const StockCard: React.FC<StockCardProps> = ({ stock }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercentage = (percentage: number | undefined | null) => {
    if (percentage === undefined || percentage === null) return '0.00%';
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
          <h3 className="stock-symbol">{stock.stockSymbol}</h3>
          <p className="stock-name">{stock.stockName}</p>
        </div>
        <div className="stock-price">
          {formatCurrency(stock.currentPrice)}
        </div>
      </div>
      
      <div className="stock-details">
        <div className="detail-row">
          <span>Shares:</span>
          <span>{stock.totalShares}</span>
        </div>
        <div className="detail-row">
          <span>Purchase Price:</span>
          <span>{formatCurrency(stock.averageCost)}</span>
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