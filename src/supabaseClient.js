import { createClient } from '@supabase/supabase-js';

// Load Supabase credentials from environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Throw an error if environment variables are missing
if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase environment variables are missing. Please check your .env file.");
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);
