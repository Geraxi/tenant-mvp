-- ID Verification System Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Verification documents table
CREATE TABLE IF NOT EXISTS verification_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN ('carta-identita', 'passaporto', 'patente')),
  document_front_url TEXT NOT NULL,
  document_back_url TEXT,
  selfie_url TEXT NOT NULL,
  document_number TEXT,
  expiry_date DATE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'expired')) DEFAULT 'pending',
  rejection_reason TEXT,
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_verification_documents_user_id ON verification_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_documents_status ON verification_documents(status);

-- Function to update user verification status when document is approved
CREATE OR REPLACE FUNCTION update_user_verification_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    -- Update user's verificato status in profiles or utenti table
    -- This assumes you have a profiles table or similar
    UPDATE auth.users
    SET raw_user_meta_data = jsonb_set(
      COALESCE(raw_user_meta_data, '{}'::jsonb),
      '{verificato}',
      'true'::jsonb
    )
    WHERE id = NEW.user_id;
    
    NEW.verified_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update user verification status
CREATE TRIGGER trigger_update_user_verification
  AFTER UPDATE OF status ON verification_documents
  FOR EACH ROW
  WHEN (NEW.status = 'approved' AND OLD.status != 'approved')
  EXECUTE FUNCTION update_user_verification_status();

-- Row Level Security (RLS) Policies
ALTER TABLE verification_documents ENABLE ROW LEVEL SECURITY;

-- Users can view their own verification documents
CREATE POLICY "Users can view their own verification documents"
  ON verification_documents FOR SELECT
  USING (user_id = auth.uid());

-- Users can insert their own verification documents
CREATE POLICY "Users can create their own verification documents"
  ON verification_documents FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own pending verification documents
CREATE POLICY "Users can update their own pending documents"
  ON verification_documents FOR UPDATE
  USING (user_id = auth.uid() AND status = 'pending');

-- Function to update updated_at
CREATE TRIGGER trigger_verification_documents_updated_at
  BEFORE UPDATE ON verification_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
