import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const hasCredentials = Boolean(supabaseUrl && supabaseAnonKey);

if (!hasCredentials) {
  console.warn(
    'Supabase credentials not found. Running in mock mode. Once ready, set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your env file.'
  );
}

const supabaseClient: SupabaseClient | null = hasCredentials
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const supabase = supabaseClient;
export const isSupabaseConfigured = hasCredentials;
