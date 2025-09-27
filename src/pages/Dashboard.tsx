import React from 'react';
import StatsCard from '../components/dashboard/StatsCard';
import TransactionRow from '../components/transactions/TransactionRow';
import CashTransactionRow from '../components/transactions/CashTransactionRow';
import PortfolioTable from '../components/portfolio/PortfolioTable';
import { useStockData } from '../hooks/useStockData';
import { usePortfolioData } from '../hooks/usePortfolioData';
import { useTransactions } from '../hooks/useTransactions';
import { useCashTransactions } from '../hooks/useCashTransactions';
import { Transaction, CashTransaction } from '../types';
import './Dashboard.css';

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

const Dashboard: React.FC = () => {
  // Use custom hooks for data fetching
  const { stockDataMap, isLoading: stockLoading, error: stockError } = useStockData();
  const { holdings, portfolioSummary, isLoading: portfolioLoading, error: portfolioError } = usePortfolioData({ stockDataMap });
  const { transactions, isLoading: transactionLoading, error: transactionError } = useTransactions(5);
  const { cashTransactions, isLoading: cashLoading, error: cashError } = useCashTransactions(5);

  // Combine loading states
  const isLoading = stockLoading || portfolioLoading || transactionLoading || cashLoading;
  
  // Combine errors
  const error = stockError || portfolioError || transactionError || cashError;



  if (isLoading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="error">Error loading dashboard: {error}</div>;
  }

  return (
    <div className="Dashboard">
      <div className="Dashboard-header">
        <h1>Portfolio Dashboard</h1>
        <p>Welcome back! Here's your portfolio overview and recent transactions.</p>
      </div>

      <div className="stats-cards">
        <StatsCard
          title="Total Portfolio Value"
          value={formatCurrency((portfolioSummary?.totalPortfolioValue || 0))}
        />
        <StatsCard
          title="Available Cash"
          value={formatCurrency((portfolioSummary?.availableCash || 0))}
        />
        <StatsCard
          title="Total Gain/Loss"
          value={formatCurrency((portfolioSummary?.totalGainLoss || 0))}
        />
        <StatsCard
          title="Number of Stocks"
          value={(portfolioSummary?.stockCount || 0).toString()}
        />
      </div>

      <div className="portfolio-holdings">
        <h2>Portfolio Holdings</h2>
        <PortfolioTable holdings={holdings} />
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
              {[...transactions, ...cashTransactions]
                .sort((a, b) => {
                  const dateA = 'transactionDateTime' in a 
                    ? a.transactionDateTime.toDate().getTime()
                    : a.transactionDate.toDate().getTime();
                  const dateB = 'transactionDateTime' in b
                    ? b.transactionDateTime.toDate().getTime()
                    : b.transactionDate.toDate().getTime();
                  return dateB - dateA;
                })
                .slice(0, 5)
                .map(transaction => (
                  'stockSymbol' in transaction ? (
                    <TransactionRow key={transaction.id} transaction={transaction as Transaction} />
                  ) : (
                    <CashTransactionRow key={transaction.id} transaction={transaction as CashTransaction} />
                  )
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;