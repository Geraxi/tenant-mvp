# Local Development Setup

This guide will help you set up the Tenant app for local development.

## Required Environment Variables

You need to set the following environment variables to run the server locally:

### 1. DATABASE_URL
Your Supabase PostgreSQL connection string.

**To get it:**
1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **Database**
4. Scroll to **Connection string** section
5. Copy the **Connection pooling** string (URI format)
   - It should look like: `postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres`

### 2. SUPABASE_SERVICE_ROLE_KEY
Your Supabase service role key (for admin operations like user creation).

**To get it:**
1. Go to your Supabase project dashboard
2. Go to **Settings** → **API**
3. Find **service_role** key (⚠️ Keep this secret!)
4. Copy the key

### 3. SUPABASE_URL (optional, already set)
Already configured in `.replit` file: `https://iohszsmnkbxpauqqdudy.supabase.co`

### 4. SUPABASE_ANON_KEY (optional, already set)
Already configured in `.replit` file

## Setting Environment Variables

### Option 1: Export in Terminal (Temporary)
```bash
export DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"
```

Then run:
```bash
npm run dev
```

### Option 2: Create a `.env` file (Recommended)
Create a `.env` file in the project root:

```bash
DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
SUPABASE_URL=https://iohszsmnkbxpauqqdudy.supabase.co
SUPABASE_ANON_KEY=sb_publishable_RvrB-op5mh0qwzjaLL2OoQ_wUVI9Rp1
```

**Note:** Make sure to add `.env` to your `.gitignore` file to avoid committing secrets!

### Option 3: Update `.replit` file
Add these to the `[userenv.shared]` section in `.replit`:

```ini
[userenv.shared]
DATABASE_URL = "postgresql://..."
SUPABASE_SERVICE_ROLE_KEY = "your-key-here"
```

## Running the Server

Once environment variables are set:

```bash
npm run dev
```

This will start both the Express API server and Vite dev server on port 5000.

## Testing the Setup

After starting the server, test the signup endpoint:

```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123456","firstName":"Test","lastName":"User"}'
```

You should get a JSON response with user data if successful.

## Troubleshooting

### "DATABASE_URL must be set" error
- Make sure you've exported or set the `DATABASE_URL` environment variable
- Verify the connection string is correct and includes the password

### "SUPABASE_SERVICE_ROLE_KEY is required" error
- Make sure you've set the `SUPABASE_SERVICE_ROLE_KEY` environment variable
- Verify the key is correct (it should start with `eyJ...` for JWT tokens)

### "Failed to create account" error
- Check server logs for detailed error messages
- Verify Supabase credentials are correct
- Make sure the database tables exist (run `npm run db:push` if needed)

## Next Steps

1. Set up the environment variables
2. Start the server: `npm run dev`
3. Sync Capacitor: `npx cap sync ios`
4. Open in Xcode: `npx cap open ios`
5. Run the app in the simulator

