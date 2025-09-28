import { useState, useEffect } from 'react';
import { activeSymbolsService } from '../services/activeSymbolsService';
import { ActiveSymbol } from '../types';

export const useActiveSymbols = () => {
  const [activeSymbols, setActiveSymbols] = useState<ActiveSymbol[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActiveSymbols = async () => {
    try {
      setLoading(true);
      setError(null);
      const symbols = await activeSymbolsService.getActiveSymbols();
      setActiveSymbols(symbols);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch active symbols');
      console.error('Error fetching active symbols:', err);
    } finally {
      setLoading(false);
    }
  };

  const addActiveSymbol = async (
    symbol: string, 
    name: string, 
    source: 'portfolio' | 'recommendation' | 'manual',
    additionalData?: Partial<ActiveSymbol>
  ) => {
    try {
      setError(null);
      await activeSymbolsService.addActiveSymbol(symbol, name, source, additionalData);
      await fetchActiveSymbols(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add active symbol');
      throw err;
    }
  };

  const updateActiveSymbol = async (id: string, updates: Partial<ActiveSymbol>) => {
    try {
      setError(null);
      await activeSymbolsService.updateActiveSymbol(id, updates);
      await fetchActiveSymbols(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update active symbol');
      throw err;
    }
  };

  const deactivateSymbol = async (id: string) => {
    try {
      setError(null);
      await activeSymbolsService.deactivateSymbol(id);
      await fetchActiveSymbols(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to deactivate symbol');
      throw err;
    }
  };

  const deleteSymbol = async (id: string) => {
    try {
      setError(null);
      await activeSymbolsService.deleteSymbol(id);
      await fetchActiveSymbols(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete symbol');
      throw err;
    }
  };

  const syncActiveSymbols = async () => {
    try {
      setError(null);
      setLoading(true);
      await activeSymbolsService.syncActiveSymbols();
      await fetchActiveSymbols(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sync active symbols');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveSymbols();
  }, []);

  return {
    activeSymbols,
    loading,
    error,
    refetch: fetchActiveSymbols,
    addActiveSymbol,
    updateActiveSymbol,
    deactivateSymbol,
    deleteSymbol,
    syncActiveSymbols
  };
};