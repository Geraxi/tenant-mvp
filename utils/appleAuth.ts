import { Platform } from 'react-native';
import { User } from '../types';

// Only import Apple Authentication if available
let AppleAuthentication: any = null;

try {
  if (Platform.OS === 'ios') {
    AppleAuthentication = require('expo-apple-authentication');
  }
} catch (error) {
  if (__DEV__) {
    console.log('Apple Authentication not available');
  }
}

export interface AppleAuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

export const isAppleAuthAvailable = (): boolean => {
  if (!AppleAuthentication) {
    return false;
  }
  return AppleAuthentication.isAvailable;
};

export const signInWithApple = async (): Promise<AppleAuthResult> => {
  if (!AppleAuthentication) {
    return {
      success: false,
      error: 'Apple Sign-In not available in Expo Go. Please use a development build.',
    };
  }
  
  try {
    if (!isAppleAuthAvailable()) {
      return {
        success: false,
        error: 'Apple Sign-In is not available on this device',
      };
    }

    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    if (credential.user) {
      const user: User = {
        id: credential.user,
        name: credential.fullName ? 
          `${credential.fullName.givenName || ''} ${credential.fullName.familyName || ''}`.trim() : 
          'Apple User',
        email: credential.email || '',
        userType: 'tenant', // Default to tenant, can be changed later
        age: 25, // Default age, can be updated in profile
        dateOfBirth: '01/01/1999', // Default date, can be updated
        bio: '',
        photos: [],
        location: '',
        verified: 'verified',
        idVerified: true,
        backgroundCheckPassed: false,
        employmentStatus: 'employed',
        jobType: 'other',
        preferences: {
          budget: 1500,
          petFriendly: false,
          smoking: false,
        },
        createdAt: Date.now(),
      };

      return {
        success: true,
        user,
      };
    }

    return {
      success: false,
      error: 'No user information received from Apple',
    };
  } catch (error: any) {
    if (__DEV__) {
      console.error('Apple Sign-In error:', error);
    }
    
    if (error.code === 'ERR_CANCELED') {
      return {
        success: false,
        error: 'Sign-in was cancelled',
      };
    }

    return {
      success: false,
      error: 'An error occurred during Apple Sign-In',
    };
  }
};
