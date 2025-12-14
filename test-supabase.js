// Test Supabase connection
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ysvindlleiicosvdzfsz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzdmluZGxsZWlpY29zdmR6ZnN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzNDE2MjAsImV4cCI6MjA3NTkxNzYyMH0.o1EemdXCSc_t9wgz7uele1qpkNBydwyR_m2vNf2mnDo';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testConnection() {
  try {
    console.log('Testing Supabase connection...');
    
    // Test auth signup
    const { data, error } = await supabase.auth.signUp({
      email: 'test@test.com',
      password: 'testpassword123',
    });
    
    if (error) {
      console.error('Auth error:', error.message);
    } else {
      console.log('Auth signup successful:', data);
    }
    
  } catch (error) {
    console.error('Connection test failed:', error);
  }
}

testConnection();
