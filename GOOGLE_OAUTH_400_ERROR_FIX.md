# Fixing Google OAuth "Error 400: invalid_request"

This error occurs when Google OAuth receives an invalid request. The most common causes are:

1. **Redirect URI mismatch** - The redirect URI doesn't match what's configured in Google Cloud Console
2. **Missing or incorrect Client ID** - Google OAuth credentials are not properly configured
3. **OAuth not enabled in Clerk** - Google OAuth provider is not enabled in Clerk Dashboard

## Step-by-Step Fix

### Step 1: Verify Clerk Dashboard Configuration

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Navigate to **User & Authentication** → **Social Connections**
3. Find **Google** in the list
4. Ensure it's **enabled** (toggle should be ON)
5. Click on **Google** to configure it

### Step 2: Configure Google OAuth in Clerk

In the Google OAuth configuration page in Clerk:

1. **Client ID**: Enter your Google OAuth Client ID
2. **Client Secret**: Enter your Google OAuth Client Secret
3. **Save** the configuration

**If you don't have Google OAuth credentials yet**, follow Step 3 first.

### Step 3: Create Google OAuth Credentials (If Needed)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project (or create a new one)
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Choose **Application type**: 
   - For **Web application** (if testing on web)
   - For **iOS** (if testing on iOS)
   - For **Android** (if testing on Android)
6. Configure **Authorized redirect URIs**:
   
   For Clerk, you need to add Clerk's redirect URI. Check your Clerk Dashboard:
   - Go to **User & Authentication** → **Social Connections** → **Google**
   - Look for the **Redirect URI** shown in the configuration
   - It typically looks like: `https://accounts.clerk.dev/v1/oauth_callback`
   - Or: `https://[your-clerk-domain].clerk.accounts.dev/v1/oauth_callback`
   
   **Add these redirect URIs to Google Cloud Console:**
   ```
   https://accounts.clerk.dev/v1/oauth_callback
   https://*.clerk.accounts.dev/v1/oauth_callback
   ```
   
   **For Expo/React Native**, also add:
   ```
   exp://localhost:8081
   exp://127.0.0.1:8081
   tenant://
   ```
   
   **For production**, add your app's URL scheme (check `app.json`):
   ```
   tenant://
   ```

7. Click **Create**
8. Copy the **Client ID** and **Client Secret**
9. Paste them into Clerk Dashboard → Social Connections → Google

### Step 4: Verify Redirect URIs Match

**Critical**: The redirect URI that Clerk sends to Google must exactly match one of the authorized redirect URIs in Google Cloud Console.

1. In Clerk Dashboard → Social Connections → Google, note the redirect URI
2. In Google Cloud Console → Credentials → Your OAuth Client, verify this exact URI is in the "Authorized redirect URIs" list
3. Make sure there are no typos or extra characters

### Step 5: Check Environment Variables

Verify your Clerk publishable key is set:

```bash
# Check if the key is set
echo $EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY

# Or check .env file
grep EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY .env
```

The key should start with `pk_test_` or `pk_live_`.

### Step 6: Common Redirect URI Patterns

For **Expo/React Native** apps, Clerk typically uses these redirect URIs:

- Development: `exp://localhost:8081` or `exp://127.0.0.1:8081`
- Production: Your app's custom URL scheme (from `app.json` → `scheme`)

In your `app.json`, you have:
```json
"scheme": "tenant"
```

So add to Google Cloud Console:
```
tenant://
```

### Step 7: Test the Fix

1. **Restart your app** after making changes
2. Clear app data/cache if possible
3. Try Google OAuth sign-in again
4. Check console logs for any errors

## Debugging Steps

### Check Console Logs

When you click "Continue with Google", check the console for:

```
[SignInScreen] Starting Google OAuth flow...
[SignInScreen] Google OAuth result: ...
```

If you see an error, it will show the specific issue.

### Verify OAuth Flow

1. Click "Continue with Google"
2. Browser should open with Google sign-in
3. After signing in, check the URL in the browser
4. Look for `error=400` or `error=invalid_request` in the URL parameters

### Check Google Cloud Console Logs

1. Go to Google Cloud Console → **APIs & Services** → **OAuth consent screen**
2. Check **OAuth consent screen** is configured
3. Go to **APIs & Services** → **Credentials**
4. Click on your OAuth client ID
5. Check the **Authorized redirect URIs** list

## Common Issues and Solutions

### Issue: "redirect_uri_mismatch"
**Solution**: Add the exact redirect URI from Clerk to Google Cloud Console

### Issue: "invalid_client"
**Solution**: Verify Client ID and Client Secret are correct in Clerk Dashboard

### Issue: "access_denied"
**Solution**: Check OAuth consent screen is configured in Google Cloud Console

### Issue: OAuth button does nothing
**Solution**: 
- Verify `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` is set
- Check Clerk is loaded: `isLoaded === true`
- Check Google OAuth is enabled in Clerk Dashboard

## Quick Checklist

- [ ] Google OAuth is **enabled** in Clerk Dashboard
- [ ] Client ID and Client Secret are configured in Clerk
- [ ] Redirect URIs are added to Google Cloud Console
- [ ] Redirect URI in Clerk matches one in Google Cloud Console
- [ ] OAuth consent screen is configured in Google Cloud Console
- [ ] `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` is set
- [ ] App has been restarted after configuration changes

## Still Not Working?

1. **Double-check redirect URIs** - They must match exactly (case-sensitive, no trailing slashes)
2. **Check Google Cloud Console quotas** - Make sure you haven't exceeded OAuth request limits
3. **Verify OAuth consent screen** - Must be configured for OAuth to work
4. **Check network connectivity** - OAuth requires internet connection
5. **Try on a physical device** - Some OAuth flows don't work in simulators

## Additional Resources

- [Clerk OAuth Documentation](https://clerk.com/docs/authentication/social-connections/oauth)
- [Google OAuth Setup Guide](https://developers.google.com/identity/protocols/oauth2)
- [Expo OAuth Guide](https://docs.expo.dev/guides/authentication/#google)

---

**Last Updated**: Based on current Clerk + Expo implementation
**Status**: Ready to fix OAuth 400 errors
