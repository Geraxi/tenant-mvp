// Debug Supabase client configuration
console.log('Environment variables:');
console.log('EXPO_PUBLIC_SUPABASE_URL:', process.env.EXPO_PUBLIC_SUPABASE_URL);
console.log('EXPO_PUBLIC_SUPABASE_ANON_KEY:', process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://ysvindlleiicosvdzfsz.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzdmluZGxsZWlpY29zdmR6ZnN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzNDE2MjAsImV4cCI6MjA3NTkxNzYyMH0.o1EemdXCSc_t9wgz7uele1qpkNBydwyR_m2vNf2mnDo';

console.log('Using URL:', SUPABASE_URL);
console.log('Using Key:', SUPABASE_ANON_KEY ? 'Present' : 'Missing');

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testConnection() {
  try {
    console.log('Testing connection...');
    const { data, error } = await supabase.auth.signUp({
      email: `debug${Date.now()}@gmail.com`,
      password: 'testpassword123',
    });
    
    if (error) {
      console.error('Error:', error.message);
    } else {
      console.log('Success! User created:', data.user?.id);
    }
  } catch (error) {
    console.error('Connection failed:', error.message);
  }
}

testConnection();
