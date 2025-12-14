// Test Supabase auth configuration
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ysvindlleiicosvdzfsz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzdmluZGxsZWlpY29zdmR6ZnN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzNDE2MjAsImV4cCI6MjA3NTkxNzYyMH0.o1EemdXCSc_t9wgz7uele1qpkNBydwyR_m2vNf2mnDo';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testAuth() {
  try {
    console.log('Testing Supabase auth...');
    
    // Test with a unique email
    const testEmail = `test${Date.now()}@gmail.com`;
    console.log('Testing with email:', testEmail);
    
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: 'testpassword123',
    });
    
    if (error) {
      console.error('Auth signup error:', error.message);
      console.error('Error details:', error);
    } else {
      console.log('Auth signup successful!');
      console.log('User:', data.user);
      console.log('Session:', data.session);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testAuth();
