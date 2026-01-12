# OAuth Diagnostic Report - Clerk Expo Implementation

## Problem Statement
OAuth authentication (Google and Apple) is failing in the React Native Expo app. Users click the OAuth buttons, but the flow doesn't complete successfully and redirects back to the login page.

## Current Implementation Overview

### Tech Stack
- **Framework**: React Native Expo
- **Auth Library**: `@clerk/clerk-expo` v2.19.17
- **OAuth Package**: `expo-web-browser` v14.0.4
- **Token Storage**: `expo-secure-store` v15.0.8
- **Platform**: iOS (primary), Android (secondary)

### File Structure
```
App.tsx                    # Root component with ClerkProvider
├── lib/tokenCache.ts     # SecureStore token cache implementation
└── screens/SignInScreen.tsx  # OAuth UI and handlers
```

## Expected Behavior

1. User taps "Continue with Google" or "Continue with Apple"
2. In-app browser opens with OAuth provider (Google/Apple)
3. User authenticates with provider
4. Browser redirects back to app
5. `startOAuthFlow()` returns `{ createdSessionId, setActive }`
6. `setActive({ session: createdSessionId })` is called
7. `useAuth()` hook detects `isSignedIn === true`
8. `useEffect` in SignInScreen calls `onSignInSuccess()`
9. App navigates to main screen

## Actual Behavior (Failure Points)

Based on user report: "oauth fails and takes me back to the login page"

**Observed symptoms:**
- OAuth buttons trigger the flow
- Browser opens (likely)
- After authentication, user is redirected back to login screen
- No successful sign-in occurs

## Code Analysis

### 1. App.tsx Setup

```typescript
// Line 22: Top-level OAuth completion
WebBrowser.maybeCompleteAuthSession();

// Lines 928-950: ClerkProvider wrapper
export default function App() {
  const clerkPublishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
  
  if (!clerkPublishableKey) {
    console.warn('[App] EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY is not set.');
  }

  return (
    <ClerkProvider
      publishableKey={clerkPublishableKey || ''}
      tokenCache={createTokenCache()}
    >
      <StripeProvider>
        <AppContent />
      </StripeProvider>
    </ClerkProvider>
  );
}
```

**Potential Issues:**
- ✅ `WebBrowser.maybeCompleteAuthSession()` is called at top level (correct)
- ✅ `ClerkProvider` wraps app (correct)
- ⚠️ **ISSUE**: If `clerkPublishableKey` is empty string, Clerk will fail silently
- ⚠️ **ISSUE**: No error boundary if Clerk fails to initialize

### 2. SignInScreen.tsx OAuth Handlers

```typescript
// Lines 58-101: Google OAuth handler
const handleGoogleSignIn = async () => {
  try {
    setGoogleLoading(true);
    const { createdSessionId, setActive } = await startGoogleOAuth();
    
    if (createdSessionId && setActive) {
      await setActive({ session: createdSessionId });
      // useEffect should detect isSignedIn change
    } else if (createdSessionId && !setActive) {
      // Fallback: wait and call callback
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (onSignInSuccess) onSignInSuccess();
    } else {
      throw new Error('OAuth flow did not create a session');
    }
  } catch (err: any) {
    const errorMessage = 
      err?.errors?.[0]?.longMessage ||
      err?.errors?.[0]?.message ||
      err?.message ||
      'Failed to sign in with Google. Please try again.';
    Alert.alert('Sign In Error', errorMessage);
  } finally {
    setGoogleLoading(false);
  }
};
```

**Potential Issues:**
- ⚠️ **ISSUE**: If `startOAuthFlow()` throws an error, it's caught but user might not see it
- ⚠️ **ISSUE**: If `setActive()` fails silently, no error is shown
- ⚠️ **ISSUE**: Race condition: `setActive()` might complete but `isSignedIn` hasn't updated yet
- ⚠️ **ISSUE**: No verification that session was actually activated

### 3. Auth State Monitoring

```typescript
// Lines 40-53: Monitor auth state changes
useEffect(() => {
  if (isLoaded && isSignedIn && userId) {
    console.log('[SignInScreen] User signed in via Clerk');
    if (onSignInSuccess) {
      setTimeout(() => {
        onSignInSuccess();
      }, 500);
    }
  }
}, [isSignedIn, isLoaded, userId, onSignInSuccess]);
```

**Potential Issues:**
- ⚠️ **ISSUE**: If `isSignedIn` never becomes `true`, callback never fires
- ⚠️ **ISSUE**: If `isLoaded` is `false`, check never passes
- ⚠️ **ISSUE**: Dependency on `onSignInSuccess` might cause unnecessary re-runs

### 4. Token Cache Implementation

