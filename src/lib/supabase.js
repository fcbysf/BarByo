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

// Custom fetch wrapper with timeout
// This handles the edge case where the app sits idle, the network drops silently,
// and Supabase requests hang forever causing an infinite loader.
const fetchWithTimeout = async (url, options) => {
  const timeoutMs = 12000; // 12 seconds
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    if (error.name === "AbortError") {
      console.warn(
        "Supabase request timed out (likely idle connection drop). Forcing page refresh...",
      );
      // If the request hangs for too long, force a refresh as requested by the user
      window.location.reload();
      throw new Error("Request timed out. Refreshing page...");
    }
    throw error;
  }
};

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
  global: {
    fetch: fetchWithTimeout,
  },
});
