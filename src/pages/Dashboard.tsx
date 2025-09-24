import React, { useState, useEffect } from 'react';
import StatsCard from '../components/dashboard/StatsCard';
import TransactionRow from '../components/transactions/TransactionRow';
import { DashboardData, Transaction } from '../types';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

  useEffect(() => {
    // Mock data - replace with actual Firebase data fetching
    const mockData: DashboardData = {
      totalPortfolioValue: 125750.50,
      totalGainLoss: 8920.25,
      totalGainLossPercentage: 7.63,
      portfolioCount: 3,
      stockCount: 12,
      recentTransactions: [
        {
          id: '1',
          stockSymbol: 'AAPL',
          stockName: 'Apple Inc.',
          type: 'buy',
          shares: 50,
          pricePerShare: 150.25,
          totalAmount: 7512.50,
          date: '2025-09-20',
        },
        {
          id: '2',
          stockSymbol: 'GOOGL',
          stockName: 'Alphabet Inc.',
          type: 'sell',
          shares: 10,
          pricePerShare: 2750.00,
          totalAmount: 27500.00,
          date: '2025-09-18',
        },
      ],
    };
    
    setDashboardData(mockData);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (!dashboardData) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="Dashboard">
      <div className="Dashboard-header">
        <h1>Portfolio Dashboard</h1>
        <p>Welcome back! Here's your portfolio overview.</p>
      </div>

      <div className="stats-grid">
        <StatsCard
          title="Total Portfolio Value"
          value={formatCurrency(dashboardData.totalPortfolioValue)}
          change={dashboardData.totalGainLossPercentage}
          changeType={dashboardData.totalGainLoss >= 0 ? 'positive' : 'negative'}
        />
        <StatsCard
          title="Total Gain/Loss"
          value={formatCurrency(dashboardData.totalGainLoss)}
          change={dashboardData.totalGainLossPercentage}
          changeType={dashboardData.totalGainLoss >= 0 ? 'positive' : 'negative'}
        />
        <StatsCard
          title="Active Stocks"
          value={dashboardData.stockCount}
        />
        <StatsCard
          title="Portfolios"
          value={dashboardData.portfolioCount}
        />
      </div>

      <div className="recent-transactions">
        <h2>Recent Transactions</h2>
        <div className="table-container">
          <table className="transactions-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Stock</th>
                <th>Type</th>
                <th>Shares</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {dashboardData.recentTransactions.map((transaction) => (
                <TransactionRow key={transaction.id} transaction={transaction} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;