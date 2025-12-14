import { supabase } from './src/supabaseClient';

export interface WalletData {
  goal_amount: number;
  deadline?: string;
  nickname?: string;
}

export interface TransactionData {
  type: 'cashback' | 'deposit' | 'bonus';
  amount: number;
  source?: string;
  metadata?: any;
}

// Get user's wallet
export async function getWallet(userId: string): Promise<HomeGoalWallet | null> {
  try {
    const { data, error } = await supabase
      .from('homegoal_wallet')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching wallet:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Get wallet error:', error);
    return null;
  }
}

// Create or update wallet
export async function updateWallet(userId: string, walletData: WalletData): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('homegoal_wallet')
      .upsert({
        user_id: userId,
        ...walletData,
      });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Update wallet error:', error);
    return { success: false, error: 'Errore durante l\'aggiornamento del wallet' };
  }
}

// Add transaction
export async function addTransaction(userId: string, transactionData: TransactionData): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('homegoal_transactions')
      .insert({
        user_id: userId,
        ...transactionData,
      });

    if (error) {
      return { success: false, error: error.message };
    }

    // Update wallet balance
    await updateWalletBalance(userId, transactionData.type, transactionData.amount);

    return { success: true };
  } catch (error) {
    console.error('Add transaction error:', error);
    return { success: false, error: 'Errore durante l\'aggiunta della transazione' };
  }
}

// Update wallet balance based on transaction type
async function updateWalletBalance(userId: string, type: 'cashback' | 'deposit' | 'bonus', amount: number): Promise<void> {
  try {
    const { data: wallet } = await supabase
      .from('homegoal_wallet')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!wallet) return;

    const updates: Partial<HomeGoalWallet> = {};
    
    switch (type) {
      case 'cashback':
        updates.cashback_balance = (wallet.cashback_balance || 0) + amount;
        break;
      case 'deposit':
        updates.manual_deposits = (wallet.manual_deposits || 0) + amount;
        break;
      case 'bonus':
        updates.bonuses = (wallet.bonuses || 0) + amount;
        break;
    }

    await supabase
      .from('homegoal_wallet')
      .update(updates)
      .eq('user_id', userId);
  } catch (error) {
    console.error('Update wallet balance error:', error);
  }
}

// Get user's transactions
export async function getTransactions(userId: string, limit: number = 50): Promise<HomeGoalTransaction[]> {
  try {
    const { data, error } = await supabase
      .from('homegoal_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Get transactions error:', error);
    return [];
  }
}

// Get transaction statistics
export async function getTransactionStats(userId: string): Promise<{
  totalCashback: number;
  totalDeposits: number;
  totalBonuses: number;
  totalTransactions: number;
}> {
  try {
    const { data, error } = await supabase
      .from('homegoal_transactions')
      .select('type, amount')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching transaction stats:', error);
      return {
        totalCashback: 0,
        totalDeposits: 0,
        totalBonuses: 0,
        totalTransactions: 0,
      };
    }

    const stats = data.reduce((acc, transaction) => {
      acc.totalTransactions++;
      switch (transaction.type) {
        case 'cashback':
          acc.totalCashback += transaction.amount;
          break;
        case 'deposit':
          acc.totalDeposits += transaction.amount;
          break;
        case 'bonus':
          acc.totalBonuses += transaction.amount;
          break;
      }
      return acc;
    }, {
      totalCashback: 0,
      totalDeposits: 0,
      totalBonuses: 0,
      totalTransactions: 0,
    });

    return stats;
  } catch (error) {
    console.error('Get transaction stats error:', error);
    return {
      totalCashback: 0,
      totalDeposits: 0,
      totalBonuses: 0,
      totalTransactions: 0,
    };
  }
}

// Calculate progress percentage
export function calculateProgress(wallet: HomeGoalWallet): number {
  if (!wallet.goal_amount || wallet.goal_amount <= 0) return 0;
  return Math.min((wallet.total_balance / wallet.goal_amount) * 100, 100);
}

// Calculate months remaining
export function calculateMonthsRemaining(deadline?: string): number {
  if (!deadline) return 0;
  
  const now = new Date();
  const endDate = new Date(deadline);
  const diffTime = endDate.getTime() - now.getTime();
  const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
  
  return Math.max(diffMonths, 0);
}
