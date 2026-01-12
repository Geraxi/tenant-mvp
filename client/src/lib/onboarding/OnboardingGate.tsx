import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { decideInitialRoute, ROUTES } from "@shared/onboarding/flow";
import { onboardingStorageWeb } from "./storage.web";
import { useAuth as useClerkAuth } from "@clerk/clerk-react";

export function OnboardingGate() {
  const [location, setLocation] = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const { isSignedIn, isLoaded: clerkLoaded } = useClerkAuth();

  useEffect(() => {
    let mounted = true;
    let timeoutId: ReturnType<typeof setTimeout>;

    const checkAndRedirect = async () => {
      try {
        // If we are on the SSO callback route, let Clerk handle it first
        if (location === "/sso-callback") {
          console.log("[OnboardingGate] On SSO callback route, waiting for Clerk to process...");
          
          // Wait for Clerk to load and process the callback
          let attempts = 0;
          while (!clerkLoaded && attempts < 20) {
            await new Promise(resolve => setTimeout(resolve, 200));
            attempts++;
          }
          
          // Give Clerk extra time to process the OAuth callback
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Check if user is now signed in
          const clerk = (window as any).Clerk;
          const hasClerkUser = clerk?.user !== null && clerk?.user !== undefined;
          
          if (isSignedIn || hasClerkUser) {
            console.log("[OnboardingGate] OAuth callback successful, proceeding with redirect");
            // Let the rest of the logic handle the redirect
            // Clear the callback URL from history
            window.history.replaceState({}, "", "/");
          } else {
            console.warn("[OnboardingGate] OAuth callback failed, redirecting to auth");
            if (mounted) {
              window.location.href = "/auth?mode=login";
            }
            setIsChecking(false);
            return;
          }
        }

        // Add timeout to prevent infinite checking
        timeoutId = setTimeout(() => {
          if (mounted) {
            console.warn("[OnboardingGate] Timeout, forcing redirect to auth");
            setIsChecking(false);
            if (location !== "/auth") {
              window.history.replaceState({}, "", "/auth");
              setLocation("/auth");
            }
          }
        }, 5000); // 5 second timeout (increased for OAuth)

        // Wait for Clerk to load
        if (!clerkLoaded) {
          // Wait a bit for Clerk to initialize
          await new Promise(resolve => setTimeout(resolve, 500));
          if (!clerkLoaded) {
            return; // Will retry when clerkLoaded becomes true
          }
        }

        // Check if user is authenticated using Clerk
        // Also check window.Clerk as a fallback
        const clerk = (window as any).Clerk;
        const hasClerkUser = clerk?.user !== null && clerk?.user !== undefined;
        
        if (!isSignedIn && !hasClerkUser) {
          // No user - redirect to auth page with login mode
          clearTimeout(timeoutId);
          if (mounted && location !== "/auth" && location !== "/sso-callback") {
            window.location.href = "/auth?mode=login";
          }
          setIsChecking(false);
          return;
        }
        
        // If we have a Clerk user but isSignedIn is false, wait a bit for state to sync
        if (hasClerkUser && !isSignedIn) {
          await new Promise(resolve => setTimeout(resolve, 500));
          // Re-check after waiting
          if (!isSignedIn && !hasClerkUser) {
            clearTimeout(timeoutId);
            if (mounted && location !== "/auth") {
              window.location.href = "/auth?mode=login";
            }
            setIsChecking(false);
            return;
          }
        }

        // User is authenticated - ALWAYS check onboarding state
        // This is the SINGLE SOURCE OF TRUTH for routing decisions
        let state;
        let target;
        
        try {
          const clerk = (window as any).Clerk;
          const userId = clerk?.user?.id || 'unknown';
          
          // Check if this is an OAuth callback (new user from OAuth)
          // OAuth sign-ups should clear onboarding flags if user has no role
          if (location === "/sso-callback") {
            try {
              const session = clerk?.session;
              const token = session ? await session.getToken() : null;
              
              if (token) {
                const response = await fetch("/api/auth/user", {
                  headers: { 'Authorization': `Bearer ${token}` },
                });
                if (response.ok) {
                  const user = await response.json();
                  if (!user?.role) {
                    // New OAuth user - clear onboarding flags
                    await onboardingStorageWeb.clearOnboardingForUser(userId);
                    console.log('[OnboardingGate] Cleared onboarding for new OAuth user:', userId);
                  }
                }
              }
            } catch (err) {
              console.error('[OnboardingGate] Error checking user after OAuth:', err);
            }
          }
          
          state = await onboardingStorageWeb.getState();
          target = decideInitialRoute(state);
          
          // Debug logging
          console.log('[OnboardingGate] State:', {
            userRole: state.userRole,
            onboardingCompleted_TENANT: state.onboardingCompleted_TENANT,
            onboardingCompleted_LANDLORD: state.onboardingCompleted_LANDLORD,
            userId: userId
          });
          console.log('[OnboardingGate] Target route:', target);
          console.log('[OnboardingGate] Current location:', location);
        } catch (error) {
          console.error('[OnboardingGate] Error getting state:', error);
          // On error, default to role selection
          target = ROUTES.ROLE;
          state = {
            userRole: undefined,
            onboardingCompleted_TENANT: undefined,
            onboardingCompleted_LANDLORD: undefined,
            verificationStatus_TENANT: undefined,
            landlordCriteriaSaved: undefined,
          };
          console.log('[OnboardingGate] Using fallback target:', target);
        }

        // If we're already on the CORRECT target route, don't redirect
        if (location === target) {
          clearTimeout(timeoutId);
          setIsChecking(false);
          return;
        }

        // CRITICAL CHECK: If user has a role but onboarding is NOT completed,
        // we MUST redirect to onboarding, even if they're on a "valid" route
        // This prevents users from skipping onboarding
        const hasRole = state.userRole === "TENANT" || state.userRole === "LANDLORD";
        const onboardingIncomplete = 
          (state.userRole === "TENANT" && state.onboardingCompleted_TENANT !== true) ||
          (state.userRole === "LANDLORD" && state.onboardingCompleted_LANDLORD !== true);

        // List of main app routes that should redirect to onboarding if incomplete
        const mainAppRoutes = [
          ROUTES.TENANT_HOME,
          ROUTES.LANDLORD_HOME,
          "/tenant",
          "/landlord",
          "/tenant/favorites",
          "/tenant/matches",
          "/landlord/listings",
          "/landlord/matches",
        ];

        const isOnMainAppRoute = mainAppRoutes.includes(location) || 
          location.startsWith("/tenant/favorites") ||
          location.startsWith("/tenant/matches") ||
          location.startsWith("/landlord/listings") ||
          location.startsWith("/landlord/matches");

        // If onboarding is incomplete and user is on a main app route, FORCE redirect to onboarding
        if (hasRole && onboardingIncomplete && isOnMainAppRoute) {
          clearTimeout(timeoutId);
          if (mounted) {
            console.log('[OnboardingGate] FORCING redirect to onboarding - user on main app but onboarding incomplete');
            window.location.href = target;
          }
          setIsChecking(false);
          return;
        }

        // Special case: if we're on /role and target is /role, allow it
        if (location === ROUTES.ROLE && target === ROUTES.ROLE) {
          clearTimeout(timeoutId);
          setIsChecking(false);
          return;
        }

        // If we're on an onboarding route that matches our target, allow it
        const isOnCorrectOnboardingRoute = 
          (target === ROUTES.TENANT_WELCOME && location === ROUTES.TENANT_WELCOME) ||
          (target === ROUTES.LANDLORD_LANDING && location === ROUTES.LANDLORD_LANDING) ||
          (target === ROUTES.LANDLORD_WELCOME && location === ROUTES.LANDLORD_WELCOME) ||
          (target === ROUTES.ROLE && location === ROUTES.ROLE) ||
          (target.startsWith("/tenant/") && location.startsWith("/tenant/") && !isOnMainAppRoute) ||
          (target.startsWith("/landlord/") && location.startsWith("/landlord/") && !isOnMainAppRoute);

        if (isOnCorrectOnboardingRoute) {
          clearTimeout(timeoutId);
          setIsChecking(false);
          return;
        }

        // ALWAYS redirect to target route if we're not already there
        clearTimeout(timeoutId);
        if (mounted) {
          if (location !== target) {
            console.log('[OnboardingGate] Redirecting:', { from: location, to: target });
            // Use window.location.href for hard redirect - this always works
            setIsChecking(false); // Stop checking before redirect
            window.location.href = target;
            return; // Exit early
          } else {
            // Already on target, just stop checking
            console.log('[OnboardingGate] Already on target route:', target);
            setIsChecking(false);
          }
        } else {
          setIsChecking(false);
        }
      } catch (error) {
        console.error("[OnboardingGate] Error:", error);
        clearTimeout(timeoutId);
        // On error, redirect to auth
        if (mounted && location !== "/auth") {
          window.history.replaceState({}, "", "/auth");
          setLocation("/auth");
        }
        setIsChecking(false);
      }
    };

    checkAndRedirect();

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
    };
  }, [location, setLocation, clerkLoaded, isSignedIn]);

  // Add a fallback timeout to prevent infinite loading
  useEffect(() => {
    if (isChecking) {
      const fallbackTimeout = setTimeout(() => {
        console.warn('[OnboardingGate] Loading timeout (5s) - forcing redirect to /role');
        setIsChecking(false);
        window.location.href = '/role';
      }, 5000); // 5 second fallback
      
      return () => clearTimeout(fallbackTimeout);
    }
  }, [isChecking]);

  // Show a minimal loading state while checking
  if (isChecking || location === "/") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-2" />
          <p className="text-sm text-gray-500">Caricamento...</p>
        </div>
      </div>
    );
  }

  // This should never be reached, but if it is, show a fallback
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <p className="text-gray-500 mb-4">Redirecting...</p>
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
      </div>
    </div>
  );
}
