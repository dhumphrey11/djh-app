import React, { useState, useEffect } from 'react';
import { Transaction, CashTransaction } from '../types';
import TransactionRow from '../components/transactions/TransactionRow';
import CashTransactionRow from '../components/transactions/CashTransactionRow';
import { transactionService } from '../services/transactionService';
import { cashService } from '../services/cashService';
import './Transactions.css';

const Transactions: React.FC = () => {
  const [stockTransactions, setStockTransactions] = useState<Transaction[]>([]);
  const [cashTransactions, setCashTransactions] = useState<CashTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Helper function to get the date from either type of transaction
  const getTransactionDate = (tx: Transaction | CashTransaction) => {
    if ('transactionDateTime' in tx) {
      return tx.transactionDateTime.toDate();
    }
    return tx.transactionDate.toDate();
  };

  // Combine and sort transactions by date
  const allTransactions = [...stockTransactions, ...cashTransactions].sort((a, b) => {
    const dateA = getTransactionDate(a);
    const dateB = getTransactionDate(b);
    return dateB.getTime() - dateA.getTime(); // Sort descending (newest first)
  });

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        setIsLoading(true);
        const [stockTx, cashTx] = await Promise.all([
          transactionService.getTransactions(),
          cashService.getCashTransactions()
        ]);
        console.log('Loaded stock transactions:', stockTx);
        console.log('Loaded cash transactions:', cashTx);
        setStockTransactions(stockTx);
        setCashTransactions(cashTx);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load transactions');
      } finally {
        setIsLoading(false);
      }
    };

    loadTransactions();
  }, []);

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