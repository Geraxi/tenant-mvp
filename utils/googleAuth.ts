import { Platform } from 'react-native';
import { User } from '../types';

// Google OAuth is completely disabled for now
export interface GoogleAuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

export const initializeGoogleAuth = async (): Promise<void> => {
  console.log('Google Sign-In is disabled');
  return;
};

export const signInWithGoogle = async (): Promise<GoogleAuthResult> => {
  return {
    success: false,
    error: 'Google Sign-In is disabled',
  };
};

export const signOutGoogle = async (): Promise<void> => {
  console.log('Google Sign-In is disabled');
  return;
};