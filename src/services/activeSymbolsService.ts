import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';

const COLLECTION_NAME = 'react_activeSymbols';

export interface ActiveSymbol {
  id?: string;
  symbol: string;
  name?: string;
  source: 'portfolio' | 'recommendation' | 'manual';
  isActive: boolean;
  addedAt: Timestamp;
  lastUpdated: Timestamp;
  portfolioQuantity?: number;
  recommendationStatus?: string;
}

class ActiveSymbolsService {
  // Get all active symbols
  async getActiveSymbols(): Promise<ActiveSymbol[]> {
    const activeSymbolsRef = collection(db, COLLECTION_NAME);
    const q = query(
      activeSymbolsRef,
      where('isActive', '==', true),
      orderBy('symbol', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ActiveSymbol));
  }

  // Get all symbols (active and inactive)
  async getAllSymbols(): Promise<ActiveSymbol[]> {
    const activeSymbolsRef = collection(db, COLLECTION_NAME);
    const q = query(activeSymbolsRef, orderBy('symbol', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ActiveSymbol));
  }

  // Add a new active symbol
  async addActiveSymbol(symbol: string, name: string, source: 'portfolio' | 'recommendation' | 'manual', additionalData?: Partial<ActiveSymbol>): Promise<string> {
    const activeSymbolsRef = collection(db, COLLECTION_NAME);
    
    // Check if symbol already exists
    const existingQuery = query(activeSymbolsRef, where('symbol', '==', symbol));
    const existingSnapshot = await getDocs(existingQuery);
    
    if (!existingSnapshot.empty) {
      // Update existing symbol
      const existingDoc = existingSnapshot.docs[0];
      await updateDoc(existingDoc.ref, {
        isActive: true,
        lastUpdated: Timestamp.now(),
        source,
        name,
        ...additionalData
      });
      return existingDoc.id;
    } else {
      // Create new symbol
      const newSymbol: Omit<ActiveSymbol, 'id'> = {
        symbol,
        name,
        source,
        isActive: true,
        addedAt: Timestamp.now(),
        lastUpdated: Timestamp.now(),
        ...additionalData
      };
      const docRef = await addDoc(activeSymbolsRef, newSymbol);
      return docRef.id;
    }
  }

