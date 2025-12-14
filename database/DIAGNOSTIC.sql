-- Comprehensive Diagnostic Script
-- Run this to see exactly what's wrong

-- 1. Check if tables exist
SELECT 
  'TABLE CHECK' as check_type,
  table_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = table_name
    ) THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status
FROM (VALUES ('conversations'), ('messages')) AS t(table_name);

-- 2. Actually try to query the tables
DO $$
BEGIN
  -- Try conversations
  BEGIN
    PERFORM 1 FROM conversations LIMIT 1;
    RAISE NOTICE '✅ conversations table EXISTS and is queryable';
  EXCEPTION
    WHEN undefined_table THEN
      RAISE NOTICE '❌ conversations table DOES NOT EXIST';
    WHEN OTHERS THEN
      RAISE NOTICE '⚠️ conversations table exists but error querying: %', SQLERRM;
  END;

  -- Try messages
  BEGIN
    PERFORM 1 FROM messages LIMIT 1;
    RAISE NOTICE '✅ messages table EXISTS and is queryable';
  EXCEPTION
    WHEN undefined_table THEN
      RAISE NOTICE '❌ messages table DOES NOT EXIST';
    WHEN OTHERS THEN
      RAISE NOTICE '⚠️ messages table exists but error querying: %', SQLERRM;
  END;
END $$;

-- 3. Check function
SELECT 
  'FUNCTION CHECK' as check_type,
  proname as function_name,
  prosecdef as has_security_definer,
  CASE 
    WHEN prosecdef THEN '✅ Has SECURITY DEFINER'
    ELSE '⚠️ Missing SECURITY DEFINER'
  END as status
FROM pg_proc
WHERE proname = 'get_or_create_conversation';

-- 4. Check RLS policies
SELECT 
  'RLS POLICY CHECK' as check_type,
  schemaname || '.' || tablename as table_name,
  policyname,
  CASE 
    WHEN policyname IS NOT NULL THEN '✅ Policy exists'
    ELSE '❌ No policy'
  END as status
FROM pg_tables t
LEFT JOIN pg_policies p ON p.tablename = t.tablename AND p.schemaname = t.schemaname
WHERE t.schemaname = 'public' 
  AND t.tablename IN ('conversations', 'messages')
ORDER BY t.tablename, p.policyname;

-- 5. Try to create a test conversation (will fail if tables don't exist)
DO $$
DECLARE
  test_user1 UUID := '00000000-0000-0000-0000-000000000001';
  test_user2 UUID := '00000000-0000-0000-0000-000000000002';
  test_conv_id UUID;
BEGIN
  BEGIN
    -- Try to call the function
    SELECT get_or_create_conversation(test_user1, test_user2) INTO test_conv_id;
    RAISE NOTICE '✅ Function works! Created test conversation: %', test_conv_id;
    
    -- Clean up
    DELETE FROM conversations WHERE id = test_conv_id;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE '❌ Function error: %', SQLERRM;
  END;
END $$;

