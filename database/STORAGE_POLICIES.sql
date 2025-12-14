-- ============================================
-- STORAGE POLICIES FOR VERIFICATION DOCUMENTS
-- Run this AFTER creating the storage bucket
-- ============================================
-- 
-- IMPORTANT: First create the bucket manually:
-- 1. Go to Supabase Dashboard → Storage
-- 2. Click "New bucket"
-- 3. Name: verification-documents
-- 4. Set to Private (not public)
-- 5. Click Create
--
-- Then run this script to add the policies
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload their own verification documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own verification documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own verification documents" ON storage.objects;

-- Policy: Allow users to upload their own documents
CREATE POLICY "Users can upload their own verification documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'verification-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Allow users to view their own documents
CREATE POLICY "Users can view their own verification documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'verification-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Allow users to delete their own documents (optional)
CREATE POLICY "Users can delete their own verification documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'verification-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================
-- STORAGE SETUP COMPLETE!
-- ============================================

