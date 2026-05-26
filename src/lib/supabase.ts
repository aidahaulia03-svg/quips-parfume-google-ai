import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseClient: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (supabaseClient) return supabaseClient;

  const url = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  const anonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

  if (!url || !anonKey) {
    return null;
  }

  try {
    supabaseClient = createClient(url, anonKey);
    return supabaseClient;
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    return null;
  }
}

export const isSupabaseConfigured = (): boolean => {
  const url = (import.meta as any).env?.VITE_SUPABASE_URL;
  const anonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;
  return !!(url && anonKey);
};
