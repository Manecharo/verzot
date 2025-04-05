import { createClient } from '@supabase/supabase-js';

// Supabase configuration with fallbacks for missing environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://iqnkstwzzymqyahlztdx.supabase.co';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxbmtzdHd6enltcXlhaGx6dGR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2NTU0NTQsImV4cCI6MjA1OTIzMTQ1NH0.XLSjt2xm5spEHGASQzYo1_tMqMiSbsrc6THTxwjXeQ4';

console.log('Supabase URL:', supabaseUrl); // Debug line
console.log('Supabase Key Available:', !!supabaseKey); // Debug line - don't log the actual key for security

// Create a single supabase client for interacting with the database
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase; 