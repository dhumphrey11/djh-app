import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { CurrentStockData } from '../types';

const COLLECTION_NAME = 'currentStockData';

export const stockDataService = {
  // Fetch all current stock data
  async getAllStockData(): Promise<CurrentStockData[]> {
    try {
      const stockDataCollection = collection(db, COLLECTION_NAME);
      const snapshot = await getDocs(stockDataCollection);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CurrentStockData[];
    } catch (error) {
      throw new Error('Failed to fetch stock data');
    }
  }
};