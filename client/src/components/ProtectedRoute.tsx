import { ReactNode, useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { onboardingStorageWeb } from "@/lib/onboarding/storage.web";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: "tenant" | "landlord";
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [location] = useLocation();
  const hasHadRoleRef = useRef(false);
  const redirectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [onboardingState, setOnboardingState] = useState<any>(null);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  // Track if user has ever had a role (to prevent redirects on temporary fetch failures)
  useEffect(() => {
    if (user && 'role' in user && user.role) {
      hasHadRoleRef.current = true;
    }
  }, [user]);

  // Check onboarding completion for home routes
  useEffect(() => {
    const checkOnboarding = async () => {
      if (!isAuthenticated || !user) {
        setCheckingOnboarding(false);
        return;
      }

      // Only check onboarding for home routes (not onboarding routes themselves)
      const homeRoutes = [
        '/tenant/home',
        '/tenant',
        '/landlord/home',
        '/landlord',
        '/tenant/favorites',
        '/tenant/matches',
        '/landlord/listings',
        '/landlord/matches',
      ];

      const isHomeRoute = homeRoutes.some(route => 
        location === route || location.startsWith(route + '/')
      );

      if (!isHomeRoute) {
        setCheckingOnboarding(false);
        return;
      }

      try {
        const state = await onboardingStorageWeb.getState();
        setOnboardingState(state);

        // Check if onboarding is incomplete
        const userRole = state.userRole;
        const onboardingIncomplete = 
          (userRole === "TENANT" && state.onboardingCompleted_TENANT !== true) ||
          (userRole === "LANDLORD" && state.onboardingCompleted_LANDLORD !== true);

        if (onboardingIncomplete) {
          // Redirect to appropriate onboarding page
          if (userRole === "TENANT") {
            window.location.href = "/tenant/welcome";
          } else if (userRole === "LANDLORD") {
            window.location.href = "/landlord/landing";
          } else {
            window.location.href = "/role";
          }
          return;
        }
      } catch (error) {
        console.error('[ProtectedRoute] Error checking onboarding:', error);
      } finally {
        setCheckingOnboarding(false);
      }
    };

    checkOnboarding();
  }, [isAuthenticated, user, location]);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  // Add timeout to prevent infinite loading
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setLoadingTimeout(true);
      }, 5000); // 5 second timeout
      return () => clearTimeout(timer);
    } else {
      setLoadingTimeout(false);
    }
  }, [isLoading]);

  if (isLoading && !loadingTimeout) {
    return (
      <div className="min-h-full bg-white flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Check onboarding completion before allowing access to home routes
  if (checkingOnboarding && isAuthenticated && user) {
    return (
      <div className="min-h-full bg-white flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // If loading timed out, show error and retry option
  if (loadingTimeout && isLoading) {
    return (
      <div className="min-h-full bg-white flex flex-col items-center justify-center p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Loading Timeout</h2>
        <p className="text-gray-500 mb-6 text-center">
          Taking longer than expected. Please try refreshing or signing in again.
        </p>
        <div className="flex gap-4">
          <button 
            onClick={() => {
              window.location.reload();
            }}
            className="bg-blue-500 text-white font-bold text-lg py-4 px-8 rounded-2xl shadow-lg"
          >
            Refresh
          </button>
          <button 
            onClick={() => window.location.href = "/"}
            className="bg-gray-500 text-white font-bold text-lg py-4 px-8 rounded-2xl shadow-lg"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-full bg-white flex flex-col items-center justify-center p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Please sign in</h2>
        <p className="text-gray-500 mb-6">You need to be logged in to access this page</p>
        <button 
          onClick={() => window.location.href = "/api/login"}
          className="bg-primary text-white font-bold text-lg py-4 px-8 rounded-2xl shadow-lg"
          data-testid="button-login-protected"
        >
          Sign In
        </button>
      </div>
    );
  }

  // Only redirect to onboarding if:
  // 1. User is authenticated
  // 2. User has never had a role (not just a temporary fetch failure)
  // 3. We've waited a bit to ensure it's not just a loading state
  const userRole = user && 'role' in user ? user.role : null;
  if (isAuthenticated && !userRole && !hasHadRoleRef.current) {
    // Add a small delay to avoid redirecting during token refresh
    if (!redirectTimeoutRef.current) {
      redirectTimeoutRef.current = setTimeout(() => {
        // Double-check after delay
        const currentUser = user && 'role' in user ? user : null;
        if (!currentUser?.role && !hasHadRoleRef.current) {
          // Will be handled by OnboardingGate
          window.location.href = "/";
        }
      }, 2000); // Wait 2 seconds before redirecting
    }
    
    return (
      <div className="min-h-full bg-white flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // If user had a role before but doesn't now (temporary fetch failure), show loading
  if (isAuthenticated && !userRole && hasHadRoleRef.current) {
    return (
      <div className="min-h-full bg-white flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (requiredRole && userRole !== requiredRole) {
    return (
      <div className="min-h-full bg-white flex flex-col items-center justify-center p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
        <p className="text-gray-500 mb-6">You don't have permission to access this page</p>
        <button 
          onClick={() => window.location.href = "/"}
          className="bg-primary text-white font-bold text-lg py-4 px-8 rounded-2xl shadow-lg"
          data-testid="button-back-home"
        >
          Go Home
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