  // Update active symbol
  async updateActiveSymbol(id: string, updates: Partial<ActiveSymbol>): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      ...updates,
      lastUpdated: Timestamp.now()
    });
  }

  // Deactivate symbol (don't delete, just mark inactive)
  async deactivateSymbol(id: string): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      isActive: false,
      lastUpdated: Timestamp.now()
    });
  }

  // Delete symbol completely
  async deleteSymbol(id: string): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  }

  // Sync active symbols based on current portfolio and recommendations
  async syncActiveSymbols(): Promise<void> {
    try {
      console.log('Starting active symbols sync...');
      
      // Get current portfolio symbols
      const portfolioSymbols = await this.getPortfolioSymbols();
      console.log('Portfolio symbols:', portfolioSymbols);
      
      // Get current recommendation symbols
      const recommendationSymbols = await this.getRecommendationSymbols();
      console.log('Recommendation symbols:', recommendationSymbols);
      
      // Combine all symbols that should be active
      const shouldBeActive = new Map<string, { name: string; source: string; additionalData?: any }>();
      
      // Add portfolio symbols
      portfolioSymbols.forEach(item => {
        shouldBeActive.set(item.symbol, {
          name: item.name,
          source: 'portfolio',
          additionalData: { portfolioQuantity: item.quantity }
        });
      });
      
      // Add recommendation symbols
      recommendationSymbols.forEach(item => {
        if (shouldBeActive.has(item.symbol)) {
          // If symbol is in both portfolio and recommendations, update source to portfolio (higher priority)
          const existing = shouldBeActive.get(item.symbol)!;
          existing.additionalData = { 
            ...existing.additionalData, 
            recommendationStatus: item.status 
          };
        } else {
          shouldBeActive.set(item.symbol, {
            name: item.name,
            source: 'recommendation',
            additionalData: { recommendationStatus: item.status }
          });
        }
      });
      
      // Get current active symbols
      const currentActiveSymbols = await this.getAllSymbols();
      const currentActiveMap = new Map(currentActiveSymbols.map(s => [s.symbol, s]));
      
      // Process all changes
      const updates: Array<() => Promise<void>> = [];
      
      // Process symbols that should be active
      shouldBeActive.forEach((data, symbol) => {
        const existing = currentActiveMap.get(symbol);
        
        if (existing) {
          // Update existing symbol if needed
          if (!existing.isActive || existing.source !== data.source) {
            updates.push(async () => {
              const docRef = doc(db, COLLECTION_NAME, existing.id!);
              await updateDoc(docRef, {
                isActive: true,
                source: data.source,
                name: data.name,
                lastUpdated: Timestamp.now(),
                ...data.additionalData
              });
            });
          }
        } else {
          // Add new symbol
          updates.push(async () => {
            const activeSymbolsRef = collection(db, COLLECTION_NAME);
            await addDoc(activeSymbolsRef, {
              symbol,
              name: data.name,
              source: data.source,
              isActive: true,
              addedAt: Timestamp.now(),
              lastUpdated: Timestamp.now(),
              ...data.additionalData
            });
          });
        }
      });
      
      // Deactivate symbols that are no longer in portfolio or recommendations (but keep manual ones)
      for (const existing of currentActiveSymbols) {
        if (existing.isActive && 
            existing.source !== 'manual' && 
            !shouldBeActive.has(existing.symbol)) {
          updates.push(async () => {
            const docRef = doc(db, COLLECTION_NAME, existing.id!);
            await updateDoc(docRef, {
              isActive: false,
              lastUpdated: Timestamp.now()
            });
          });
        }
      }
      
      // Execute all updates
      await Promise.all(updates.map(update => update()))
      
      console.log('Active symbols sync completed successfully');
    } catch (error) {
      console.error('Error syncing active symbols:', error);
      throw error;
    }
  }

  // Helper method to get portfolio symbols
  private async getPortfolioSymbols(): Promise<Array<{ symbol: string; name: string; quantity: number }>> {
    try {
      const transactionsRef = collection(db, 'react_transactions');
      const snapshot = await getDocs(transactionsRef);
      
      const holdings = new Map<string, { name: string; quantity: number }>();
      
      snapshot.docs.forEach(doc => {
        const transaction = doc.data();
        if (transaction.stockSymbol && transaction.numberOfShares) {
          const current = holdings.get(transaction.stockSymbol) || { name: transaction.stockSymbol, quantity: 0 };
          
          if (transaction.transactionType === 'Buy') {
            current.quantity += transaction.numberOfShares || 0;
          } else if (transaction.transactionType === 'Sell') {
            current.quantity -= transaction.numberOfShares || 0;
          }
          
          holdings.set(transaction.stockSymbol, current);
        }
      });
      
      // Return only symbols with positive holdings
      return Array.from(holdings.entries())
        .filter(([_, data]) => data.quantity > 0)
        .map(([symbol, data]) => ({ symbol, name: data.name, quantity: data.quantity }));
    } catch (error) {
      console.error('Error getting portfolio symbols:', error);
      return [];
    }
  }

  // Helper method to get recommendation symbols
  private async getRecommendationSymbols(): Promise<Array<{ symbol: string; name: string; status: string }>> {
    try {
      const recommendationsRef = collection(db, 'react_recommendations');
      const q = query(
        recommendationsRef,
        where('status', 'in', ['pending', 'active', 'monitoring'])
      );
      const snapshot = await getDocs(q);
      
      const symbols = new Map<string, { name: string; status: string }>();
      
      snapshot.docs.forEach(doc => {
        const rec = doc.data();
        if (rec.stockSymbol && rec.stockName) {
          symbols.set(rec.stockSymbol, {
            name: rec.stockName,
            status: rec.status
          });
        }
      });
      
      return Array.from(symbols.entries())
        .map(([symbol, data]) => ({ symbol, name: data.name, status: data.status }));
    } catch (error) {
      console.error('Error getting recommendation symbols:', error);
      return [];
    }
  }
}

export const activeSymbolsService = new ActiveSymbolsService();