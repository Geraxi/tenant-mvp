-- Simple Check - Just verify tables exist
-- Run this to see if the migration worked

-- Check conversations table
SELECT 
  'conversations' as table_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'conversations'
    ) THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status;

-- Check messages table  
SELECT 
  'messages' as table_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'messages'
    ) THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status;

-- Check function
SELECT 
  'get_or_create_conversation' as function_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_proc
      WHERE proname = 'get_or_create_conversation'
    ) THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status;

