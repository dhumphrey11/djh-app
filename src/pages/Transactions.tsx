import React, { useState, useEffect } from 'react';
import StockCard from '../components/portfolio/StockCard';
import { Stock } from '../types';
import './Portfolio.css';

const Transactions: React.FC = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);

  return (
    <div className="Transactions">
      <div className="Transactions-header">
        <h1>My Transactions</h1>
        
      </div>

    </div>
  );
};

export default Transactions;