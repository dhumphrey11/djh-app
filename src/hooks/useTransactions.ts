import { useState, useEffect } from 'react';
import { Transaction } from '../types';
import { transactionService } from '../services/transactionService';

export const useTransactions = (limit?: number) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoading(true);
        const data = limit 
          ? await transactionService.getRecentTransactions(limit)
          : await transactionService.getTransactions();
        setTransactions(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [limit]);

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    try {
      const id = await transactionService.addTransaction(transaction);
      const newTransaction = { ...transaction, id };
      setTransactions(prev => [newTransaction, ...prev]);
      return id;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add transaction');
      throw err;
    }
  };

  return {
    transactions,
    isLoading,
    error,
    addTransaction
  };
};