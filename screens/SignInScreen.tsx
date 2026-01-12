import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOAuth } from '@clerk/clerk-expo';
import { useAuth } from '@clerk/clerk-expo';
import { MaterialIcons } from '@expo/vector-icons';
import { getOAuthErrorMessage } from '../utils/oauthConfigValidator';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;
const __DEV__ = process.env.NODE_ENV === 'development';

interface SignInScreenProps {
  onSignInSuccess?: () => void;
}

/**
 * Sign-in screen with Apple and Google OAuth buttons
 * Uses Clerk's mobile-specific useOAuth hook for OAuth flow
 */
export default function SignInScreen({ onSignInSuccess }: SignInScreenProps) {
  const { isSignedIn, isLoaded, userId } = useAuth();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);

  // Use refs to prevent stale closures
  const isSignedInRef = useRef(isSignedIn);
  const isLoadedRef = useRef(isLoaded);
  const onSignInSuccessRef = useRef(onSignInSuccess);

  // Update refs when values change
  useEffect(() => {
    isSignedInRef.current = isSignedIn;
    isLoadedRef.current = isLoaded;
    onSignInSuccessRef.current = onSignInSuccess;
  }, [isSignedIn, isLoaded, onSignInSuccess]);

  // Google OAuth hook
  const { startOAuthFlow: startGoogleOAuth } = useOAuth({ strategy: 'oauth_google' });

  // Apple OAuth hook
  const { startOAuthFlow: startAppleOAuth } = useOAuth({ strategy: 'oauth_apple' });
  
  // #region agent log
  useEffect(() => {
    fetch('http://127.0.0.1:7242/ingest/33576b38-9696-4a90-8e4e-ed8f02c7e75d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'SignInScreen.tsx:47',message:'OAuth hooks initialized',data:{hasStartGoogleOAuth:!!startGoogleOAuth,hasStartAppleOAuth:!!startAppleOAuth,isLoaded,isSignedIn},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  }, [isLoaded, isSignedIn]);
  // #endregion

  // Monitor auth state changes and call success callback when signed in
  // Removed onSignInSuccess from deps to prevent unnecessary re-runs
  useEffect(() => {
    if (isLoaded && isSignedIn && userId) {
      if (__DEV__) {
        console.log('[SignInScreen] User signed in via Clerk:', { userId, isSignedIn, isLoaded });
      }
      
      // Call success callback if provided (use ref to avoid stale closure)
      const callback = onSignInSuccessRef.current;
      if (callback) {
        if (__DEV__) {
          console.log('[SignInScreen] Calling onSignInSuccess callback');
        }
        // Small delay to ensure session is fully established
        setTimeout(() => {
          callback();
        }, 500);
      }
    }
  }, [isSignedIn, isLoaded, userId]);

  /**
   * Poll for isSignedIn to become true after session activation
   * Returns true if signed in, false if timeout
   */
  const pollForSignedIn = async (maxAttempts: number = 10, delayMs: number = 500): Promise<boolean> => {
    if (__DEV__) {
      console.log('[SignInScreen] Starting to poll for isSignedIn...');
    }
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      // Check current auth state
      const currentIsSignedIn = isSignedInRef.current;
      const currentIsLoaded = isLoadedRef.current;
      
      if (__DEV__) {
        console.log(`[SignInScreen] Poll attempt ${attempt + 1}/${maxAttempts}:`, {
          isSignedIn: currentIsSignedIn,
          isLoaded: currentIsLoaded,
        });
      }
      
      if (currentIsLoaded && currentIsSignedIn) {
        if (__DEV__) {
          console.log('[SignInScreen] User is signed in after polling');
        }
        return true;
      }
      
      // Wait before next attempt
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
    
    if (__DEV__) {
      console.warn('[SignInScreen] Polling timeout - user not signed in after', maxAttempts * delayMs, 'ms');
    }
    return false;
  };

  /**
   * Handle Google OAuth sign-in
   */
  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/33576b38-9696-4a90-8e4e-ed8f02c7e75d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'SignInScreen.tsx:115',message:'handleGoogleSignIn entry',data:{isLoaded:isLoadedRef.current,isSignedIn:isSignedInRef.current,hasPublishableKey:!!process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,publishableKeyPrefix:process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY?.substring(0,10)||'missing'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      
      // Verify Clerk is loaded before starting OAuth
      if (!isLoadedRef.current) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/33576b38-9696-4a90-8e4e-ed8f02c7e75d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'SignInScreen.tsx:120',message:'Clerk not loaded error',data:{isLoaded:isLoadedRef.current},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        throw new Error('Clerk is not loaded yet. Please wait a moment and try again.');
      }

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/33576b38-9696-4a90-8e4e-ed8f02c7e75d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'SignInScreen.tsx:125',message:'Before startGoogleOAuth call',data:{isLoaded:isLoadedRef.current,strategy:'oauth_google'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion

      if (__DEV__) {
        console.log('[SignInScreen] Starting Google OAuth flow...');
      }

      // Start the OAuth flow - this opens the in-app browser
      const result = await startGoogleOAuth();
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/33576b38-9696-4a90-8e4e-ed8f02c7e75d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'SignInScreen.tsx:129',message:'After startGoogleOAuth call',data:{hasResult:!!result,hasCreatedSessionId:!!result?.createdSessionId,createdSessionId:result?.createdSessionId||null,hasSetActive:!!result?.setActive,resultKeys:result?Object.keys(result):[]},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      
      if (__DEV__) {
        console.log('[SignInScreen] Google OAuth result:', {
          createdSessionId: !!result.createdSessionId,
          createdSessionIdValue: result.createdSessionId,
          hasSetActive: !!result.setActive,
        });
      }

      const { createdSessionId, setActive } = result;

      // Verify session was created
      if (!createdSessionId) {
        throw new Error('OAuth flow did not create a session. Please try again.');
      }

      // Verify setActive is available
      if (!setActive) {
        throw new Error('Session activation is not available. Please try again.');
      }

      // Activate the session
      if (__DEV__) {
        console.log('[SignInScreen] Activating session with ID:', createdSessionId);
      }
      
      await setActive({ session: createdSessionId });
      
      if (__DEV__) {
        console.log('[SignInScreen] setActive() completed');
      }

      // Poll for isSignedIn to become true (up to 5 seconds)
      const isNowSignedIn = await pollForSignedIn(10, 500);
      
      if (!isNowSignedIn) {
        throw new Error('Session activation failed. The session was created but could not be activated. Please try again.');
      }

      // Success - useEffect will detect isSignedIn change and call onSignInSuccess
      if (__DEV__) {
        console.log('[SignInScreen] Google OAuth completed successfully');
      }
    } catch (err: any) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/33576b38-9696-4a90-8e4e-ed8f02c7e75d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'SignInScreen.tsx:173',message:'OAuth error caught',data:{errorName:err?.name,errorMessage:err?.message,errorStack:err?.stack?.substring(0,200),hasErrors:!!err?.errors,errorsLength:err?.errors?.length||0,firstErrorLongMessage:err?.errors?.[0]?.longMessage||null,firstErrorMessage:err?.errors?.[0]?.message||null,errorCode:err?.code||null,errorStatus:err?.status||null},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
      
      // Enhanced error logging
      console.error('[SignInScreen] Google OAuth error:', err);
      console.error('[SignInScreen] Error name:', err?.name);
      console.error('[SignInScreen] Error message:', err?.message);
      console.error('[SignInScreen] Error code:', err?.code);
      console.error('[SignInScreen] Error status:', err?.status);
      if (err?.errors && err.errors.length > 0) {
        console.error('[SignInScreen] First error:', err.errors[0]);
        console.error('[SignInScreen] First error longMessage:', err.errors[0]?.longMessage);
        console.error('[SignInScreen] First error message:', err.errors[0]?.message);
      }
      console.error('[SignInScreen] Full error object:', JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
      
      // Extract user-friendly error message - prioritize longMessage
      let errorMessage = 
        err?.errors?.[0]?.longMessage ||
        err?.errors?.[0]?.message ||
        err?.message ||
        'Failed to sign in with Google. Please try again.';
      
      // Use helper function to get user-friendly error message
      errorMessage = getOAuthErrorMessage(err);

      Alert.alert('Sign In Error', errorMessage);
    } finally {
      setGoogleLoading(false);
    }
  };

  /**
   * Handle Apple OAuth sign-in
   */
  const handleAppleSignIn = async () => {
    try {
      setAppleLoading(true);
      
      // Verify Clerk is loaded before starting OAuth
      if (!isLoadedRef.current) {
        throw new Error('Clerk is not loaded yet. Please wait a moment and try again.');
      }

      if (__DEV__) {
        console.log('[SignInScreen] Starting Apple OAuth flow...');
      }

      // Start the OAuth flow - this opens the in-app browser
      const result = await startAppleOAuth();
      
      if (__DEV__) {
        console.log('[SignInScreen] Apple OAuth result:', {
          createdSessionId: !!result.createdSessionId,
          createdSessionIdValue: result.createdSessionId,
          hasSetActive: !!result.setActive,
        });
      }

      const { createdSessionId, setActive } = result;

      // Verify session was created
      if (!createdSessionId) {
        throw new Error('OAuth flow did not create a session. Please try again.');
      }

      // Verify setActive is available
      if (!setActive) {
        throw new Error('Session activation is not available. Please try again.');
      }

      // Activate the session
      if (__DEV__) {
        console.log('[SignInScreen] Activating session with ID:', createdSessionId);
      }
      
      await setActive({ session: createdSessionId });
      
      if (__DEV__) {
        console.log('[SignInScreen] setActive() completed');
      }

      // Poll for isSignedIn to become true (up to 5 seconds)
      const isNowSignedIn = await pollForSignedIn(10, 500);
      
      if (!isNowSignedIn) {
        throw new Error('Session activation failed. The session was created but could not be activated. Please try again.');
      }

      // Success - useEffect will detect isSignedIn change and call onSignInSuccess
      if (__DEV__) {
        console.log('[SignInScreen] Apple OAuth completed successfully');
      }
    } catch (err: any) {
      // Enhanced error logging
      console.error('[SignInScreen] Apple OAuth error:', err);
      console.error('[SignInScreen] Error name:', err?.name);
      console.error('[SignInScreen] Error message:', err?.message);
      console.error('[SignInScreen] Error code:', err?.code);
      console.error('[SignInScreen] Error status:', err?.status);
      if (err?.errors && err.errors.length > 0) {
        console.error('[SignInScreen] First error:', err.errors[0]);
        console.error('[SignInScreen] First error longMessage:', err.errors[0]?.longMessage);
        console.error('[SignInScreen] First error message:', err.errors[0]?.message);
      }
      console.error('[SignInScreen] Full error object:', JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
      
      // Use helper function to get user-friendly error message
      const errorMessage = getOAuthErrorMessage(err);

      Alert.alert('Sign In Error', errorMessage);
    } finally {
      setAppleLoading(false);
    }
  };

  // If already signed in, show success message
  if (isSignedIn) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <MaterialIcons name="check-circle" size={64} color="#4CAF50" />
          <Text style={styles.successText}>Signed in successfully!</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo/Title Section */}
        <View style={styles.header}>
          <Text style={styles.title}>Welcome to Tenant</Text>
          <Text style={styles.subtitle}>
            Find your perfect match in the rental market
          </Text>
        </View>

        {/* OAuth Buttons */}
        <View style={styles.buttonContainer}>
          {/* Google Sign In Button */}
          <TouchableOpacity
            style={[styles.oauthButton, styles.googleButton, googleLoading && styles.buttonDisabled]}
            onPress={handleGoogleSignIn}
            disabled={googleLoading || appleLoading}
            activeOpacity={0.8}
          >
            {googleLoading ? (
              <ActivityIndicator size="small" color="#666" />
            ) : (
              <>
                <MaterialIcons name="g-translate" size={24} color="#666" />
                <Text style={styles.googleButtonText}>Continue with Google</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Apple Sign In Button - Only show on iOS */}
          {Platform.OS === 'ios' && (
            <TouchableOpacity
              style={[styles.oauthButton, styles.appleButton, appleLoading && styles.buttonDisabled]}
              onPress={handleAppleSignIn}
              disabled={googleLoading || appleLoading}
              activeOpacity={0.8}
            >
              {appleLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <MaterialIcons name="apple" size={24} color="#fff" />
                  <Text style={styles.appleButtonText}>Continue with Apple</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: isTablet ? 60 : 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: isTablet ? 60 : 48,
  },
  title: {
    fontSize: isTablet ? 36 : 28,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: isTablet ? 18 : 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: isTablet ? 400 : 320,
    gap: 16,
  },
  oauthButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: isTablet ? 18 : 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    minHeight: 56,
  },
  googleButton: {
    backgroundColor: '#fff',
    borderColor: '#e0e0e0',
  },
  googleButtonText: {
    fontSize: isTablet ? 18 : 16,
    fontWeight: '600',
    color: '#333',
  },
  appleButton: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  appleButtonText: {
    fontSize: isTablet ? 18 : 16,
    fontWeight: '600',
    color: '#fff',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  footer: {
    marginTop: isTablet ? 40 : 32,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: isTablet ? 14 : 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 18,
  },
  successText: {
    fontSize: isTablet ? 24 : 20,
    fontWeight: '600',
    color: '#4CAF50',
    marginTop: 16,
  },
});

