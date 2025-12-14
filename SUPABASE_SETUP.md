# Supabase Setup Guide

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login and create a new project
3. Choose a region close to your users
4. Set a strong database password
5. Wait for the project to be created (2-3 minutes)

## 2. Get Project Credentials

1. Go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (e.g., `https://your-project-id.supabase.co`)
   - **anon public** key (starts with `eyJ...`)

## 3. Update Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Update `.env.local` with your actual credentials:
   ```env
   SUPABASE_URL=https://your-actual-project-id.supabase.co
   SUPABASE_ANON_KEY=your-actual-anon-key-here
   EXPO_PUBLIC_SUPABASE_URL=https://your-actual-project-id.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key-here
   ```

## 4. Set Up Database

1. Go to **SQL Editor** in your Supabase dashboard
2. Copy the entire contents of `utils/supabaseSetup.sql`
3. Paste and run the SQL script
4. This will create all necessary tables, policies, and storage buckets

## 5. Configure Storage Buckets

1. Go to **Storage** in your Supabase dashboard
2. The following buckets should be created automatically:
   - `user_uploads` (public)
   - `user_uploads_private` (private)
   - `property_images` (public)
   - `contracts` (private)

3. If buckets weren't created, create them manually with the correct permissions

## 6. Test the Setup

1. Start your Expo development server:
   ```bash
   npx expo start --ios --clear
   ```

2. Try to sign up with a test email
3. Check the Supabase dashboard to see if the user was created
4. Verify that the profile and wallet records were created

## 7. Optional: Configure External Services

### DocuSign Integration
1. Create a DocuSign developer account
2. Get your integration key and secret
3. Update the signing service URLs in `utils/supabaseContracts.ts`

### SPID Integration
1. Register with SPID providers
2. Update the SPID service URLs

### Aruba Integration
1. Create an Aruba Sign account
2. Update the Aruba service URLs

## Troubleshooting

### Common Issues:

1. **"Invalid API key"** - Check your environment variables
2. **"Table doesn't exist"** - Run the SQL setup script
3. **"Storage bucket not found"** - Create the buckets manually
4. **"Permission denied"** - Check RLS policies

### Debug Mode:
- Check the Supabase dashboard logs
- Use the browser developer tools
- Check Expo logs for errors

## Security Notes

- Never commit `.env.local` to version control
- Use Row Level Security (RLS) policies
- Regularly rotate your API keys
- Monitor usage in the Supabase dashboard
