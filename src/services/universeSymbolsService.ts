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

const COLLECTION_NAME = 'react_universeSymbols';

export interface UniverseSymbol {
  id?: string;
  symbol: string;
  name: string;
  sector?: string;
  industry?: string;
  marketCap?: number;
  isActive: boolean;
  addedAt: Timestamp;
  lastUpdated: Timestamp;
  notes?: string;
  priority: 'high' | 'medium' | 'low';
}

class UniverseSymbolsService {
  // Get all universe symbols
  async getUniverseSymbols(): Promise<UniverseSymbol[]> {
    const universeSymbolsRef = collection(db, COLLECTION_NAME);
    const q = query(universeSymbolsRef, orderBy('symbol', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as UniverseSymbol));
  }

  // Get active universe symbols only
  async getActiveUniverseSymbols(): Promise<UniverseSymbol[]> {
    const universeSymbolsRef = collection(db, COLLECTION_NAME);
    const q = query(
      universeSymbolsRef,
      where('isActive', '==', true),
      orderBy('symbol', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as UniverseSymbol));
  }

  // Get universe symbols by priority
  async getUniverseSymbolsByPriority(priority: 'high' | 'medium' | 'low'): Promise<UniverseSymbol[]> {
    const universeSymbolsRef = collection(db, COLLECTION_NAME);
    const q = query(
      universeSymbolsRef,
      where('priority', '==', priority),
      where('isActive', '==', true),
      orderBy('symbol', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as UniverseSymbol));
  }

  // Get universe symbols by sector
  async getUniverseSymbolsBySector(sector: string): Promise<UniverseSymbol[]> {
    const universeSymbolsRef = collection(db, COLLECTION_NAME);
    const q = query(
      universeSymbolsRef,
      where('sector', '==', sector),
      where('isActive', '==', true),
      orderBy('symbol', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as UniverseSymbol));
  }

  // Add a new universe symbol
  async addUniverseSymbol(symbolData: Omit<UniverseSymbol, 'id' | 'addedAt' | 'lastUpdated'>): Promise<string> {
    const universeSymbolsRef = collection(db, COLLECTION_NAME);
    
    // Check if symbol already exists
    const existingQuery = query(universeSymbolsRef, where('symbol', '==', symbolData.symbol));
    const existingSnapshot = await getDocs(existingQuery);
    
    if (!existingSnapshot.empty) {
      throw new Error(`Symbol ${symbolData.symbol} already exists in universe`);
    }
    
    const newSymbol: Omit<UniverseSymbol, 'id'> = {
      ...symbolData,
      addedAt: Timestamp.now(),
      lastUpdated: Timestamp.now()
    };
    
    const docRef = await addDoc(universeSymbolsRef, newSymbol);
    return docRef.id;
  }

  // Update universe symbol
  async updateUniverseSymbol(id: string, updates: Partial<UniverseSymbol>): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      ...updates,
      lastUpdated: Timestamp.now()
    });
  }

  // Delete universe symbol
  async deleteUniverseSymbol(id: string): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  }

  // Activate/Deactivate symbol
  async toggleSymbolStatus(id: string, isActive: boolean): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      isActive,
      lastUpdated: Timestamp.now()
    });
  }

  // Bulk add symbols
  async bulkAddSymbols(symbols: Array<Omit<UniverseSymbol, 'id' | 'addedAt' | 'lastUpdated'>>): Promise<string[]> {
    const universeSymbolsRef = collection(db, COLLECTION_NAME);
    const addedIds: string[] = [];
    
    for (const symbolData of symbols) {
      try {
        // Check if symbol already exists
        const existingQuery = query(universeSymbolsRef, where('symbol', '==', symbolData.symbol));
        const existingSnapshot = await getDocs(existingQuery);
        
        if (existingSnapshot.empty) {
          const newSymbol: Omit<UniverseSymbol, 'id'> = {
            ...symbolData,
            addedAt: Timestamp.now(),
            lastUpdated: Timestamp.now()
          };
          
          const docRef = await addDoc(universeSymbolsRef, newSymbol);
          addedIds.push(docRef.id);
        } else {
          console.log(`Symbol ${symbolData.symbol} already exists, skipping...`);
        }
      } catch (error) {
        console.error(`Error adding symbol ${symbolData.symbol}:`, error);
      }
    }
    
    return addedIds;
  }

  // Update symbol priority
  async updateSymbolPriority(id: string, priority: 'high' | 'medium' | 'low'): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      priority,
      lastUpdated: Timestamp.now()
    });
  }

  // Get all unique sectors
  async getUniqueSectors(): Promise<string[]> {
    const symbols = await this.getActiveUniverseSymbols();
    const sectors = new Set<string>();
    
    symbols.forEach(symbol => {
      if (symbol.sector) {
        sectors.add(symbol.sector);
      }
    });
    
    return Array.from(sectors).sort();
  }

  // Get all unique industries
  async getUniqueIndustries(): Promise<string[]> {
    const symbols = await this.getActiveUniverseSymbols();
    const industries = new Set<string>();
    
    symbols.forEach(symbol => {
      if (symbol.industry) {
        industries.add(symbol.industry);
      }
    });
    
    return Array.from(industries).sort();
  }

  // Search universe symbols
  async searchUniverseSymbols(searchTerm: string): Promise<UniverseSymbol[]> {
    const symbols = await this.getActiveUniverseSymbols();
    const lowercaseSearch = searchTerm.toLowerCase();
    
    return symbols.filter(symbol => 
      symbol.symbol.toLowerCase().includes(lowercaseSearch) ||
      symbol.name.toLowerCase().includes(lowercaseSearch) ||
      (symbol.sector && symbol.sector.toLowerCase().includes(lowercaseSearch)) ||
      (symbol.industry && symbol.industry.toLowerCase().includes(lowercaseSearch))
    );
  }

  // Get statistics
  async getUniverseStatistics(): Promise<{
    total: number;
    active: number;
    inactive: number;
    byPriority: { high: number; medium: number; low: number };
    bySector: Record<string, number>;
  }> {
    const allSymbols = await this.getUniverseSymbols();
    
    const stats = {
      total: allSymbols.length,
      active: allSymbols.filter(s => s.isActive).length,
      inactive: allSymbols.filter(s => !s.isActive).length,
      byPriority: {
        high: allSymbols.filter(s => s.priority === 'high' && s.isActive).length,
        medium: allSymbols.filter(s => s.priority === 'medium' && s.isActive).length,
        low: allSymbols.filter(s => s.priority === 'low' && s.isActive).length
      },
      bySector: {} as Record<string, number>
    };
    
    // Count by sector
    allSymbols
      .filter(s => s.isActive && s.sector)
      .forEach(symbol => {
        if (symbol.sector) {
          stats.bySector[symbol.sector] = (stats.bySector[symbol.sector] || 0) + 1;
        }
      });
    
    return stats;
  }
}

export const universeSymbolsService = new UniverseSymbolsService();