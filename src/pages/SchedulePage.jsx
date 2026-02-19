
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { getBarberAppointments, createAppointment, deleteAppointment } from '../services/appointmentService';
import { getBarberServices } from '../services/barberService';
import { supabase } from '../lib/supabase';
import { ArrowLeft, ChevronLeft, ChevronRight, Plus, X, User, Scissors, Clock, Calendar as CalendarIcon, Loader2, Trash2, Bell } from 'lucide-react';
import NotificationDropdown from '../components/NotificationDropdown';
import Sidebar from '../components/Sidebar';
import { format, startOfWeek, addDays, subDays, isSameDay, parseISO } from 'date-fns';

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
    customer_name: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // Computed
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday start
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const hours = Array.from({ length: 13 }, (_, i) => i + 8); // 8 AM to 8 PM

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
      .channel(`appointments:barber_id=eq.${myBarberShop.id}`)
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
          notes: formData.customer_name ? `Walk-in: ${formData.customer_name}` : 'Walk-in'
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

  return (
    <div className="flex h-screen bg-background-light">
      <Sidebar />
      <main className="flex-1 flex flex-col bg-white overflow-hidden">
        {/* Header */}
        <header className="h-20 flex items-center justify-between px-4 md:px-8 bg-white border-b border-slate-100 shrink-0 z-10 pl-16 md:pl-8">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1">
              <h1 className="text-2xl font-bold">Schedule</h1>
              <span className="text-2xl text-slate-200 font-light">/</span>
              <h2 className="text-xl font-medium text-text-muted">
                {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d')}
              </h2>
            </div>
            {myBarberShop && (
              <span className="hidden md:block text-xs font-bold text-secondary bg-secondary/10 px-3 py-1 rounded-full">
                {myBarberShop.name}
              </span>
            )}
            <div className="flex bg-slate-50 rounded-full p-1 text-sm font-bold ml-4">
              <button className="px-6 py-1.5 bg-white shadow-sm rounded-full">Week</button>
              <button className="px-6 py-1.5 text-text-muted">Day</button>
            </div>
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
              className="bg-primary hover:bg-primary-hover text-text-main px-6 py-2.5 rounded-full font-bold text-sm flex items-center gap-2 shadow-sm"
            >
              <Plus size={20} /> New Appointment
            </button>
          </div>
        </header>

        {/* Grid Container */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Days Header */}
          <div className="flex border-b border-slate-100 bg-white shadow-sm z-10">
            <div className="w-20 shrink-0 border-r border-slate-100"></div>
            <div className="flex-1 grid grid-cols-7">
              {days.map((day, i) => {
                const isToday = isSameDay(day, new Date());
                return (
                  <div key={i} className={`text-center py-6 ${isToday ? 'bg-primary/5 relative' : ''}`}>
                    <span className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-1">{format(day, 'EEE')}</span>
                    <span className={`text-xl font-black ${isToday ? 'text-text-main' : 'text-slate-900'}`}>{format(day, 'd')}</span>
                    {isToday && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary"></div>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Scrollable Area */}
          <div className="flex-1 overflow-y-auto overflow-x-auto relative bg-slate-50/30">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="animate-spin text-primary" size={40} />
              </div>
            ) : !myBarberShop ? (
              <div className="flex flex-col items-center justify-center h-64 gap-4">
                <p className="text-text-muted text-lg">No barber shop found.</p>
                <button
                  onClick={() => navigate('/onboarding')}
                  className="bg-primary text-text-main font-bold px-6 py-3 rounded-xl"
                >
                  Complete Setup
                </button>
              </div>
            ) : (
              <div className="flex min-h-[1000px] min-w-[800px] md:min-w-0">
                {/* Time Labels */}
                <div className="w-20 shrink-0 bg-white border-r border-slate-100 flex flex-col">
                  {hours.map((h) => (
                    <div key={h} className="h-32 relative group">
                      <span className="absolute -top-2.5 right-4 text-[10px] font-black text-text-muted uppercase tracking-widest group-hover:text-text-main">
                        {h > 12 ? h - 12 : h} {h >= 12 ? 'PM' : 'AM'}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Grid Columns */}
                <div className="flex-1 grid grid-cols-7 divide-x divide-slate-100 relative">
                  {/* Horizontal Dividers */}
                  <div className="absolute inset-0 pointer-events-none z-0">
                    {hours.map((h) => (
                      <div key={h} className="h-32 border-b border-slate-100/50"></div>
                    ))}
                  </div>

                  {/* Day Columns */}
                  {days.map((day, i) => (
                    <div key={i} className="relative h-full z-10">
                      {hours.map(hour => {
                        const slotAppointments = getAppointmentsForSlot(day, hour);
                        return slotAppointments.map(apt => (
                          <div
                            key={apt.id}
                            onClick={() => setSelectedAppointment(apt)}
                            className="absolute left-1 right-1 bg-secondary/15 border-l-4 border-secondary rounded-xl p-3 shadow-sm cursor-pointer hover:bg-secondary/25 transition-all hover:shadow-md z-20 overflow-hidden"
                            style={{ top: `${(hour - 8) * 128 + 4}px`, height: '120px' }}
                          >
                            <p className="text-xs font-black text-text-main truncate">{apt.notes?.replace('Walk-in: ', '') || 'Walk-in'}</p>
                            <p className="text-[10px] font-bold text-text-muted mt-1 uppercase truncate">{apt.service}</p>
                            <p className="text-[10px] font-medium text-slate-500 mt-1 flex items-center gap-1">
                              <Clock size={10} /> {apt.appointment_time.slice(0, 5)}
                            </p>
                            <span className={`absolute top-2 right-2 text-[9px] font-black px-1.5 py-0.5 rounded-full ${apt.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                              apt.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                'bg-slate-100 text-slate-500'
                              }`}>{apt.status}</span>
                          </div>
                        ));
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
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
                <button
                  onClick={() => handleDeleteAppointment(selectedAppointment.id)}
                  className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-2xl flex items-center justify-center gap-2 transition-all"
                >
                  <Trash2 size={16} /> Cancel Appointment
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
    </div>
  );
};

export default SchedulePage;
