import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yrwpoyqgdvcdfsvcucuc.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlyd3BveXFnZHZjZGZzdmN1Y3VjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4MTkyNzMsImV4cCI6MjEwMzM5NTI3M30.g4gdDTWtJUgpUtsB1pUlQ4PaPBwqjwLmo8LBHAWZMBY';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn('⚠️ Supabase environment variables not detected in process.env. Using fallback live cloud project credentials.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const isSupabaseConfigured = () => {
  return true;
};
