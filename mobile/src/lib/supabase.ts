import { createClient } from '@supabase/supabase-js';

// For React Native, you'll need to configure these via environment variables or a config file
// You can use react-native-config or similar for environment variables
const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'placeholder-key';

// Create a mock client for development when Supabase is not configured
const createMockClient = () => ({
  from: () => ({
    select: () => ({
      eq: () => ({
        order: () => Promise.resolve({ data: [], error: new Error('Supabase not configured') })
      }),
      insert: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
    }),
    delete: () => Promise.resolve({ error: new Error('Supabase not configured') }),
    update: () => Promise.resolve({ error: new Error('Supabase not configured') }),
  }),
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    signInWithPassword: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
    signOut: () => Promise.resolve({ error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
  }
});

// Check if Supabase is properly configured
const isSupabaseConfigured = supabaseUrl !== 'https://placeholder.supabase.co' && supabaseAnonKey !== 'placeholder-key';

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createMockClient() as any;

export type SupabaseClient = typeof supabase;

