import React, { useState, useEffect } from 'react';
import { StockRecommendation } from '../types';
import { recommendationService } from '../services/recommendationService';
import RecommendationRow from '../components/recommendations/RecommendationRow';
import './Recommendations.css';

const Recommendations: React.FC = () => {
  const [recommendations, setRecommendations] = useState<StockRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StockRecommendation['status'] | 'all'>('all');
  const [confidenceThreshold, setConfidenceThreshold] = useState(0);

  useEffect(() => {
    loadRecommendations();
  }, [statusFilter, confidenceThreshold]);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      let fetchedRecommendations: StockRecommendation[];

      if (statusFilter === 'all') {
        if (confidenceThreshold > 0) {
          fetchedRecommendations = await recommendationService.getRecommendationsByConfidence(confidenceThreshold);
        } else {
          fetchedRecommendations = await recommendationService.getActiveRecommendations();
        }
      } else {
        fetchedRecommendations = await recommendationService.getRecommendationsByStatus(statusFilter);
      }

      setRecommendations(fetchedRecommendations);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: StockRecommendation['status']) => {
    try {
      await recommendationService.updateRecommendationStatus(id, newStatus);
      // Reload recommendations to get updated list
      loadRecommendations();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update recommendation status');
    }
  };

  if (loading) {
    return <div className="loading">Loading recommendations...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="recommendations-page">
      <div className="recommendations-header">
        <h1>Stock Recommendations</h1>
        <div className="filters">
          <div className="filter-group">
            <label htmlFor="status">Status:</label>
            <select
              id="status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StockRecommendation['status'] | 'all')}
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="executed">Executed</option>
              <option value="rejected">Rejected</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="confidence">Min. Confidence:</label>
            <select
              id="confidence"
              value={confidenceThreshold}
              onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
            >
              <option value={0}>Any</option>
              <option value={50}>50%+</option>
              <option value={70}>70%+</option>
              <option value={90}>90%+</option>
            </select>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="recommendations-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Stock</th>
              <th>Type</th>
              <th>Price Strategy</th>
              <th>Confidence</th>
              <th>Hold Period</th>
              <th>Reasoning</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {recommendations.map(recommendation => (
              <RecommendationRow 
                key={recommendation.id} 
                recommendation={recommendation}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Recommendations;