
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { getBarberById, getBarberServices, getBarberAvailability } from '../services/barberService';
import { createAppointment, getAvailableTimeSlots } from '../services/appointmentService';
import { Scissors, Search, Heart, MapPin, ChevronLeft, ChevronRight, ArrowRight, Star, Loader2, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { format, addDays, startOfToday, isSameDay, parseISO } from 'date-fns';

const BookingPage = () => {
  const { barberId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Data State
  const [barber, setBarber] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selection State
  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(startOfToday());
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Computed
  const weekDates = Array.from({ length: 5 }, (_, i) => addDays(selectedDate, i - 2 > 0 ? i - 2 : i));

  useEffect(() => {
    if (barberId) {
      fetchBarberData();
    }
  }, [barberId]);

  useEffect(() => {
    if (barberId && selectedDate) {
      fetchTimeSlots();
    }
  }, [barberId, selectedDate]);

  const fetchBarberData = async () => {
    try {
      setLoading(true);
      const [barberData, servicesData] = await Promise.all([
        getBarberById(barberId),
        getBarberServices(barberId)
      ]);

      setBarber(barberData);
      setServices(servicesData);

      if (servicesData.length > 0) {
        setSelectedServiceId(servicesData[0].id);
      }
    } catch (error) {
      console.error('Error fetching barber data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTimeSlots = async () => {
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const slots = await getAvailableTimeSlots(barberId, dateStr);
      setAvailableSlots(slots);
      setSelectedSlot(null);
    } catch (error) {
      console.error('Error fetching time slots:', error);
    }
  };

  const handleBooking = async () => {
    if (!user) {
      alert('Please log in to book an appointment');
      navigate('/login');
      return;
    }

    if (!selectedServiceId || !selectedSlot) return;

    setBookingLoading(true);
    try {
      const service = services.find(s => s.id === selectedServiceId);

      await createAppointment({
        customer_id: user.id,
        barber_id: barberId,
        appointment_date: format(selectedDate, 'yyyy-MM-dd'),
        appointment_time: selectedSlot,
        service: service.name,
        price: service.price,
        status: 'confirmed',
        notes: ''
      });

      alert('Booking confirmed!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Booking failed:', error);
      alert('Failed to book appointment: ' + error.message);
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  if (!barber) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h2 className="text-2xl font-bold">Barber not found</h2>
        <button onClick={() => navigate('/dashboard')} className="text-primary hover:underline">Go back home</button>
      </div>
    );
  }

  const selectedService = services.find(s => s.id === selectedServiceId);

  return (
    <div className="bg-background-light min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-8 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
            <Scissors className="text-secondary" size={24} />
            <span className="text-xl font-bold tracking-tight">BarberPro</span>
          </div>
          <button className="flex items-center gap-2 text-sm font-bold bg-slate-50 hover:bg-slate-100 px-4 py-2 rounded-xl transition-all">
            <Search size={18} /> Search
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-12 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
        <div className="space-y-8">
          {/* Shop Intro */}
          <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-50 flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
            <div className="relative">
              <img src={barber.image_url || "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=300"} className="w-32 h-32 rounded-3xl object-cover shadow-md" alt="shop" />
              <div className="absolute -bottom-2 -right-2 bg-green-500 text-white text-[10px] font-black px-3 py-1 rounded-full border-4 border-white uppercase tracking-widest">Open</div>
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex justify-between">
                <h1 className="text-3xl font-black">{barber.name}</h1>
                <button className="hidden md:block text-text-muted hover:text-red-400"><Heart size={24} /></button>
              </div>
              <p className="text-text-muted text-sm flex items-center justify-center md:justify-start gap-1">
                <MapPin size={16} /> {barber.address || 'Address not available'}
              </p>
              <div className="flex items-center justify-center md:justify-start gap-4 pt-2">
                <div className="flex items-center gap-1 font-black text-sm">
                  <span className="text-secondary text-base">{barber.rating || 'New'}</span>
                  <div className="flex text-secondary text-xs gap-0.5">
                    {[1, 2, 3, 4, 5].map((_, i) => <Star key={i} size={12} fill={i < Math.floor(barber.rating || 5) ? "currentColor" : "none"} />)}
                  </div>
                  <span className="text-text-muted font-normal underline cursor-pointer ml-1">({barber.total_reviews || 0} reviews)</span>
                </div>
                <span className="text-green-600 font-bold text-sm">Open until 8:00 PM</span>
              </div>
            </div>
          </section>

          {/* Navigation */}
          <div className="flex border-b border-slate-100 hide-scrollbar overflow-x-auto">
            {['Services', 'Reviews', 'Portfolio', 'About'].map((tab, i) => (
              <button key={tab} className={`px-6 py-4 text-sm font-bold whitespace-nowrap transition-all border-b-2 ${i === 0 ? 'text-secondary border-secondary' : 'text-text-muted border-transparent hover:text-text-main'}`}>
                {tab}
              </button>
            ))}
          </div>

          {/* Services List */}
          <div className="space-y-4">
            <h2 className="text-xl font-black">Services</h2>
            <div className="bg-white rounded-3xl border border-slate-50 shadow-sm divide-y divide-slate-50">
              {services.length === 0 ? (
                <div className="p-8 text-center text-text-muted">No services listed yet.</div>
              ) : (
                services.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => setSelectedServiceId(s.id)}
                    className={`p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer hover:bg-slate-50 transition-all ${selectedServiceId === s.id ? 'bg-primary/5 ring-1 ring-inset ring-primary' : ''}`}
                  >
                    <div className="flex-1 space-y-1">
                      <p className="font-bold text-lg">{s.name}</p>
                      <p className="text-sm text-text-muted max-w-md">{s.description}</p>
                      <p className="text-xs font-black text-text-muted uppercase tracking-widest pt-2">{s.duration} min</p>
                    </div>
                    <div className="flex flex-col items-end gap-3 w-full md:w-auto">
                      <p className="font-black text-lg">${s.price}</p>
                      <button className={`w-full md:w-32 py-2 rounded-xl text-sm font-bold border transition-all ${selectedServiceId === s.id ? 'bg-primary border-primary text-text-main shadow-md' : 'border-slate-200 hover:border-secondary hover:text-secondary'
                        }`}>
                        {selectedServiceId === s.id ? 'Selected' : 'Select'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Sticky Booking */}
        <aside className="space-y-6">
          <div className="sticky top-24 bg-white rounded-3xl border border-slate-50 shadow-xl shadow-slate-200/50 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-50">
              <h3 className="font-black mb-1">Your Booking</h3>
              <div className="flex justify-between items-center text-sm font-bold">
                <span className="text-text-muted truncate max-w-[150px]">{selectedService?.name || 'Select Service'}</span>
                <span>${selectedService?.price || '0.00'}</span>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-black">Select Date</h3>
                  <div className="flex gap-2">
                    <button className="text-text-muted hover:text-text-main"><ChevronLeft size={24} /></button>
                    <span className="text-xs font-bold uppercase tracking-widest pt-1">{format(selectedDate, 'MMM yyyy')}</span>
                    <button className="text-text-muted hover:text-text-main"><ChevronRight size={24} /></button>
                  </div>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
                  {weekDates.map((d, i) => {
                    const isSelected = isSameDay(d, selectedDate);
                    return (
                      <button
                        key={i}
                        onClick={() => setSelectedDate(d)}
                        className={`flex flex-col items-center justify-center min-w-[64px] h-20 rounded-2xl transition-all ${isSelected ? 'bg-primary shadow-lg shadow-primary/30 transform scale-105' : 'bg-slate-50 hover:bg-slate-100'}`}
                      >
                        <span className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1">{format(d, 'EEE')}</span>
                        <span className="text-lg font-black">{format(d, 'd')}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="font-black text-sm mb-4">Available times on {format(selectedDate, 'EEE, MMM d')}</h3>
                {availableSlots.length === 0 ? (
                  <p className="text-sm text-text-muted text-center py-4 bg-slate-50 rounded-xl border border-slate-100 border-dashed">No slots available</p>
                ) : (
                  <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto pr-1">
                    {availableSlots.map((slot) => {
                      const timeDisplay = slot.slice(0, 5);
                      return (
                        <button
                          key={slot}
                          onClick={() => setSelectedSlot(slot)}
                          className={`py-2 rounded-xl text-xs font-bold transition-all border ${selectedSlot === slot ? 'bg-primary border-primary shadow-md transform scale-105' : 'bg-slate-50 border-transparent hover:border-secondary'
                            }`}
                        >
                          {timeDisplay}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100">
              <button
                onClick={handleBooking}
                disabled={!selectedSlot || !selectedServiceId || bookingLoading}
                className="w-full py-4 bg-primary hover:bg-primary-hover text-text-main font-black rounded-2xl shadow-xl shadow-primary/30 transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {bookingLoading ? <Loader2 className="animate-spin" /> : (
                  <>Book for {format(selectedDate, 'MMM d')}, {selectedSlot ? selectedSlot.slice(0, 5) : '--:--'} <ArrowRight size={18} /></>
                )}
              </button>
              <p className="text-center text-[10px] font-bold text-text-muted uppercase tracking-widest mt-4">No credit card required to book.</p>
            </div>
          </div>
        </aside>
      </main>

      <footer className="py-12 border-t border-slate-100 mt-12 bg-white">
        <div className="max-w-5xl mx-auto px-8 text-center flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex gap-6">
            <a href="#" className="text-xs font-bold text-text-muted hover:text-text-main transition-colors uppercase tracking-widest">Privacy Policy</a>
            <a href="#" className="text-xs font-bold text-text-muted hover:text-text-main transition-colors uppercase tracking-widest">Terms</a>
            <a href="#" className="text-xs font-bold text-text-muted hover:text-text-main transition-colors uppercase tracking-widest">Support</a>
          </div>
          <p className="text-xs font-bold text-text-muted uppercase tracking-widest">© 2023 BarberPro Inc.</p>
        </div>
      </footer>
    </div>
  );
};

export default BookingPage;
