import { collection, addDoc, getDocs, query, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { CashTransaction } from '../types';

const COLLECTION_NAME = 'cashTransactions';

export const cashService = {
  // Add a new cash transaction
  async addCashTransaction(transaction: Omit<CashTransaction, 'id'>): Promise<string> {
    const cashTransactionsRef = collection(db, COLLECTION_NAME);
    const docRef = await addDoc(cashTransactionsRef, {
      ...transaction,
      transactionDate: Timestamp.now()
    });
    return docRef.id;
  },

  // Get all cash transactions
  async getCashTransactions(): Promise<CashTransaction[]> {
    const cashTransactionsRef = collection(db, COLLECTION_NAME);
    const q = query(cashTransactionsRef, orderBy('transactionDate', 'asc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as CashTransaction));
  },

  // Get recent cash transactions
  async getRecentCashTransactions(limitCount: number = 5): Promise<CashTransaction[]> {
    const cashTransactionsRef = collection(db, COLLECTION_NAME);
    const q = query(
      cashTransactionsRef,
      orderBy('transactionDate', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as CashTransaction));
  },

  // Calculate current cash balance
  async calculateCashBalance(): Promise<number> {
    const transactions = await this.getCashTransactions();
    return transactions.reduce((balance, transaction) => {
      if (transaction.transactionType === 'Deposit') {
        return balance + transaction.amount;
      } else {
        return balance - transaction.amount;
      }
    }, 0);
  }
};