```typescript
// lib/tokenCache.ts
const createTokenCache = (): TokenCache => {
  return {
    async getToken(key: string): Promise<string | null> {
      try {
        return await SecureStore.getItemAsync(key);
      } catch (error) {
        console.error(`[TokenCache] Error getting token:`, error);
        return null;
      }
    },
    // ... saveToken, clearToken
  };
};
```

**Potential Issues:**
- ✅ Implementation looks correct
- ⚠️ **ISSUE**: If SecureStore fails, tokens aren't persisted (but should still work for session)

## Root Cause Hypotheses

### Hypothesis 1: Missing or Invalid Clerk Publishable Key
**Likelihood**: HIGH
**Evidence**: 
- Code warns if key is missing but continues with empty string
- Empty key would cause all Clerk operations to fail silently

**Check:**
```bash
# Verify environment variable is set
echo $EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY

# Or check .env file
grep EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY .env
```

### Hypothesis 2: OAuth Providers Not Configured in Clerk Dashboard
**Likelihood**: HIGH
**Evidence**:
- OAuth requires explicit enablement in Clerk dashboard
- Missing configuration would cause `startOAuthFlow()` to fail

**Check:**
1. Go to Clerk Dashboard → User & Authentication → Social Connections
2. Verify Google OAuth is enabled
3. Verify Apple OAuth is enabled (for iOS)
4. Check that OAuth credentials (Client ID, Client Secret) are configured

### Hypothesis 3: Session Activation Failing Silently
**Likelihood**: MEDIUM
**Evidence**:
- `setActive()` might throw but error is caught
- No verification that session is actually active after `setActive()`

**Check:**
- Add logging after `setActive()` to verify session state
- Check if `isSignedIn` becomes `true` after activation

### Hypothesis 4: Race Condition in Auth State Update
**Likelihood**: MEDIUM
**Evidence**:
- `setActive()` completes but `isSignedIn` hasn't updated yet
- `useEffect` might run before state updates

**Check:**
- Add polling/retry logic to wait for `isSignedIn` to become `true`
- Increase timeout in `useEffect`

### Hypothesis 5: WebBrowser.maybeCompleteAuthSession() Not Working
**Likelihood**: LOW
**Evidence**:
- Called at top level (correct)
- But might not be completing the OAuth session properly

**Check:**
- Verify `expo-web-browser` version compatibility
- Check if OAuth redirect URL is being handled correctly

### Hypothesis 6: App Navigation Overriding Auth State
**Likelihood**: MEDIUM
**Evidence**:
- App might be checking auth state and redirecting to login
- `AppContent` component might have auth checks that redirect

**Check:**
- Review `App.tsx` `initializeApp()` function
- Check if it redirects to login when no user is found
- Verify timing: does redirect happen before Clerk session is established?

## Debugging Steps

### Step 1: Verify Environment Configuration
```bash
# Check if key is set
npx expo config --type public | grep CLERK

# Or check .env file
cat .env | grep CLERK
```

### Step 2: Add Comprehensive Logging
Add these logs to `SignInScreen.tsx`:

```typescript
const handleGoogleSignIn = async () => {
  try {
    setGoogleLoading(true);
    console.log('[DEBUG] 1. Starting OAuth flow...');
    console.log('[DEBUG] 1a. Clerk loaded?', isLoaded);
    console.log('[DEBUG] 1b. Already signed in?', isSignedIn);
    
    const result = await startGoogleOAuth();
    console.log('[DEBUG] 2. OAuth result:', {
      hasCreatedSessionId: !!result.createdSessionId,
      createdSessionId: result.createdSessionId,
      hasSetActive: !!result.setActive,
      fullResult: result,
    });
    
    if (result.createdSessionId && result.setActive) {
      console.log('[DEBUG] 3. Calling setActive...');
      await result.setActive({ session: result.createdSessionId });
      console.log('[DEBUG] 4. setActive completed');
      
      // Wait and check auth state
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('[DEBUG] 5. Auth state after setActive:', {
        isSignedIn,
        isLoaded,
        userId,
      });
    }
  } catch (err) {
    console.error('[DEBUG] ERROR:', err);
    console.error('[DEBUG] ERROR details:', JSON.stringify(err, null, 2));
  }
};
```

### Step 3: Check Clerk Dashboard Configuration
1. **OAuth Providers**:
   - Dashboard → User & Authentication → Social Connections
   - Enable Google OAuth
   - Enable Apple OAuth (iOS)
   - Verify redirect URLs are configured (should be auto-configured for Expo)

