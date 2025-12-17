import { createClient } from '@supabase/supabase-js';

// Vite uses import.meta.env.VITE_...
const SUPABASE_URL = (import.meta as any).env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn(
    'Supabase credentials are missing. Please check your .env file.\n' +
    'Make sure you have VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY set.'
  );
}

export const supabase = createClient(
  (SUPABASE_URL as string) || '', 
  (SUPABASE_ANON_KEY as string) || ''
);