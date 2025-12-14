// Environment Configuration Template
// Copy this to .env.local and fill in your actual values

export const ENV_CONFIG = {
  // Supabase Configuration
  SUPABASE_URL: 'https://YOUR-PROJECT.supabase.co',
  SUPABASE_ANON_KEY: 'YOUR-ANON-KEY',
  
  // Expo Public Environment Variables (accessible in client)
  EXPO_PUBLIC_SUPABASE_URL: 'https://YOUR-PROJECT.supabase.co',
  EXPO_PUBLIC_SUPABASE_ANON_KEY: 'YOUR-ANON-KEY',
  EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'pk_test_YOUR_STRIPE_PUBLISHABLE_KEY',
  
  // Server-side Environment Variables (for Supabase Edge Functions)
  STRIPE_SECRET: 'sk_test_YOUR_STRIPE_SECRET_KEY',
  STRIPE_WEBHOOK_SECRET: 'whsec_YOUR_WEBHOOK_SECRET',
};

// Instructions:
// 1. Create a .env.local file in your project root
// 2. Add the following variables:
//    EXPO_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
//    EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR-ANON-KEY
//    EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_STRIPE_PUBLISHABLE_KEY
// 3. For Supabase Edge Functions, set these in your Supabase dashboard:
//    STRIPE_SECRET=sk_test_YOUR_STRIPE_SECRET_KEY
//    STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET

