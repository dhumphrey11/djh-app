import React from 'react';
import { CashTransaction } from '../../types';
import './TransactionRow.css';

interface CashTransactionRowProps {
  transaction: CashTransaction;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

const formatDate = (timestamp: any): string => {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const CashTransactionRow: React.FC<CashTransactionRowProps> = ({ transaction }) => {
  return (
    <tr className={`TransactionRow ${transaction.transactionType.toLowerCase()}`}>
      <td>{formatDate(transaction.transactionDate)}</td>
      <td>CASH</td>
      <td>{transaction.transactionType}</td>
      <td>-</td>
      <td>-</td>
      <td>{formatCurrency(transaction.amount)}</td>
    </tr>
  );
};

export default CashTransactionRow;