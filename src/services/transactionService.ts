import { collection, addDoc, getDocs, query, orderBy, limit, where, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Transaction, CurrentStockData, StockHolding, PortfolioSummary } from '../types';
import { cashService } from './cashService';

const COLLECTION_NAME = 'transactions';

export const transactionService = {
  // Add a new transaction
  async addTransaction(transaction: Omit<Transaction, 'id'>): Promise<string> {
    const transactionsRef = collection(db, COLLECTION_NAME);
    const docRef = await addDoc(transactionsRef, {
      ...transaction,
      transactionDateTime: Timestamp.now()
    });
    return docRef.id;
  },

  // Get all transactions
  async getTransactions(): Promise<Transaction[]> {
    try {
      const transactionsRef = collection(db, COLLECTION_NAME);
      console.log('Querying collection:', COLLECTION_NAME);
      
      // First try without orderBy to see all documents
      const snapshot = await getDocs(collection(db, COLLECTION_NAME));
      
      // Log the raw data of the first document to see its structure
      if (!snapshot.empty) {
        const firstDoc = snapshot.docs[0];
        console.log('First document data:', {
          id: firstDoc.id,
          data: firstDoc.data(),
          fields: Object.keys(firstDoc.data())
        });
      }
      
      // Now query with ordering
      const q = query(transactionsRef, orderBy('transactionDateTime', 'asc'));
      const orderedSnapshot = await getDocs(q);
      
      console.log('Firestore ordered response:', {
        empty: orderedSnapshot.empty,
        size: orderedSnapshot.size,
        docs: orderedSnapshot.docs.map(doc => ({
          id: doc.id,
          data: doc.data()
        }))
      });
      
      const transactions = orderedSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          stockSymbol: data.stockSymbol,
          numberOfShares: data.numberOfShares,
          transactionDateTime: data.transactionDateTime,
          transactionType: data.transactionType,
          price: data.price
        } as Transaction;
      });
      
      console.log('Processed transactions:', transactions);
      return transactions;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  },

  // Get recent transactions with a limit
  async getRecentTransactions(limitCount: number = 50): Promise<Transaction[]> {
    const transactionsRef = collection(db, COLLECTION_NAME);
    const q = query(
      transactionsRef,
      orderBy('transactionDateTime', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Transaction));
  },

  // Get transactions for a specific stock
  async getTransactionsBySymbol(symbol: string): Promise<Transaction[]> {
    const transactionsRef = collection(db, COLLECTION_NAME);
    const q = query(
      transactionsRef,
      where('stockSymbol', '==', symbol),
      orderBy('transactionDate', 'desc')
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Transaction));
  },

  // Calculate current holdings from transactions
  async calculateHoldings(stockDataMap: Map<string, CurrentStockData>): Promise<StockHolding[]> {
    const transactions = await this.getTransactions();
    const holdingsMap = new Map<string, {
      totalShares: number;
      totalCost: number;
    }>();

    // Calculate total shares and cost for each stock
    transactions.forEach(transaction => {
      const { stockSymbol, numberOfShares, price, transactionType } = transaction;
      const current = holdingsMap.get(stockSymbol) || { totalShares: 0, totalCost: 0 };
      
      if (transactionType === 'Buy') {
        current.totalShares += numberOfShares;
        current.totalCost += numberOfShares * price;
      } else {
        current.totalShares -= numberOfShares;
        current.totalCost -= (current.totalCost / (current.totalShares + numberOfShares)) * numberOfShares;
      }

      if (current.totalShares > 0) {
        holdingsMap.set(stockSymbol, current);
      } else {
        holdingsMap.delete(stockSymbol);
      }
    });

    // Convert to holdings with current prices
    return Array.from(holdingsMap.entries()).map(([symbol, data]) => {
      const stockData = stockDataMap.get(symbol);
      if (!stockData) {
        throw new Error(`No current data found for stock ${symbol}`);
      }

      const averageCost = data.totalCost / data.totalShares;
      const currentValue = data.totalShares * stockData.currentPrice;
      const gainLoss = currentValue - data.totalCost;
      const gainLossPercentage = (gainLoss / data.totalCost) * 100;

      return {
        stockSymbol: symbol,
        stockName: stockData.stockName,
        currentPrice: stockData.currentPrice,
        totalShares: data.totalShares,
        averageCost,
        totalValue: currentValue,
        gainLoss,
        gainLossPercentage
      };
    });
  },

  // Calculate portfolio summary including cash balance
  async getPortfolioSummary(stockDataMap: Map<string, CurrentStockData>): Promise<PortfolioSummary> {
    const holdings = await this.calculateHoldings(stockDataMap);
    const cashBalance = await cashService.calculateCashBalance();
    
    // Calculate total portfolio value and other metrics
    const totalPortfolioValue = holdings.reduce((sum, holding) => sum + holding.totalValue, 0);
    const totalGainLoss = holdings.reduce((sum, holding) => sum + holding.gainLoss, 0);
    const totalGainLossPercentage = totalPortfolioValue > 0 
      ? (totalGainLoss / (totalPortfolioValue - totalGainLoss)) * 100 
      : 0;

    // Calculate available cash by subtracting pending buy orders
    const transactions = await this.getTransactions();
    const pendingBuyTotal = transactions
      .filter(t => t.transactionType === 'Buy')
      .reduce((sum, t) => sum + (t.numberOfShares * t.price), 0);
    const pendingSellTotal = transactions
      .filter(t => t.transactionType === 'Sell')
      .reduce((sum, t) => sum + (t.numberOfShares * t.price), 0);
    const availableCash = cashBalance + pendingSellTotal - pendingBuyTotal;

    return {
      totalPortfolioValue: totalPortfolioValue + cashBalance,
      totalGainLoss,
      totalGainLossPercentage,
      stockCount: holdings.length,
      cashBalance,
      availableCash
    };
  }
};