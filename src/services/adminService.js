/**
 * Admin Service
 *
 * Handles all admin-specific operations: managing requests, barbers, and platform stats.
 */

import { supabase } from "../lib/supabase";

// ─── Access Requests ─────────────────────────

/**
 * Get all access requests (admin only)
 */
export const getAccessRequests = async (statusFilter = null) => {
  let query = supabase
    .from("access_requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (statusFilter) {
    query = query.eq("status", statusFilter);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

/**
 * Approve an access request
 * 1. Update request status to approved
 * 2. Set user role to barber
 * 3. Create barber profile
 * 4. Activate 7-day trial
 */
export const approveRequest = async (request) => {
  const { data, error } = await supabase.rpc("approve_access_request", {
    p_request_id: request.id,
    p_user_id: request.user_id,
    p_shop_name: request.shop_name,
    p_owner_name: request.name,
    p_phone: request.phone,
    p_location: request.location || "",
  });

  if (error) {
    console.error("AdminService: approve_access_request RPC error:", error);
    throw error;
  }

  console.log("AdminService: approve_access_request success:", data);
  return data;
};

/**
 * Reject an access request
 */
export const rejectRequest = async (requestId) => {
  const { error } = await supabase
    .from("access_requests")
    .update({ status: "rejected" })
    .eq("id", requestId);

  if (error) throw error;
};

// ─── Barber Management ───────────────────────

/**
 * Get all barbers (admin view, no active filter)
 */
export const getAllBarbersAdmin = async () => {
  const { data, error } = await supabase
    .from("barbers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};

/**
 * Toggle barber active status
 */
export const toggleBarberActive = async (barberId, isActive) => {
  const { data, error } = await supabase
    .from("barbers")
    .update({ is_active: isActive })
    .eq("id", barberId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Update barber subscription
 */
export const updateBarberSubscription = async (barberId, updates) => {
  const { data, error } = await supabase
    .from("barbers")
    .update(updates)
    .eq("id", barberId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Delete a barber
 */
export const deleteBarber = async (barberId) => {
  const { error } = await supabase.from("barbers").delete().eq("id", barberId);

  if (error) throw error;
};

// ─── Platform Stats ──────────────────────────

/**
 * Get platform overview stats
 */
export const getPlatformStats = async () => {
  const [usersRes, barbersRes, bookingsRes, requestsRes] = await Promise.all([
    supabase.from("users").select("id", { count: "exact", head: true }),
    supabase
      .from("barbers")
      .select("id, subscription_status", { count: "exact" }),
    supabase.from("appointments").select("id", { count: "exact", head: true }),
    supabase
      .from("access_requests")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
  ]);

  const barbers = barbersRes.data || [];
  const activeSubscriptions = barbers.filter(
    (b) =>
      b.subscription_status === "active" || b.subscription_status === "trial",
  ).length;

  return {
    totalUsers: usersRes.count || 0,
    totalBarbers: barbers.length,
    totalBookings: bookingsRes.count || 0,
    activeSubscriptions,
    pendingRequests: requestsRes.count || 0,
  };
};

// ─── Shops Overview ──────────────────────────

/**
 * Get all shops with booking counts
 */
export const getAllShopsWithStats = async () => {
  const { data: shops, error } = await supabase
    .from("barbers")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw error;

  // Get booking counts for each shop
  const shopsWithStats = await Promise.all(
    shops.map(async (shop) => {
      const { count } = await supabase
        .from("appointments")
        .select("id", { count: "exact", head: true })
        .eq("barber_id", shop.id);

      return { ...shop, bookingCount: count || 0 };
    }),
  );

  return shopsWithStats;
};
