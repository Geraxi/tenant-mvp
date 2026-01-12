import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { User } from "@shared/schema";
import { useAuth as useClerkAuth, useUser } from "@clerk/clerk-react";

async function fetchUser(): Promise<User | null> {
  try {
    // Get Clerk session token using the proper API
    // Clerk exposes the session through window.Clerk.session
    const clerk = (window as any).Clerk;
    if (!clerk) {
      console.warn('[useAuth] Clerk not available');
      return null;
    }
    
    // Wait for Clerk to be ready (max 2 seconds)
    let attempts = 0;
    while ((!clerk.session || typeof clerk.session.getToken !== 'function') && attempts < 20) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }
    
    if (!clerk.session || typeof clerk.session.getToken !== 'function') {
      console.warn('[useAuth] Clerk session not available after waiting');
      return null;
    }
    
    const token = await clerk.session.getToken();
    if (!token) {
      console.warn('[useAuth] Failed to get Clerk token');
      return null;
    }

    const response = await fetch("/api/auth/user", {
      credentials: "include",
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      if (response.status === 401) {
        return null;
      }
      throw new Error("Failed to fetch user");
    }
    return await response.json();
  } catch {
    return null;
  }
}

export function useAuth() {
  const queryClient = useQueryClient();
  const { isSignedIn, isLoaded: clerkLoaded } = useClerkAuth();
  const { user: clerkUser } = useUser();
  const [isReady, setIsReady] = useState(false);
  
  useEffect(() => {
    if (clerkLoaded) {
      setIsReady(true);
      // Invalidate queries when auth state changes
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    }
  }, [clerkLoaded, isSignedIn, queryClient]);
  
  const { data: user, isLoading, error } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    queryFn: fetchUser,
    retry: (failureCount, error: any) => {
      // Don't retry on database connection errors
      if (error?.message?.includes('getaddrinfo') || error?.message?.includes('ENOTFOUND')) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: 1000, // Wait 1 second between retries
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // Keep in cache for 10 minutes (formerly cacheTime)
    enabled: isReady && isSignedIn,
    // Keep previous data while refetching to prevent flickering
    placeholderData: (previousData) => previousData,
  });

  const logout = async () => {
    const clerk = (window as any).Clerk;
    if (clerk?.signOut) {
      await clerk.signOut();
    }
    queryClient.setQueryData(["/api/auth/user"], null);
    queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
  };

  return {
    user,
    isLoading: isLoading || !isReady || !clerkLoaded,
    isAuthenticated: !!user && isSignedIn,
    error,
    logout,
    clerkUser, // Expose Clerk user for direct access if needed
  };
}
