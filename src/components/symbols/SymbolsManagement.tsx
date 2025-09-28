import React, { useState, useEffect } from 'react';
import { useActiveSymbols } from '../../hooks/useActiveSymbols';
import { useUniverseSymbols } from '../../hooks/useUniverseSymbols';
import { useAuth } from '../../context/AuthContext';
import { ActiveSymbol, UniverseSymbol } from '../../types';
import './SymbolsManagement.css';

interface SymbolsManagementProps {}

const SymbolsManagement: React.FC<SymbolsManagementProps> = () => {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'admin';
  
  const {
    activeSymbols,
    loading: activeLoading,
    error: activeError,
    syncActiveSymbols,
    deactivateSymbol,
    deleteSymbol: deleteActiveSymbol
  } = useActiveSymbols();

  const {
    universeSymbols,
    loading: universeLoading,
    error: universeError,
    addUniverseSymbol,
    updateUniverseSymbol,
    deleteUniverseSymbol,
    toggleSymbolStatus,
    updateSymbolPriority,
    getStatistics
  } = useUniverseSymbols();

  const [activeTab, setActiveTab] = useState<'active' | 'universe'>('active');
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statistics, setStatistics] = useState<any>(null);

  const [newSymbol, setNewSymbol] = useState({
    symbol: '',
    name: '',
    sector: '',
    industry: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
    notes: ''
  });

  useEffect(() => {
    loadStatistics();
  }, [universeSymbols]);

  const loadStatistics = async () => {
    try {
      const stats = await getStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  const handleSyncActiveSymbols = async () => {
    try {
      await syncActiveSymbols();
    } catch (error) {
      console.error('Error syncing active symbols:', error);
    }
  };

  const handleAddUniverseSymbol = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addUniverseSymbol({
        ...newSymbol,
        isActive: true
      });
      setNewSymbol({
        symbol: '',
        name: '',
        sector: '',
        industry: '',
        priority: 'medium',
        notes: ''
      });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding symbol:', error);
    }
  };

  const handleDeactivateActive = async (id: string) => {
    if (window.confirm('Are you sure you want to deactivate this symbol?')) {
      try {
        await deactivateSymbol(id);
      } catch (error) {
        console.error('Error deactivating symbol:', error);
      }
    }
  };

  const handleDeleteActive = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this symbol? This action cannot be undone.')) {
      try {
        await deleteActiveSymbol(id);
      } catch (error) {
        console.error('Error deleting symbol:', error);
      }
    }
  };

  const handleToggleUniverseStatus = async (id: string, isActive: boolean) => {
    try {
      await toggleSymbolStatus(id, !isActive);
    } catch (error) {
      console.error('Error toggling symbol status:', error);
    }
  };

  const handleDeleteUniverse = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this symbol? This action cannot be undone.')) {
      try {
        await deleteUniverseSymbol(id);
      } catch (error) {
        console.error('Error deleting universe symbol:', error);
      }
    }
  };

  const handlePriorityChange = async (id: string, priority: 'high' | 'medium' | 'low') => {
    try {
      await updateSymbolPriority(id, priority);
    } catch (error) {
      console.error('Error updating priority:', error);
    }
  };

  const filteredActiveSymbols = activeSymbols.filter(symbol =>
    symbol.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    symbol.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUniverseSymbols = universeSymbols.filter(symbol =>
    symbol.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    symbol.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    symbol.sector?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    symbol.industry?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (activeLoading || universeLoading) {
    return <div className="loading">Loading symbols management...</div>;
  }

  return (
    <div className="symbols-management">
      <div className="symbols-header">
        <h3>Symbols Management</h3>
        {isAdmin && (
          <div className="symbols-actions">
            <button className="btn-sync" onClick={handleSyncActiveSymbols}>
              Sync Active Symbols
            </button>
            <button className="btn-add" onClick={() => setShowAddForm(!showAddForm)}>
              Add Universe Symbol
            </button>
          </div>
        )}
      </div>

      {(activeError || universeError) && (
        <div className="error">
          {activeError || universeError}
        </div>
      )}

      {statistics && (
        <div className="symbols-stats">
          <div className="stat-card">
            <h4>Active Symbols</h4>
            <div className="stat-value">{activeSymbols.length}</div>
          </div>
          <div className="stat-card">
            <h4>Universe Total</h4>
            <div className="stat-value">{statistics.total}</div>
          </div>
          <div className="stat-card">
            <h4>High Priority</h4>
            <div className="stat-value">{statistics.byPriority.high}</div>
          </div>
          <div className="stat-card">
            <h4>Active Universe</h4>
            <div className="stat-value">{statistics.active}</div>
          </div>
        </div>
      )}

      {isAdmin && showAddForm && (
        <div className="add-symbol-form">
          <h4>Add New Universe Symbol</h4>
          <form onSubmit={handleAddUniverseSymbol}>
            <div className="form-row">
              <div className="form-group">
                <label>Symbol *</label>
                <input
                  type="text"
                  value={newSymbol.symbol}
                  onChange={(e) => setNewSymbol({ ...newSymbol, symbol: e.target.value.toUpperCase() })}
                  required
                  placeholder="e.g., AAPL"
                />
              </div>
              <div className="form-group">
                <label>Company Name *</label>
                <input
                  type="text"
                  value={newSymbol.name}
                  onChange={(e) => setNewSymbol({ ...newSymbol, name: e.target.value })}
                  required
                  placeholder="e.g., Apple Inc."
                />
              </div>
              <div className="form-group">
                <label>Priority</label>
                <select
                  value={newSymbol.priority}
                  onChange={(e) => setNewSymbol({ ...newSymbol, priority: e.target.value as 'high' | 'medium' | 'low' })}
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Sector</label>
                <input
                  type="text"
                  value={newSymbol.sector}
                  onChange={(e) => setNewSymbol({ ...newSymbol, sector: e.target.value })}
                  placeholder="e.g., Technology"
                />
              </div>
              <div className="form-group">
                <label>Industry</label>
                <input
                  type="text"
                  value={newSymbol.industry}
                  onChange={(e) => setNewSymbol({ ...newSymbol, industry: e.target.value })}
                  placeholder="e.g., Consumer Electronics"
                />
              </div>
            </div>
            <div className="form-group">
              <label>Notes</label>
              <textarea
                value={newSymbol.notes}
                onChange={(e) => setNewSymbol({ ...newSymbol, notes: e.target.value })}
                placeholder="Additional notes about this symbol..."
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-add">Add Symbol</button>
              <button type="button" className="btn-secondary" onClick={() => setShowAddForm(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="search-box">
        <input
          type="text"
          placeholder="Search symbols..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="symbols-tabs">
        <button
          className={`tab-button ${activeTab === 'active' ? 'active' : ''}`}
          onClick={() => setActiveTab('active')}
        >
          Active Symbols ({activeSymbols.length})
        </button>
        <button
          className={`tab-button ${activeTab === 'universe' ? 'active' : ''}`}
          onClick={() => setActiveTab('universe')}
        >
          Universe Symbols ({universeSymbols.length})
        </button>
      </div>

      <div className="symbols-table-container">
        {activeTab === 'active' ? (
          <table className="symbols-table">
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Name</th>
                <th>Source</th>
                <th>Portfolio Qty</th>
                <th>Status</th>
                <th>Last Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredActiveSymbols.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty-state">
                    <h4>No active symbols found</h4>
                    <p>Try syncing active symbols or adjusting your search.</p>
                  </td>
                </tr>
              ) : (
                filteredActiveSymbols.map((symbol) => (
                  <tr key={symbol.id}>
                    <td><strong>{symbol.symbol}</strong></td>
                    <td>{symbol.name || 'N/A'}</td>
                    <td>
                      <span className={`source-badge source-${symbol.source}`}>
                        {symbol.source}
                      </span>
                    </td>
                    <td>{symbol.portfolioQuantity || 'N/A'}</td>
                    <td>
                      <span className={`status-badge status-${symbol.isActive ? 'active' : 'inactive'}`}>
                        {symbol.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>{symbol.lastUpdated?.toDate().toLocaleDateString()}</td>
                    <td>
                      {isAdmin ? (
                        <div className="symbol-actions">
                          <button
                            className="btn-sm btn-secondary"
                            onClick={() => handleDeactivateActive(symbol.id!)}
                            title="Deactivate"
                          >
                            Deactivate
                          </button>
                          <button
                            className="btn-sm btn-danger"
                            onClick={() => handleDeleteActive(symbol.id!)}
                            title="Delete"
                          >
                            Delete
                          </button>
                        </div>
                      ) : (
                        <span className="text-muted">View Only</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        ) : (
          <table className="symbols-table">
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Name</th>
                <th>Sector</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Added</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUniverseSymbols.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty-state">
                    <h4>No universe symbols found</h4>
                    <p>Add some symbols to start building your monitoring universe.</p>
                  </td>
                </tr>
              ) : (
                filteredUniverseSymbols.map((symbol) => (
                  <tr key={symbol.id}>
                    <td><strong>{symbol.symbol}</strong></td>
                    <td>{symbol.name}</td>
                    <td>{symbol.sector || 'N/A'}</td>
                    <td>
                      {isAdmin ? (
                        <select
                          value={symbol.priority}
                          onChange={(e) => handlePriorityChange(symbol.id!, e.target.value as 'high' | 'medium' | 'low')}
                          className={`priority-badge priority-${symbol.priority}`}
                        >
                          <option value="high">High</option>
                          <option value="medium">Medium</option>
                          <option value="low">Low</option>
                        </select>
                      ) : (
                        <span className={`priority-badge priority-${symbol.priority}`}>
                          {symbol.priority.charAt(0).toUpperCase() + symbol.priority.slice(1)}
                        </span>
                      )}
                    </td>
                    <td>
                      <span className={`status-badge status-${symbol.isActive ? 'active' : 'inactive'}`}>
                        {symbol.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>{symbol.addedAt?.toDate().toLocaleDateString()}</td>
                    <td>
                      {isAdmin ? (
                        <div className="symbol-actions">
                          <button
                            className={`btn-sm ${symbol.isActive ? 'btn-secondary' : 'btn-success'}`}
                            onClick={() => handleToggleUniverseStatus(symbol.id!, symbol.isActive)}
                            title={symbol.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {symbol.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            className="btn-sm btn-danger"
                            onClick={() => handleDeleteUniverse(symbol.id!)}
                            title="Delete"
                          >
                            Delete
                          </button>
                        </div>
                      ) : (
                        <span className="text-muted">View Only</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default SymbolsManagement;