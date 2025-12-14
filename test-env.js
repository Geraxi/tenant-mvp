// Test environment variables loading
require('dotenv').config({ path: '.env.local' });

console.log('Environment variables test:');
console.log('EXPO_PUBLIC_SUPABASE_URL:', process.env.EXPO_PUBLIC_SUPABASE_URL);
console.log('EXPO_PUBLIC_SUPABASE_ANON_KEY:', process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);

if (!process.env.EXPO_PUBLIC_SUPABASE_URL || !process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY) {
  console.log('Environment variables not found, creating .env.local file...');
  
  const fs = require('fs');
  const envContent = `EXPO_PUBLIC_SUPABASE_URL=https://ysvindlleiicosvdzfsz.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzdmluZGxsZWlpY29zdmR6ZnN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzNDE2MjAsImV4cCI6MjA3NTkxNzYyMH0.o1EemdXCSc_t9wgz7uele1qpkNBydwyR_m2vNf2mnDo
EXPO_PUBLIC_KIKI_API_KEY=your_kiki_api_key_here
EXPO_PUBLIC_KIKI_BASE_URL=https://api.kiki.com`;

  try {
    fs.writeFileSync('.env.local', envContent);
    console.log('.env.local file created successfully');
  } catch (error) {
    console.error('Error creating .env.local:', error.message);
  }
} else {
  console.log('Environment variables loaded successfully');
}
