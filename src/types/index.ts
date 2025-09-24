import { Timestamp } from 'firebase/firestore';

export interface Transaction {
  id: string;
  stockSymbol: string;
  numberOfShares: number;
  transactionDateTime: Timestamp;
  transactionType: 'Buy' | 'Sell';
  price: number;
}

export interface CashTransaction {
  id: string;
  transactionDate: Timestamp;
  amount: number;
  transactionType: 'Deposit' | 'Withdrawal';
  description?: string;
}

export interface CurrentStockData {
  id: string;
  stockSymbol: string;
  stockName: string;
  currentPrice: number;
}

// Computed holding from transactions
export interface StockHolding {
  stockSymbol: string;
  stockName: string;
  currentPrice: number;
  totalShares: number;
  averageCost: number;
  totalValue: number;
  gainLoss: number;
  gainLossPercentage: number;
}

export interface PortfolioSummary {
  totalPortfolioValue: number;
  totalGainLoss: number;
  totalGainLossPercentage: number;
  stockCount: number;
  cashBalance: number;
  availableCash: number;
}

export interface DashboardData extends PortfolioSummary {
  recentTransactions: Transaction[];
  recentCashTransactions: CashTransaction[];
}

export interface StockRecommendation {
  id: string;
  stockSymbol: string;
  stockName: string;
  currentPrice: number;
  targetPrice: number;
  recommendationType: 'Buy' | 'Hold' | 'Sell';
  confidence: number; // 0-100
  suggestedInvestmentAmount: number;
  recommendedHoldingPeriodDays: number;
  reasoning: string;
  createdAt: Timestamp;
  executed: boolean;
  status: 'pending' | 'executed' | 'expired' | 'rejected';
  relatedTransactionId?: string; // If executed, link to the transaction
  aiModel: string; // Identifier for the AI model that generated this recommendation
  metadata?: {
    [key: string]: any; // Additional AI-specific metadata
  };
}