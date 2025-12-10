-- ============================================
-- COMPLETE MIGRATION SCRIPT
-- Run this entire file in your Supabase SQL Editor
-- This script safely adds messaging and verification features
-- ============================================

-- ============================================
-- PART 1: Add missing columns to utenti table (if it exists)
-- ============================================
-- Check if utenti table exists, then add columns if needed
DO $$ 
BEGIN
  -- Check if utenti table exists
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'utenti'
  ) THEN
    -- Check if verification_pending column exists, if not add it
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'utenti' 
      AND column_name = 'verification_pending'
    ) THEN
      ALTER TABLE utenti ADD COLUMN verification_pending BOOLEAN DEFAULT FALSE;
      RAISE NOTICE 'Added verification_pending column to utenti';
    ELSE
      RAISE NOTICE 'verification_pending column already exists in utenti';
    END IF;

    -- Check if verification_submitted_at column exists, if not add it
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'utenti' 
      AND column_name = 'verification_submitted_at'
    ) THEN
      ALTER TABLE utenti ADD COLUMN verification_submitted_at TIMESTAMPTZ;
      RAISE NOTICE 'Added verification_submitted_at column to utenti';
    ELSE
      RAISE NOTICE 'verification_submitted_at column already exists in utenti';
    END IF;
  ELSE
    RAISE NOTICE 'utenti table does not exist - skipping column additions';
    RAISE NOTICE 'Note: The verification features will still work, but user verification status will be stored in verification_documents table only';
  END IF;
END $$;

-- ============================================
-- PART 2: Create conversations table
-- ============================================
CREATE TABLE IF NOT EXISTS conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  participant1_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  participant2_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  last_message_id UUID,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure unique conversations between two users
  UNIQUE(participant1_id, participant2_id),
  -- Ensure participant1_id < participant2_id for consistency
  CHECK (participant1_id < participant2_id)
);

-- ============================================
-- PART 3: Create messages table
-- ============================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PART 4: Create verification_documents table
-- ============================================
CREATE TABLE IF NOT EXISTS verification_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
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

-- ============================================
-- PART 5: Create indexes for performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_conversations_participant1 ON conversations(participant1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_participant2 ON conversations(participant2_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(is_read) WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS idx_verification_documents_user_id ON verification_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_documents_status ON verification_documents(status);

-- ============================================
-- PART 6: Create or replace functions
-- ============================================
-- Ensure update_updated_at_column function exists (from your existing schema)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update conversation's last message
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET 
    last_message_id = NEW.id,
    last_message_at = NEW.created_at,
    updated_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to get or create a conversation between two users
-- SECURITY DEFINER allows the function to bypass RLS when creating conversations
CREATE OR REPLACE FUNCTION get_or_create_conversation(
  user1_id UUID,
  user2_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  conv_id UUID;
  smaller_id UUID;
  larger_id UUID;
  current_user_id UUID;
BEGIN
  -- Get the current authenticated user
  current_user_id := auth.uid();
  
  -- Verify that the current user is one of the participants
  IF current_user_id IS NULL OR (current_user_id != user1_id AND current_user_id != user2_id) THEN
    RAISE EXCEPTION 'Unauthorized: You can only create conversations with yourself';
  END IF;

  -- Ensure consistent ordering
  IF user1_id < user2_id THEN
    smaller_id := user1_id;
    larger_id := user2_id;
  ELSE
    smaller_id := user2_id;
    larger_id := user1_id;
  END IF;

  -- Try to find existing conversation
  SELECT id INTO conv_id
  FROM conversations
  WHERE participant1_id = smaller_id AND participant2_id = larger_id;

  -- If not found, create a new one
  IF conv_id IS NULL THEN
    INSERT INTO conversations (participant1_id, participant2_id)
    VALUES (smaller_id, larger_id)
    RETURNING id INTO conv_id;
  END IF;

  RETURN conv_id;
END;
$$;

-- Function to update user verification status when document is approved
CREATE OR REPLACE FUNCTION update_user_verification_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    -- Update user's verificato status in utenti table (if it exists)
    IF EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'utenti'
    ) THEN
      UPDATE utenti
      SET verificato = TRUE
      WHERE id = NEW.user_id;
    END IF;
    
    NEW.verified_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- PART 7: Create triggers
-- ============================================
-- Drop existing triggers if they exist (to avoid duplicates)
DROP TRIGGER IF EXISTS trigger_update_conversation_on_message ON messages;
DROP TRIGGER IF EXISTS trigger_update_user_verification ON verification_documents;
DROP TRIGGER IF EXISTS trigger_conversations_updated_at ON conversations;
DROP TRIGGER IF EXISTS trigger_messages_updated_at ON messages;
DROP TRIGGER IF EXISTS trigger_verification_documents_updated_at ON verification_documents;

-- Create triggers
CREATE TRIGGER trigger_update_conversation_on_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_last_message();

CREATE TRIGGER trigger_update_user_verification
  AFTER UPDATE OF status ON verification_documents
  FOR EACH ROW
  WHEN (NEW.status = 'approved' AND OLD.status != 'approved')
  EXECUTE FUNCTION update_user_verification_status();

CREATE TRIGGER trigger_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_messages_updated_at
  BEFORE UPDATE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_verification_documents_updated_at
  BEFORE UPDATE ON verification_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- PART 8: Enable Row Level Security (RLS)
-- ============================================
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_documents ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PART 9: Create RLS Policies
-- ============================================
-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON messages;
DROP POLICY IF EXISTS "Users can view their own verification documents" ON verification_documents;
DROP POLICY IF EXISTS "Users can create their own verification documents" ON verification_documents;
DROP POLICY IF EXISTS "Users can update their own pending documents" ON verification_documents;

-- Create policies for conversations
CREATE POLICY "Users can view their own conversations"
  ON conversations FOR SELECT
  USING (
    participant1_id = auth.uid() OR 
    participant2_id = auth.uid()
  );

CREATE POLICY "Users can create conversations"
  ON conversations FOR INSERT
  WITH CHECK (
    participant1_id = auth.uid() OR 
    participant2_id = auth.uid()
  );

-- Create policies for messages
CREATE POLICY "Users can view messages in their conversations"
  ON messages FOR SELECT
  USING (
    sender_id = auth.uid() OR 
    receiver_id = auth.uid()
  );

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can update their own messages"
  ON messages FOR UPDATE
  USING (sender_id = auth.uid());

-- Create policies for verification documents
CREATE POLICY "Users can view their own verification documents"
  ON verification_documents FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own verification documents"
  ON verification_documents FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own pending documents"
  ON verification_documents FOR UPDATE
  USING (user_id = auth.uid() AND status = 'pending');

-- ============================================
-- MIGRATION COMPLETE!
-- ============================================
-- Next step: Create the storage bucket in Supabase Dashboard
-- Then run the storage policies script below

