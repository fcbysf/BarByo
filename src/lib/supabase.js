/**
 * Supabase Client Configuration
 *
 * This file creates and exports a singleton instance of the Supabase client.
 * The client is used throughout the app to interact with the Supabase backend,
 * including authentication, database queries, and real-time subscriptions.
 */

import { createClient } from "@supabase/supabase-js";

// Get Supabase credentials from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate that environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase credentials. Please check your .env file and ensure " +
      "VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set correctly.",
  );
}

// Create and export the Supabase client
// This client automatically handles:
// - Authentication state management
// - Session persistence in localStorage
// - Automatic token refresh
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Enable automatic session refresh
    autoRefreshToken: true,
    // Persist session in localStorage (survives page refreshes)
    persistSession: true,
    // Detect session from URL (used for OAuth callbacks)
    detectSessionInUrl: true,
  },
});
