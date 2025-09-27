import React, { useState, useEffect } from 'react';
import StatsCard from '../components/dashboard/StatsCard';
import TransactionRow from '../components/transactions/TransactionRow';
import CashTransactionRow from '../components/transactions/CashTransactionRow';
import PortfolioTable from '../components/portfolio/PortfolioTable';
import { transactionService } from '../services/transactionService';
import { stockDataService } from '../services/stockDataService';
import { cashService } from '../services/cashService';
import { StockHolding, Transaction, CurrentStockData, CashTransaction, PortfolioSummary } from '../types';
import './Dashboard.css';

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

const Dashboard: React.FC = () => {
  const [holdings, setHoldings] = useState<StockHolding[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [cashTransactions, setCashTransactions] = useState<CashTransaction[]>([]);
  const [portfolioSummary, setPortfolioSummary] = useState<PortfolioSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        // Load all data in parallel
        console.log('Loading dashboard data...');
        const [stockData, recentStockTx, recentCashTx] = await Promise.all([
          stockDataService.getAllStockData(),
          transactionService.getRecentTransactions(5),
          cashService.getRecentCashTransactions(5)
        ]);

        // Create a map of stock data for easy lookup
        const stockDataMap = new Map<string, CurrentStockData>();
        stockData.forEach((stock: CurrentStockData) => stockDataMap.set(stock.stockSymbol, stock));

        // Get portfolio summary (includes cash balance)
        const summary = await transactionService.getPortfolioSummary(stockDataMap);
        const currentHoldings = await transactionService.calculateHoldings(stockDataMap);

        setHoldings(currentHoldings);
        setTransactions(recentStockTx);
        setCashTransactions(recentCashTx);
        setPortfolioSummary(summary);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);



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