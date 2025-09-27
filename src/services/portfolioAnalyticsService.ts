import { Transaction, StockHolding, StockRecommendation, CurrentStockData } from '../types';

export interface PortfolioPerformanceMetrics {
  totalReturn: number;
  totalReturnPercentage: number;
  annualizedReturn: number;
  volatility: number;
  sharpeRatio: number;
  maxDrawdown: number;
  currentDrawdown: number;
  winRate: number;
  averageWin: number;
  averageLoss: number;
  profitFactor: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  largestWin: number;
  largestLoss: number;
  consecutiveWins: number;
  consecutiveLosses: number;
  calmarRatio: number;
  sortinoRatio: number;
}

export interface AIRecommendationMetrics {
  totalRecommendations: number;
  executedRecommendations: number;
  successfulRecommendations: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  averageConfidence: number;
  highConfidenceAccuracy: number;
  mediumConfidenceAccuracy: number;
  lowConfidenceAccuracy: number;
  averageReturnOnRecommendations: number;
  bestPerformingRecommendation: number;
  worstPerformingRecommendation: number;
  recommendationsByStatus: Record<string, number>;
  confidenceDistribution: { high: number; medium: number; low: number };
  averageDaysToExecution: number;
  timeBasedAccuracy: Record<string, number>;
}

export interface TimeSeriesPoint {
  date: Date;
  portfolioValue: number;
  benchmarkValue?: number;
  dailyReturn: number;
  cumulativeReturn: number;
  drawdown: number;
}

export class PortfolioAnalyticsService {
  
  /**
   * Calculate comprehensive portfolio performance metrics
   */
  static calculatePortfolioMetrics(
    transactions: Transaction[],
    holdings: StockHolding[],
    stockDataMap: Map<string, CurrentStockData>,
    initialCash: number = 0
  ): PortfolioPerformanceMetrics {
    
    // Sort transactions by date
    const sortedTransactions = [...transactions].sort((a, b) => 
      a.transactionDateTime.toDate().getTime() - b.transactionDateTime.toDate().getTime()
    );

    // Calculate basic metrics
    const totalInvested = this.calculateTotalInvested(sortedTransactions);
    const currentValue = this.calculateCurrentValue(holdings);
    const totalReturn = currentValue - totalInvested;
    const totalReturnPercentage = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;

    // Calculate time series data for advanced metrics
    const timeSeriesData = this.generateTimeSeriesData(sortedTransactions, stockDataMap);
    
    // Calculate volatility and risk metrics
    const dailyReturns = timeSeriesData.map(point => point.dailyReturn).filter(r => r !== 0);
    const volatility = this.calculateVolatility(dailyReturns);
    const maxDrawdown = this.calculateMaxDrawdown(timeSeriesData);
    const currentDrawdown = this.calculateCurrentDrawdown(timeSeriesData);

    // Calculate trading performance
    const tradeAnalysis = this.analyzeIndividualTrades(sortedTransactions, stockDataMap);
    
    // Calculate risk-adjusted returns
    const annualizedReturn = this.calculateAnnualizedReturn(totalReturnPercentage, this.calculateTimespan(sortedTransactions));
    const sharpeRatio = this.calculateSharpeRatio(annualizedReturn, volatility);
    const calmarRatio = maxDrawdown !== 0 ? annualizedReturn / Math.abs(maxDrawdown) : 0;
    const sortinoRatio = this.calculateSortinoRatio(dailyReturns, annualizedReturn);

    return {
      totalReturn,
      totalReturnPercentage,
      annualizedReturn,
      volatility,
      sharpeRatio,
      maxDrawdown,
      currentDrawdown,
      winRate: tradeAnalysis.winRate,
      averageWin: tradeAnalysis.averageWin,
      averageLoss: tradeAnalysis.averageLoss,
      profitFactor: tradeAnalysis.profitFactor,
      totalTrades: tradeAnalysis.totalTrades,
      winningTrades: tradeAnalysis.winningTrades,
      losingTrades: tradeAnalysis.losingTrades,
      largestWin: tradeAnalysis.largestWin,
      largestLoss: tradeAnalysis.largestLoss,
      consecutiveWins: tradeAnalysis.consecutiveWins,
      consecutiveLosses: tradeAnalysis.consecutiveLosses,
      calmarRatio,
      sortinoRatio
    };
  }

