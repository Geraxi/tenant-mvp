# OAuth Troubleshooting Quick Checklist

Use this checklist to quickly identify and fix OAuth issues.

## ✅ Pre-Flight Checks

- [ ] `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` is set in `.env` file
- [ ] Key starts with `pk_test_` or `pk_live_`
- [ ] Key matches the one in Clerk Dashboard → Applications
- [ ] App has been restarted after adding the key

## ✅ Clerk Dashboard Configuration

- [ ] Go to Clerk Dashboard → User & Authentication → Social Connections
- [ ] Google OAuth is **enabled**
- [ ] Apple OAuth is **enabled** (for iOS)
- [ ] OAuth credentials (Client ID/Secret) are configured
- [ ] Redirect URLs are configured (usually auto-configured for Expo)

## ✅ Code Verification

- [ ] `WebBrowser.maybeCompleteAuthSession()` is called at top level of `App.tsx`
- [ ] `ClerkProvider` wraps the entire app
- [ ] `tokenCache={createTokenCache()}` is passed to ClerkProvider
- [ ] `useOAuth` hook is used (not web version)
- [ ] `setActive({ session: createdSessionId })` is called after OAuth

## ✅ Runtime Checks

Run the app and check console logs when clicking OAuth button:

- [ ] `[SignInScreen] Starting Google/Apple OAuth flow...` appears
- [ ] Browser opens with OAuth provider
- [ ] `[SignInScreen] Google/Apple OAuth result:` shows `createdSessionId: true`
- [ ] `[SignInScreen] Activating session...` appears
- [ ] `[SignInScreen] Session activated successfully` appears
- [ ] `[SignInScreen] User signed in via Clerk` appears
- [ ] `onSignInSuccess()` callback is called

## 🔍 If OAuth Button Does Nothing

1. Check if button is disabled: `disabled={googleLoading || appleLoading}`
2. Check if `isLoaded` is `false` (Clerk not initialized)
3. Check console for errors when button is pressed
4. Verify `startOAuthFlow` is not throwing an error

## 🔍 If Browser Opens But Fails

1. Check Clerk Dashboard → Social Connections for configuration errors
2. Verify OAuth provider credentials are correct
3. Check if redirect URL is allowed in Clerk Dashboard
4. Look for error messages in the OAuth provider's page

## 🔍 If Session Created But Not Activated

1. Check if `setActive` is available: `!!result.setActive`
2. Check if `createdSessionId` exists: `!!result.createdSessionId`
3. Verify `setActive()` is being called (check logs)
4. Check if `isSignedIn` becomes `true` after `setActive()`
5. Add polling to wait for `isSignedIn` to become `true`

## 🔍 If Redirected Back to Login

1. Check `App.tsx` `initializeApp()` function
2. Verify it's not checking auth too early
3. Check if both Clerk and Supabase auth are being checked
4. Add delay before redirecting to login
5. Check if `isClerkSignedIn` is being checked correctly

## 🐛 Common Error Messages

### "OAuth flow did not create a session"
- **Fix**: Enable OAuth provider in Clerk Dashboard

### "Session activation is not available"
- **Fix**: Check if `setActive` is returned from `startOAuthFlow()`

### "Clerk is not loaded yet"
- **Fix**: Wait for `isLoaded === true` before starting OAuth

### "Failed to sign in with Google/Apple"
- **Fix**: Check the full error message in `err?.errors?.[0]?.longMessage`

## 📝 Quick Test Script

Add this to `SignInScreen.tsx` to test OAuth:

```typescript
const testOAuth = async () => {
  console.log('=== OAuth Test Start ===');
  console.log('1. Clerk loaded:', isLoaded);
  console.log('2. Already signed in:', isSignedIn);
  console.log('3. Publishable key exists:', !!process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY);
  
  try {
    const result = await startGoogleOAuth();
    console.log('4. OAuth result:', result);
    if (result.createdSessionId && result.setActive) {
      await result.setActive({ session: result.createdSessionId });
      console.log('5. Session activated');
      setTimeout(() => {
        console.log('6. Final auth state:', { isSignedIn, userId });
      }, 2000);
    }
  } catch (err) {
    console.error('7. Error:', err);
  }
  console.log('=== OAuth Test End ===');
};
```

## 🚀 Quick Fixes to Try

1. **Restart the app** after changing environment variables
2. **Clear app data** and try again
3. **Check network connectivity** (OAuth requires internet)
4. **Verify Expo Go** or development build is up to date
5. **Try on a physical device** instead of simulator (some OAuth providers don't work in simulator)

## 📞 Still Not Working?

1. Check the full diagnostic document: `OAUTH_DIAGNOSTIC.md`
2. Collect console logs from start to finish
3. Take screenshot of Clerk Dashboard → Social Connections
4. Share error messages and logs


