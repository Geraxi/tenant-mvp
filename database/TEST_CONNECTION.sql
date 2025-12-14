-- Simple connection test
-- This will verify your Supabase connection and show current user

-- Show current database
SELECT current_database() as database_name;

-- Show current schema
SELECT current_schema() as schema_name;

-- Show current user
SELECT current_user as database_user;

-- List all tables in public schema
SELECT 
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Specifically check for conversations and messages
SELECT 
  'conversations' as table_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'conversations'
    ) THEN '✅ EXISTS'
    ELSE '❌ DOES NOT EXIST'
  END as status
UNION ALL
SELECT 
  'messages' as table_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'messages'
    ) THEN '✅ EXISTS'
    ELSE '❌ DOES NOT EXIST'
  END as status;