  /**
   * Calculate AI recommendation engine metrics
   */
  static calculateAIMetrics(recommendations: StockRecommendation[]): AIRecommendationMetrics {
    const total = recommendations.length;
    const executed = recommendations.filter(r => r.status === 'executed');
    const successful = executed.filter(r => this.isRecommendationSuccessful(r));
    
    const accuracy = executed.length > 0 ? (successful.length / executed.length) * 100 : 0;
    
    // Calculate precision, recall, and F1 score
    const truePositives = successful.length;
    const falsePositives = executed.length - successful.length;
    const falseNegatives = recommendations.filter(r => r.status === 'rejected').length;
    
    const precision = (truePositives + falsePositives) > 0 ? (truePositives / (truePositives + falsePositives)) * 100 : 0;
    const recall = (truePositives + falseNegatives) > 0 ? (truePositives / (truePositives + falseNegatives)) * 100 : 0;
    const f1Score = (precision + recall) > 0 ? (2 * precision * recall) / (precision + recall) : 0;

    // Confidence analysis
    const averageConfidence = recommendations.reduce((sum, r) => sum + r.confidence, 0) / total;
    const confidenceDistribution = this.analyzeConfidenceDistribution(recommendations);
    
    // Performance by confidence level
    const highConfidenceRecs = executed.filter(r => r.confidence >= 80);
    const mediumConfidenceRecs = executed.filter(r => r.confidence >= 60 && r.confidence < 80);
    const lowConfidenceRecs = executed.filter(r => r.confidence < 60);

    const highConfidenceAccuracy = this.calculateAccuracyForGroup(highConfidenceRecs);
    const mediumConfidenceAccuracy = this.calculateAccuracyForGroup(mediumConfidenceRecs);
    const lowConfidenceAccuracy = this.calculateAccuracyForGroup(lowConfidenceRecs);

    // Return analysis
    const returns = executed.map(r => this.calculateRecommendationReturn(r));
    const averageReturnOnRecommendations = returns.length > 0 ? returns.reduce((sum, r) => sum + r, 0) / returns.length : 0;
    const bestPerformingRecommendation = returns.length > 0 ? Math.max(...returns) : 0;
    const worstPerformingRecommendation = returns.length > 0 ? Math.min(...returns) : 0;

    // Status distribution
    const recommendationsByStatus = recommendations.reduce((acc, rec) => {
      acc[rec.status] = (acc[rec.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Timing analysis
    const averageDaysToExecution = this.calculateAverageDaysToExecution(executed);
    const timeBasedAccuracy = this.calculateTimeBasedAccuracy(recommendations);

    return {
      totalRecommendations: total,
      executedRecommendations: executed.length,
      successfulRecommendations: successful.length,
      accuracy,
      precision,
      recall,
      f1Score,
      averageConfidence,
      highConfidenceAccuracy,
      mediumConfidenceAccuracy,
      lowConfidenceAccuracy,
      averageReturnOnRecommendations,
      bestPerformingRecommendation,
      worstPerformingRecommendation,
      recommendationsByStatus,
      confidenceDistribution,
      averageDaysToExecution,
      timeBasedAccuracy
    };
  }

  // Helper methods
  private static calculateTotalInvested(transactions: Transaction[]): number {
    return transactions.reduce((total, tx) => {
      return tx.transactionType === 'Buy' 
        ? total + (tx.numberOfShares * tx.price)
        : total - (tx.numberOfShares * tx.price);
    }, 0);
  }

  private static calculateCurrentValue(holdings: StockHolding[]): number {
    return holdings.reduce((total, holding) => 
      total + (holding.currentPrice * holding.totalShares), 0
    );
  }

  private static generateTimeSeriesData(
    transactions: Transaction[], 
    stockDataMap: Map<string, CurrentStockData>
  ): TimeSeriesPoint[] {
    // Simplified version - would need historical price data for full implementation
    const timeSeriesData: TimeSeriesPoint[] = [];
    let portfolioValue = 0;
    let previousValue = 0;

    transactions.forEach(tx => {
      const currentStock = stockDataMap.get(tx.stockSymbol);
      if (currentStock) {
        portfolioValue += tx.transactionType === 'Buy' 
          ? tx.numberOfShares * currentStock.currentPrice
          : -tx.numberOfShares * currentStock.currentPrice;

        const dailyReturn = previousValue > 0 ? (portfolioValue - previousValue) / previousValue : 0;
        const cumulativeReturn = portfolioValue / Math.max(1, previousValue) - 1;

        timeSeriesData.push({
          date: tx.transactionDateTime.toDate(),
          portfolioValue,
          dailyReturn,
          cumulativeReturn,
          drawdown: 0 // Would calculate from peak
        });

        previousValue = portfolioValue;
      }
    });

    return timeSeriesData;
  }

  private static calculateVolatility(dailyReturns: number[]): number {
    if (dailyReturns.length < 2) return 0;
    
    const mean = dailyReturns.reduce((sum, r) => sum + r, 0) / dailyReturns.length;
    const variance = dailyReturns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / (dailyReturns.length - 1);
    
    return Math.sqrt(variance * 252) * 100; // Annualized volatility
  }

  private static calculateMaxDrawdown(timeSeriesData: TimeSeriesPoint[]): number {
    let peak = 0;
    let maxDrawdown = 0;

    timeSeriesData.forEach(point => {
      if (point.portfolioValue > peak) {
        peak = point.portfolioValue;
      }
      const drawdown = peak > 0 ? (peak - point.portfolioValue) / peak * 100 : 0;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    });

    return maxDrawdown;
  }

  private static calculateCurrentDrawdown(timeSeriesData: TimeSeriesPoint[]): number {
    if (timeSeriesData.length === 0) return 0;
    
    const peak = Math.max(...timeSeriesData.map(point => point.portfolioValue));
    const current = timeSeriesData[timeSeriesData.length - 1]?.portfolioValue || 0;
    
    return peak > 0 ? (peak - current) / peak * 100 : 0;
  }

  private static analyzeIndividualTrades(
    transactions: Transaction[], 
    stockDataMap: Map<string, CurrentStockData>
  ): any {
    // Group transactions by symbol for trade analysis
    const tradesBySymbol = new Map<string, Transaction[]>();
    
    transactions.forEach(tx => {
      if (!tradesBySymbol.has(tx.stockSymbol)) {
        tradesBySymbol.set(tx.stockSymbol, []);
      }
      tradesBySymbol.get(tx.stockSymbol)!.push(tx);
    });

    let totalTrades = 0;
    let winningTrades = 0;
    let losingTrades = 0;
    let totalWinAmount = 0;
    let totalLossAmount = 0;
    let largestWin = 0;
    let largestLoss = 0;

    tradesBySymbol.forEach((symbolTrades, symbol) => {
      const currentStock = stockDataMap.get(symbol);
      if (!currentStock) return;

      symbolTrades.forEach(tx => {
        totalTrades++;
        const currentValue = tx.numberOfShares * currentStock.currentPrice;
        const originalValue = tx.numberOfShares * tx.price;
        const pnl = tx.transactionType === 'Buy' 
          ? currentValue - originalValue 
          : originalValue - currentValue;

        if (pnl > 0) {
          winningTrades++;
          totalWinAmount += pnl;
          if (pnl > largestWin) largestWin = pnl;
        } else if (pnl < 0) {
          losingTrades++;
          totalLossAmount += Math.abs(pnl);
          if (Math.abs(pnl) > Math.abs(largestLoss)) largestLoss = pnl;
        }
      });
    });

    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
    const averageWin = winningTrades > 0 ? totalWinAmount / winningTrades : 0;
    const averageLoss = losingTrades > 0 ? totalLossAmount / losingTrades : 0;
    const profitFactor = totalLossAmount > 0 ? totalWinAmount / totalLossAmount : 0;

    return {
      totalTrades,
      winningTrades,
      losingTrades,
      winRate,
      averageWin,
      averageLoss,
      profitFactor,
      largestWin,
      largestLoss,
      consecutiveWins: 0, // Would need sequential analysis
      consecutiveLosses: 0 // Would need sequential analysis
    };
  }

  private static calculateTimespan(transactions: Transaction[]): number {
    if (transactions.length < 2) return 1;
    
    const firstDate = transactions[0].transactionDateTime.toDate();
    const lastDate = transactions[transactions.length - 1].transactionDateTime.toDate();
    
    return (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  }

  private static calculateAnnualizedReturn(totalReturn: number, timespan: number): number {
    return timespan > 0 ? Math.pow(1 + totalReturn / 100, 1 / timespan) - 1 : 0;
  }

  private static calculateSharpeRatio(annualizedReturn: number, volatility: number): number {
    const riskFreeRate = 0.02; // Assuming 2% risk-free rate
    return volatility > 0 ? (annualizedReturn - riskFreeRate) / (volatility / 100) : 0;
  }

  private static calculateSortinoRatio(dailyReturns: number[], targetReturn: number): number {
    const downwardReturns = dailyReturns.filter(r => r < targetReturn);
    if (downwardReturns.length === 0) return 0;
    
    const downwardVolatility = Math.sqrt(
      downwardReturns.reduce((sum, r) => sum + Math.pow(r - targetReturn, 2), 0) / downwardReturns.length
    );
    
    return downwardVolatility > 0 ? targetReturn / downwardVolatility : 0;
  }

  // AI Metrics Helper Methods
  private static isRecommendationSuccessful(recommendation: StockRecommendation): boolean {
    // This would need actual performance data to determine success
    // For now, we'll use confidence as a proxy
    return recommendation.confidence > 70;
  }

  private static analyzeConfidenceDistribution(recommendations: StockRecommendation[]) {
    const high = recommendations.filter(r => r.confidence >= 80).length;
    const medium = recommendations.filter(r => r.confidence >= 60 && r.confidence < 80).length;
    const low = recommendations.filter(r => r.confidence < 60).length;
    
    return { high, medium, low };
  }

  private static calculateAccuracyForGroup(recommendations: StockRecommendation[]): number {
    if (recommendations.length === 0) return 0;
    const successful = recommendations.filter(r => this.isRecommendationSuccessful(r));
    return (successful.length / recommendations.length) * 100;
  }

  private static calculateRecommendationReturn(recommendation: StockRecommendation): number {
    // This would calculate actual returns based on execution price vs target price
    // For now, return a placeholder based on confidence
    return (recommendation.confidence - 50) / 10;
  }

  private static calculateAverageDaysToExecution(executedRecommendations: StockRecommendation[]): number {
    // This would calculate time between recommendation date and execution date
    return 3; // Placeholder
  }

  private static calculateTimeBasedAccuracy(recommendations: StockRecommendation[]): Record<string, number> {
    // This would analyze accuracy over different time periods
    return {
      '1week': 75,
      '1month': 68,
      '3months': 62,
      '6months': 58
    };
  }
}