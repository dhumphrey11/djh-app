import { useState, useEffect } from 'react';
import { CashTransaction } from '../types';
import { cashService } from '../services/cashService';

export const useCashTransactions = (limit?: number) => {
  const [cashTransactions, setCashTransactions] = useState<CashTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCashTransactions = async () => {
      try {
        setIsLoading(true);
        const data = limit 
          ? await cashService.getRecentCashTransactions(limit)
          : await cashService.getCashTransactions();
        setCashTransactions(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch cash transactions');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCashTransactions();
  }, [limit]);

  const addCashTransaction = async (transaction: Omit<CashTransaction, 'id'>) => {
    try {
      const id = await cashService.addCashTransaction(transaction);
      const newTransaction = { ...transaction, id };
      setCashTransactions(prev => [newTransaction, ...prev]);
      return id;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add cash transaction');
      throw err;
    }
  };

  return {
    cashTransactions,
    isLoading,
    error,
    addCashTransaction
  };
};