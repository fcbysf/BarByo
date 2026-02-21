
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { getBarberAppointments, createAppointment, deleteAppointment, markAppointmentNoShow, markAppointmentCompleted } from '../services/appointmentService';
import { getBarberServices } from '../services/barberService';
import { supabase } from '../lib/supabase';
import { ArrowLeft, ChevronLeft, ChevronRight, Plus, X, User, Scissors, Clock, Calendar as CalendarIcon, Loader2, Trash2, Bell, LogOut, CheckCircle, AlertTriangle } from 'lucide-react';
import NotificationDropdown from '../components/NotificationDropdown';
import Sidebar from '../components/Sidebar';
import { format, startOfWeek, addDays, subDays, isSameDay, parseISO } from 'date-fns';
import { useStagger, useFadeIn } from '../hooks/useAnimations';
import { Smartphone } from 'lucide-react';

const SchedulePage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [myBarberShop, setMyBarberShop] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // Form State
  const [services, setServices] = useState([]);
  const [formData, setFormData] = useState({
    service: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '10:00',
    customer_name: '',
    whatsapp_number: '' // New field
  });
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null); // { title: '', desc: '', action: { label: '', href: '' } }
  const [showMobileBanner, setShowMobileBanner] = useState(true);

  // Computed
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday start
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const hours = Array.from({ length: 13 }, (_, i) => i + 8); // 8 AM to 8 PM

  // GSAP Animation Refs
  const gridRef = React.useRef(null);

  useFadeIn(gridRef, [currentDate, appointments.length]);
  useStagger(gridRef, '.gsap-appointment', [currentDate, appointments.length], { y: 15, duration: 0.4, stagger: 0.03 });

  // Fetch Data
  useEffect(() => {
    fetchMyShopAndAppointments();
  }, [user, currentDate]);

  useEffect(() => {
    if (myBarberShop) {
      fetchServices(myBarberShop.id);
    }
  }, [myBarberShop]);

  // Realtime subscription — re-fetch whenever appointments change for this shop
  useEffect(() => {
    if (!myBarberShop) return;

    const channel = supabase
      .channel(`appointments-schedule-${myBarberShop.id}-${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'appointments',
          filter: `barber_id=eq.${myBarberShop.id}`
        },
        () => {
          // Re-fetch whenever anything changes
          getBarberAppointments(myBarberShop.id).then(setAppointments);
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [myBarberShop]);

  const fetchMyShopAndAppointments = async () => {
    if (!user) return;
    try {
      setLoading(true);

      // Get the logged-in barber's own shop
      const { data: shop, error: shopError } = await supabase
        .from('barbers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (shopError && shopError.code !== 'PGRST116') {
        console.error('Error fetching shop:', shopError);
      }

      if (shop) {
        setMyBarberShop(shop);
        const data = await getBarberAppointments(shop.id);
        setAppointments(data);
      } else {
        setAppointments([]);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async (barberId) => {
    try {
      const data = await getBarberServices(barberId);
      setServices(data);
      if (data.length > 0) {
        setFormData(prev => ({ ...prev, service: data[0].name }));
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const handleCreateAppointment = async (e) => {
    e.preventDefault();
    if (!myBarberShop) {
      alert('No barber shop found. Please complete onboarding first.');
      return;
    }
    setSubmitting(true);
    try {
      const selectedService = services.find(s => s.name === formData.service);
      const price = selectedService ? selectedService.price : 0;

      // Walk-in appointments: customer_id is null (no auth user)
      // The Realtime subscription will pick this up and update the calendar automatically
      const { data, error } = await supabase
        .from('appointments')
        .insert([{
          customer_id: null,
          barber_id: myBarberShop.id,
          appointment_date: formData.date,
          appointment_time: formData.time + ':00',
          service: formData.service,
          price: price,
          status: 'confirmed',
          notes: formData.customer_name ? `Walk-in: ${formData.customer_name}${formData.whatsapp_number ? ` (WA: ${formData.whatsapp_number})` : ''}` : 'Walk-in'
        }])
        .select()
        .single();

      if (error) throw error;

      // Optimistically add to local state immediately (Realtime will also fire)
      setAppointments(prev => [...prev, data]);
      setIsModalOpen(false);
      // Reset form
      setFormData(prev => ({
        ...prev,
        customer_name: '',
        whatsapp_number: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        time: '10:00'
      }));
    } catch (error) {
      console.error('Error creating appointment:', error);
      alert(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAppointment = async (aptId) => {
    if (!window.confirm('Cancel this appointment?')) return;
    try {
      await deleteAppointment(aptId);
      setSelectedAppointment(null);
      fetchMyShopAndAppointments();
    } catch (error) {
      alert('Failed to delete: ' + error.message);
    }
  };

  // Helper to get appointments for a specific day and hour
  const getAppointmentsForSlot = (day, hour) => {
    return appointments.filter(apt => {
      const aptDate = parseISO(apt.appointment_date);
      const [aptHour] = apt.appointment_time.split(':').map(Number);
      return isSameDay(aptDate, day) && aptHour === hour;
    });
  };

  const showToast = (title, desc, nextAppointment) => {
    let whatsappHref = null;

    if (nextAppointment) {
      const notes = nextAppointment.notes || '';
      const waMatch = notes.match(/\(WA:\s*([^\)]+)\)/i);
      const phoneToUse = waMatch ? waMatch[1].replace(/\D/g, '') : (nextAppointment.users?.phone || nextAppointment.guest_phone || '');

      if (phoneToUse) {
        const message = encodeURIComponent(`Hi ${nextAppointment.users?.full_name || nextAppointment.guest_name || 'there'}, your barber ${myBarberShop?.name} is ready for you early! Are you around?`);
        whatsappHref = `https://wa.me/${phoneToUse}?text=${message}`;
      }
    }

    setToastMessage({
      title,
      desc,
      action: whatsappHref ? { label: 'Notify Next Client', href: whatsappHref } : null
    });

    setTimeout(() => {
      setToastMessage(null);
    }, 8000);
  };

  const findNextAppointment = (currentAptId, currentList = appointments) => {
    const today = new Date().toISOString().split('T')[0];
    const todaysApts = currentList
      .filter(a => a.appointment_date === today && a.id !== currentAptId && (a.status === 'confirmed' || a.status === 'pending'))
      .sort((a, b) => a.appointment_time.localeCompare(b.appointment_time));

    const currentApt = currentList.find(a => a.id === currentAptId);
    if (!currentApt) return todaysApts[0] || null;

    const next = todaysApts.find(a => a.appointment_time >= currentApt.appointment_time);
    return next || null;
  };

  const handleCompleteEarly = async (aptId) => {
    if (!window.confirm("Mark this appointment as Completed?")) return;
    try {
      const nextApt = findNextAppointment(aptId);
      await markAppointmentCompleted(aptId);
      setSelectedAppointment(null);
      showToast("Appointment Completed", "Great job finishing early!", nextApt);
      fetchMyShopAndAppointments();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleNoShow = async (aptId) => {
    if (!window.confirm("Mark this appointment as a No-Show?")) return;
    try {
      const nextApt = findNextAppointment(aptId);
      await markAppointmentNoShow(aptId);
      setSelectedAppointment(null);
      showToast("Client Marked as No-Show", "The calendar has been updated.", nextApt);
      fetchMyShopAndAppointments();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  return (
    <div className="flex h-screen bg-background-light">
      <Sidebar />
      <main className="flex-1 flex flex-col bg-white overflow-hidden">
        {/* Header */}
        <header className="h-20 flex items-center justify-between px-4 md:px-8 bg-white border-b border-slate-100 shrink-0 z-10 pl-16 md:pl-8">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1">
              <h2 className="text-xl font-medium text-text-muted hidden landscape:block">
                {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d')}
              </h2>
            </div>
            {myBarberShop && (
              <span className="hidden lg:block text-xs font-bold text-secondary bg-secondary/10 px-3 py-1 rounded-full">
                {myBarberShop.name}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 mr-4">
              <button onClick={() => setCurrentDate(subDays(currentDate, 7))} className="p-1 hover:bg-slate-50 rounded-full"><ChevronLeft size={20} /></button>
              <button onClick={() => setCurrentDate(new Date())} className="px-4 py-1 text-sm font-bold">Today</button>
              <button onClick={() => setCurrentDate(addDays(currentDate, 7))} className="p-1 hover:bg-slate-50 rounded-full"><ChevronRight size={20} /></button>
            </div>
            <NotificationDropdown shopId={myBarberShop?.id} />
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-primary hover:bg-primary-hover text-text-main px-3 md:px-6 py-2.5 rounded-full font-bold text-sm flex items-center gap-2 shadow-sm"
            >
              <Plus size={20} /> <span className="hidden md:inline">New Appointment</span>
            </button>
          </div>
        </header>

        {/* Grid Container */}
        <div className="flex-1 overflow-auto bg-slate-50/30 relative" id="schedule-scroll-container">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="animate-spin text-primary" size={40} />
            </div>
          ) : !myBarberShop ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <p className="text-text-muted text-lg">No barber shop found.</p>
              <button
                onClick={() => navigate('/onboarding')}
                className="bg-primary text-text-main font-bold px-6 py-3 rounded-xl"
              >
                Complete Setup
              </button>
            </div>
          ) : (
            <div className="min-w-[800px] md:min-w-0 h-full flex flex-col">
              {/* Sticky Days Header */}
              <div className="sticky top-0 z-30 flex border-b border-slate-100 bg-white shadow-sm">
                {/* Top-Left Corner */}
                <div className="w-16 md:w-20 shrink-0 border-r border-slate-100 bg-white sticky left-0 z-40"></div>

                {/* Days Grid */}
                <div className="flex-1 grid grid-cols-7">
                  {days.map((day, i) => {
                    const isToday = isSameDay(day, new Date());
                    const isSelected = isSameDay(day, currentDate);
                    return (
                      <div
                        key={i}
                        onClick={() => setCurrentDate(day)}
                        className={`text-center py-4 md:py-6 cursor-pointer transition-colors ${isSelected ? 'bg-primary/5 relative' : 'hover:bg-slate-50'}`}
                      >
                        <span className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-1">{format(day, 'EEE')}</span>
                        <span className={`text-lg md:text-xl font-black ${isSelected ? 'text-text-main' : 'text-slate-900'}`}>{format(day, 'd')}</span>
                        {isSelected && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary"></div>}
                        {isToday && !isSelected && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-secondary"></div>}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Scrollable Grid Body */}
              <div className="flex relative pt-4" ref={gridRef}>
                {/* Sticky Time Column */}
                <div className="w-16 md:w-20 shrink-0 bg-white border-r border-slate-100 flex flex-col sticky left-0 z-20">
                  {hours.map((h) => (
                    <div key={h} className="h-32 relative group border-b border-transparent">
                      <span className="absolute -top-2.5 right-2 md:right-4 text-[10px] font-black text-text-muted uppercase tracking-widest group-hover:text-text-main">
                        {h > 12 ? h - 12 : h} {h >= 12 ? 'PM' : 'AM'}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Main Event Grid */}
                <div className="flex-1 grid grid-cols-7 divide-x divide-slate-100 relative">
                  {/* Horizontal Guidelines */}
                  <div className="absolute inset-0 pointer-events-none z-0">
                    {hours.map((h) => (
                      <div key={h} className="h-32 border-b border-slate-100/50"></div>
                    ))}
                  </div>

                  {/* Appointments per Day */}
                  {days.map((day, i) => (
                    <div key={i} className="relative h-full z-10">
                      {hours.map(hour => {
                        const slotAppointments = getAppointmentsForSlot(day, hour);
                        return slotAppointments.map(apt => (
                          <div
                            key={apt.id}
                            onClick={() => setSelectedAppointment(apt)}
                            className="gsap-appointment absolute left-1 right-1 bg-secondary/15 border-l-4 border-secondary rounded-xl p-2 md:p-3 shadow-sm cursor-pointer hover:bg-secondary/25 transition-all hover:shadow-md z-20 overflow-hidden"
                            style={{ top: `${(hour - 8) * 128 + 4}px`, height: '120px' }}
                          >
                            <p className="text-xs font-black text-text-main truncate">{apt.notes?.replace('Walk-in: ', '') || 'Walk-in'}</p>
                            <p className="text-[10px] font-bold text-text-muted mt-1 uppercase truncate">{apt.service}</p>
                            <p className="text-[10px] font-medium text-slate-500 mt-1 flex items-center gap-1">
                              <Clock size={10} /> {apt.appointment_time.slice(0, 5)}
                            </p>
                            <span className={`absolute top-2 right-2 flex h-2 w-2`}>
                              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${apt.status === 'confirmed' ? 'bg-green-400' : 'bg-amber-400'}`}></span>
                              <span className={`relative inline-flex rounded-full h-2 w-2 ${apt.status === 'confirmed' ? 'bg-green-500' : 'bg-amber-500'}`}></span>
                            </span>
                          </div>
                        ));
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Appointment Detail Modal */}
        {selectedAppointment && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/20 backdrop-blur-sm" onClick={() => setSelectedAppointment(null)}>
            <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="p-6 flex items-center justify-between border-b border-slate-50">
                <h3 className="text-lg font-black">Appointment Details</h3>
                <button onClick={() => setSelectedAppointment(null)} className="text-text-muted hover:text-text-main"><X size={20} /></button>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center font-bold text-sm">
                    {(selectedAppointment.notes?.replace('Walk-in: ', '') || 'W').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold">{selectedAppointment.notes?.replace('Walk-in: ', '') || 'Walk-in'}</p>
                    <p className="text-xs text-text-muted">{selectedAppointment.notes || ''}</p>
                  </div>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted font-medium">Service</span>
                    <span className="font-bold">{selectedAppointment.service}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted font-medium">Date</span>
                    <span className="font-bold">{selectedAppointment.appointment_date}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted font-medium">Time</span>
                    <span className="font-bold">{selectedAppointment.appointment_time?.slice(0, 5)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted font-medium">Price</span>
                    <span className="font-bold text-secondary">${selectedAppointment.price}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted font-medium">Status</span>
                    <span className={`font-bold capitalize ${selectedAppointment.status === 'confirmed' ? 'text-green-600' : 'text-amber-600'}`}>{selectedAppointment.status}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => handleCompleteEarly(selectedAppointment.id)}
                    className="w-full py-3 bg-green-50 hover:bg-green-100 text-green-700 font-bold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-sm"
                  >
                    <CheckCircle size={16} /> Complete Early
                  </button>
                  <button
                    onClick={() => handleNoShow(selectedAppointment.id)}
                    className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-sm"
                  >
                    <AlertTriangle size={16} /> Mark No-Show
                  </button>
                </div>

                <button
                  onClick={() => handleDeleteAppointment(selectedAppointment.id)}
                  className="w-full py-3 bg-slate-50 hover:bg-slate-100/50 text-slate-400 hover:text-red-500 font-bold rounded-2xl flex items-center justify-center gap-2 transition-all"
                >
                  <Trash2 size={16} /> Delete Forever
                </button>
              </div>
            </div>
          </div>
        )}

        {/* New Appointment Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/20 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
              <div className="p-8 flex items-center justify-between">
                <h3 className="text-2xl font-black">New Appointment</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-text-muted hover:text-text-main"><X size={24} /></button>
              </div>
              <form onSubmit={handleCreateAppointment} className="p-8 space-y-6 pt-0">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Client Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                    <input
                      type="text"
                      required
                      value={formData.customer_name}
                      onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                      placeholder="John Doe"
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-primary focus:bg-white outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 mt-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">WhatsApp Number (Optional)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-sm font-bold">+</span>
                    <input
                      type="tel"
                      value={formData.whatsapp_number}
                      onChange={(e) => {
                        // Only allow numbers
                        const val = e.target.value.replace(/\D/g, '');
                        setFormData({ ...formData, whatsapp_number: val });
                      }}
                      placeholder="1234567890"
                      className="w-full pl-8 pr-4 py-3.5 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-primary focus:bg-white outline-none transition-all"
                    />
                  </div>
                </div>

                {myBarberShop && (
                  <div className="bg-secondary/10 rounded-2xl px-4 py-3 flex items-center gap-3">
                    <Scissors size={18} className="text-secondary" />
                    <div>
                      <p className="text-xs font-black text-text-muted uppercase tracking-widest">Barber Shop</p>
                      <p className="font-bold text-sm">{myBarberShop.name}</p>
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Service</label>
                  <div className="relative">
                    <Scissors className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                    <select
                      required
                      value={formData.service}
                      onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-primary focus:bg-white outline-none appearance-none transition-all"
                    >
                      <option value="">Select Service</option>
                      {services.map((s, i) => (
                        <option key={i} value={s.name}>{s.name} (${s.price})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Date</label>
                    <div className="relative">
                      <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                      <input
                        type="date"
                        required
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Time</label>
                    <div className="relative">
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                      <input
                        type="time"
                        required
                        value={formData.time}
                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-transparent rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6 flex gap-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-4 text-sm font-bold text-text-muted hover:bg-slate-50 rounded-2xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-[2] py-4 bg-primary hover:bg-primary-hover text-text-main font-black rounded-2xl shadow-lg shadow-primary/30 flex items-center justify-center gap-2"
                  >
                    {submitting ? <Loader2 className="animate-spin" /> : 'Save Appointment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Custom Toast */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 bg-slate-900 text-white p-6 rounded-2xl shadow-2xl z-50 animate-fade-in-up max-w-sm border border-slate-700">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-black text-lg">{toastMessage.title}</h4>
            <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white"><LogOut size={16} className="rotate-45" /></button>
          </div>
          <p className="text-slate-300 text-sm mb-4">{toastMessage.desc}</p>

          {toastMessage.action && (
            <a
              href={toastMessage.action.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setToastMessage(null)}
              className="w-full text-center flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebd5a] text-white font-black py-3 rounded-xl transition-all"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
              {toastMessage.action.label}
            </a>
          )}
        </div>
      )}

      {/* Mobile Rotation Banner */}
      {showMobileBanner && (
        <div className="md:hidden portrait:flex landscape:hidden fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/95 backdrop-blur-sm text-white px-2 py-2 pl-6 rounded-full items-center gap-3 shadow-2xl z-[60] border border-slate-700 w-max max-w-[90vw] animate-fade-in-up">
          <Smartphone size={18} className="text-primary animate-pulse rotate-90 shrink-0" />
          <span className="text-xs font-bold truncate">Rotate phone for best experience</span>
          <button
            onClick={() => setShowMobileBanner(false)}
            className="ml-2 p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

export default SchedulePage;
