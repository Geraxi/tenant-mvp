// Test environment variables loading
require('dotenv').config({ path: '.env.local' });

console.log('Environment variables test:');
console.log('EXPO_PUBLIC_SUPABASE_URL set:', !!process.env.EXPO_PUBLIC_SUPABASE_URL);
console.log('EXPO_PUBLIC_SUPABASE_ANON_KEY set:', !!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);

if (!process.env.EXPO_PUBLIC_SUPABASE_URL || !process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY) {
  console.log('Environment variables not found. Set them in your .env.local file.');
} else {
  console.log('Environment variables loaded successfully');
}
