-- Verification Script - Run this to check if everything is set up correctly

-- Check if tables exist
SELECT 
  'Tables Check' as check_type,
  table_name,
  'EXISTS' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('conversations', 'messages', 'verification_documents')
ORDER BY table_name;

-- Check if functions exist
SELECT 
  'Functions Check' as check_type,
  proname as function_name,
  'EXISTS' as status
FROM pg_proc
WHERE proname IN (
  'get_or_create_conversation',
  'update_conversation_last_message',
  'update_user_verification_status',
  'update_updated_at_column'
)
ORDER BY proname;

-- Check if indexes exist
SELECT 
  'Indexes Check' as check_type,
  indexname as index_name,
  'EXISTS' as status
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%'
  AND (
    indexname LIKE 'idx_conversations%' OR
    indexname LIKE 'idx_messages%' OR
    indexname LIKE 'idx_verification_documents%'
  )
ORDER BY indexname;

-- Check if triggers exist
SELECT 
  'Triggers Check' as check_type,
  trigger_name,
  'EXISTS' as status
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND trigger_name LIKE 'trigger_%'
  AND (
    trigger_name LIKE 'trigger_%conversation%' OR
    trigger_name LIKE 'trigger_%message%' OR
    trigger_name LIKE 'trigger_%verification%'
  )
ORDER BY trigger_name;

-- Check if RLS is enabled
SELECT 
  'RLS Check' as check_type,
  tablename,
  CASE WHEN rowsecurity THEN 'ENABLED' ELSE 'DISABLED' END as status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('conversations', 'messages', 'verification_documents')
ORDER BY tablename;

-- Check storage bucket (if you have access)
SELECT 
  'Storage Check' as check_type,
  name as bucket_name,
  CASE WHEN public THEN 'PUBLIC' ELSE 'PRIVATE' END as visibility
FROM storage.buckets
WHERE name = 'verification-documents';

-- Summary
SELECT 
  'SUMMARY' as check_type,
  'If all checks above show EXISTS/ENABLED, setup is complete!' as status;

