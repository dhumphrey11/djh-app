import React from 'react';
import { StockRecommendation } from '../../types';
import './RecommendationRow.css';

interface RecommendationRowProps {
  recommendation: StockRecommendation;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

const formatDate = (timestamp: any): string => {
  return new Date(timestamp.seconds * 1000).toLocaleDateString();
};

const formatHoldingPeriod = (days: number): string => {
  if (days >= 365) {
    return `${(days / 365).toFixed(1)} years`;
  } else if (days >= 30) {
    return `${Math.round(days / 30)} months`;
  } else if (days >= 7) {
    return `${Math.round(days / 7)} weeks`;
  }
  return `${days} days`;
};

const RecommendationRow: React.FC<RecommendationRowProps> = ({ recommendation }) => {
  return (
    <tr className={`recommendation-row ${recommendation.executed ? 'executed' : ''}`}>
      <td className="date-cell">{formatDate(recommendation.createdAt)}</td>
      <td>
        <div className="symbol-cell">
          <span className="symbol">{recommendation.stockSymbol}</span>
          <span className="name">{recommendation.stockName}</span>
        </div>
      </td>
      <td>{recommendation.recommendationType}</td>
      <td>
        <div className="price-strategy">
          <span className="current-price">{formatCurrency(recommendation.currentPrice)}</span>
          <span className="price-arrow">→</span>
          <span className="target-price">{formatCurrency(recommendation.targetPrice)}</span>
        </div>
      </td>
      <td>
        <div className={`confidence ${recommendation.confidence >= 80 ? 'high' : recommendation.confidence >= 60 ? 'medium' : 'low'}`}>
          {recommendation.confidence}%
        </div>
      </td>
      <td>{formatHoldingPeriod(recommendation.recommendedHoldingPeriodDays)}</td>
      <td className="reasoning-cell">{recommendation.reasoning}</td>
      <td className={`status ${recommendation.status}`}>
        {recommendation.status}
      </td>
    </tr>
  );
};

export default RecommendationRow;