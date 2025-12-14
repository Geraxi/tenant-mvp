# Database Setup Guide

This guide will help you set up the database tables and storage buckets needed for the messaging and verification features.

## Prerequisites

1. A Supabase project (https://supabase.com)
2. Access to your Supabase SQL Editor
3. Access to your Supabase Storage settings

## Step 1: Create Database Tables

### 1.1 Messaging Tables

Run the SQL script in `database/messaging_schema.sql` in your Supabase SQL Editor. This will create:
- `conversations` table - stores conversations between users
- `messages` table - stores individual messages
- Functions and triggers for automatic conversation management
- Row Level Security (RLS) policies

### 1.2 Verification Tables

Run the SQL script in `database/verification_schema.sql` in your Supabase SQL Editor. This will create:
- `verification_documents` table - stores ID verification documents
- Functions to update user verification status
- RLS policies for document access

### 1.3 Ensure Utenti Table Exists

Make sure you have a `utenti` table with the following columns:
- `id` (UUID, references auth.users)
- `nome` (TEXT)
- `foto` (TEXT, optional)
- `verificato` (BOOLEAN)
- `verification_pending` (BOOLEAN, optional)
- `verification_submitted_at` (TIMESTAMPTZ, optional)

If you don't have this table, create it:

```sql
CREATE TABLE IF NOT EXISTS utenti (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT,
  foto TEXT,
  verificato BOOLEAN DEFAULT FALSE,
  verification_pending BOOLEAN DEFAULT FALSE,
  verification_submitted_at TIMESTAMPTZ,
  ruolo TEXT CHECK (ruolo IN ('tenant', 'landlord')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Step 2: Create Storage Buckets

### 2.1 Verification Documents Bucket

1. Go to Storage in your Supabase dashboard
2. Create a new bucket named `verification-documents`
3. Set it to **Private** (not public)
4. Add the following policy for authenticated users to upload:

```sql
-- Allow users to upload their own documents
CREATE POLICY "Users can upload their own verification documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'verification-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to view their own documents
CREATE POLICY "Users can view their own verification documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'verification-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

## Step 3: Update RLS Policies

Make sure Row Level Security is enabled on all tables:

```sql
-- Enable RLS on utenti if not already enabled
ALTER TABLE utenti ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own profile
CREATE POLICY "Users can view their own profile"
ON utenti FOR SELECT
USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile"
ON utenti FOR UPDATE
USING (auth.uid() = id);
```

## Step 4: Test the Setup

1. **Test Messaging:**
   - Try sending a message between two users
   - Check that conversations are created automatically
   - Verify messages appear in real-time

2. **Test Verification:**
   - Upload a verification document
   - Check that it appears in the `verification_documents` table
   - Verify the user's `verification_pending` status is updated

## Troubleshooting

### Messages not appearing
- Check that RLS policies are correctly set
- Verify the `get_or_create_conversation` function exists
- Check browser console for errors

### Verification uploads failing
- Verify the storage bucket exists and is named correctly
- Check storage policies allow uploads
- Ensure the user is authenticated

### Real-time updates not working
- Verify Supabase Realtime is enabled for your project
- Check that the `messages` table has Realtime enabled
- Ensure your Supabase plan supports Realtime

## Additional Notes

- All timestamps are stored in UTC
- Messages are automatically marked as read when viewed
- Verification documents are stored privately and only accessible by the user
- The system automatically creates conversations when needed

