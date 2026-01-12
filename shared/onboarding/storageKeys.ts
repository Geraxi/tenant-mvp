// Base storage keys (will be prefixed with userId for per-user storage)
export const STORAGE_KEYS = {
  userRole: "tenantapp:userRole",
  onboardingCompleted_TENANT: "tenantapp:onboardingCompleted_TENANT",
  onboardingCompleted_LANDLORD: "tenantapp:onboardingCompleted_LANDLORD",
  verificationStatus_TENANT: "tenantapp:verificationStatus_TENANT",
  landlordCriteriaSaved: "tenantapp:landlordCriteriaSaved",
} as const;

// Helper to get user-scoped storage key
export function getUserScopedKey(baseKey: string, userId: string | null | undefined): string {
  if (!userId) {
    // Fallback to non-scoped key if no userId (shouldn't happen in production)
    return baseKey;
  }
  return `${baseKey}:${userId}`;
}

