-- Supabase Database Setup for Tenant App
-- Run this SQL in your Supabase SQL Editor

-- Note: JWT secret is automatically managed by Supabase

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  id_document_url TEXT,
  selfie_url TEXT,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- HomeGoal wallet table
CREATE TABLE IF NOT EXISTS homegoal_wallet (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  goal_amount NUMERIC DEFAULT 0,
  deadline DATE,
  nickname TEXT,
  cashback_balance NUMERIC DEFAULT 0,
  manual_deposits NUMERIC DEFAULT 0,
  bonuses NUMERIC DEFAULT 0,
  total_balance NUMERIC GENERATED ALWAYS AS (COALESCE(cashback_balance,0) + COALESCE(manual_deposits,0) + COALESCE(bonuses,0)) STORED,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions table
CREATE TABLE IF NOT EXISTS homegoal_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('cashback', 'deposit', 'bonus')),
  amount NUMERIC NOT NULL,
  source TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Property listings table
CREATE TABLE IF NOT EXISTS properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES auth.users NOT NULL,
  title TEXT,
  description TEXT,
  images TEXT[] DEFAULT '{}',
  rent NUMERIC,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contracts table
CREATE TABLE IF NOT EXISTS contracts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) NOT NULL,
  tenant_id UUID REFERENCES auth.users NOT NULL,
  landlord_id UUID REFERENCES auth.users NOT NULL,
  document_url TEXT,
  signed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on wallet update
DROP TRIGGER IF EXISTS set_updated_at ON homegoal_wallet;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON homegoal_wallet
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Row Level Security Policies

-- Profiles: Users can only access their own profile
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- HomeGoal Wallet: Users can only access their own wallet
ALTER TABLE homegoal_wallet ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own wallet" ON homegoal_wallet
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own wallet" ON homegoal_wallet
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own wallet" ON homegoal_wallet
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Transactions: Users can only access their own transactions
ALTER TABLE homegoal_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own transactions" ON homegoal_transactions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON homegoal_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Properties: Public read, owner can modify
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view properties" ON properties
  FOR SELECT USING (true);
CREATE POLICY "Users can insert own properties" ON properties
  FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can update own properties" ON properties
  FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Users can delete own properties" ON properties
  FOR DELETE USING (auth.uid() = owner_id);

-- Contracts: Only involved parties can access
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own contracts" ON contracts
  FOR SELECT USING (auth.uid() = tenant_id OR auth.uid() = landlord_id);
CREATE POLICY "Users can insert contracts" ON contracts
  FOR INSERT WITH CHECK (auth.uid() = tenant_id OR auth.uid() = landlord_id);
CREATE POLICY "Users can update own contracts" ON contracts
  FOR UPDATE USING (auth.uid() = tenant_id OR auth.uid() = landlord_id);

-- Storage Buckets Setup
-- Run these in Supabase Storage section

-- Create buckets (only if they don't exist)
INSERT INTO storage.buckets (id, name, public) 
SELECT 'user_uploads', 'user_uploads', true
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'user_uploads');

INSERT INTO storage.buckets (id, name, public) 
SELECT 'user_uploads_private', 'user_uploads_private', false
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'user_uploads_private');

INSERT INTO storage.buckets (id, name, public) 
SELECT 'property_images', 'property_images', true
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'property_images');

INSERT INTO storage.buckets (id, name, public) 
SELECT 'contracts', 'contracts', false
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'contracts');

-- Storage policies (drop existing policies first to avoid conflicts)
DROP POLICY IF EXISTS "Public read access for user uploads" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own private files" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own private files" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for property images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload property images" ON storage.objects;
DROP POLICY IF EXISTS "Contract parties can view contracts" ON storage.objects;
DROP POLICY IF EXISTS "Contract parties can upload contracts" ON storage.objects;

-- User uploads (public - avatars)
CREATE POLICY "Public read access for user uploads" ON storage.objects
  FOR SELECT USING (bucket_id = 'user_uploads');

CREATE POLICY "Users can upload own files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'user_uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Private user uploads (ID documents, selfies)
CREATE POLICY "Users can view own private files" ON storage.objects
  FOR SELECT USING (bucket_id = 'user_uploads_private' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload own private files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'user_uploads_private' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Property images (public)
CREATE POLICY "Public read access for property images" ON storage.objects
  FOR SELECT USING (bucket_id = 'property_images');

CREATE POLICY "Users can upload property images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'property_images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Contracts (private - only involved parties)
CREATE POLICY "Contract parties can view contracts" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'contracts' AND (
      auth.uid()::text = (storage.foldername(name))[1] OR 
      auth.uid()::text = (storage.foldername(name))[2]
    )
  );

CREATE POLICY "Contract parties can upload contracts" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'contracts' AND (
      auth.uid()::text = (storage.foldername(name))[1] OR 
      auth.uid()::text = (storage.foldername(name))[2]
    )
  );
