# How to Get Your Supabase Connection String

## Step-by-Step Instructions

### 1. Navigate to Database Settings
- Go to your Supabase project dashboard
- Click on **Settings** (gear icon in the left sidebar)
- Click on **Database** in the settings menu

### 2. Find the Connection String Section
The connection string is typically displayed in one of these locations:

#### Option A: Connection String Card (Most Common)
- Look for a section titled **"Connection string"** or **"Connection info"**
- It's usually at the top of the Database settings page
- You'll see tabs for different connection types:
  - **URI** - Full connection string
  - **Connection pooling** (Transaction mode)
  - **Connection pooling** (Session mode)
  - **Direct connection**

#### Option B: Connection Pooling Section
- Scroll down to the **"Connection pooling configuration"** section
- Look for a **"Connection string"** subsection or button
- Click to reveal the connection string

### 3. Select the Right Connection Type
**IMPORTANT:** Change the **"Method"** dropdown from "Direct connection" to **"Connection pooling" → "Transaction mode"**:

- **Direct connection** (what you're currently viewing):
  - Port: `5432`
  - Hostname: `db.iohszsmnkbxpauqqdudy.supabase.co`
  - Not suitable for server applications with connection pooling

- **Connection pooling** → **Transaction mode** (what you need):
  - Port: `6543`
  - Hostname: `aws-0.[REGION].pooler.supabase.com`
  - Better for serverless/server applications
  - Handles connection pooling automatically
  - This is the one you need!

### 4. Copy the Connection String
The connection string will look like:
```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0.[REGION].pooler.supabase.com:6543/postgres
```

**Important:** 
- Replace `[PASSWORD]` with your actual database password
- The `[PROJECT-REF]` should be `iohszsmnkbxpauqqdudy` (from your Supabase URL)
- The `[REGION]` should match your project's region (e.g., `us-east-1`, `eu-west-1`)

### 5. Update Your .env File
Once you have the connection string:
1. Open your `.env` file
2. Find the line: `DATABASE_URL=...`
3. Replace it with the connection string you copied
4. Make sure to replace `[PASSWORD]` with your actual password: `tenantmvp2026`

Example:
```env
DATABASE_URL=postgresql://postgres.iohszsmnkbxpauqqdudy:tenantmvp2026@aws-0.us-east-1.pooler.supabase.com:6543/postgres
```

### 6. Verify the Connection
After updating:
```bash
npm run dev
```

Check the server logs for any connection errors. If successful, you should see the server start without database connection errors.

## Troubleshooting

### If You Can't Find the Connection String:
1. Make sure you're in the **Database** settings (not API settings)
2. Look for a **"Show"** or **"Reveal"** button next to connection info
3. Check if there's a **"Copy"** button that copies the connection string
4. Try the **"Direct connection"** tab if pooling doesn't work

### If the Connection Still Fails:
1. **Check the region**: Make sure the region in the hostname matches your project region
   - Find your region in: Settings → General → Region
2. **Verify the password**: Make sure you're using the correct database password
3. **Check IP restrictions**: If enabled, make sure your server's IP is whitelisted
4. **Try direct connection**: Use port 5432 instead of 6543 for testing

### Common Regions:
- `us-east-1` - US East (N. Virginia)
- `us-west-1` - US West (N. California)  
- `eu-west-1` - EU (Ireland)
- `ap-southeast-1` - Asia Pacific (Singapore)

## Quick Reference

**Your Project Reference:** `iohszsmnkbxpauqqdudy`  
**Your Password:** `tenantmvp2026` (unless you've reset it)  
**Connection Pooling Port:** `6543`  
**Direct Connection Port:** `5432`

The connection string format:
```
postgresql://postgres.iohszsmnkbxpauqqdudy:tenantmvp2026@aws-0.[YOUR-REGION].pooler.supabase.com:6543/postgres
```

Replace `[YOUR-REGION]` with your actual region from the Supabase dashboard.

