# Quick Fix for "Failed to create account"

## The Problem
The API server isn't running because the `.env` file is missing.

## Solution (2 steps)

### Step 1: Create .env file

You need your Supabase credentials:

1. **DATABASE_URL**: 
   - Go to: https://supabase.com/dashboard
   - Select your project
   - Settings → Database → Connection string
   - Copy the "Connection pooling" URI

2. **SUPABASE_SERVICE_ROLE_KEY**:
   - Same dashboard → Settings → API
   - Copy the `service_role` key

Then create `.env` file in the project root:

```bash
DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=sb_publishable_RvrB-op5mh0qwzjaLL2OoQ_wUVI9Rp1
PORT=5000
NODE_ENV=development
```

### Step 2: Start the full server

```bash
# Stop any running dev server first
npm run dev
```

This starts both the API server and frontend. The signup should work after this!

