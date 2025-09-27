import { useState, useEffect } from 'react';
import { AIRecommendationMetrics, PortfolioAnalyticsService } from '../services/portfolioAnalyticsService';
import { useRecommendations } from './useRecommendations';

export const useAIMetrics = () => {
  const [aiMetrics, setAiMetrics] = useState<AIRecommendationMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get recommendations data
  const { allRecommendations, isLoading: recommendationLoading } = useRecommendations();

  useEffect(() => {
    const calculateAIMetrics = async () => {
      if (recommendationLoading) {
        return;
      }

      try {
        setIsLoading(true);
        
        // Calculate AI recommendation engine metrics
        const metrics = PortfolioAnalyticsService.calculateAIMetrics(allRecommendations);
        
        setAiMetrics(metrics);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to calculate AI metrics');
      } finally {
        setIsLoading(false);
      }
    };

    calculateAIMetrics();
  }, [recommendationLoading, allRecommendations]);

  return {
    aiMetrics,
    isLoading,
    error
  };
};