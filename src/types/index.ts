export interface Stock {
  id: string;
  symbol: string;
  name: string;
  currentPrice: number;
  shares: number;
  purchasePrice: number;
  purchaseDate: string;
  totalValue: number;
  gainLoss: number;
  gainLossPercentage: number;
}

export interface Transaction {
  id: string;
  stockSymbol: string;
  stockName: string;
  type: 'buy' | 'sell';
  shares: number;
  pricePerShare: number;
  totalAmount: number;
  date: string;
  notes?: string;
}

export interface Portfolio {
  id: string;
  name: string;
  totalValue: number;
  totalGainLoss: number;
  totalGainLossPercentage: number;
  stocks: Stock[];
  createdAt: string;
  updatedAt: string;
}

export interface DashboardData {
  totalPortfolioValue: number;
  totalGainLoss: number;
  totalGainLossPercentage: number;
  portfolioCount: number;
  stockCount: number;
  recentTransactions: Transaction[];
}