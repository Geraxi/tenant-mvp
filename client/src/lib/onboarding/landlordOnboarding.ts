import { useLocation } from "wouter";
import { ROUTES } from "../../../shared/onboarding/flow";
import { onboardingStorageWeb } from "./storage.web";

// Standalone functions that can be used with a navigate function
export function createLandlordOnboardingHandlers(navigate: (path: string, options?: { replace?: boolean }) => void) {
  const skip = async () => {
    const state = await onboardingStorageWeb.getState();
    navigate(
      state.landlordCriteriaSaved
        ? ROUTES.LANDLORD_ADD_PROPERTY
        : ROUTES.LANDLORD_CRITERIA
    );
  };

  const publish = async () => {
    await onboardingStorageWeb.completeLandlordOnboarding();
    navigate(ROUTES.LANDLORD_PUBLISH_SUCCESS, {
      replace: true,
    });
  };

  const goHome = async () => {
    // Redirect to "/" so OnboardingGate can route to home
    window.location.href = "/";
  };

  return { skip, publish, goHome };
}

// React hook version
export function useLandlordOnboarding() {
  const [, setLocation] = useLocation();

  const navigate = (path: string, options?: { replace?: boolean }) => {
    if (options?.replace) {
      window.history.replaceState({}, "", path);
    }
    setLocation(path);
  };

  return createLandlordOnboardingHandlers(navigate);
}

