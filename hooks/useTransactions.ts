import { useState, useEffect, useCallback } from 'react';
import { HomeGoalTransaction } from '../types';

// Mock data for development
const mockTransactions: HomeGoalTransaction[] = [
  {
    id: 'tx-1',
    userId: 'user-1',
    type: 'cashback',
    amount: 30,
    source: 'rent',
    description: 'Cashback pagamento affitto',
    createdAt: '2024-01-15T10:30:00Z',
    metadata: {
      rentPaymentId: 'rent-123',
    },
  },
  {
    id: 'tx-2',
    userId: 'user-1',
    type: 'deposit',
    amount: 1000,
    source: 'manual',
    description: 'Deposito manuale',
    createdAt: '2024-01-10T14:20:00Z',
  },
  {
    id: 'tx-3',
    userId: 'user-1',
    type: 'bonus',
    amount: 50,
    source: 'referral',
    description: 'Bonus referral amico',
    createdAt: '2024-01-05T09:15:00Z',
    metadata: {
      referralUserId: 'user-2',
    },
  },
  {
    id: 'tx-4',
    userId: 'user-1',
    type: 'cashback',
    amount: 25,
    source: 'rent',
    description: 'Cashback pagamento affitto',
    createdAt: '2024-01-01T10:30:00Z',
    metadata: {
      rentPaymentId: 'rent-124',
    },
  },
  {
    id: 'tx-5',
    userId: 'user-1',
    type: 'deposit',
    amount: 500,
    source: 'manual',
    description: 'Deposito manuale',
    createdAt: '2023-12-20T16:45:00Z',
  },
  {
    id: 'tx-6',
    userId: 'user-1',
    type: 'bonus',
    amount: 20,
    source: 'streak',
    description: 'Bonus pagamenti consecutivi',
    createdAt: '2023-12-15T08:30:00Z',
  },
  {
    id: 'tx-7',
    userId: 'user-1',
    type: 'redeem',
    amount: -2000,
    source: 'withdrawal',
    description: 'Prelievo bonifico bancario',
    createdAt: '2023-12-01T12:00:00Z',
  },
];

export type TransactionFilter = 'all' | 'cashback' | 'deposit' | 'bonus' | 'redeem';

export const useTransactions = (filter: TransactionFilter = 'all') => {
  const [transactions, setTransactions] = useState<HomeGoalTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      let filteredTransactions = mockTransactions;
      
      if (filter !== 'all') {
        filteredTransactions = mockTransactions.filter(tx => {
          switch (filter) {
            case 'cashback':
              return tx.type === 'cashback';
            case 'deposit':
              return tx.type === 'deposit';
            case 'bonus':
              return tx.type === 'bonus';
            case 'redeem':
              return tx.type === 'redeem';
            default:
              return true;
          }
        });
      }
      
      // Sort by date (newest first)
      filteredTransactions.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      setTransactions(filteredTransactions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nel caricamento delle transazioni');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  const addTransaction = useCallback(async (transaction: Omit<HomeGoalTransaction, 'id' | 'createdAt'>) => {
    try {
      setError(null);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const newTransaction: HomeGoalTransaction = {
        ...transaction,
        id: `tx-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      
      setTransactions(prev => [newTransaction, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nell\'aggiunta della transazione');
    }
  }, []);

  const getTransactionIcon = useCallback((type: HomeGoalTransaction['type']) => {
    switch (type) {
      case 'cashback':
        return '💰';
      case 'deposit':
        return '💳';
      case 'bonus':
        return '🎁';
      case 'redeem':
        return '🏦';
      default:
        return '💸';
    }
  }, []);

  const getTransactionColor = useCallback((type: HomeGoalTransaction['type']) => {
    switch (type) {
      case 'cashback':
        return '#4CAF50'; // Green
      case 'deposit':
        return '#2196F3'; // Blue
      case 'bonus':
        return '#FF9800'; // Orange
      case 'redeem':
        return '#F44336'; // Red
      default:
        return '#757575'; // Gray
    }
  }, []);

  const getTransactionDescription = useCallback((transaction: HomeGoalTransaction) => {
    const amount = Math.abs(transaction.amount);
    const isPositive = transaction.amount > 0;
    
    switch (transaction.type) {
      case 'cashback':
        return `+€${amount} cashback`;
      case 'deposit':
        return `+€${amount} deposito`;
      case 'bonus':
        return `+€${amount} bonus`;
      case 'redeem':
        return `-€${amount} prelievo`;
      default:
        return `€${amount}`;
    }
  }, []);

  const getTotalByType = useCallback((type: HomeGoalTransaction['type']) => {
    return transactions
      .filter(tx => tx.type === type)
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [transactions]);

  const getTotalCashback = useCallback(() => {
    return getTotalByType('cashback');
  }, [getTotalByType]);

  const getTotalDeposits = useCallback(() => {
    return getTotalByType('deposit');
  }, [getTotalByType]);

  const getTotalBonuses = useCallback(() => {
    return getTotalByType('bonus');
  }, [getTotalByType]);

  const getTotalRedeemed = useCallback(() => {
    return Math.abs(getTotalByType('redeem'));
  }, [getTotalByType]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return {
    transactions,
    loading,
    error,
    addTransaction,
    getTransactionIcon,
    getTransactionColor,
    getTransactionDescription,
    getTotalCashback,
    getTotalDeposits,
    getTotalBonuses,
    getTotalRedeemed,
    refetch: fetchTransactions,
  };
};





