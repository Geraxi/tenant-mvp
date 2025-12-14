import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { User } from "@shared/schema";
import { supabase } from "@/lib/supabase";

async function fetchUser(): Promise<User | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      return null;
    }

    const response = await fetch("/api/auth/user", {
      credentials: "include",
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
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
  const [isReady, setIsReady] = useState(false);
  
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      }
      setIsReady(true);
    });

    supabase.auth.getSession().then(() => setIsReady(true));

    return () => subscription.unsubscribe();
  }, [queryClient]);
  
  const { data: user, isLoading, error } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    queryFn: fetchUser,
    retry: 2, // Retry up to 2 times on failure
    retryDelay: 1000, // Wait 1 second between retries
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // Keep in cache for 10 minutes (formerly cacheTime)
    enabled: isReady,
    // Suppress database connection errors
    onError: (error: any) => {
      // Silently ignore database connection errors - they're handled by the server fallback
      if (error?.message?.includes('getaddrinfo') || error?.message?.includes('ENOTFOUND')) {
        return;
      }
    },
    // Keep previous data while refetching to prevent flickering
    placeholderData: (previousData) => previousData,
  });

  const logout = async () => {
    await supabase.auth.signOut();
    queryClient.setQueryData(["/api/auth/user"], null);
    queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
  };

  return {
    user,
    isLoading: isLoading || !isReady,
    isAuthenticated: !!user,
    error,
    logout,
  };
}
