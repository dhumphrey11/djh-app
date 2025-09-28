import React from 'react';
import SymbolsManagement from '../components/symbols/SymbolsManagement';
import './Symbols.css';

const Symbols: React.FC = () => {

  return (
    <div className="symbols-container">
      <div className="symbols-header">
        <h2>Stock Symbols Universe</h2>
        <p className="symbols-description">
          Explore and manage the universe of stock symbols available for monitoring. 
          View active symbols from your portfolio and recommendations, and browse the 
          complete symbol database with sector and industry categorization.
        </p>
      </div>

      <div className="symbols-content">
        <SymbolsManagement />
      </div>
    </div>
  );
};

export default Symbols;