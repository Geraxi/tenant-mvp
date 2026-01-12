import { useLocation } from "wouter";
import { ROUTES } from "../../../shared/onboarding/flow";
import { onboardingStorageWeb } from "./storage.web";

// Standalone functions that can be used with a navigate function
export function createTenantVerificationHandlers(navigate: (path: string, options?: { replace?: boolean }) => void) {
  const skip = async () => {
    await onboardingStorageWeb.setTenantVerificationStatus("skipped");
    navigate(ROUTES.TENANT_INTRO);
  };

  const finish = async () => {
    await onboardingStorageWeb.completeTenantOnboarding();
    // Redirect to "/" so OnboardingGate can route to home
    window.location.href = "/";
  };

  return { skip, finish };
}

// React hook version
export function useTenantVerification() {
  const [, setLocation] = useLocation();

  const navigate = (path: string, options?: { replace?: boolean }) => {
    if (options?.replace) {
      window.history.replaceState({}, "", path);
    }
    setLocation(path);
  };

  return createTenantVerificationHandlers(navigate);
}

