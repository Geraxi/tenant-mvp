import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: (failureCount, error: any) => {
        // Don't retry on database connection errors
        const errorMessage = error?.message || error?.toString() || '';
        if (errorMessage.includes('getaddrinfo') || 
            errorMessage.includes('ENOTFOUND') || 
            errorMessage.includes('aws-0.us-east-1.pooler.supabase.com') ||
            errorMessage.includes('Failed to fetch user')) {
          return false;
        }
        return false; // Don't retry by default
      },
    },
    mutations: {
      retry: (failureCount, error: any) => {
        // Don't retry on database connection errors
        const errorMessage = error?.message || error?.toString() || '';
        if (errorMessage.includes('getaddrinfo') || 
            errorMessage.includes('ENOTFOUND') || 
            errorMessage.includes('aws-0.us-east-1.pooler.supabase.com') ||
            errorMessage.includes('Failed to fetch user')) {
          return false;
        }
        return false; // Don't retry by default
      },
    },
  },
});
