import { useState, useEffect, useMemo } from 'react';
import { StockRecommendation } from '../types';
import { recommendationService } from '../services/recommendationService';

interface UseRecommendationsParams {
  statusFilter?: StockRecommendation['status'] | 'all';
  confidenceThreshold?: number;
}

export const useRecommendations = ({ 
  statusFilter = 'all', 
  confidenceThreshold = 0 
}: UseRecommendationsParams = {}) => {
  const [allRecommendations, setAllRecommendations] = useState<StockRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setIsLoading(true);
        const data = await recommendationService.getActiveRecommendations();
        setAllRecommendations(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch recommendations');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  // Apply filters using useMemo to avoid unnecessary recalculations
  const filteredRecommendations = useMemo(() => {
    return allRecommendations.filter(recommendation => {
      // Apply status filter
      if (statusFilter !== 'all' && recommendation.status !== statusFilter) {
        return false;
      }
      
      // Apply confidence threshold filter
      if (recommendation.confidence < confidenceThreshold) {
        return false;
      }
      
      return true;
    });
  }, [allRecommendations, statusFilter, confidenceThreshold]);

  const updateRecommendationStatus = async (
    recommendationId: string, 
    newStatus: StockRecommendation['status']
  ) => {
    try {
      await recommendationService.updateRecommendationStatus(recommendationId, newStatus);
      
      // Update local state
      setAllRecommendations(prev => 
        prev.map(rec => 
          rec.id === recommendationId 
            ? { ...rec, status: newStatus }
            : rec
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update recommendation status');
      throw err;
    }
  };

  return {
    recommendations: filteredRecommendations,
    allRecommendations,
    isLoading,
    error,
    updateRecommendationStatus
  };
};