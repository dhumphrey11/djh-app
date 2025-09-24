import { collection, query, where, orderBy, getDocs, doc, updateDoc, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { StockRecommendation } from '../types';

class RecommendationService {
  private readonly collectionName = 'recommendations';

  // Get all active (non-expired) recommendations
  async getActiveRecommendations(): Promise<StockRecommendation[]> {
    const q = query(
      collection(db, this.collectionName),
      where('status', 'in', ['pending', 'executed']),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as StockRecommendation));
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
    const q = query(
      collection(db, this.collectionName),
      where('createdAt', '>=', startDate),
      where('createdAt', '<=', endDate),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as StockRecommendation));
  }

  // Get recommendations by confidence threshold
  async getRecommendationsByConfidence(minConfidence: number): Promise<StockRecommendation[]> {
    const q = query(
      collection(db, this.collectionName),
      where('status', '==', 'pending'),
      where('confidence', '>=', minConfidence),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as StockRecommendation));
  }
}

export const recommendationService = new RecommendationService();