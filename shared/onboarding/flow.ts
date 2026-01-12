import type { OnboardingState } from "./types";

export type InitialRoute =
  | "/role"
  | "/tenant/welcome"
  | "/tenant/home"
  | "/landlord/landing"
  | "/landlord/home";

export const ROUTES = {
  ROLE: "/role",

  TENANT_WELCOME: "/tenant/welcome",
  TENANT_PROFILE_STEP1: "/tenant/profile/step-1",
  TENANT_VERIFY_INTRO: "/tenant/verify/intro",
  TENANT_VERIFY_MENU: "/tenant/verify/menu",
  TENANT_INTRO: "/tenant/intro",
  TENANT_HOME: "/tenant/home",

  LANDLORD_LANDING: "/landlord/landing",
  LANDLORD_WELCOME: "/landlord/welcome",
  LANDLORD_INTRO: "/landlord/intro",
  LANDLORD_CRITERIA: "/landlord/criteria",
  LANDLORD_VERIFY: "/landlord/verify",
  LANDLORD_ADD_PROPERTY: "/landlord/add-property",

  LANDLORD_PROPERTY_1: "/landlord/property/step-1",
  LANDLORD_PROPERTY_2: "/landlord/property/step-2",
  LANDLORD_PROPERTY_3: "/landlord/property/step-3",
  LANDLORD_PROPERTY_4: "/landlord/property/step-4",

  LANDLORD_PUBLISH_SUCCESS: "/landlord/publish/success",

  LANDLORD_HOME: "/landlord/home",
} as const;

/**
 * OnboardingGate uses this function as the SINGLE SOURCE OF TRUTH for routing decisions.
 * 
 * Logic:
 * - if no userRole -> go /role
 * - if userRole=TENANT and onboardingCompleted_TENANT !== true -> go /tenant/welcome
 * - if userRole=LANDLORD and onboardingCompleted_LANDLORD !== true -> go /landlord/landing
 * - otherwise go to correct home
 */
export function decideInitialRoute(
  state: OnboardingState
): InitialRoute {
  // No role selected yet - go to role selection
  if (!state.userRole) {
    return ROUTES.ROLE;
  }

  // Tenant flow
  if (state.userRole === "TENANT") {
    // Only go to home if onboarding is explicitly completed (true)
    // undefined or false means onboarding is not completed
    if (state.onboardingCompleted_TENANT === true) {
      return ROUTES.TENANT_HOME;
    }
    // Onboarding not completed - go to welcome
    return ROUTES.TENANT_WELCOME;
  }

  // Landlord flow
  if (state.userRole === "LANDLORD") {
    // Only go to home if onboarding is explicitly completed (true)
    // undefined or false means onboarding is not completed
    if (state.onboardingCompleted_LANDLORD === true) {
      return ROUTES.LANDLORD_HOME;
    }
    // Onboarding not completed - go to landing
    return ROUTES.LANDLORD_LANDING;
  }

  // Fallback (shouldn't happen)
  return ROUTES.ROLE;
}

