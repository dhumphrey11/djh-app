import { useState, useEffect } from 'react';
import { CurrentStockData } from '../types';
import { stockDataService } from '../services/stockDataService';

export const useStockData = () => {
  const [stockData, setStockData] = useState<CurrentStockData[]>([]);
  const [stockDataMap, setStockDataMap] = useState<Map<string, CurrentStockData>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        setIsLoading(true);
        const data = await stockDataService.getAllStockData();
        
        // Create a map for easy lookup
        const dataMap = new Map<string, CurrentStockData>();
        data.forEach((stock: CurrentStockData) => dataMap.set(stock.stockSymbol, stock));
        
        setStockData(data);
        setStockDataMap(dataMap);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch stock data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStockData();
  }, []);

  return {
    stockData,
    stockDataMap,
    isLoading,
    error
  };
};