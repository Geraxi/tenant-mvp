import { STORAGE_KEYS, getUserScopedKey } from "@shared/onboarding/storageKeys";
import type {
  UserRole,
  TenantVerificationStatus,
  OnboardingState,
} from "@shared/onboarding/types";

function getBool(key: string): boolean | undefined {
  const v = localStorage.getItem(key);
  if (v === null) return undefined;
  return v === "true";
}

function setBool(key: string, value: boolean) {
  localStorage.setItem(key, String(value));
}

// Get current user ID from Clerk
async function getCurrentUserId(): Promise<string | null> {
  try {
    const clerk = (window as any).Clerk;
    if (!clerk || !clerk.user) {
      return null;
    }
    return clerk.user.id || null;
  } catch (error) {
    console.error('[onboardingStorage] Error getting user ID:', error);
    return null;
  }
}

// Get current user ID synchronously (from cached session)
// This is a fallback for cases where we need immediate access
function getCurrentUserIdSync(): string | null {
  try {
    // Supabase stores session in localStorage under a key like 'sb-<project-ref>-auth-token'
    // We can't reliably access it synchronously, so return null
    // The async version should be used instead
    return null;
  } catch {
    return null;
  }
}

export const onboardingStorageWeb = {
  async getState(): Promise<OnboardingState> {
    const userId = await getCurrentUserId();
    
    // If no userId, onboarding cannot be completed
    if (!userId) {
      return {
        userRole: undefined,
        onboardingCompleted_TENANT: undefined,
        onboardingCompleted_LANDLORD: undefined,
        verificationStatus_TENANT: undefined,
        landlordCriteriaSaved: undefined,
      };
    }

    return {
      userRole:
        (localStorage.getItem(
          getUserScopedKey(STORAGE_KEYS.userRole, userId)
        ) as UserRole | null) ?? undefined,

      onboardingCompleted_TENANT: getBool(
        getUserScopedKey(STORAGE_KEYS.onboardingCompleted_TENANT, userId)
      ),

      onboardingCompleted_LANDLORD: getBool(
        getUserScopedKey(STORAGE_KEYS.onboardingCompleted_LANDLORD, userId)
      ),

      verificationStatus_TENANT:
        (localStorage.getItem(
          getUserScopedKey(STORAGE_KEYS.verificationStatus_TENANT, userId)
        ) as TenantVerificationStatus | null) ??
        undefined,

      landlordCriteriaSaved: getBool(
        getUserScopedKey(STORAGE_KEYS.landlordCriteriaSaved, userId)
      ),
    };
  },

  // Synchronous version for cases where we need immediate access
  getStateSync(): OnboardingState {
    const userId = getCurrentUserIdSync();
    
    if (!userId) {
      return {
        userRole: undefined,
        onboardingCompleted_TENANT: undefined,
        onboardingCompleted_LANDLORD: undefined,
        verificationStatus_TENANT: undefined,
        landlordCriteriaSaved: undefined,
      };
    }

    return {
      userRole:
        (localStorage.getItem(
          getUserScopedKey(STORAGE_KEYS.userRole, userId)
        ) as UserRole | null) ?? undefined,

      onboardingCompleted_TENANT: getBool(
        getUserScopedKey(STORAGE_KEYS.onboardingCompleted_TENANT, userId)
      ),

      onboardingCompleted_LANDLORD: getBool(
        getUserScopedKey(STORAGE_KEYS.onboardingCompleted_LANDLORD, userId)
      ),

      verificationStatus_TENANT:
        (localStorage.getItem(
          getUserScopedKey(STORAGE_KEYS.verificationStatus_TENANT, userId)
        ) as TenantVerificationStatus | null) ??
        undefined,

      landlordCriteriaSaved: getBool(
        getUserScopedKey(STORAGE_KEYS.landlordCriteriaSaved, userId)
      ),
    };
  },

  async setUserRole(role: UserRole) {
    const userId = await getCurrentUserId();
    if (!userId) return;
    localStorage.setItem(getUserScopedKey(STORAGE_KEYS.userRole, userId), role);
  },

  async completeTenantOnboarding() {
    const userId = await getCurrentUserId();
    if (!userId) return;
    setBool(
      getUserScopedKey(STORAGE_KEYS.onboardingCompleted_TENANT, userId),
      true
    );
  },

  async completeLandlordOnboarding() {
    const userId = await getCurrentUserId();
    if (!userId) return;
    setBool(
      getUserScopedKey(STORAGE_KEYS.onboardingCompleted_LANDLORD, userId),
      true
    );
  },

  async setTenantVerificationStatus(
    status: TenantVerificationStatus
  ) {
    const userId = await getCurrentUserId();
    if (!userId) return;
    localStorage.setItem(
      getUserScopedKey(STORAGE_KEYS.verificationStatus_TENANT, userId),
      status
    );
  },

  async setLandlordCriteriaSaved(saved: boolean) {
    const userId = await getCurrentUserId();
    if (!userId) return;
    setBool(
      getUserScopedKey(STORAGE_KEYS.landlordCriteriaSaved, userId),
      saved
    );
  },

  // Clear all onboarding flags for current user
  async clearOnboardingForCurrentUser() {
    const userId = await getCurrentUserId();
    if (!userId) return;
    
    localStorage.removeItem(getUserScopedKey(STORAGE_KEYS.userRole, userId));
    localStorage.removeItem(getUserScopedKey(STORAGE_KEYS.onboardingCompleted_TENANT, userId));
    localStorage.removeItem(getUserScopedKey(STORAGE_KEYS.onboardingCompleted_LANDLORD, userId));
    localStorage.removeItem(getUserScopedKey(STORAGE_KEYS.verificationStatus_TENANT, userId));
    localStorage.removeItem(getUserScopedKey(STORAGE_KEYS.landlordCriteriaSaved, userId));
  },

  // Dev helper: reset onboarding for current user
  async resetOnboardingForCurrentUser() {
    await this.clearOnboardingForCurrentUser();
  },
};

