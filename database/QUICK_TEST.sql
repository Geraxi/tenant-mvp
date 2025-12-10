-- Quick Test Script
-- Run this in Supabase SQL Editor to check if tables exist

-- Test 1: Check if conversations table exists
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'conversations'
    ) THEN '✅ conversations table EXISTS'
    ELSE '❌ conversations table DOES NOT EXIST'
  END as conversations_check;

-- Test 2: Check if messages table exists
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'messages'
    ) THEN '✅ messages table EXISTS'
    ELSE '❌ messages table DOES NOT EXIST'
  END as messages_check;

-- Test 3: Check if get_or_create_conversation function exists
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_proc
      WHERE proname = 'get_or_create_conversation'
    ) THEN '✅ get_or_create_conversation function EXISTS'
    ELSE '❌ get_or_create_conversation function DOES NOT EXIST'
  END as function_check;

-- Test 4: Try to query conversations table (if it exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'conversations'
  ) THEN
    RAISE NOTICE '✅ Can query conversations table';
  ELSE
    RAISE NOTICE '❌ Cannot query conversations table - it does not exist';
  END IF;
END $$;

-- Summary
SELECT 
  'If you see ❌ above, you need to run COMPLETE_MIGRATION.sql' as instruction;

