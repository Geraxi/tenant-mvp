// Test Supabase connection
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

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
