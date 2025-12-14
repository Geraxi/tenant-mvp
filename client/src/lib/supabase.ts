import { createClient } from '@supabase/supabase-js';

// Use environment variables or fallback to known values
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://iohszsmnkbxpauqqdudy.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvaHN6c21ua2J4cGF1cXFkdWR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzMDcwMTMsImV4cCI6MjA4MDg4MzAxM30.ubRLz7xBU2L906pvgcFeUWbhxaF7gJ-yCz9nxZ5GVPY';

console.log('Supabase client config:', {
  url: supabaseUrl,
  hasAnonKey: !!supabaseAnonKey,
  anonKeyLength: supabaseAnonKey?.length,
  usingEnvVar: !!import.meta.env.VITE_SUPABASE_URL
});

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
