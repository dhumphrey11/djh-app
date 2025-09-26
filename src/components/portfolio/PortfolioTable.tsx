import React from 'react';
import { StockHolding } from '../../types';
import './PortfolioTable.css';

interface PortfolioTableProps {
  holdings: StockHolding[];
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
};

const PortfolioTable: React.FC<PortfolioTableProps> = ({ holdings }) => {
  return (
    <div className="table-container">
      <table className="transactions-table">
        <thead>
          <tr>
            <th>Stock</th>
            <th>Shares</th>
            <th>Avg. Cost</th>
            <th>Current Price</th>
            <th>Market Value</th>
            <th>Gain/Loss</th>
            <th>% Change</th>
          </tr>
        </thead>
        <tbody>
          {holdings.map((holding) => {
            const gainLoss = holding.gainLoss;
            const percentChange = holding.gainLossPercentage;

            return (
              <tr key={holding.stockSymbol}>
                <td>
                  <div className="stock-info">
                    <span className="stock-symbol">{holding.stockSymbol}</span>
                    <span className="stock-name">{holding.stockName}</span>
                  </div>
                </td>
                <td>{formatNumber(holding.totalShares)}</td>
                <td>{formatCurrency(holding.averageCost)}</td>
                <td>{formatCurrency(holding.currentPrice)}</td>
                <td>{formatCurrency(holding.totalValue)}</td>
                <td className={gainLoss >= 0 ? 'positive' : 'negative'}>
                  {formatCurrency(gainLoss)}
                </td>
                <td className={percentChange >= 0 ? 'positive' : 'negative'}>
                  {formatNumber(percentChange)}%
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default PortfolioTable;