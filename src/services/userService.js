/**
 * User Service
 * 
 * Handles user profile operations and queries.
 */

import { supabase } from '../lib/supabase';

/**
 * Get user profile by user_id (auth user id)
 */
export const getUserProfile = async (userId) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return data;
};

/**
 * Get user profile by id (users table id)
 */
export const getUserProfileById = async (id) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

/**
 * Update user profile
 */
export const updateUserProfile = async (userId, updates) => {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Create user profile (usually called after signup)
 */
export const createUserProfile = async (userData) => {
  const { data, error } = await supabase
    .from('users')
    .insert([userData])
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Delete user profile
 */
export const deleteUserProfile = async (userId) => {
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('user_id', userId);

  if (error) throw error;
};
