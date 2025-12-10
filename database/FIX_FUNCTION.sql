-- Fix the get_or_create_conversation function to work with RLS
-- Run this if you're getting permission errors

-- Drop and recreate the function with SECURITY DEFINER
DROP FUNCTION IF EXISTS get_or_create_conversation(UUID, UUID);

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

-- Verify the function was created
SELECT 
  'Function fixed!' as status,
  proname as function_name,
  prosecdef as has_security_definer
FROM pg_proc
WHERE proname = 'get_or_create_conversation';

