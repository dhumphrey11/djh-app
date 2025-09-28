import { useState, useEffect } from 'react';
import { universeSymbolsService } from '../services/universeSymbolsService';
import { UniverseSymbol } from '../types';

export const useUniverseSymbols = () => {
  const [universeSymbols, setUniverseSymbols] = useState<UniverseSymbol[]>([]);
  const [activeSymbols, setActiveSymbols] = useState<UniverseSymbol[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUniverseSymbols = async () => {
    try {
      setLoading(true);
      setError(null);
      const [allSymbols, activeOnly] = await Promise.all([
        universeSymbolsService.getUniverseSymbols(),
        universeSymbolsService.getActiveUniverseSymbols()
      ]);
      setUniverseSymbols(allSymbols);
      setActiveSymbols(activeOnly);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch universe symbols');
      console.error('Error fetching universe symbols:', err);
    } finally {
      setLoading(false);
    }
  };

  const addUniverseSymbol = async (symbolData: Omit<UniverseSymbol, 'id' | 'addedAt' | 'lastUpdated'>) => {
    try {
      setError(null);
      await universeSymbolsService.addUniverseSymbol(symbolData);
      await fetchUniverseSymbols(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add universe symbol');
      throw err;
    }
  };

  const updateUniverseSymbol = async (id: string, updates: Partial<UniverseSymbol>) => {
    try {
      setError(null);
      await universeSymbolsService.updateUniverseSymbol(id, updates);
      await fetchUniverseSymbols(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update universe symbol');
      throw err;
    }
  };

  const deleteUniverseSymbol = async (id: string) => {
    try {
      setError(null);
      await universeSymbolsService.deleteUniverseSymbol(id);
      await fetchUniverseSymbols(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete universe symbol');
      throw err;
    }
  };

  const toggleSymbolStatus = async (id: string, isActive: boolean) => {
    try {
      setError(null);
      await universeSymbolsService.toggleSymbolStatus(id, isActive);
      await fetchUniverseSymbols(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle symbol status');
      throw err;
    }
  };

  const bulkAddSymbols = async (symbols: Array<Omit<UniverseSymbol, 'id' | 'addedAt' | 'lastUpdated'>>) => {
    try {
      setError(null);
      setLoading(true);
      await universeSymbolsService.bulkAddSymbols(symbols);
      await fetchUniverseSymbols(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to bulk add symbols');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateSymbolPriority = async (id: string, priority: 'high' | 'medium' | 'low') => {
    try {
      setError(null);
      await universeSymbolsService.updateSymbolPriority(id, priority);
      await fetchUniverseSymbols(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update symbol priority');
      throw err;
    }
  };

  const searchSymbols = async (searchTerm: string) => {
    try {
      setError(null);
      return await universeSymbolsService.searchUniverseSymbols(searchTerm);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search symbols');
      throw err;
    }
  };

  const getSymbolsByPriority = async (priority: 'high' | 'medium' | 'low') => {
    try {
      setError(null);
      return await universeSymbolsService.getUniverseSymbolsByPriority(priority);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get symbols by priority');
      throw err;
    }
  };

  const getSymbolsBySector = async (sector: string) => {
    try {
      setError(null);
      return await universeSymbolsService.getUniverseSymbolsBySector(sector);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get symbols by sector');
      throw err;
    }
  };

  const getUniqueSectors = async () => {
    try {
      setError(null);
      return await universeSymbolsService.getUniqueSectors();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get unique sectors');
      throw err;
    }
  };

  const getUniqueIndustries = async () => {
    try {
      setError(null);
      return await universeSymbolsService.getUniqueIndustries();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get unique industries');
      throw err;
    }
  };

  const getStatistics = async () => {
    try {
      setError(null);
      return await universeSymbolsService.getUniverseStatistics();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get statistics');
      throw err;
    }
  };

  useEffect(() => {
    fetchUniverseSymbols();
  }, []);

  return {
    universeSymbols,
    activeSymbols,
    loading,
    error,
    refetch: fetchUniverseSymbols,
    addUniverseSymbol,
    updateUniverseSymbol,
    deleteUniverseSymbol,
    toggleSymbolStatus,
    bulkAddSymbols,
    updateSymbolPriority,
    searchSymbols,
    getSymbolsByPriority,
    getSymbolsBySector,
    getUniqueSectors,
    getUniqueIndustries,
    getStatistics
  };
};