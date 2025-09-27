import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
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

const Admin: React.FC = () => {
  const { currentUser } = useAuth();
  const [lastExecution, setLastExecution] = useState<FunctionLog | null>(null);
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
  }, []);

  if (loading) {
    return (
      <div className="admin-container">
        <h2>Admin Dashboard</h2>
        <p>Loading admin data...</p>
        <p>User: {currentUser?.email} (Role: {currentUser?.role})</p>
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

  const getDuration = () => {
    if (!lastExecution.endTime) return 'In progress...';
    const durationMs = 
      (lastExecution.endTime.seconds - lastExecution.startTime.seconds) * 1000 +
      (lastExecution.endTime.nanoseconds - lastExecution.startTime.nanoseconds) / 1000000;
    return `${durationMs.toFixed(2)} ms`;
  };

  return (
    <div className="admin-container">
      <h2>Stock Price Update Function Status</h2>
      <div className="status-card">
        <h3>Last Execution</h3>
        <div className="status-item">
          <span>Status:</span>
          <span className={`status-${lastExecution.status}`}>
            {lastExecution.status.toUpperCase()}
          </span>
        </div>
        <div className="status-item">
          <span>Start Time:</span>
          <span>{formatDate(lastExecution.startTime)}</span>
        </div>
        {lastExecution.endTime && (
          <div className="status-item">
            <span>End Time:</span>
            <span>{formatDate(lastExecution.endTime)}</span>
          </div>
        )}
        <div className="status-item">
          <span>Duration:</span>
          <span>{getDuration()}</span>
        </div>
        {lastExecution.updatedSymbols && (
          <div className="status-item">
            <span>Updated Symbols:</span>
            <span>{lastExecution.updatedSymbols.join(', ')}</span>
          </div>
        )}
        {lastExecution.error && (
          <div className="status-item error">
            <span>Error:</span>
            <span>{lastExecution.error}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;