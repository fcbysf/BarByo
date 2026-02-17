/**
 * Appointment Service
 * 
 * Handles all appointment-related operations including CRUD and real-time subscriptions.
 */

import { supabase } from '../lib/supabase';

/**
 * Create a new appointment
 */
export const createAppointment = async (appointmentData) => {
  // First check if the time slot is available
  const isAvailable = await checkTimeSlotAvailability(
    appointmentData.barber_id,
    appointmentData.appointment_date,
    appointmentData.appointment_time
  );

  if (!isAvailable) {
    throw new Error('This time slot is already booked. Please choose a different time.');
  }

  const { data, error } = await supabase
    .from('appointments')
    .insert([appointmentData])
    .select(`
      *,
      barbers (
        name,
        owner_name,
        address,
        phone,
        image_url
      )
    `)
    .single();

  if (error) throw error;
  return data;
};

/**
 * Get all appointments for a customer
 */
export const getCustomerAppointments = async (customerId) => {
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      barbers (
        name,
        owner_name,
        address,
        phone,
        image_url,
        rating
      )
    `)
    .eq('customer_id', customerId)
    .order('appointment_date', { ascending: true })
    .order('appointment_time', { ascending: true });

  if (error) throw error;
  return data;
};

/**
 * Get all appointments for a barber
 */
export const getBarberAppointments = async (barberId, startDate = null) => {
  let query = supabase
    .from('appointments')
    .select(`
      *,
      users!appointments_customer_id_fkey (
        full_name,
        email,
        phone,
        avatar_url
      )
    `)
    .eq('barber_id', barberId)
    .order('appointment_date', { ascending: true })
    .order('appointment_time', { ascending: true });

  // Optionally filter by start date
  if (startDate) {
    query = query.gte('appointment_date', startDate);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
};

/**
 * Get a single appointment by ID
 */
export const getAppointmentById = async (appointmentId) => {
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      barbers (*),
      users!appointments_customer_id_fkey (*)
    `)
    .eq('id', appointmentId)
    .single();

  if (error) throw error;
  return data;
};

/**
 * Update an appointment
 */
export const updateAppointment = async (appointmentId, updates) => {
  // If updating time/date, check availability
  if (updates.appointment_date || updates.appointment_time) {
    const appointment = await getAppointmentById(appointmentId);

    const isAvailable = await checkTimeSlotAvailability(
      appointment.barber_id,
      updates.appointment_date || appointment.appointment_date,
      updates.appointment_time || appointment.appointment_time,
      appointmentId // Exclude current appointment from check
    );

    if (!isAvailable) {
      throw new Error('This time slot is already booked. Please choose a different time.');
    }
  }

  const { data, error } = await supabase
    .from('appointments')
    .update(updates)
    .eq('id', appointmentId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Cancel an appointment (soft delete by setting status)
 */
export const cancelAppointment = async (appointmentId) => {
  return updateAppointment(appointmentId, { status: 'cancelled' });
};

/**
 * Delete an appointment (hard delete)
 */
export const deleteAppointment = async (appointmentId) => {
  const { error } = await supabase
    .from('appointments')
    .delete()
    .eq('id', appointmentId);

  if (error) throw error;
};

/**
 * Check if a time slot is available
 */
export const checkTimeSlotAvailability = async (
  barberId,
  date,
  time,
  excludeAppointmentId = null
) => {
  let query = supabase
    .from('appointments')
    .select('id')
    .eq('barber_id', barberId)
    .eq('appointment_date', date)
    .eq('appointment_time', time)
    .not('status', 'in', '(cancelled,completed)');

  // Exclude a specific appointment (useful when updating)
  if (excludeAppointmentId) {
    query = query.neq('id', excludeAppointmentId);
  }

  const { data, error } = await query;

  if (error) throw error;

  // If no appointments found, slot is available
  return data.length === 0;
};

/**
 * Get upcoming appointments for a customer
 */
export const getUpcomingAppointments = async (customerId) => {
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      barbers (*)
    `)
    .eq('customer_id', customerId)
    .gte('appointment_date', today)
    .not('status', 'in', '(cancelled,completed)')
    .order('appointment_date', { ascending: true })
    .order('appointment_time', { ascending: true });

  if (error) throw error;
  return data;
};

/**
 * Get appointment history for a customer
 */
export const getAppointmentHistory = async (customerId) => {
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      barbers (*)
    `)
    .eq('customer_id', customerId)
    .in('status', ['completed', 'cancelled'])
    .order('appointment_date', { ascending: false });

  if (error) throw error;
  return data;
};

/**
 * Subscribe to real-time appointment updates
 * Returns a subscription object that you should unsubscribe from when done
 */
export const subscribeToAppointments = (customerId, callback) => {
  const subscription = supabase
    .channel('appointments-changes')
    .on(
      'postgres_changes',
      {
        event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
        schema: 'public',
        table: 'appointments',
        filter: `customer_id=eq.${customerId}`,
      },
      (payload) => {
        callback(payload);
      }
    )
    .subscribe();

  return subscription;
};

/**
 * Get available time slots for a barber on a specific date
 */
export const getAvailableTimeSlots = async (barberId, date) => {
  // Get barber's working hours for this day
  const { data: barber, error: barberError } = await supabase
    .from('barbers')
    .select('availability')
    .eq('id', barberId)
    .single();

  if (barberError) throw barberError;

  const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const workingHours = barber?.availability?.[dayOfWeek] || [];

  if (workingHours.length === 0) {
    return []; // Barber doesn't work on this day
  }

  // Get all booked appointments for this day
  const { data: bookedAppointments, error: appointmentsError } = await supabase
    .from('appointments')
    .select('appointment_time')
    .eq('barber_id', barberId)
    .eq('appointment_date', date)
    .not('status', 'in', '(cancelled,completed)');

  if (appointmentsError) throw appointmentsError;

  // Convert booked times to array
  const bookedTimes = bookedAppointments.map((apt) => apt.appointment_time);

  // Generate all possible 30-minute slots within working hours
  const allSlots = [];
  workingHours.forEach((hours) => {
    const [start, end] = hours.split('-');
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);

    let currentHour = startHour;
    let currentMin = startMin;

    while (
      currentHour < endHour ||
      (currentHour === endHour && currentMin < endMin)
    ) {
      const timeSlot = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}:00`;
      allSlots.push(timeSlot);

      // Add 30 minutes
      currentMin += 30;
      if (currentMin >= 60) {
        currentMin = 0;
        currentHour += 1;
      }
    }
  });

  // Filter out booked slots
  const availableSlots = allSlots.filter((slot) => !bookedTimes.includes(slot));

  return availableSlots;
};
