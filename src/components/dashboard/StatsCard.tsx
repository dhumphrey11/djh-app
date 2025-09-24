import React from 'react';
import './StatsCard.css';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'positive' | 'negative' | 'neutral';
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, change, changeType }) => {
  const formatChange = (change: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
  };

  const getChangeClass = (type?: string) => {
    switch (type) {
      case 'positive': return 'change positive';
      case 'negative': return 'change negative';
      default: return 'change neutral';
    }
  };

  return (
    <div className="stats-card">
      <h3 className="stats-title">{title}</h3>
      <div className="stats-value">{value}</div>
      {change !== undefined && (
        <div className={getChangeClass(changeType)}>
          {formatChange(change)}
        </div>
      )}
    </div>
  );
};

export default StatsCard;