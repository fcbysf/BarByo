/**
 * Authentication Store (Zustand)
 *
 * Global state management for user authentication.
 * Handles login, signup, logout, and session persistence.
 */

import { create } from "zustand";
import { supabase } from "../lib/supabase";

export const useAuthStore = create((set, get) => ({
  // State
  user: null, // Authenticated user object from Supabase
  profile: null, // User profile from our users table
  loading: true, // Loading state for initial session check
  error: null, // Error message if auth fails

  /**
   * Initialize authentication state
   * Checks for existing session and sets up auth listener
   */
  initialize: async () => {
    try {
      set({ loading: true, error: null });

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
        });
      } else {
        set({ user: null, profile: null, loading: false });
      }

      // Listen for auth state changes (login, logout, token refresh)
      supabase.auth.onAuthStateChange(async (event, session) => {
        console.log("Auth state changed:", event);

        if (session?.user) {
          // User logged in - fetch profile
          const { data: profile } = await supabase
            .from("users")
            .select("*")
            .eq("user_id", session.user.id)
            .single();

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
      set({ error: error.message, loading: false });
    }
  },

  /**
   * Sign up with email and password
   */
  signUp: async (email, password, userData = {}) => {
    try {
      set({ loading: true, error: null });

      // Create auth user
      const { data: authData, error: signUpError } = await supabase.auth.signUp(
        {
          email,
          password,
          options: {
            data: userData, // Optional metadata
          },
        },
      );

      if (signUpError) throw signUpError;

      // Create profile in users table
      if (authData.user) {
        const { error: profileError } = await supabase.from("users").insert([
          {
            user_id: authData.user.id,
            email: email,
            full_name: userData.full_name || "",
            user_type: userData.user_type || "customer",
          },
        ]);

        if (profileError) throw profileError;

        // Fetch the created profile
        const { data: profile } = await supabase
          .from("users")
          .select("*")
          .eq("user_id", authData.user.id)
          .single();

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
      const { data: profile } = await supabase
        .from("users")
        .select("*")
        .eq("user_id", data.user.id)
        .single();

      set({
        user: data.user,
        profile: profile,
        loading: false,
      });

      return { success: true, data };
    } catch (error) {
      console.error("Sign in error:", error);
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
          redirectTo: `${window.location.origin}/dashboard`,
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
}));
