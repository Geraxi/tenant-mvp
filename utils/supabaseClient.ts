import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Supabase configuration - Your actual project details
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://ysvindlleiicosvdzfsz.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzdmluZGxsZWlpY29zdmR6ZnN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzNDE2MjAsImV4cCI6MjA3NTkxNzYyMH0.o1EemdXCSc_t9wgz7uele1qpkNBydwyR_m2vNf2mnDo';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
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
