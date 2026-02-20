
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { getUpcomingAppointments, getBarberAppointments } from '../services/appointmentService';
import { supabase } from '../lib/supabase';
import { Scissors, LayoutDashboard, Calendar, Users, Settings, LogOut, Search, Bell, Plus, TrendingUp, CalendarX, MoreVertical, DollarSign, Clock, UserPlus } from 'lucide-react';
import NotificationDropdown from '../components/NotificationDropdown';
import Sidebar from '../components/Sidebar';
import { useFadeIn, useStagger } from '../hooks/useAnimations';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuthStore();

  const [appointments, setAppointments] = useState([]);
  const [barberShop, setBarberShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Animation Refs
  const mainRef = React.useRef(null);
  const containerRef = React.useRef(null);

  useFadeIn(mainRef, [loading], { y: 20 });
  useStagger(containerRef, '.gsap-card', [loading], { y: 30, stagger: 0.1 });

  // Fetch appointments on component mount
  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        if (profile?.role === 'barber') {
          // Barber: fetch their shop and its appointments
          const { data: shop } = await supabase
            .from('barbers')
            .select('*')
            .eq('user_id', user.id)
            .single();

          if (shop) {
            setBarberShop(shop);
            const data = await getBarberAppointments(shop.id);
            setAppointments(data);
          } else {
            // No shop found for this barber, send to onboarding
            navigate('/onboarding', { replace: true });
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        // If it's a "no row found" error for the barber shop, redirect to onboarding
        if (profile?.role === 'barber' && (err.code === 'PGRST116' || err.message?.includes('0 rows'))) {
          navigate('/onboarding', { replace: true });
        } else {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, profile]);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const isBarber = true; // Dashboard is now barber-only
  const today = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter(a => a.appointment_date === today);
  const todayRevenue = todayAppointments.reduce((sum, apt) => sum + (apt.price || 0), 0);

  // Calculate statistics from appointments
  const stats = [
    { label: "Today's Revenue", value: `$${todayRevenue.toFixed(2)}`, trend: `${todayAppointments.length} appts today`, Icon: DollarSign, color: "text-secondary" },
    { label: "Total Appointments", value: `${appointments.length}`, trend: 'This week', Icon: Clock, color: "text-primary-text" },
    { label: "Shop Status", value: barberShop?.is_active ? 'Active' : 'Inactive', trend: 'Live', Icon: UserPlus, color: "text-blue-500" }
  ];

  // Format appointment data for display
  const formattedAppointments = appointments.map((apt) => ({
    id: apt.id,
    time: apt.appointment_time?.slice(0, 5) || 'N/A', // HH:MM
    date: apt.appointment_date,
    customerName: isBarber ? (apt.users?.full_name || apt.guest_name || 'Walk-in') : (apt.barbers?.name || 'Barbershop'),
    customerInitials: isBarber
      ? (apt.users?.full_name || apt.guest_name || 'W').split(' ').map(n => n[0]).join('')
      : (apt.barbers?.name || 'B').split(' ').map(n => n[0]).join(''),
    service: apt.service,
    status: apt.status === 'pending' ? 'Pending' : apt.status === 'confirmed' ? 'Confirmed' : apt.status === 'cancelled' ? 'Cancelled' : 'Completed',
    barberName: apt.barbers?.name || barberShop?.name || 'Barbershop',
  }));

  return (
    <div className="flex h-screen bg-background-light">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-4 md:px-8 sticky top-0 z-10 pl-16 md:pl-8">
          <div>
            <h2 className="text-xl font-bold">Overview</h2>
            <p className="text-xs font-bold text-text-muted">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
              <input type="text" placeholder="Search..." className="pl-10 pr-4 py-2 bg-slate-50 border-transparent rounded-xl text-sm w-64 focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none" />
            </div>
            <NotificationDropdown shopId={barberShop?.id} />
            <Link to="/schedule" className="bg-primary hover:bg-primary-hover text-text-main px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-sm transition-all">
              <Calendar size={20} /> View Schedule
            </Link>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 max-w-7xl mx-auto w-full space-y-8" ref={mainRef}>
          {/* Hero Banner */}
          <div className="relative h-48 rounded-3xl overflow-hidden shadow-lg">
            <img
              src={barberShop?.image_url || "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=2000"}
              className="w-full h-full object-cover"
              alt={barberShop?.name || "Barbershop"}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-slate-900/40 to-transparent flex items-center p-12">
              <div className="text-white">
                <h3 className="text-3xl font-black mb-2">Welcome, {profile?.full_name || user?.email?.split('@')[0] || 'User'}!</h3>
                <p className="text-slate-200">
                  {loading ? 'Loading your data...' :
                    (barberShop ? `Managing ${barberShop.name} · ${appointments.length} appointment${appointments.length !== 1 ? 's' : ''} this week` : 'Complete your shop setup to start receiving bookings.')}
                </p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6" ref={containerRef}>
            {stats.map((s) => (
              <div key={s.label} className="gsap-card bg-white p-6 rounded-3xl border border-slate-50 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group hover:border-secondary transition-all">
                <div className="z-10 flex flex-col justify-between h-full">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1">{s.label}</p>
                    <h4 className="text-3xl font-black">{s.value}</h4>
                  </div>
                  <div className={`text-[10px] font-bold flex items-center gap-1 ${s.trend.startsWith('+') ? 'text-green-600' : 'text-text-muted'}`}>
                    <TrendingUp size={12} /> {s.trend}
                  </div>
                </div>
                <s.Icon className="absolute -right-4 -bottom-4 text-slate-100 group-hover:text-secondary/10 transition-all" size={96} />
              </div>
            ))}
          </div>

          {/* Appointments Table */}
          <div className="bg-white rounded-3xl border border-slate-50 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between">
              <h3 className="text-lg font-bold">Upcoming Appointments</h3>
              {isBarber ? (
                <Link to="/schedule" className="text-sm font-bold text-secondary hover:underline">View Calendar</Link>
              ) : (
                <Link to="/client" className="text-sm font-bold text-secondary hover:underline">Book New</Link>
              )}
            </div>

            {loading ? (
              <div className="p-12 text-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-text-muted">Loading appointments...</p>
              </div>
            ) : error ? (
              <div className="p-12 text-center">
                <p className="text-red-600">Error loading appointments: {error}</p>
              </div>
            ) : formattedAppointments.length === 0 ? (
              <div className="p-12 text-center">
                <CalendarX className="text-slate-200 mb-4" size={64} />
                <p className="text-text-muted text-lg mb-4">No upcoming appointments</p>
                <Link to="/schedule" className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-text-main font-bold px-6 py-3 rounded-xl transition-all">
                  <Calendar size={20} /> View Schedule
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-text-muted">
                      <th className="px-6 py-4">Date & Time</th>
                      <th className="px-6 py-4">Client</th>
                      <th className="px-6 py-4">Service</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 relative" ref={containerRef}>
                    {formattedAppointments.map((a) => (
                      <tr key={a.id} className="gsap-card group hover:bg-slate-50/30 transition-all">
                        <td className="px-6 py-5">
                          <p className="font-bold text-sm">{a.time}</p>
                          <p className="text-xs text-text-muted">{a.date}</p>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center text-xs font-bold">
                              {a.customerInitials}
                            </div>
                            <span className="text-sm font-medium">{a.customerName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-sm text-text-muted">{a.service}</td>
                        <td className="px-6 py-5">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${a.status === 'Confirmed' ? 'bg-green-100 text-green-700' :
                            a.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                              a.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                                'bg-slate-100 text-slate-600'
                            }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${a.status === 'Confirmed' ? 'bg-green-500' :
                              a.status === 'Pending' ? 'bg-amber-500' :
                                a.status === 'Cancelled' ? 'bg-red-500' :
                                  'bg-slate-400'
                              }`}></span>
                            {a.status}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <button className="p-2 rounded-lg hover:bg-white text-slate-300 hover:text-text-main transition-all">
                            <MoreVertical size={20} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
