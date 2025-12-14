import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, UserType } from '../types';

const USER_KEY = 'current_user';
const USER_TYPE_KEY = 'user_type';
const IS_FIRST_TIME_KEY = 'is_first_time';
const EMAIL_VERIFICATION_KEY = 'email_verification';
const PENDING_USER_KEY = 'pending_user';
const SESSION_KEY = 'user_session';
const LOGIN_TIMESTAMP_KEY = 'login_timestamp';

export const saveUser = async (user: User) => {
  try {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    await AsyncStorage.setItem(USER_TYPE_KEY, user.userType);
    await AsyncStorage.setItem(IS_FIRST_TIME_KEY, 'false');
    await AsyncStorage.setItem(SESSION_KEY, 'active');
    await AsyncStorage.setItem(LOGIN_TIMESTAMP_KEY, Date.now().toString());
  } catch (error) {
    if (__DEV__) {
      console.error('Error saving user:', error);
    }
  }
};

export const getUser = async (): Promise<User | null> => {
  try {
    const userData = await AsyncStorage.getItem(USER_KEY);
    if (userData) {
      return JSON.parse(userData);
    }
    return null;
  } catch (error) {
    if (__DEV__) {
      console.error('Error getting user:', error);
    }
    return null;
  }
};

export const getUserType = async (): Promise<UserType | null> => {
  try {
    const userType = await AsyncStorage.getItem(USER_TYPE_KEY);
    return userType as UserType | null;
  } catch (error) {
    if (__DEV__) {
      console.error('Error getting user type:', error);
    }
    return null;
  }
};

export const isFirstTime = async (): Promise<boolean> => {
  try {
    const isFirst = await AsyncStorage.getItem(IS_FIRST_TIME_KEY);
    return isFirst !== 'false';
  } catch (error) {
    if (__DEV__) {
      console.error('Error checking first time:', error);
    }
    return true;
  }
};

export const clearUser = async () => {
  try {
    await AsyncStorage.multiRemove([USER_KEY, USER_TYPE_KEY, IS_FIRST_TIME_KEY, EMAIL_VERIFICATION_KEY, PENDING_USER_KEY, SESSION_KEY, LOGIN_TIMESTAMP_KEY]);
  } catch (error) {
    if (__DEV__) {
      console.error('Error clearing user:', error);
    }
  }
};

export const isSessionActive = async (): Promise<boolean> => {
  try {
    const session = await AsyncStorage.getItem(SESSION_KEY);
    const loginTimestamp = await AsyncStorage.getItem(LOGIN_TIMESTAMP_KEY);
    
    if (session === 'active' && loginTimestamp) {
      const loginTime = parseInt(loginTimestamp, 10);
      const currentTime = Date.now();
      const sessionDuration = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
      
      // Check if session is still valid (within 7 days)
      return (currentTime - loginTime) < sessionDuration;
    }
    
    return false;
  } catch (error) {
    if (__DEV__) {
      console.error('Error checking session:', error);
    }
    return false;
  }
};

export const refreshSession = async () => {
  try {
    await AsyncStorage.setItem(LOGIN_TIMESTAMP_KEY, Date.now().toString());
  } catch (error) {
    if (__DEV__) {
      console.error('Error refreshing session:', error);
    }
  }
};

export const savePendingUser = async (userData: { email: string; password: string; confirmationToken: string }) => {
  try {
    await AsyncStorage.setItem(PENDING_USER_KEY, JSON.stringify(userData));
  } catch (error) {
    if (__DEV__) {
      console.error('Error saving pending user:', error);
    }
  }
};

export const getPendingUser = async (): Promise<{ email: string; password: string; confirmationToken: string } | null> => {
  try {
    const pendingUserData = await AsyncStorage.getItem(PENDING_USER_KEY);
    if (pendingUserData) {
      return JSON.parse(pendingUserData);
    }
    return null;
  } catch (error) {
    if (__DEV__) {
      console.error('Error getting pending user:', error);
    }
    return null;
  }
};

export const clearPendingUser = async () => {
  try {
    await AsyncStorage.removeItem(PENDING_USER_KEY);
  } catch (error) {
    if (__DEV__) {
      console.error('Error clearing pending user:', error);
    }
  }
};

export const setEmailVerified = async (email: string) => {
  try {
    await AsyncStorage.setItem(EMAIL_VERIFICATION_KEY, email);
  } catch (error) {
    if (__DEV__) {
      console.error('Error setting email verified:', error);
    }
  }
};

export const isEmailVerified = async (email: string): Promise<boolean> => {
  try {
    const verifiedEmail = await AsyncStorage.getItem(EMAIL_VERIFICATION_KEY);
    return verifiedEmail === email;
  } catch (error) {
    if (__DEV__) {
      console.error('Error checking email verification:', error);
    }
    return false;
  }
};

export const updateUser = async (updatedUser: Partial<User>) => {
  try {
    const currentUser = await getUser();
    if (currentUser) {
      const newUser = { ...currentUser, ...updatedUser };
      await saveUser(newUser);
      return newUser;
    }
    return null;
  } catch (error) {
    if (__DEV__) {
      console.error('Error updating user:', error);
    }
    return null;
  }
};
