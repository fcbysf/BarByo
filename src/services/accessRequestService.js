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
  const { data, error } = await supabase.rpc("get_my_access_request");

  if (error) {
    console.error(
      "AccessRequestService: get_my_access_request RPC error:",
      error,
    );
    throw error;
  }

  return data;
};
