# OAuth Quick Fix Guide

## If you're seeing "Error 400: invalid_request"

This error means Google is rejecting the OAuth request, usually due to a redirect URI mismatch.

### Quick Fix (5 minutes)

1. **Get the Redirect URI from Clerk:**
   - Go to [Clerk Dashboard](https://dashboard.clerk.com)
   - Navigate to **User & Authentication** → **Social Connections** → **Google**
   - Look for the **Redirect URI** field (it will show something like `https://accounts.clerk.dev/v1/oauth_callback` or `https://[your-domain].clerk.accounts.dev/v1/oauth_callback`)
   - **Copy this exact URI**

2. **Add Redirect URIs to Google Cloud Console:**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Select your project
   - Navigate to **APIs & Services** → **Credentials**
   - Click on your **OAuth 2.0 Client ID** (or create one if you don't have it)
   - In **Authorized redirect URIs**, click **+ ADD URI**
   - Add these URIs (one at a time):
     ```
     tenant://
     exp://localhost:8081
     exp://127.0.0.1:8081
     ```
   - **Most importantly**: Add the exact redirect URI you copied from Clerk Dashboard
   - Click **SAVE**

3. **Verify Google OAuth is enabled in Clerk:**
   - In Clerk Dashboard → Social Connections → Google
   - Make sure the toggle is **ON** (enabled)
   - Verify **Client ID** and **Client Secret** are filled in
   - Click **Save**

4. **Restart your app** and try again

### Common Redirect URIs for Expo Apps

For your app (`tenant` scheme), add these to Google Cloud Console:

```
tenant://
exp://localhost:8081
exp://127.0.0.1:8081
https://accounts.clerk.dev/v1/oauth_callback
https://*.clerk.accounts.dev/v1/oauth_callback
```

**Important**: The redirect URI from Clerk Dashboard must be added exactly as shown (case-sensitive, no trailing slashes).

### Still Not Working?

1. **Check the console logs** - The app now shows detailed error messages
2. **Verify your Clerk publishable key** - Should start with `pk_test_` or `pk_live_`
3. **Check Google Cloud Console quotas** - Make sure you haven't exceeded OAuth request limits
4. **Verify OAuth consent screen** - Must be configured in Google Cloud Console

### Need More Help?

See `GOOGLE_OAUTH_400_ERROR_FIX.md` for a complete step-by-step guide with screenshots.