2. **Application Settings**:
   - Dashboard → Applications → [Your App]
   - Verify publishable key matches `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - Check allowed origins/redirect URLs

### Step 4: Test OAuth Flow Manually
1. Add breakpoints/logs at each step
2. Verify `startOAuthFlow()` is called
3. Verify browser opens
4. Verify user completes authentication
5. Verify browser redirects back
6. Verify `createdSessionId` is returned
7. Verify `setActive()` is called
8. Verify `isSignedIn` becomes `true`

### Step 5: Check for Competing Auth Systems
The app also uses `useSupabaseAuth()`. Check if:
- Supabase auth is interfering with Clerk
- App initialization is checking Supabase first and redirecting
- Both auth systems are conflicting

**Location**: `App.tsx` line 70:
```typescript
const { user, loading: authLoading, ... } = useSupabaseAuth();
const { isSignedIn: isClerkSignedIn, ... } = useClerkAuth();
```

## Code Snippets for Fixes

### Fix 1: Add Error Handling and Verification
```typescript
const handleGoogleSignIn = async () => {
  try {
    setGoogleLoading(true);
    
    // Verify Clerk is loaded
    if (!isLoaded) {
      throw new Error('Clerk is not loaded yet. Please wait.');
    }
    
    const { createdSessionId, setActive } = await startGoogleOAuth();
    
    if (!createdSessionId) {
      throw new Error('OAuth flow did not create a session. Please try again.');
    }
    
    if (!setActive) {
      throw new Error('Session activation is not available. Please try again.');
    }
    
    // Activate session
    await setActive({ session: createdSessionId });
    
    // Verify session is active (poll for up to 5 seconds)
    let attempts = 0;
    while (attempts < 10 && !isSignedIn) {
      await new Promise(resolve => setTimeout(resolve, 500));
      attempts++;
    }
    
    if (!isSignedIn) {
      throw new Error('Session activation failed. Please try again.');
    }
    
    // Success - useEffect will handle callback
  } catch (err: any) {
    // ... error handling
  }
};
```

### Fix 2: Improve Auth State Monitoring
```typescript
useEffect(() => {
  if (isLoaded && isSignedIn && userId) {
    console.log('[SignInScreen] User signed in, calling callback');
    // Remove setTimeout, call immediately
    if (onSignInSuccess) {
      onSignInSuccess();
    }
  }
}, [isSignedIn, isLoaded, userId]); // Remove onSignInSuccess from deps
```

### Fix 3: Add Publishable Key Validation
```typescript
export default function App() {
  const clerkPublishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
  
  if (!clerkPublishableKey || clerkPublishableKey.trim() === '') {
    console.error('[App] EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY is missing or empty!');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Error: Clerk publishable key is not configured.</Text>
      </View>
    );
  }
  
  // ... rest of component
}
```

## Required Information for Debugging

To help diagnose the issue, please provide:

1. **Console Logs**: Full console output when clicking OAuth button
2. **Environment Check**: Output of `npx expo config --type public | grep CLERK`
3. **Clerk Dashboard**: Screenshot of Social Connections page showing enabled providers
4. **Error Messages**: Any error alerts shown to user
5. **Network Logs**: Check if OAuth requests are being made (use React Native Debugger or Flipper)

## Expected Console Output (Success Case)

```
[SignInScreen] Starting Google OAuth flow...
[SignInScreen] Google OAuth result: { createdSessionId: true, hasSetActive: true }
[SignInScreen] Activating session...
[SignInScreen] Session activated successfully
[SignInScreen] User signed in via Clerk: { userId: 'user_xxx', isSignedIn: true, isLoaded: true }
[SignInScreen] Calling onSignInSuccess callback
[App] Clerk OAuth sign-in successful
```

## Common Issues and Solutions

### Issue: "OAuth flow did not create a session"
**Cause**: OAuth provider not configured in Clerk Dashboard
**Solution**: Enable Google/Apple OAuth in Clerk Dashboard → Social Connections

### Issue: "Session activation failed"
**Cause**: `setActive()` is failing or session isn't persisting
**Solution**: 
- Check token cache implementation
- Verify SecureStore permissions
- Check Clerk dashboard for session limits

### Issue: "Clerk is not loaded yet"
**Cause**: ClerkProvider hasn't initialized
**Solution**: 
- Verify ClerkProvider wraps entire app
- Check publishable key is valid
- Wait for `isLoaded === true` before starting OAuth

### Issue: User redirected to login after OAuth
**Cause**: App initialization checking auth before Clerk session is established
**Solution**: 
- Add delay/retry logic in `initializeApp()`
- Check both Clerk and Supabase auth states
- Don't redirect if Clerk is still loading

## Next Steps

1. **Immediate**: Add comprehensive logging to identify failure point
2. **Verify**: Check Clerk Dashboard OAuth configuration
3. **Test**: Verify environment variable is set correctly
4. **Fix**: Implement fixes based on which hypothesis is correct
5. **Monitor**: Add error tracking to catch issues in production

---

**Last Updated**: Based on code review of current implementation
**Status**: Awaiting diagnostic information to identify root cause


