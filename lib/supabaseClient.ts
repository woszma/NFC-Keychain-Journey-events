import { createClient } from '@supabase/supabase-js';

// Access environment variables defined in the .env file
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn(
    'Supabase credentials are missing. Please check your .env file.\n' +
    'Make sure you have REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY set.'
  );
}

// Create the client with the environment variables
// Using 'as string' assertion because we handle the warning above, and the app relies on them.
export const supabase = createClient(
  SUPABASE_URL as string, 
  SUPABASE_ANON_KEY as string
);