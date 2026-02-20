/**
 * Authentication Store (Zustand)
 *
 * Global state management for user authentication.
 * Handles login, logout, and session persistence.
 * Role-based access: admin, barber, or null (unapproved).
 */

import { create } from "zustand";
import { supabase } from "../lib/supabase";

export const useAuthStore = create((set, get) => ({
  // State
  user: null, // Authenticated user object from Supabase
  profile: null, // User profile from our users table
  loading: true, // Loading state for initial session check
  error: null, // Error message if auth fails
  initialized: false, // Prevents multiple listeners and initializations

  /**
   * Initialize authentication state
   * Checks for existing session and sets up auth listener
   */
  initialize: async () => {
    try {
      if (get().initialized) return;

      set({ loading: true, error: null });

      // Safety timeout: if auth takes too long, stop loading
      const timeoutId = setTimeout(() => {
        if (get().loading) {
          console.warn(
            "Auth initialization timed out, forcing loading to false",
          );
          set({ loading: false, initialized: true });
        }
      }, 5000);

      // Check if there's an existing session
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      if (session?.user) {
        // Session exists - fetch user profile
        const { data: profile } = await supabase
          .from("users")
          .select("*")
          .eq("user_id", session.user.id)
          .single();

        set({
          user: session.user,
          profile: profile,
          loading: false,
          initialized: true,
        });
      } else {
        set({ user: null, profile: null, loading: false, initialized: true });
      }

      // Listen for auth state changes (login, logout, token refresh)
      supabase.auth.onAuthStateChange(async (event, session) => {
        console.log("Auth state changed:", event);

        if (session?.user) {
          // User logged in - fetch profile with retry for background trigger
          let profile = null;
          let retries = 5;

          while (!profile && retries > 0) {
            const { data } = await supabase
              .from("users")
              .select("*")
              .eq("user_id", session.user.id)
              .single();

            if (data) {
              profile = data;
            } else {
              await new Promise((res) => setTimeout(res, 500));
              retries--;
            }
          }

          set({
            user: session.user,
            profile: profile,
            loading: false,
          });
        } else {
          // User logged out
          set({ user: null, profile: null, loading: false });
        }
      });
    } catch (error) {
      console.error("Error initializing auth:", error);
      set({ error: error.message, loading: false, initialized: true });
    }
  },

  /**
   * Sign in with email and password
   */
  signIn: async (email, password) => {
    try {
      set({ loading: true, error: null });

      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (signInError) throw signInError;

      // Fetch user profile
      let profile = null;
      const { data: existingProfile } = await supabase
        .from("users")
        .select("*")
        .eq("user_id", data.user.id)
        .single();

      if (existingProfile) {
        profile = existingProfile;
      } else {
        // User exists in auth but not in users table - create profile
        const { data: newProfile } = await supabase
          .from("users")
          .insert([
            {
              user_id: data.user.id,
              email: email,
              full_name:
                data.user.user_metadata?.full_name || email.split("@")[0],
            },
          ])
          .select()
          .single();
        profile = newProfile;
      }

      set({
        user: data.user,
        profile: profile,
        loading: false,
      });

      return { success: true, data, profile };
    } catch (error) {
      console.error("Sign in error:", error);
      set({ error: error.message, loading: false });
      return { success: false, error: error.message };
    }
  },

  /**
   * Sign up with email and password (creates auth user, profile auto-created)
   */
  signUp: async (email, password) => {
    try {
      set({ loading: true, error: null });

      const { data: authData, error: signUpError } = await supabase.auth.signUp(
        {
          email,
          password,
        },
      );

      if (signUpError) throw signUpError;

      // Create user profile (role stays null until admin approves)
      if (authData.user) {
        let profile = null;
        // Try to find existing profile first
        const { data: existing } = await supabase
          .from("users")
          .select("*")
          .eq("user_id", authData.user.id)
          .single();

        if (existing) {
          profile = existing;
        } else {
          // Wait for DB trigger / create manually
          let retries = 5;
          while (!profile && retries > 0) {
            const { data } = await supabase
              .from("users")
              .select("*")
              .eq("user_id", authData.user.id)
              .single();

            if (data) {
              profile = data;
            } else {
              if (retries === 5) {
                // Try inserting on first retry
                const { data: inserted } = await supabase
                  .from("users")
                  .insert([
                    {
                      user_id: authData.user.id,
                      email: email,
                      full_name: email.split("@")[0],
                    },
                  ])
                  .select()
                  .single();
                if (inserted) profile = inserted;
              }
              await new Promise((res) => setTimeout(res, 500));
              retries--;
            }
          }
        }

        set({
          user: authData.user,
          profile: profile,
          loading: false,
        });
      }

      return { success: true, data: authData };
    } catch (error) {
      console.error("Sign up error:", error);
      set({ error: error.message, loading: false });
      return { success: false, error: error.message };
    }
  },

  /**
   * Sign in with Google OAuth
   */
  signInWithGoogle: async () => {
    try {
      set({ loading: true, error: null });

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/login`,
        },
      });

      if (error) throw error;

      // Note: OAuth redirects to Google, then back to our app
      // The actual user state update happens in the onAuthStateChange listener
      return { success: true, data };
    } catch (error) {
      console.error("Google sign in error:", error);
      set({ error: error.message, loading: false });
      return { success: false, error: error.message };
    }
  },

  /**
   * Sign out
   */
  signOut: async () => {
    try {
      set({ loading: true, error: null });

      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      set({ user: null, profile: null, loading: false });

      return { success: true };
    } catch (error) {
      console.error("Sign out error:", error);
      set({ error: error.message, loading: false });
      return { success: false, error: error.message };
    }
  },

  /**
   * Update user profile
   */
  updateProfile: async (updates) => {
    try {
      const { user, profile } = get();
      if (!user || !profile) throw new Error("Not authenticated");

      set({ loading: true, error: null });

      const { data, error } = await supabase
        .from("users")
        .update(updates)
        .eq("id", profile.id)
        .select()
        .single();

      if (error) throw error;

      set({ profile: data, loading: false });

      return { success: true, data };
    } catch (error) {
      console.error("Update profile error:", error);
      set({ error: error.message, loading: false });
      return { success: false, error: error.message };
    }
  },

  /**
   * Reset password (send reset email)
   */
  resetPassword: async (email) => {
    try {
      set({ loading: true, error: null });

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      set({ loading: false });
      return { success: true };
    } catch (error) {
      console.error("Reset password error:", error);
      set({ error: error.message, loading: false });
      return { success: false, error: error.message };
    }
  },

  /**
   * Refresh user profile from database
   */
  refreshProfile: async () => {
    try {
      const { user } = get();
      if (!user) return;

      const { data: profile } = await supabase
        .from("users")
        .select("*")
        .eq("user_id", user.id)
        .single();

      set({ profile });
    } catch (error) {
      console.error("Refresh profile error:", error);
    }
  },
}));
