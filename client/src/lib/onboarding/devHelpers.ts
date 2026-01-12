/**
 * Development helper functions for onboarding debugging
 * These should NOT be called automatically - only for manual debugging
 */

import { onboardingStorageWeb } from "./storage.web";

/**
 * Reset onboarding for the current user
 * Clears all user-scoped onboarding flags
 * 
 * Usage in browser console:
 * import { resetOnboardingForCurrentUser } from '@/lib/onboarding/devHelpers';
 * await resetOnboardingForCurrentUser();
 */
export async function resetOnboardingForCurrentUser() {
  console.log('[Dev Helper] Resetting onboarding for current user...');
  await onboardingStorageWeb.resetOnboardingForCurrentUser();
  console.log('[Dev Helper] Onboarding reset complete. Refresh the page.');
}

// Expose to window for easy console access in development
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  (window as any).resetOnboarding = resetOnboardingForCurrentUser;
  console.log('[Dev Helper] resetOnboarding() is available in the console');
}




