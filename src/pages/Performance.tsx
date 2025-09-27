import React from 'react';
import { usePerformanceMetrics } from '../hooks/usePerformanceMetrics';
import { useAIMetrics } from '../hooks/useAIMetrics';
import './Performance.css';

const Performance: React.FC = () => {
  const { performanceMetrics, isLoading: performanceLoading, error: performanceError } = usePerformanceMetrics();
  const { aiMetrics, isLoading: aiLoading, error: aiError } = useAIMetrics();

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (value: number, decimals: number = 2): string => {
    return `${value.toFixed(decimals)}%`;
  };

  const formatNumber = (value: number, decimals: number = 2): string => {
    return value.toFixed(decimals);
  };

  const getPerformanceColor = (value: number): string => {
    return value >= 0 ? '#28a745' : '#dc3545';
  };

  const getRiskColor = (value: number): string => {
    if (value < 10) return '#28a745'; // Low risk - green
    if (value < 20) return '#ffc107'; // Medium risk - yellow
    return '#dc3545'; // High risk - red
  };

  const getAccuracyColor = (value: number): string => {
    if (value >= 80) return '#28a745'; // Excellent - green
    if (value >= 60) return '#ffc107'; // Good - yellow
    return '#dc3545'; // Needs improvement - red
  };

  if (performanceLoading || aiLoading) {
    return (
      <div className="performance-container">
        <h2>Performance Analytics</h2>
        <div className="loading-performance">
          <p>Calculating comprehensive performance metrics...</p>
          <div className="loading-indicators">
            <div>Portfolio Metrics: {performanceLoading ? 'Calculating...' : '✓ Complete'}</div>
            <div>AI Engine Metrics: {aiLoading ? 'Calculating...' : '✓ Complete'}</div>
          </div>
        </div>
      </div>
    );
  }

  if (performanceError || aiError) {
    return (
      <div className="performance-container">
        <h2>Performance Analytics</h2>
        <div className="error-state">
          <h3>Error Loading Performance Data</h3>
          {performanceError && <p>Portfolio Metrics: {performanceError}</p>}
          {aiError && <p>AI Metrics: {aiError}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="performance-container">
      <div className="performance-header">
        <h2>Performance Analytics Dashboard</h2>
        <p>Comprehensive analysis of portfolio performance and AI recommendations engine</p>
      </div>

      {/* Portfolio Performance Overview */}
      {performanceMetrics && (
        <div className="performance-section">
          <h3>Portfolio Performance Metrics</h3>
          
          {/* Key Performance Indicators */}
          <div className="performance-kpis">
            <div className="kpi-grid">
              <div className="kpi-card primary">
                <div className="kpi-label">Total Return</div>
                <div className="kpi-value" style={{ color: getPerformanceColor(performanceMetrics.totalReturn) }}>
                  {formatCurrency(performanceMetrics.totalReturn)}
                </div>
                <div className="kpi-percentage" style={{ color: getPerformanceColor(performanceMetrics.totalReturnPercentage) }}>
                  {formatPercentage(performanceMetrics.totalReturnPercentage)}
                </div>
              </div>
              
              <div className="kpi-card">
                <div className="kpi-label">Annualized Return</div>
                <div className="kpi-value" style={{ color: getPerformanceColor(performanceMetrics.annualizedReturn * 100) }}>
                  {formatPercentage(performanceMetrics.annualizedReturn * 100)}
                </div>
              </div>
              
              <div className="kpi-card">
                <div className="kpi-label">Volatility (Risk)</div>
                <div className="kpi-value" style={{ color: getRiskColor(performanceMetrics.volatility) }}>
                  {formatPercentage(performanceMetrics.volatility)}
                </div>
              </div>
              
              <div className="kpi-card">
                <div className="kpi-label">Sharpe Ratio</div>
                <div className="kpi-value" style={{ color: performanceMetrics.sharpeRatio > 1 ? '#28a745' : '#ffc107' }}>
                  {formatNumber(performanceMetrics.sharpeRatio)}
                </div>
              </div>
            </div>
          </div>

          {/* Risk Metrics */}
          <div className="risk-metrics">
            <h4>Risk Analysis</h4>
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-header">
                  <span>Maximum Drawdown</span>
                  <span className="metric-value" style={{ color: getRiskColor(performanceMetrics.maxDrawdown) }}>
                    -{formatPercentage(performanceMetrics.maxDrawdown)}
                  </span>
                </div>
                <div className="metric-description">
                  Largest peak-to-trough decline
                </div>
              </div>
              
              <div className="metric-card">
                <div className="metric-header">
                  <span>Current Drawdown</span>
                  <span className="metric-value" style={{ color: getRiskColor(performanceMetrics.currentDrawdown) }}>
                    -{formatPercentage(performanceMetrics.currentDrawdown)}
                  </span>
                </div>
                <div className="metric-description">
                  Current decline from peak
                </div>
              </div>
              
              <div className="metric-card">
                <div className="metric-header">
                  <span>Calmar Ratio</span>
                  <span className="metric-value">
                    {formatNumber(performanceMetrics.calmarRatio)}
                  </span>
                </div>
                <div className="metric-description">
                  Return vs Maximum Drawdown
                </div>
              </div>
              
              <div className="metric-card">
                <div className="metric-header">
                  <span>Sortino Ratio</span>
                  <span className="metric-value">
                    {formatNumber(performanceMetrics.sortinoRatio)}
                  </span>
                </div>
                <div className="metric-description">
                  Downside risk-adjusted return
                </div>
              </div>
            </div>
          </div>

          {/* Trading Performance */}
          <div className="trading-metrics">
            <h4>Trading Performance</h4>
            <div className="trading-stats-grid">
              <div className="trading-stat">
                <div className="stat-label">Win Rate</div>
                <div className="stat-value" style={{ color: getAccuracyColor(performanceMetrics.winRate) }}>
                  {formatPercentage(performanceMetrics.winRate)}
                </div>
              </div>
              
              <div className="trading-stat">
                <div className="stat-label">Total Trades</div>
                <div className="stat-value">{performanceMetrics.totalTrades}</div>
              </div>
              
              <div className="trading-stat">
                <div className="stat-label">Winning Trades</div>
                <div className="stat-value text-success">{performanceMetrics.winningTrades}</div>
              </div>
              
              <div className="trading-stat">
                <div className="stat-label">Losing Trades</div>
                <div className="stat-value text-danger">{performanceMetrics.losingTrades}</div>
              </div>
              
              <div className="trading-stat">
                <div className="stat-label">Average Win</div>
                <div className="stat-value text-success">{formatCurrency(performanceMetrics.averageWin)}</div>
              </div>
              
              <div className="trading-stat">
                <div className="stat-label">Average Loss</div>
                <div className="stat-value text-danger">-{formatCurrency(performanceMetrics.averageLoss)}</div>
              </div>
              
              <div className="trading-stat">
                <div className="stat-label">Profit Factor</div>
                <div className="stat-value" style={{ color: performanceMetrics.profitFactor > 1 ? '#28a745' : '#dc3545' }}>
                  {formatNumber(performanceMetrics.profitFactor)}
                </div>
              </div>
              
              <div className="trading-stat">
                <div className="stat-label">Largest Win</div>
                <div className="stat-value text-success">{formatCurrency(performanceMetrics.largestWin)}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Recommendations Engine Performance */}
      {aiMetrics && (
        <div className="performance-section">
          <h3>AI Recommendations Engine Performance</h3>
          
          {/* AI Overview KPIs */}
          <div className="ai-kpis">
            <div className="kpi-grid">
              <div className="kpi-card ai-primary">
                <div className="kpi-label">Overall Accuracy</div>
                <div className="kpi-value" style={{ color: getAccuracyColor(aiMetrics.accuracy) }}>
                  {formatPercentage(aiMetrics.accuracy)}
                </div>
                <div className="kpi-subtitle">
                  {aiMetrics.successfulRecommendations} of {aiMetrics.executedRecommendations} executed
                </div>
              </div>
              
              <div className="kpi-card">
                <div className="kpi-label">Precision</div>
                <div className="kpi-value" style={{ color: getAccuracyColor(aiMetrics.precision) }}>
                  {formatPercentage(aiMetrics.precision)}
                </div>
              </div>
              
              <div className="kpi-card">
                <div className="kpi-label">Recall</div>
                <div className="kpi-value" style={{ color: getAccuracyColor(aiMetrics.recall) }}>
                  {formatPercentage(aiMetrics.recall)}
                </div>
              </div>
              
              <div className="kpi-card">
                <div className="kpi-label">F1 Score</div>
                <div className="kpi-value" style={{ color: getAccuracyColor(aiMetrics.f1Score) }}>
                  {formatPercentage(aiMetrics.f1Score)}
                </div>
              </div>
            </div>
          </div>

          {/* Confidence Analysis */}
          <div className="confidence-analysis">
            <h4>Confidence Level Analysis</h4>
            <div className="confidence-grid">
              <div className="confidence-card">
                <div className="confidence-header">
                  <span>High Confidence (80%+)</span>
                  <span className="badge">{aiMetrics.confidenceDistribution.high} recommendations</span>
                </div>
                <div className="confidence-accuracy" style={{ color: getAccuracyColor(aiMetrics.highConfidenceAccuracy) }}>
                  {formatPercentage(aiMetrics.highConfidenceAccuracy)} accuracy
                </div>
              </div>
              
              <div className="confidence-card">
                <div className="confidence-header">
                  <span>Medium Confidence (60-79%)</span>
                  <span className="badge">{aiMetrics.confidenceDistribution.medium} recommendations</span>
                </div>
                <div className="confidence-accuracy" style={{ color: getAccuracyColor(aiMetrics.mediumConfidenceAccuracy) }}>
                  {formatPercentage(aiMetrics.mediumConfidenceAccuracy)} accuracy
                </div>
              </div>
              
              <div className="confidence-card">
                <div className="confidence-header">
                  <span>Low Confidence (&lt;60%)</span>
                  <span className="badge">{aiMetrics.confidenceDistribution.low} recommendations</span>
                </div>
                <div className="confidence-accuracy" style={{ color: getAccuracyColor(aiMetrics.lowConfidenceAccuracy) }}>
                  {formatPercentage(aiMetrics.lowConfidenceAccuracy)} accuracy
                </div>
              </div>
            </div>
          </div>

          {/* Recommendation Performance */}
          <div className="recommendation-performance">
            <h4>Recommendation Performance</h4>
            <div className="performance-stats-grid">
              <div className="performance-stat">
                <div className="stat-label">Total Recommendations</div>
                <div className="stat-value">{aiMetrics.totalRecommendations}</div>
              </div>
              
              <div className="performance-stat">
                <div className="stat-label">Average Confidence</div>
                <div className="stat-value">{formatPercentage(aiMetrics.averageConfidence)}</div>
              </div>
              
              <div className="performance-stat">
                <div className="stat-label">Average Return</div>
                <div className="stat-value" style={{ color: getPerformanceColor(aiMetrics.averageReturnOnRecommendations) }}>
                  {formatPercentage(aiMetrics.averageReturnOnRecommendations)}
                </div>
              </div>
              
              <div className="performance-stat">
                <div className="stat-label">Best Recommendation</div>
                <div className="stat-value text-success">
                  {formatPercentage(aiMetrics.bestPerformingRecommendation)}
                </div>
              </div>
              
              <div className="performance-stat">
                <div className="stat-label">Worst Recommendation</div>
                <div className="stat-value text-danger">
                  {formatPercentage(aiMetrics.worstPerformingRecommendation)}
                </div>
              </div>
              
              <div className="performance-stat">
                <div className="stat-label">Avg. Days to Execute</div>
                <div className="stat-value">{formatNumber(aiMetrics.averageDaysToExecution, 1)}</div>
              </div>
            </div>
          </div>

          {/* Status Distribution */}
          <div className="status-distribution">
            <h4>Recommendation Status Distribution</h4>
            <div className="status-grid">
              {Object.entries(aiMetrics.recommendationsByStatus).map(([status, count]) => (
                <div key={status} className="status-item">
                  <div className="status-label">{status.charAt(0).toUpperCase() + status.slice(1)}</div>
                  <div className="status-count">{count}</div>
                  <div className="status-percentage">
                    {formatPercentage((count / aiMetrics.totalRecommendations) * 100)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Time-based Accuracy */}
          <div className="time-accuracy">
            <h4>Time-based Accuracy Analysis</h4>
            <div className="time-accuracy-grid">
              {Object.entries(aiMetrics.timeBasedAccuracy).map(([period, accuracy]) => (
                <div key={period} className="time-accuracy-item">
                  <div className="time-period">{period}</div>
                  <div className="accuracy-value" style={{ color: getAccuracyColor(accuracy) }}>
                    {formatPercentage(accuracy)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Performance Insights */}
      <div className="performance-section">
        <h3>Performance Insights & Recommendations</h3>
        <div className="insights-grid">
          {performanceMetrics && (
            <div className="insight-card">
              <h4>Portfolio Health</h4>
              <div className="insight-content">
                {performanceMetrics.sharpeRatio > 1 ? (
                  <p className="insight-positive">✅ Strong risk-adjusted returns (Sharpe: {formatNumber(performanceMetrics.sharpeRatio)})</p>
                ) : (
                  <p className="insight-warning">⚠️ Consider optimizing risk-return balance</p>
                )}
                
                {performanceMetrics.maxDrawdown < 15 ? (
                  <p className="insight-positive">✅ Well-controlled maximum drawdown</p>
                ) : (
                  <p className="insight-warning">⚠️ High maximum drawdown detected - consider risk management</p>
                )}
                
                {performanceMetrics.winRate > 60 ? (
                  <p className="insight-positive">✅ Strong win rate of {formatPercentage(performanceMetrics.winRate)}</p>
                ) : (
                  <p className="insight-warning">⚠️ Win rate could be improved</p>
                )}
              </div>
            </div>
          )}

          {aiMetrics && (
            <div className="insight-card">
              <h4>AI Engine Health</h4>
              <div className="insight-content">
                {aiMetrics.accuracy > 75 ? (
                  <p className="insight-positive">✅ Excellent AI accuracy of {formatPercentage(aiMetrics.accuracy)}</p>
                ) : (
                  <p className="insight-warning">⚠️ AI accuracy needs improvement</p>
                )}
                
                {aiMetrics.highConfidenceAccuracy > aiMetrics.lowConfidenceAccuracy + 10 ? (
                  <p className="insight-positive">✅ Good confidence calibration</p>
                ) : (
                  <p className="insight-warning">⚠️ Confidence calibration needs adjustment</p>
                )}
                
                {aiMetrics.averageReturnOnRecommendations > 0 ? (
                  <p className="insight-positive">✅ Positive average returns on recommendations</p>
                ) : (
                  <p className="insight-negative">❌ Negative average returns - review strategy</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Performance;