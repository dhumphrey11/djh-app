import React, { useMemo } from 'react';
import { Transaction, CashTransaction } from '../types';
import TransactionRow from '../components/transactions/TransactionRow';
import CashTransactionRow from '../components/transactions/CashTransactionRow';
import { useTransactions } from '../hooks/useTransactions';
import { useCashTransactions } from '../hooks/useCashTransactions';
import './Transactions.css';

const Transactions: React.FC = () => {
  // Use custom hooks for data fetching
  const { transactions: stockTransactions, isLoading: stockLoading, error: stockError } = useTransactions();
  const { cashTransactions, isLoading: cashLoading, error: cashError } = useCashTransactions();

  // Combine loading states and errors
  const isLoading = stockLoading || cashLoading;
  const error = stockError || cashError;
  
  // Helper function to get the date from either type of transaction
  const getTransactionDate = (tx: Transaction | CashTransaction) => {
    if ('transactionDateTime' in tx) {
      return tx.transactionDateTime.toDate();
    }
    return tx.transactionDate.toDate();
  };

  // Combine and sort transactions by date using useMemo for performance
  const allTransactions = useMemo(() => {
    return [...stockTransactions, ...cashTransactions].sort((a, b) => {
      const dateA = getTransactionDate(a);
      const dateB = getTransactionDate(b);
      return dateB.getTime() - dateA.getTime(); // Sort descending (newest first)
    });
  }, [stockTransactions, cashTransactions]);

  if (isLoading) {
    return <div className="loading">Loading transactions...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="Transactions">
      <div className="Transactions-header">
        <h1>My Transactions</h1>
      </div>

      <div className="transactions-container">
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
            {allTransactions.map((transaction) => (
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
  );
};

export default Transactions;