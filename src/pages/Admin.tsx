import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { useStockData } from '../hooks/useStockData';
import { useTransactions } from '../hooks/useTransactions';
import { useCashTransactions } from '../hooks/useCashTransactions';
import { useRecommendations } from '../hooks/useRecommendations';
import { usePortfolioData } from '../hooks/usePortfolioData';
import './Admin.css';

interface FunctionLog {
  id: string;
  functionName: string;
  startTime: {
    seconds: number;
    nanoseconds: number;
  };
  endTime: {
    seconds: number;
    nanoseconds: number;
  } | null;
  status: 'started' | 'completed' | 'error';
  updatedSymbols?: string[];
  error?: string;
}

interface SystemStats {
  totalUsers: number;
  totalTransactions: number;
  totalCashTransactions: number;
  totalStockSymbols: number;
  totalRecommendations: number;
  databaseSize: string;
  lastDataUpdate: Date;
  systemHealth: 'healthy' | 'warning' | 'critical';
}

const Admin: React.FC = () => {
  const { currentUser } = useAuth();
  
  // Use custom hooks for comprehensive data
  const { stockData, stockDataMap, isLoading: stockLoading } = useStockData();
  const { transactions, isLoading: transactionLoading } = useTransactions();
  const { cashTransactions, isLoading: cashLoading } = useCashTransactions();
  const { allRecommendations, isLoading: recommendationLoading } = useRecommendations();
  const { portfolioSummary } = usePortfolioData({ stockDataMap });
  
  // Local admin state
  const [lastExecution, setLastExecution] = useState<FunctionLog | null>(null);
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLastExecution = async () => {
      try {
        console.log('Current user:', currentUser);
        console.log('User role:', currentUser?.role);
        
        const q = query(
          collection(db, 'functionLogs'),
          orderBy('startTime', 'desc'),
          limit(1)
        );

        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          setLastExecution({
            id: doc.id,
            ...doc.data()
          } as FunctionLog);
        }
        setLoading(false);
      } catch (err) {
        console.error('Admin page error:', err);
        const errorMessage = err instanceof Error ? err.message : 'An error occurred';
        
        // Provide more specific error messages
        if (errorMessage.includes('permission-denied')) {
          setError('Access denied. Please ensure you have admin permissions and try refreshing the page.');
        } else if (errorMessage.includes('Failed to get document')) {
          setError('Unable to access function logs. Check Firestore rules and user permissions.');
        } else {
          setError(errorMessage);
        }
        setLoading(false);
      }
    };

    fetchLastExecution();
    
    // Refresh every minute
    const interval = setInterval(fetchLastExecution, 60000);
    return () => clearInterval(interval);
  }, [currentUser]);

  // Calculate system statistics when data is available
  useEffect(() => {
    if (!stockLoading && !transactionLoading && !cashLoading && !recommendationLoading) {
      const calculateEstimatedSize = (): string => {
        const transactionSize = transactions.length * 200;
        const cashTransactionSize = cashTransactions.length * 150;
        const stockDataSize = stockData.length * 100;
        const recommendationSize = allRecommendations.length * 300;
        
        const totalBytes = transactionSize + cashTransactionSize + stockDataSize + recommendationSize;
        const totalKB = totalBytes / 1024;
        
        return totalKB < 1024 ? `${totalKB.toFixed(2)} KB` : `${(totalKB / 1024).toFixed(2)} MB`;
      };

      const getLastDataUpdate = (): Date => {
        const dates = [
          ...transactions.map(t => t.transactionDateTime.toDate()),
          ...cashTransactions.map(t => t.transactionDate.toDate()),
          ...(lastExecution ? [new Date(lastExecution.startTime.seconds * 1000)] : [])
        ];
        
        return dates.length > 0 ? new Date(Math.max(...dates.map(d => d.getTime()))) : new Date();
      };

      const determineSystemHealth = (): 'healthy' | 'warning' | 'critical' => {
        const lastUpdate = getLastDataUpdate();
        const hoursSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60);
        
        if (lastExecution?.status === 'error') return 'critical';
        if (hoursSinceUpdate > 24) return 'warning';
        if (transactions.length === 0 && cashTransactions.length === 0) return 'warning';
        
        return 'healthy';
      };

      const stats: SystemStats = {
        totalUsers: 1,
        totalTransactions: transactions.length,
        totalCashTransactions: cashTransactions.length,
        totalStockSymbols: stockData.length,
        totalRecommendations: allRecommendations.length,
        databaseSize: calculateEstimatedSize(),
        lastDataUpdate: getLastDataUpdate(),
        systemHealth: determineSystemHealth()
      };
      setSystemStats(stats);
    }
  }, [stockLoading, transactionLoading, cashLoading, recommendationLoading, 
      transactions, cashTransactions, stockData, allRecommendations, lastExecution]);

  if (loading || stockLoading || transactionLoading || cashLoading || recommendationLoading) {
    return (
      <div className="admin-container">
        <h2>Admin Dashboard</h2>
        <p>Loading comprehensive system data...</p>
        <p>User: {currentUser?.email} (Role: {currentUser?.role})</p>
        <div className="loading-progress">
          <div>Stock Data: {stockLoading ? 'Loading...' : '✓ Loaded'}</div>
          <div>Transactions: {transactionLoading ? 'Loading...' : '✓ Loaded'}</div>
          <div>Cash Transactions: {cashLoading ? 'Loading...' : '✓ Loaded'}</div>
          <div>Recommendations: {recommendationLoading ? 'Loading...' : '✓ Loaded'}</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-container">
        <h2>Admin Dashboard</h2>
        <div className="error">
          <h3>Error accessing admin data:</h3>
          <p>{error}</p>
          <div style={{ marginTop: '20px', padding: '10px', background: '#f5f5f5', borderRadius: '4px' }}>
            <h4>Debug Information:</h4>
            <p><strong>Current User:</strong> {currentUser?.email || 'Not logged in'}</p>
            <p><strong>User Role:</strong> {currentUser?.role || 'No role assigned'}</p>
            <p><strong>User ID:</strong> {currentUser?.id || 'No ID'}</p>
          </div>
          <p style={{ marginTop: '10px' }}>
            If you should have admin access, try logging out and back in, or contact support.
          </p>
        </div>
      </div>
    );
  }

  if (!lastExecution) {
    return <div>No function executions found</div>;
  }

  const formatDate = (timestamp: { seconds: number; nanoseconds: number }) => {
    return new Date(timestamp.seconds * 1000).toLocaleString();
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getHealthStatusColor = (health: 'healthy' | 'warning' | 'critical') => {
    switch (health) {
      case 'healthy': return '#4CAF50';
      case 'warning': return '#FF9800';
      case 'critical': return '#f44336';
      default: return '#757575';
    }
  };

  const getDuration = () => {
    if (!lastExecution.endTime) return 'In progress...';
    const durationMs = 
      (lastExecution.endTime.seconds - lastExecution.startTime.seconds) * 1000 +
      (lastExecution.endTime.nanoseconds - lastExecution.startTime.nanoseconds) / 1000000;
    return `${durationMs.toFixed(2)} ms`;
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2>System Administration Dashboard</h2>
        <div className="admin-user-info">
          <span>Logged in as: <strong>{currentUser?.email}</strong></span>
          <span className="user-role">Role: {currentUser?.role}</span>
        </div>
      </div>

      {/* System Health Overview */}
      {systemStats && (
        <div className="admin-section">
          <h3>System Health Overview</h3>
          <div className="system-health-card">
            <div 
              className="health-indicator"
              style={{ 
                backgroundColor: getHealthStatusColor(systemStats.systemHealth),
                color: 'white',
                padding: '10px',
                borderRadius: '8px',
                textAlign: 'center',
                marginBottom: '15px'
              }}
            >
              <span className="health-status">{systemStats.systemHealth.toUpperCase()}</span>
            </div>
            <div className="health-details">
              <p><strong>Last Data Update:</strong> {systemStats.lastDataUpdate.toLocaleString()}</p>
              <p><strong>Estimated Database Size:</strong> {systemStats.databaseSize}</p>
              <p><strong>Minutes Since Last Update:</strong> {Math.floor((Date.now() - systemStats.lastDataUpdate.getTime()) / (1000 * 60))}</p>
            </div>
          </div>
        </div>
      )}

      {/* Database Statistics */}
      {systemStats && (
        <div className="admin-section">
          <h3>Database Statistics</h3>
          <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <div className="stat-card" style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px', textAlign: 'center' }}>
              <div className="stat-number" style={{ fontSize: '2em', fontWeight: 'bold', color: '#007bff' }}>{systemStats.totalUsers}</div>
              <div className="stat-label">Active Users</div>
            </div>
            <div className="stat-card" style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px', textAlign: 'center' }}>
              <div className="stat-number" style={{ fontSize: '2em', fontWeight: 'bold', color: '#28a745' }}>{systemStats.totalTransactions}</div>
              <div className="stat-label">Stock Transactions</div>
            </div>
            <div className="stat-card" style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px', textAlign: 'center' }}>
              <div className="stat-number" style={{ fontSize: '2em', fontWeight: 'bold', color: '#17a2b8' }}>{systemStats.totalCashTransactions}</div>
              <div className="stat-label">Cash Transactions</div>
            </div>
            <div className="stat-card" style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px', textAlign: 'center' }}>
              <div className="stat-number" style={{ fontSize: '2em', fontWeight: 'bold', color: '#fd7e14' }}>{systemStats.totalStockSymbols}</div>
              <div className="stat-label">Tracked Stocks</div>
            </div>
            <div className="stat-card" style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px', textAlign: 'center' }}>
              <div className="stat-number" style={{ fontSize: '2em', fontWeight: 'bold', color: '#6f42c1' }}>{systemStats.totalRecommendations}</div>
              <div className="stat-label">Recommendations</div>
            </div>
          </div>
        </div>
      )}

      {/* Portfolio Summary */}
      {portfolioSummary && (
        <div className="admin-section">
          <h3>Portfolio Summary (Admin View)</h3>
          <div className="portfolio-summary-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
            <div className="summary-card" style={{ padding: '20px', background: '#e8f5e8', borderRadius: '8px', border: '1px solid #28a745' }}>
              <div className="summary-label" style={{ fontSize: '0.9em', color: '#666' }}>Total Portfolio Value</div>
              <div className="summary-value" style={{ fontSize: '1.5em', fontWeight: 'bold', color: '#28a745' }}>{formatCurrency(portfolioSummary.totalPortfolioValue)}</div>
            </div>
            <div className="summary-card" style={{ padding: '20px', background: '#e3f2fd', borderRadius: '8px', border: '1px solid #2196f3' }}>
              <div className="summary-label" style={{ fontSize: '0.9em', color: '#666' }}>Available Cash</div>
              <div className="summary-value" style={{ fontSize: '1.5em', fontWeight: 'bold', color: '#2196f3' }}>{formatCurrency(portfolioSummary.availableCash)}</div>
            </div>
            <div className="summary-card" style={{ padding: '20px', background: portfolioSummary.totalGainLoss >= 0 ? '#e8f5e8' : '#ffebee', borderRadius: '8px', border: `1px solid ${portfolioSummary.totalGainLoss >= 0 ? '#4caf50' : '#f44336'}` }}>
              <div className="summary-label" style={{ fontSize: '0.9em', color: '#666' }}>Total Gain/Loss</div>
              <div className="summary-value" style={{ fontSize: '1.5em', fontWeight: 'bold', color: portfolioSummary.totalGainLoss >= 0 ? '#4caf50' : '#f44336' }}>
                {formatCurrency(portfolioSummary.totalGainLoss)}
              </div>
            </div>
            <div className="summary-card" style={{ padding: '20px', background: '#fff3e0', borderRadius: '8px', border: '1px solid #ff9800' }}>
              <div className="summary-label" style={{ fontSize: '0.9em', color: '#666' }}>Stock Holdings</div>
              <div className="summary-value" style={{ fontSize: '1.5em', fontWeight: 'bold', color: '#ff9800' }}>{portfolioSummary.stockCount}</div>
            </div>
          </div>
        </div>
      )}

      {/* Stock Data Overview */}
      <div className="admin-section">
        <h3>Stock Data Management</h3>
        <div className="stock-overview">
          <p><strong>Currently Tracked Stocks:</strong> {stockData.length}</p>
          <div className="stock-symbols" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', marginTop: '15px' }}>
            {stockData.slice(0, 12).map((stock) => (
              <div key={stock.id} className="stock-card" style={{ padding: '10px', background: '#f8f9fa', borderRadius: '6px', textAlign: 'center' }}>
                <div style={{ fontWeight: 'bold', fontSize: '0.9em' }}>{stock.stockSymbol}</div>
                <div style={{ color: '#28a745', fontWeight: 'bold' }}>{formatCurrency(stock.currentPrice)}</div>
                <div style={{ fontSize: '0.8em', color: '#666' }}>{stock.stockName}</div>
              </div>
            ))}
            {stockData.length > 12 && (
              <div className="stock-card" style={{ padding: '10px', background: '#e9ecef', borderRadius: '6px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div>+{stockData.length - 12} more</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Function Status */}
      {lastExecution && (
        <div className="admin-section">
          <h3>Stock Price Update Function Status</h3>
          <div className="status-card">
            <div className="status-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h4>Last Execution</h4>
              <span className={`status-badge status-${lastExecution.status}`} style={{ 
                padding: '5px 10px', 
                borderRadius: '15px', 
                fontSize: '0.8em', 
                fontWeight: 'bold',
                backgroundColor: lastExecution.status === 'completed' ? '#28a745' : lastExecution.status === 'error' ? '#dc3545' : '#ffc107',
                color: 'white'
              }}>
                {lastExecution.status.toUpperCase()}
              </span>
            </div>
            <div className="status-details">
              <div className="status-item">
                <span><strong>Function Name:</strong></span>
                <span>{lastExecution.functionName}</span>
              </div>
              <div className="status-item">
                <span><strong>Start Time:</strong></span>
                <span>{formatDate(lastExecution.startTime)}</span>
              </div>
              {lastExecution.endTime && (
                <div className="status-item">
                  <span><strong>End Time:</strong></span>
                  <span>{formatDate(lastExecution.endTime)}</span>
                </div>
              )}
              <div className="status-item">
                <span><strong>Duration:</strong></span>
                <span>{getDuration()}</span>
              </div>
              {lastExecution.updatedSymbols && (
                <div className="status-item">
                  <span><strong>Updated Symbols ({lastExecution.updatedSymbols.length}):</strong></span>
                  <span>{lastExecution.updatedSymbols.join(', ')}</span>
                </div>
              )}
              {lastExecution.error && (
                <div className="status-item error" style={{ color: '#dc3545' }}>
                  <span><strong>Error:</strong></span>
                  <span>{lastExecution.error}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Data Insights */}
      <div className="admin-section">
        <h3>Data Quality Insights</h3>
        <div className="insights-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          <div className="insight-card" style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px', borderLeft: '4px solid #007bff' }}>
            <div className="insight-title" style={{ fontWeight: 'bold', marginBottom: '10px', color: '#007bff' }}>Transaction Analysis</div>
            <div className="insight-content">
              <p><strong>Last Transaction:</strong> {transactions.length > 0 
                ? transactions[0]?.transactionDateTime.toDate().toLocaleDateString()
                : 'No transactions'}</p>
              <p><strong>Avg. Daily Transactions:</strong> {Math.round(transactions.length / 30)}</p>
              <p><strong>Most Recent Symbol:</strong> {transactions[0]?.stockSymbol || 'N/A'}</p>
            </div>
          </div>
          <div className="insight-card" style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px', borderLeft: '4px solid #28a745' }}>
            <div className="insight-title" style={{ fontWeight: 'bold', marginBottom: '10px', color: '#28a745' }}>Cash Flow Analysis</div>
            <div className="insight-content">
              <p><strong>Last Cash Transaction:</strong> {cashTransactions.length > 0 
                ? cashTransactions[0]?.transactionDate.toDate().toLocaleDateString()
                : 'None'}</p>
              <p><strong>Total Cash Flow:</strong> {formatCurrency(
                cashTransactions.reduce((sum, tx) => 
                  sum + (tx.transactionType === 'Deposit' ? tx.amount : -tx.amount), 0))}</p>
              <p><strong>Transaction Count:</strong> {cashTransactions.length}</p>
            </div>
          </div>
          <div className="insight-card" style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px', borderLeft: '4px solid #6f42c1' }}>
            <div className="insight-title" style={{ fontWeight: 'bold', marginBottom: '10px', color: '#6f42c1' }}>Recommendations</div>
            <div className="insight-content">
              <p><strong>Active Recommendations:</strong> {allRecommendations.filter(r => r.status === 'pending').length}</p>
              <p><strong>Success Rate:</strong> {allRecommendations.length > 0 
                ? Math.round((allRecommendations.filter(r => r.status === 'executed').length / allRecommendations.length) * 100)
                : 0}%</p>
              <p><strong>Total Recommendations:</strong> {allRecommendations.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-footer" style={{ marginTop: '40px', padding: '20px', background: '#f8f9fa', borderRadius: '8px', textAlign: 'center' }}>
        <p><small>Dashboard auto-refreshes every minute • Last refresh: {new Date().toLocaleTimeString()}</small></p>
      </div>
    </div>
  );
};

export default Admin;