// Test Supabase auth configuration
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

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
