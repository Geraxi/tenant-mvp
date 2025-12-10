import { createClient } from '@supabase/supabase-js';

// Supabase client configuration for Italian tax payments
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://ysvindlleiicosvdzfsz.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzdmluZGxsZWlpY29zdmR6ZnN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzNDE2MjAsImV4cCI6MjA3NTkxNzYyMH0.o1EemdXCSc_t9wgz7uele1qpkNBydwyR_m2vNf2mnDo';

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  { 
    auth: { 
      persistSession: true, 
      autoRefreshToken: true, 
      detectSessionInUrl: false 
    } 
  }
);

// Enhanced types for Italian tax system
export interface Bill {
  id: string;
  user_id: string;
  tax_type: 'IMU' | 'TARI' | 'TASI' | 'CONSORZIO' | 'CONDOMINIO' | 'CANONE_UNICO' | 'OTHER';
  provider_name: string;
  amount: number;
  due_date: string | null;
  status: 'pending' | 'paid' | 'failed' | 'requires_action';
  qr_raw: string | null;
  meta: {
    ente?: string;
    iuv?: string;
    causale?: string;
    source: 'QR' | 'OCR';
    parsed_at: string;
  };
  stripe_pi_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  bill_id: string | null;
  amount: number;
  provider: string;
  status: 'pending' | 'paid' | 'failed' | 'requires_action';
  stripe_payment_intent: string | null;
  pagopa_settlement_id: string | null;
  created_at: string;
}

export interface PaymentMethod {
  id: string;
  user_id: string;
  stripe_payment_method_id: string;
  brand: string;
  last4: string;
  is_default: boolean;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  stripe_customer_id: string | null;
  role: 'landlord' | 'tenant';
  created_at: string;
}

// Italian tax classification helper
export const classifyTaxType = (ente: string, causale: string = ''): Bill['tax_type'] => {
  const enteLower = ente.toLowerCase();
  const causaleLower = causale.toLowerCase();
  
  if (enteLower.includes('imu') || (enteLower.includes('comune') && causaleLower.includes('imposta'))) {
    return 'IMU';
  }
  if (enteLower.includes('tari') || enteLower.includes('rifiuti')) {
    return 'TARI';
  }
  if (enteLower.includes('tasi')) {
    return 'TASI';
  }
  if (enteLower.includes('consorzio') || enteLower.includes('bonifica')) {
    return 'CONSORZIO';
  }
  if (enteLower.includes('condominio') || enteLower.includes('amministratore')) {
    return 'CONDOMINIO';
  }
  if (enteLower.includes('canone') && enteLower.includes('unico')) {
    return 'CANONE_UNICO';
  }
  
  return 'OTHER';
};

// Enhanced API functions for Italian tax system
export const billsApi = {
  // Get all bills for a user
  async getBills(userId: string): Promise<Bill[]> {
    const { data, error } = await supabase
      .from('bills')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Get bills by tax type
  async getBillsByTaxType(userId: string, taxType: Bill['tax_type']): Promise<Bill[]> {
    const { data, error } = await supabase
      .from('bills')
      .select('*')
      .eq('user_id', userId)
      .eq('tax_type', taxType)
      .order('due_date', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  // Get overdue bills
  async getOverdueBills(userId: string): Promise<Bill[]> {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('bills')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'pending')
      .lt('due_date', today)
      .order('due_date', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  // Get a specific bill
  async getBill(billId: string): Promise<Bill | null> {
    const { data, error } = await supabase
      .from('bills')
      .select('*')
      .eq('id', billId)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Create a new bill
  async createBill(bill: Partial<Bill>): Promise<Bill> {
    const { data, error } = await supabase
      .from('bills')
      .insert(bill)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update bill status
  async updateBillStatus(billId: string, status: Bill['status'], stripePiId?: string): Promise<void> {
    const updateData: any = { status };
    if (stripePiId) updateData.stripe_pi_id = stripePiId;
    
    const { error } = await supabase
      .from('bills')
      .update(updateData)
      .eq('id', billId);
    
    if (error) throw error;
  }
};

export const transactionsApi = {
  // Get all transactions for a user
  async getTransactions(userId: string): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Create a new transaction
  async createTransaction(transaction: Partial<Transaction>): Promise<Transaction> {
    const { data, error } = await supabase
      .from('transactions')
      .insert(transaction)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

export const paymentMethodsApi = {
  // Get payment methods for a user
  async getPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Create a new payment method
  async createPaymentMethod(paymentMethod: Partial<PaymentMethod>): Promise<PaymentMethod> {
    const { data, error } = await supabase
      .from('payment_methods')
      .insert(paymentMethod)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Set default payment method
  async setDefaultPaymentMethod(userId: string, paymentMethodId: string): Promise<void> {
    // First, unset all defaults
    await supabase
      .from('payment_methods')
      .update({ is_default: false })
      .eq('user_id', userId);
    
    // Then set the new default
    const { error } = await supabase
      .from('payment_methods')
      .update({ is_default: true })
      .eq('id', paymentMethodId)
      .eq('user_id', userId);
    
    if (error) throw error;
  }
};

export const usersApi = {
  // Get or create user
  async getOrCreateUser(email: string, role: string): Promise<User> {
    // Try to get existing user
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (existingUser) return existingUser;
    
    // Create new user
    const { data, error } = await supabase
      .from('users')
      .insert({ email, role })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update user's Stripe customer ID
  async updateStripeCustomerId(userId: string, stripeCustomerId: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .update({ stripe_customer_id: stripeCustomerId })
      .eq('id', userId);
    
    if (error) throw error;
  }
};
