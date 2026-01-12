import { ClerkProvider } from '@clerk/clerk-react';

// Get publishable key from environment
// Note: User provided key with NEXT_PUBLIC_ prefix, but we use VITE_ for Vite
const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 
  import.meta.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
  'pk_test_Y2FyaW5nLWJhcm5hY2xlLTc0LmNsZXJrLmFjY291bnRzLmRldiQ';

if (!clerkPublishableKey) {
  console.warn('Clerk publishable key not found. Please set VITE_CLERK_PUBLISHABLE_KEY');
}

export { ClerkProvider };
export { clerkPublishableKey };

