import { useState, useEffect, useCallback } from 'react';
import { HomeGoal, HomeGoalWallet, HomeGoalProgress, HomeGoalTransaction } from '../types';

// Mock data for development
const mockHomeGoal: HomeGoal = {
  id: 'homegoal-1',
  userId: 'user-1',
  goalAmount: 50000,
  deadline: '2026-12-31',
  nickname: 'Appartamento Milano',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  isActive: true,
};

const mockWallet: HomeGoalWallet = {
  id: 'wallet-1',
  userId: 'user-1',
  cashbackBalance: 1250,
  manualDeposits: 5000,
  bonuses: 200,
  totalBalance: 6450,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

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
];

export const useHomeGoal = () => {
  const [homeGoal, setHomeGoal] = useState<HomeGoal | null>(null);
  const [wallet, setWallet] = useState<HomeGoalWallet | null>(null);
  const [progress, setProgress] = useState<HomeGoalProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const calculateProgress = useCallback((goal: HomeGoal, wallet: HomeGoalWallet): HomeGoalProgress => {
    const totalBalance = wallet.totalBalance;
    const goalAmount = goal.goalAmount;
    const progressPercentage = Math.min((totalBalance / goalAmount) * 100, 100);
    const remainingAmount = Math.max(goalAmount - totalBalance, 0);
    
    const deadline = new Date(goal.deadline);
    const now = new Date();
    const daysRemaining = Math.max(Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)), 0);
    
    const totalDays = Math.ceil((deadline.getTime() - new Date(goal.createdAt).getTime()) / (1000 * 60 * 60 * 24));
    const elapsedDays = totalDays - daysRemaining;
    const monthlyTarget = remainingAmount / Math.max(daysRemaining / 30, 1);

    const milestones = [
      { percentage: 25, amount: goalAmount * 0.25, achieved: totalBalance >= goalAmount * 0.25, achievedAt: undefined },
      { percentage: 50, amount: goalAmount * 0.5, achieved: totalBalance >= goalAmount * 0.5, achievedAt: undefined },
      { percentage: 75, amount: goalAmount * 0.75, achieved: totalBalance >= goalAmount * 0.75, achievedAt: undefined },
      { percentage: 100, amount: goalAmount, achieved: totalBalance >= goalAmount, achievedAt: undefined },
    ];

    return {
      goalAmount,
      totalBalance,
      progressPercentage,
      remainingAmount,
      daysRemaining,
      monthlyTarget,
      milestones,
    };
  }, []);

  const fetchHomeGoal = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setHomeGoal(mockHomeGoal);
      setWallet(mockWallet);
      setProgress(calculateProgress(mockHomeGoal, mockWallet));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nel caricamento del HomeGoal');
    } finally {
      setLoading(false);
    }
  }, [calculateProgress]);

  const updateGoal = useCallback(async (goalData: Partial<HomeGoal>) => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedGoal = { ...mockHomeGoal, ...goalData, updatedAt: new Date().toISOString() };
      setHomeGoal(updatedGoal);
      
      if (wallet) {
        setProgress(calculateProgress(updatedGoal, wallet));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nell\'aggiornamento dell\'obiettivo');
    } finally {
      setLoading(false);
    }
  }, [wallet, calculateProgress]);

  const addFunds = useCallback(async (amount: number, method: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedWallet = {
        ...mockWallet,
        manualDeposits: mockWallet.manualDeposits + amount,
        totalBalance: mockWallet.totalBalance + amount,
        updatedAt: new Date().toISOString(),
      };
      
      setWallet(updatedWallet);
      
      if (homeGoal) {
        setProgress(calculateProgress(homeGoal, updatedWallet));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nell\'aggiunta di fondi');
    } finally {
      setLoading(false);
    }
  }, [homeGoal, calculateProgress]);

  const addCashback = useCallback(async (amount: number, source: string) => {
    try {
      setError(null);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const updatedWallet = {
        ...mockWallet,
        cashbackBalance: mockWallet.cashbackBalance + amount,
        totalBalance: mockWallet.totalBalance + amount,
        updatedAt: new Date().toISOString(),
      };
      
      setWallet(updatedWallet);
      
      if (homeGoal) {
        setProgress(calculateProgress(homeGoal, updatedWallet));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nell\'aggiunta del cashback');
    }
  }, [homeGoal, calculateProgress]);

  const addBonus = useCallback(async (amount: number, source: string) => {
    try {
      setError(null);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const updatedWallet = {
        ...mockWallet,
        bonuses: mockWallet.bonuses + amount,
        totalBalance: mockWallet.totalBalance + amount,
        updatedAt: new Date().toISOString(),
      };
      
      setWallet(updatedWallet);
      
      if (homeGoal) {
        setProgress(calculateProgress(homeGoal, updatedWallet));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nell\'aggiunta del bonus');
    }
  }, [homeGoal, calculateProgress]);

  useEffect(() => {
    fetchHomeGoal();
  }, [fetchHomeGoal]);

  return {
    homeGoal,
    wallet,
    progress,
    loading,
    error,
    updateGoal,
    addFunds,
    addCashback,
    addBonus,
    refetch: fetchHomeGoal,
  };
};





