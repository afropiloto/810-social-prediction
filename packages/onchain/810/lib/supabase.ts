// import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
// Note: We use a fallback empty string during build/preview to prevent the applet from crashing
// if these environment variables are not yet populated in the AI Studio environment.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// If credentials are missing, this client won't function correctly but will prevent a fatal crash on load
export const supabase = {
    // uncomment the import above and the line below in Cursor
    // createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder-key'),
    isConfigured: !!process.env.NEXT_PUBLIC_SUPABASE_URL
};
