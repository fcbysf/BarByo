/**
 * Access Request Service
 *
 * Handles access request operations for users requesting barber access.
 */

import { supabase } from "../lib/supabase";

/**
 * Submit a new access request
 */
export const submitAccessRequest = async (data) => {
  const { data: result, error } = await supabase
    .from("access_requests")
    .insert([data])
    .select()
    .single();

  if (error) throw error;
  return result;
};

/**
 * Get the current user's access request (most recent)
 */
export const getMyAccessRequest = async (userId) => {
  const { data, error } = await supabase
    .from("access_requests")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows
  return data;
};
