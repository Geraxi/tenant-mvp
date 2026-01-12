/**
 * OAuth Configuration Validator
 * Validates OAuth setup before attempting sign-in
 */

export interface OAuthConfigStatus {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validates OAuth configuration for Google sign-in
 */
export function validateGoogleOAuthConfig(): OAuthConfigStatus {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check Clerk publishable key
  const clerkKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (!clerkKey || clerkKey.trim() === '') {
    errors.push('EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY is not set');
  } else if (!clerkKey.startsWith('pk_test_') && !clerkKey.startsWith('pk_live_')) {
    warnings.push('Clerk publishable key format may be invalid (should start with pk_test_ or pk_live_)');
  }

  // Check app scheme (for redirect URI)
  // This would need to be passed in or read from app.json
  // For now, we'll just note that it should be configured

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Gets helpful error message based on error type
 */
export function getOAuthErrorMessage(error: any): string {
  const errorString = JSON.stringify(error).toLowerCase();
  const errorMessage = error?.message?.toLowerCase() || '';
  const longMessage = error?.errors?.[0]?.longMessage?.toLowerCase() || '';

  // Redirect URI mismatch (most common)
  if (
    errorString.includes('400') ||
    errorString.includes('invalid_request') ||
    errorString.includes('redirect_uri') ||
    errorMessage.includes('redirect_uri') ||
    longMessage.includes('redirect_uri')
  ) {
    return (
      'OAuth Configuration Error: Redirect URI mismatch.\n\n' +
      'This usually means the redirect URI in Google Cloud Console doesn\'t match what Clerk is sending.\n\n' +
      'To fix:\n' +
      '1. Go to Clerk Dashboard → User & Authentication → Social Connections → Google\n' +
      '2. Note the Redirect URI shown there\n' +
      '3. Go to Google Cloud Console → APIs & Services → Credentials\n' +
      '4. Edit your OAuth 2.0 Client ID\n' +
      '5. Add these Authorized redirect URIs:\n' +
      '   - tenant://\n' +
      '   - exp://localhost:8081\n' +
      '   - exp://127.0.0.1:8081\n' +
      '   - The exact redirect URI from Clerk Dashboard\n\n' +
      'See GOOGLE_OAUTH_400_ERROR_FIX.md for detailed instructions.'
    );
  }

  // OAuth not enabled
  if (
    errorString.includes('not enabled') ||
    errorString.includes('oauth') && errorString.includes('disabled') ||
    errorMessage.includes('not enabled')
  ) {
    return (
      'Google OAuth is not enabled in Clerk Dashboard.\n\n' +
      'To fix:\n' +
      '1. Go to Clerk Dashboard → User & Authentication → Social Connections\n' +
      '2. Find Google in the list\n' +
      '3. Enable it (toggle should be ON)\n' +
      '4. Configure Client ID and Client Secret if not already done'
    );
  }

  // Invalid credentials
  if (
    errorString.includes('client_id') ||
    errorString.includes('invalid_client') ||
    errorMessage.includes('client_id') ||
    errorMessage.includes('invalid_client')
  ) {
    return (
      'Invalid Google OAuth credentials.\n\n' +
      'To fix:\n' +
      '1. Go to Clerk Dashboard → Social Connections → Google\n' +
      '2. Verify your Client ID and Client Secret are correct\n' +
      '3. Make sure they match your Google Cloud Console OAuth client'
    );
  }

  // Generic error
  return (
    error?.errors?.[0]?.longMessage ||
    error?.errors?.[0]?.message ||
    error?.message ||
    'Failed to sign in with Google. Please try again.'
  );
}
