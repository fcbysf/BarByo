/**
 * Barber Service
 *
 * Handles barber/shop queries and operations.
 */

import { supabase } from "../lib/supabase";

/**
 * Get all active barbers
 */
export const getAllBarbers = async () => {
  const { data, error } = await supabase
    .from("barbers")
    .select("*")
    .eq("is_active", true)
    .order("rating", { ascending: false });

  if (error) throw error;
  return data;
};

/**
 * Get a specific barber by ID
 */
export const getBarberById = async (barberId) => {
  const { data, error } = await supabase
    .from("barbers")
    .select("*")
    .eq("id", barberId)
    .single();

  if (error) throw error;
  return data;
};

/**
 * Search barbers by name or services
 */
export const searchBarbers = async (query) => {
  const { data, error } = await supabase
    .from("barbers")
    .select("*")
    .eq("is_active", true)
    .or(`name.ilike.%${query}%,owner_name.ilike.%${query}%`)
    .order("rating", { ascending: false });

  if (error) throw error;
  return data;
};

/**
 * Get barbers offering a specific service
 */
export const getBarbersByService = async (service) => {
  const { data, error } = await supabase
    .from("barbers")
    .select("*")
    .eq("is_active", true)
    .contains("services", [service])
    .order("rating", { ascending: false });

  if (error) throw error;
  return data;
};

/**
 * Get barber availability for a specific day
 */
export const getBarberAvailability = async (barberId, dayOfWeek) => {
  const { data, error } = await supabase
    .from("barbers")
    .select("availability")
    .eq("id", barberId)
    .single();

  if (error) throw error;

  // Parse availability JSON and return for the requested day
  // dayOfWeek should be lowercase like 'monday', 'tuesday', etc.
  const availability = data?.availability || {};
  return availability[dayOfWeek.toLowerCase()] || [];
};

/**
 * Create a new barber shop (for barber owners)
 */
export const createBarberShop = async (barberData) => {
  const { data, error } = await supabase
    .from("barbers")
    .insert([barberData])
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Update barber shop information
 */
export const updateBarberShop = async (barberId, updates) => {
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
 * Get barber services and pricing
 */
export const getBarberPricing = async (barberId) => {
  const { data, error } = await supabase
    .from("barbers")
    .select("services, pricing")
    .eq("id", barberId)
    .single();

  if (error) throw error;
  return data;
};

/**
 * Get detailed services for a barber
 */
export const getBarberServices = async (barberId) => {
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("barber_id", barberId)
    .order("price", { ascending: true });

  if (error) throw error;
  return data;
};

/**
 * Create a new service
 */
export const createService = async (serviceData) => {
  const { data, error } = await supabase
    .from("services")
    .insert([serviceData])
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Update a service
 */
export const updateService = async (serviceId, updates) => {
  const { data, error } = await supabase
    .from("services")
    .update(updates)
    .eq("id", serviceId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Delete a service
 */
export const deleteService = async (serviceId) => {
  const { error } = await supabase
    .from("services")
    .delete()
    .eq("id", serviceId);

  if (error) throw error;
};
