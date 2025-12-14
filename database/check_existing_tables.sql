-- Check Existing Tables Script
-- Run this FIRST to see what tables already exist in your database
-- This helps you understand what will be created vs what already exists

-- List all tables in the public schema
SELECT 
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- List all columns in the utenti table (if it exists)
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'utenti'
ORDER BY ordinal_position;

-- Check if conversations table exists
SELECT EXISTS (
  SELECT 1 
  FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'conversations'
) AS conversations_exists;

-- Check if messages table exists
SELECT EXISTS (
  SELECT 1 
  FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'messages'
) AS messages_exists;

-- Check if verification_documents table exists
SELECT EXISTS (
  SELECT 1 
  FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'verification_documents'
) AS verification_documents_exists;

-- Check if functions exist
SELECT 
  proname AS function_name,
  pg_get_functiondef(oid) AS function_definition
FROM pg_proc
WHERE proname IN (
  'get_or_create_conversation',
  'update_conversation_last_message',
  'update_user_verification_status',
  'update_updated_at_column'
)
ORDER BY proname;

-- Check if storage buckets exist (requires storage admin access)
-- Note: This query might not work depending on your Supabase permissions
SELECT name, public
FROM storage.buckets
WHERE name IN ('verification-documents');

