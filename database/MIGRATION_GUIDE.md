# Safe Migration Guide

This guide will help you safely add the messaging and verification features to your existing database without affecting your current project.

## ⚠️ Important: Backup First!

Before running any migrations:
1. **Export your database** from Supabase Dashboard → Settings → Database → Backup
2. **Test in a development/staging environment first** if possible

## Step-by-Step Migration Process

### Step 1: Check What Already Exists

Run `check_existing_tables.sql` in your Supabase SQL Editor to see:
- What tables already exist
- What columns are in your `utenti` table
- Whether any of the new tables already exist
- What functions are already defined

**This is safe to run** - it only reads information, doesn't modify anything.

### Step 2: Review the Results

Check the output to see:
- ✅ If `conversations`, `messages`, or `verification_documents` tables already exist
- ✅ What columns your `utenti` table has
- ✅ If any functions conflict

### Step 3: Run the Safe Migration

Run `safe_migration.sql` in your Supabase SQL Editor.

**This script is idempotent** - it's safe to run multiple times because it:
- Uses `CREATE TABLE IF NOT EXISTS` - won't recreate existing tables
- Uses `CREATE INDEX IF NOT EXISTS` - won't duplicate indexes
- Checks for columns before adding them
- Drops and recreates triggers/policies to avoid conflicts
- Uses `CREATE OR REPLACE FUNCTION` - updates functions if they exist

### Step 4: Set Up Storage Bucket

1. Go to **Supabase Dashboard → Storage**
2. Click **"New bucket"**
3. Name it: `verification-documents`
4. Set it to **Private** (not public)
5. Click **Create**

Then add these policies in the SQL Editor:

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

### Step 5: Verify the Migration

Run this query to verify everything was created:

```sql
-- Check tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('conversations', 'messages', 'verification_documents')
ORDER BY table_name;

-- Check utenti columns
SELECT column_name 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'utenti'
  AND column_name IN ('verification_pending', 'verification_submitted_at');

-- Check functions
SELECT proname 
FROM pg_proc 
WHERE proname IN (
  'get_or_create_conversation',
  'update_conversation_last_message',
  'update_user_verification_status'
);
```

All should return results if the migration was successful.

## What Gets Created

### New Tables:
- ✅ `conversations` - Stores user conversations
- ✅ `messages` - Stores individual messages
- ✅ `verification_documents` - Stores ID verification documents

### Modified Tables:
- ✅ `utenti` - Adds `verification_pending` and `verification_submitted_at` columns (only if they don't exist)

### New Functions:
- ✅ `get_or_create_conversation()` - Automatically creates conversations
- ✅ `update_conversation_last_message()` - Updates conversation metadata
- ✅ `update_user_verification_status()` - Updates user verification when approved

### New Indexes:
- ✅ Indexes on conversation participants
- ✅ Indexes on message senders/receivers
- ✅ Indexes on verification documents

## What WON'T Be Affected

The migration script is designed to **NOT** modify:
- ❌ Existing tables (except adding optional columns to `utenti`)
- ❌ Existing data
- ❌ Existing functions (uses CREATE OR REPLACE)
- ❌ Existing indexes
- ❌ Your existing `utenti`, `immobili`, `matches`, `likes` tables

## Troubleshooting

### Error: "relation already exists"
- This means the table already exists. The script uses `IF NOT EXISTS` so this shouldn't happen, but if it does, check if you already ran the migration.

### Error: "column already exists"
- The script checks before adding columns, so this shouldn't happen. If it does, the column already exists and you can ignore the error.

### Error: "function already exists"
- The script uses `CREATE OR REPLACE`, so it will update existing functions. This is safe.

### Error: "permission denied"
- Make sure you're running the script as a database admin or with sufficient permissions.

## Rollback (If Needed)

If you need to remove the new features, run `rollback_migration.sql`.

**⚠️ WARNING**: This will delete all messages, conversations, and verification documents!

## Testing After Migration

1. **Test Messaging:**
   ```sql
   -- Create a test conversation
   SELECT get_or_create_conversation(
     'user-id-1'::UUID,
     'user-id-2'::UUID
   );
   ```

2. **Test Verification:**
   - Try uploading a document through the app
   - Check that it appears in `verification_documents` table

3. **Check RLS:**
   - Try querying conversations/messages as different users
   - Verify users can only see their own data

## Need Help?

If you encounter issues:
1. Check the Supabase logs in Dashboard → Logs
2. Verify RLS policies are enabled
3. Check that your user has the correct permissions
4. Review the error messages in the SQL Editor

