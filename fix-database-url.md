# Fix DATABASE_URL Connection String

## Current Issue

Your current `DATABASE_URL` has an incorrect hostname:
```
postgresql://postgres.iohszsmnkbxpauqqdudy:tenantmvp2026@aws-0.us-east-1.pooler.supabase.com:6543/postgres
```

The hostname `aws-0.us-east-1.pooler.supabase.com` cannot be resolved, causing connection errors.

## How to Get the Correct Connection String

### Option 1: From Supabase Dashboard (Recommended)

1. Go to your Supabase project: https://supabase.com/dashboard/project/iohszsmnkbxpauqqdudy
2. Navigate to **Settings** → **Database**
3. Scroll down to **Connection string**
4. Select **Connection pooling** (for production) or **Direct connection** (for development)
5. Copy the connection string
6. It should look like one of these formats:

**Connection Pooling (Recommended for production):**
```
postgresql://postgres.iohszsmnkbxpauqqdudy:[YOUR-PASSWORD]@aws-0.[REGION].pooler.supabase.com:6543/postgres
```

**Direct Connection:**
```
postgresql://postgres.iohszsmnkbxpauqqdudy:[YOUR-PASSWORD]@aws-0.[REGION].supabase.com:5432/postgres
```

### Option 2: Check Your Supabase Project Region

The region in the hostname must match your Supabase project's region. Common regions:
- `us-east-1` (US East - N. Virginia)
- `us-west-1` (US West - N. California)
- `eu-west-1` (EU - Ireland)
- `ap-southeast-1` (Asia Pacific - Singapore)

To find your region:
1. Go to Supabase Dashboard → Settings → General
2. Check the "Region" field

### Option 3: Use Transaction Mode (Alternative)

If connection pooling doesn't work, try transaction mode:
```
postgresql://postgres.iohszsmnkbxpauqqdudy:[YOUR-PASSWORD]@aws-0.[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
```

## Update Your .env File

Once you have the correct connection string:

1. Open your `.env` file
2. Update the `DATABASE_URL` line:
   ```
   DATABASE_URL=postgresql://postgres.iohszsmnkbxpauqqdudy:tenantmvp2026@[CORRECT-HOSTNAME]:6543/postgres
   ```
3. Replace `[CORRECT-HOSTNAME]` with the actual hostname from Supabase dashboard
4. Make sure the password `tenantmvp2026` is correct
5. Restart your server

## Verify the Connection

After updating, test the connection:
```bash
npm run dev
```

Check the server logs for any connection errors. If you see connection errors, double-check:
- The hostname is correct
- The password is correct
- The port is correct (6543 for pooling, 5432 for direct)
- Your IP is allowed in Supabase (if using IP restrictions)

## Common Issues

1. **Wrong Region**: Make sure the region in the hostname matches your Supabase project region
2. **Wrong Port**: Use 6543 for connection pooling, 5432 for direct connection
3. **Password Issues**: Ensure the password doesn't have special characters that need URL encoding
4. **IP Restrictions**: If you have IP restrictions enabled, make sure your server's IP is whitelisted




