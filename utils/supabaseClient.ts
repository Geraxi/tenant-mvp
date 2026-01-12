import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY');
}

const secureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: secureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database types
export interface Profile {
  id: string;
  full_name?: string;
  avatar_url?: string;
  id_document_url?: string;
  selfie_url?: string;
  verified: boolean;
  created_at: string;
}

export interface HomeGoalWallet {
  id: string;
  user_id: string;
  goal_amount: number;
  deadline?: string;
  nickname?: string;
  cashback_balance: number;
  manual_deposits: number;
  bonuses: number;
  total_balance: number;
  created_at: string;
  updated_at: string;
}

export interface HomeGoalTransaction {
  id: string;
  user_id: string;
  type: 'cashback' | 'deposit' | 'bonus';
  amount: number;
  source?: string;
  metadata?: any;
  created_at: string;
}

export interface Property {
  id: string;
  owner_id: string;
  title?: string;
  description?: string;
  images: string[];
  rent?: number;
  location?: string;
  created_at: string;
}

export interface Contract {
  id: string;
  property_id: string;
  tenant_id: string;
  landlord_id: string;
  document_url?: string;
  signed: boolean;
  created_at: string;
}
