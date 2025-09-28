import { collection, query, where, orderBy, getDocs, doc, updateDoc, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { StockRecommendation } from '../types';

class RecommendationService {
  private readonly collectionName = 'react_recommendations';

  // Get all active (non-expired) recommendations
  async getActiveRecommendations(): Promise<StockRecommendation[]> {
    try {
      // First order by createdAt, then filter in memory
      const q = query(
        collection(db, this.collectionName),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        } as StockRecommendation))
        .filter(rec => rec.status === 'pending' || rec.status === 'executed');
    } catch (error) {
      console.error('Error fetching active recommendations:', error);
      return [];
    }
  }

  // Get recommendations by status
  async getRecommendationsByStatus(status: StockRecommendation['status']): Promise<StockRecommendation[]> {
    const q = query(
      collection(db, this.collectionName),
      where('status', '==', status),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as StockRecommendation));
  }

  // Update recommendation status
  async updateRecommendationStatus(
    recommendationId: string, 
    status: StockRecommendation['status'],
    transactionId?: string
  ): Promise<void> {
    const docRef = doc(db, this.collectionName, recommendationId);
    const updateData: Partial<StockRecommendation> = {
      status,
      executed: status === 'executed'
    };

    if (transactionId) {
      updateData.relatedTransactionId = transactionId;
    }

    await updateDoc(docRef, updateData);
  }

  // Add a new recommendation
  async addRecommendation(recommendation: Omit<StockRecommendation, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, this.collectionName), recommendation);
    return docRef.id;
  }

  // Get recommendations within a date range
  async getRecommendationsInDateRange(startDate: Date, endDate: Date): Promise<StockRecommendation[]> {
    try {
      // Use a single inequality filter and filter the rest in memory
      const q = query(
        collection(db, this.collectionName),
        where('createdAt', '>=', startDate),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const endTimestamp = endDate.getTime();
      return snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        } as StockRecommendation))
        .filter(rec => (rec.createdAt as any).toDate().getTime() <= endTimestamp);
    } catch (error) {
      console.error('Error fetching recommendations by date range:', error);
      return [];
    }
  }

  // Get recommendations by confidence threshold
  async getRecommendationsByConfidence(minConfidence: number): Promise<StockRecommendation[]> {
    try {
      // First get all pending recommendations, then filter by confidence in memory
      const q = query(
        collection(db, this.collectionName),
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        } as StockRecommendation))
        .filter(rec => rec.confidence >= minConfidence);
    } catch (error) {
      console.error('Error fetching recommendations by confidence:', error);
      return [];
    }
  }
}

export const recommendationService = new RecommendationService();