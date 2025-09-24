import React from 'react';
import { Transaction } from '../../types';
import './TransactionRow.css';

interface TransactionRowProps {
  transaction: Transaction;
}

const TransactionRow: React.FC<TransactionRowProps> = ({ transaction }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getTypeClass = (type: string) => {
    return type === 'buy' ? 'transaction-type buy' : 'transaction-type sell';
  };

  return (
    <tr className="transaction-row">
      <td>{formatDate(transaction.date)}</td>
      <td>
        <div>
          <div className="stock-symbol">{transaction.stockSymbol}</div>
          <div className="stock-name">{transaction.stockName}</div>
        </div>
      </td>
      <td>
        <span className={getTypeClass(transaction.type)}>
          {transaction.type.toUpperCase()}
        </span>
      </td>
      <td className="text-right">{transaction.shares}</td>
      <td className="text-right">{formatCurrency(transaction.pricePerShare)}</td>
      <td className="text-right font-weight-bold">{formatCurrency(transaction.totalAmount)}</td>
    </tr>
  );
};

export default TransactionRow;