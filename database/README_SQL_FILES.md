# SQL Files to Run in Supabase

## Quick Start - Run These Files in Order:

### 1. **COMPLETE_MIGRATION.sql** ⭐ (Main File)
   - **Run this FIRST** in Supabase SQL Editor
   - Creates all tables, functions, triggers, and policies
   - Safe to run multiple times (idempotent)
   - **Location:** `database/COMPLETE_MIGRATION.sql`

### 2. **Create Storage Bucket** (Manual Step)
   - Go to Supabase Dashboard → Storage
   - Click "New bucket"
   - Name: `verification-documents`
   - Set to **Private** (not public)
   - Click "Create"

### 3. **STORAGE_POLICIES.sql** ⭐
   - **Run this AFTER** creating the storage bucket
   - Adds security policies for document uploads
   - **Location:** `database/STORAGE_POLICIES.sql`

---

## Optional Files (For Reference):

### check_existing_tables.sql
- Use this to see what tables already exist before migration
- Safe to run - only reads data, doesn't modify anything

### rollback_migration.sql
- Use ONLY if you need to remove the new features
- ⚠️ WARNING: Deletes all messages, conversations, and verification data

---

## Summary:

**You only need to run 2 SQL files:**
1. ✅ `COMPLETE_MIGRATION.sql` - Main migration
2. ✅ `STORAGE_POLICIES.sql` - Storage policies (after creating bucket)

That's it! Everything else is optional.

