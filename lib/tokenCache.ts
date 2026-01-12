import * as SecureStore from 'expo-secure-store';
import type { TokenCache } from '@clerk/clerk-expo/dist/cache';

/**
 * Token cache implementation using Expo SecureStore
 * This securely stores Clerk authentication tokens on the device
 */
const createTokenCache = (): TokenCache => {
  return {
    async getToken(key: string): Promise<string | null> {
      try {
        const token = await SecureStore.getItemAsync(key);
        return token;
      } catch (error) {
        console.error(`[TokenCache] Error getting token for key ${key}:`, error);
        return null;
      }
    },

    async saveToken(key: string, value: string): Promise<void> {
      try {
        await SecureStore.setItemAsync(key, value);
      } catch (error) {
        console.error(`[TokenCache] Error saving token for key ${key}:`, error);
        throw error;
      }
    },

    async clearToken(key: string): Promise<void> {
      try {
        await SecureStore.deleteItemAsync(key);
      } catch (error) {
        console.error(`[TokenCache] Error clearing token for key ${key}:`, error);
        // Don't throw - clearing a non-existent key is not an error
      }
    },
  };
};

export default createTokenCache;


