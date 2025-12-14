-- Rollback Script - Use ONLY if you need to remove the new tables
-- WARNING: This will DELETE all data in these tables!
-- Only run this if you're sure you want to remove the messaging and verification features

-- ============================================
-- STEP 1: Drop triggers first
-- ============================================
DROP TRIGGER IF EXISTS trigger_update_conversation_on_message ON messages;
DROP TRIGGER IF EXISTS trigger_update_user_verification ON verification_documents;
DROP TRIGGER IF EXISTS trigger_conversations_updated_at ON conversations;
DROP TRIGGER IF EXISTS trigger_messages_updated_at ON messages;
DROP TRIGGER IF EXISTS trigger_verification_documents_updated_at ON verification_documents;

-- ============================================
-- STEP 2: Drop policies
-- ============================================
DROP POLICY IF EXISTS "Users can view their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON messages;
DROP POLICY IF EXISTS "Users can view their own verification documents" ON verification_documents;
DROP POLICY IF EXISTS "Users can create their own verification documents" ON verification_documents;
DROP POLICY IF EXISTS "Users can update their own pending documents" ON verification_documents;

-- ============================================
-- STEP 3: Drop tables (CASCADE will also drop dependent objects)
-- ============================================
-- WARNING: This deletes all messages and conversations!
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS verification_documents CASCADE;

-- ============================================
-- STEP 4: Drop functions (optional - only if you want to remove them)
-- ============================================
-- Uncomment these if you want to remove the functions too
-- DROP FUNCTION IF EXISTS get_or_create_conversation(UUID, UUID);
-- DROP FUNCTION IF EXISTS update_conversation_last_message();
-- DROP FUNCTION IF EXISTS update_user_verification_status();

-- ============================================
-- STEP 5: Remove columns from utenti (optional)
-- ============================================
-- Uncomment these if you want to remove the verification columns from utenti
-- ALTER TABLE utenti DROP COLUMN IF EXISTS verification_pending;
-- ALTER TABLE utenti DROP COLUMN IF EXISTS verification_submitted_at;

-- ============================================
-- NOTE: Storage bucket cleanup
-- ============================================
-- You'll need to manually delete the 'verification-documents' storage bucket
-- from the Supabase dashboard if you want to remove it completely
-- Go to Storage > verification-documents > Delete Bucket

