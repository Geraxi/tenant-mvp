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
    retry: false,
    staleTime: 1000 * 60 * 5,
    enabled: isReady,
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
