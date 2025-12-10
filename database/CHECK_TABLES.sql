-- Comprehensive check for all messaging tables
-- Run this to see exactly what exists

-- Check conversations table
SELECT 
  'conversations' as object_name,
  'table' as object_type,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'conversations'
    ) THEN '✅ EXISTS'
    ELSE '❌ MISSING - Run COMPLETE_MIGRATION.sql'
  END as status;

-- Check messages table  
SELECT 
  'messages' as object_name,
  'table' as object_type,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'messages'
    ) THEN '✅ EXISTS'
    ELSE '❌ MISSING - Run COMPLETE_MIGRATION.sql'
  END as status;

-- Check function
SELECT 
  'get_or_create_conversation' as object_name,
  'function' as object_type,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_proc
      WHERE proname = 'get_or_create_conversation'
    ) THEN '✅ EXISTS'
    ELSE '❌ MISSING - Run COMPLETE_MIGRATION.sql'
  END as status;

-- Try to actually query the conversations table (if it exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'conversations'
  ) THEN
    PERFORM 1 FROM conversations LIMIT 1;
    RAISE NOTICE '✅ Can query conversations table successfully';
  ELSE
    RAISE NOTICE '❌ conversations table does not exist';
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '❌ Error querying conversations table: %', SQLERRM;
END $$;

