import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Create a single supabase client for interacting with the database
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase; 