import { ReactNode, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: "tenant" | "landlord";
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const hasHadRoleRef = useRef(false);
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Track if user has ever had a role (to prevent redirects on temporary fetch failures)
  useEffect(() => {
    if (user?.role) {
      hasHadRoleRef.current = true;
    }
  }, [user?.role]);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-full bg-white flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
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
  if (isAuthenticated && !user?.role && !hasHadRoleRef.current) {
    // Add a small delay to avoid redirecting during token refresh
    if (!redirectTimeoutRef.current) {
      redirectTimeoutRef.current = setTimeout(() => {
        // Double-check after delay
        if (!user?.role && !hasHadRoleRef.current) {
          window.location.href = "/onboarding";
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
  if (isAuthenticated && !user?.role && hasHadRoleRef.current) {
    return (
      <div className="min-h-full bg-white flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (requiredRole && user?.role !== requiredRole) {
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
