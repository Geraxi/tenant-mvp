-- FINAL FIX - One script to rule them all
-- Run this ENTIRE script in Supabase SQL Editor
-- Make sure you're in the correct project: https://your-project.supabase.co

-- Step 1: Verify we're in the right place
SELECT 
  'Current Database' as info,
  current_database() as value;

-- Step 2: Drop and recreate everything
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP FUNCTION IF EXISTS get_or_create_conversation(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS update_conversation_last_message() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Step 3: Create conversations table
CREATE TABLE conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  participant1_id UUID NOT NULL,
  participant2_id UUID NOT NULL,
  last_message_id UUID,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(participant1_id, participant2_id),
  CHECK (participant1_id < participant2_id)
);

-- Step 4: Create messages table
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 5: Create indexes
CREATE INDEX idx_conv_p1 ON conversations(participant1_id);
CREATE INDEX idx_conv_p2 ON conversations(participant2_id);
CREATE INDEX idx_conv_last_msg ON conversations(last_message_at DESC);
CREATE INDEX idx_msg_conv ON messages(conversation_id);
CREATE INDEX idx_msg_sender ON messages(sender_id);
CREATE INDEX idx_msg_receiver ON messages(receiver_id);

-- Step 6: Create function with SECURITY DEFINER
CREATE OR REPLACE FUNCTION get_or_create_conversation(
  user1_id UUID,
  user2_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  conv_id UUID;
  smaller_id UUID;
  larger_id UUID;
BEGIN
  IF user1_id < user2_id THEN
    smaller_id := user1_id;
    larger_id := user2_id;
  ELSE
    smaller_id := user2_id;
    larger_id := user1_id;
  END IF;

  SELECT id INTO conv_id
  FROM conversations
  WHERE participant1_id = smaller_id AND participant2_id = larger_id;

  IF conv_id IS NULL THEN
    INSERT INTO conversations (participant1_id, participant2_id)
    VALUES (smaller_id, larger_id)
    RETURNING id INTO conv_id;
  END IF;

  RETURN conv_id;
END;
$$;

-- Step 7: Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Step 8: Create RLS policies
DROP POLICY IF EXISTS "view_own_conv" ON conversations;
DROP POLICY IF EXISTS "create_own_conv" ON conversations;
DROP POLICY IF EXISTS "view_own_msg" ON messages;
DROP POLICY IF EXISTS "send_msg" ON messages;

CREATE POLICY "view_own_conv" ON conversations
  FOR SELECT USING (participant1_id = auth.uid() OR participant2_id = auth.uid());

CREATE POLICY "create_own_conv" ON conversations
  FOR INSERT WITH CHECK (participant1_id = auth.uid() OR participant2_id = auth.uid());

CREATE POLICY "view_own_msg" ON messages
  FOR SELECT USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "send_msg" ON messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());

-- Step 9: Verify
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'conversations') THEN
    RAISE NOTICE '✅ conversations table created';
  ELSE
    RAISE NOTICE '❌ conversations table FAILED';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'messages') THEN
    RAISE NOTICE '✅ messages table created';
  ELSE
    RAISE NOTICE '❌ messages table FAILED';
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_or_create_conversation') THEN
    RAISE NOTICE '✅ function created';
  ELSE
    RAISE NOTICE '❌ function FAILED';
  END IF;
END $$;

SELECT '✅✅✅ SETUP COMPLETE! Restart your app now. ✅✅✅' as status;

