# Clerk Authentication Setup for React Native Expo

This document describes the Clerk authentication implementation for the React Native Expo app.

## Files Created

### 1. `lib/tokenCache.ts`
- Implements token caching using `expo-secure-store`
- Provides secure storage for Clerk authentication tokens
- Exports `createTokenCache()` function that returns a `TokenCache` object

### 2. `screens/SignInScreen.tsx`
- Complete sign-in screen with Apple and Google OAuth buttons
- Uses `useOAuth` hook from `@clerk/clerk-expo` (mobile-specific)
- Implements proper error handling with user-friendly messages
- Shows loading states for both OAuth buttons
- Responsive design for iPhone and iPad
- Automatically activates session after successful OAuth

### 3. `App.tsx` (Updated)
- Wrapped with `ClerkProvider` at the root level
- Configured with token cache using SecureStore
- Calls `WebBrowser.maybeCompleteAuthSession()` at the top level

## Dependencies Added

- `expo-web-browser`: Added to `package.json` (version ~14.0.4)

## Environment Variables Required

Make sure you have the following environment variable set:

```bash
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
```

## Usage

### Using the SignInScreen

Replace your existing login screen with the new `SignInScreen`:

```tsx
import SignInScreen from './screens/SignInScreen';

// In your navigation/routing:
<SignInScreen 
  onSignInSuccess={() => {
    // Handle successful sign-in
    // Navigate to home screen, etc.
  }}
/>
```

### Features

1. **Google OAuth**: Works on both iOS and Android
2. **Apple OAuth**: Only shown on iOS devices
3. **Loading States**: Shows ActivityIndicator during OAuth flow
4. **Error Handling**: Displays specific error messages from Clerk
5. **Session Activation**: Automatically activates session after OAuth
6. **Responsive Design**: Adapts to iPhone and iPad screen sizes

## How It Works

1. User taps Google or Apple button
2. `useOAuth` hook starts the OAuth flow
3. Expo WebBrowser opens in-app browser for authentication
4. User authenticates with provider (Google/Apple)
5. Clerk processes the OAuth callback
6. Session is automatically created and activated
7. `onSignInSuccess` callback is called
8. App can navigate to the appropriate screen

## Important Notes

- **No redirect URLs needed**: Clerk handles OAuth entirely within the app
- **No callback routes**: OAuth flow completes automatically
- **No URL schemes**: Clerk manages deep linking internally
- **Secure token storage**: Tokens are stored in SecureStore (encrypted)
- **WebBrowser.maybeCompleteAuthSession()**: Called at top level to ensure OAuth callbacks work

## Testing

1. Make sure `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` is set in your `.env` file
2. Install dependencies: `npm install` or `npx expo install expo-web-browser`
3. Run the app: `npx expo start`
4. Test Google OAuth on both iOS and Android
5. Test Apple OAuth on iOS device/simulator

## Troubleshooting

### OAuth not working
- Check that `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` is set correctly
- Verify Google/Apple OAuth is enabled in Clerk Dashboard
- Check console logs for error messages

### Session not activating
- Ensure `setActive` is called after OAuth completes
- Check that `createdSessionId` is returned from `startOAuthFlow`

### Errors not showing
- Check that error handling extracts `err?.errors?.[0]?.longMessage`
- Verify Alert.alert is working on your platform


