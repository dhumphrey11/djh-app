import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
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
  const [lastExecution, setLastExecution] = useState<FunctionLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLastExecution = async () => {
      try {
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
        setError(err instanceof Error ? err.message : 'An error occurred');
        setLoading(false);
      }
    };

    fetchLastExecution();
    
    // Refresh every minute
    const interval = setInterval(fetchLastExecution, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
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