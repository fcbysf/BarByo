
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { getUpcomingAppointments } from '../services/appointmentService';
import { Scissors, LayoutDashboard, Calendar, Users, Settings, LogOut, Search, Bell, Plus, TrendingUp, CalendarX, MoreVertical, DollarSign, Clock, UserPlus } from 'lucide-react';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuthStore();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch appointments on component mount
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!profile) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getUpcomingAppointments(profile.id);
        setAppointments(data);
      } catch (err) {
        console.error('Error fetching appointments:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [profile]);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  // Calculate statistics from appointments
  const stats = [
    { label: "Today's Revenue", value: `$${appointments.reduce((sum, apt) => sum + (apt.price || 0), 0).toFixed(2)}`, trend: "+12%", Icon: DollarSign, color: "text-secondary" },
    { label: "Total Appointments", value: `${appointments.length} / ${appointments.length + 4}`, trend: "Running Smooth", Icon: Clock, color: "text-primary-text" },
    { label: "New Customers", value: "2", trend: "+5%", Icon: UserPlus, color: "text-blue-500" }
  ];

  // Format appointment data for display
  const formattedAppointments = appointments.map((apt) => ({
    id: apt.id,
    time: apt.appointment_time?.slice(0, 5) || 'N/A', // HH:MM
    customerName: profile?.full_name || 'You',
    customerInitials: profile?.full_name?.split(' ').map(n => n[0]).join('') || 'U',
    service: apt.service,
    status: apt.status === 'pending' ? 'Pending' : apt.status === 'confirmed' ? 'Confirmed' : 'Checked In',
    avatar: profile?.avatar_url,
    barberName: apt.barbers?.name || 'Barbershop',
  }));

  return (
    <div className="flex h-screen bg-background-light">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-100 flex flex-col p-6">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-sm">
            <Scissors className="text-text-main" size={20} />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">BarberPro</h1>
            <p className="text-[10px] text-text-muted font-black uppercase tracking-widest">Dashboard</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary font-bold text-text-main shadow-sm">
            <LayoutDashboard size={20} /> Dashboard
          </Link>
          <Link to="/schedule" className="flex items-center gap-3 px-4 py-3 rounded-xl text-text-muted font-medium hover:bg-slate-50 transition-all">
            <Calendar size={20} /> Calendar
          </Link>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-text-muted font-medium hover:bg-slate-50 transition-all">
            <Scissors size={20} /> Services
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-text-muted font-medium hover:bg-slate-50 transition-all">
            <Users size={20} /> Customers
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-text-muted font-medium hover:bg-slate-50 transition-all">
            <Settings size={20} /> Settings
          </a>
        </nav>

        <div className="pt-6 border-t border-slate-50">
          <div className="flex items-center gap-3">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} className="w-10 h-10 rounded-full" alt={profile.full_name} />
            ) : (
              <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center font-bold text-sm">
                {profile?.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
              </div>
            )}
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold truncate">{profile?.full_name || user?.email}</p>
              <p className="text-[10px] text-text-muted uppercase font-black">{profile?.user_type || 'User'}</p>
            </div>
            <button onClick={handleLogout} className="text-text-muted hover:text-text-main"><LogOut size={20} /></button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold">Overview</h2>
            <p className="text-xs font-bold text-text-muted">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
              <input type="text" placeholder="Search..." className="pl-10 pr-4 py-2 bg-slate-50 border-transparent rounded-xl text-sm w-64 focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none" />
            </div>
            <button className="text-text-muted relative">
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <Link to="/book/:shopId" className="bg-primary hover:bg-primary-hover text-text-main px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-sm transition-all">
              <Plus size={20} /> Book Appointment
            </Link>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 max-w-7xl mx-auto w-full space-y-8">
          {/* Hero Banner */}
          <div className="relative h-48 rounded-3xl overflow-hidden shadow-lg">
            <img
              src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=2000"
              className="w-full h-full object-cover"
              alt="Barbershop"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-slate-900/40 to-transparent flex items-center p-12">
              <div className="text-white">
                <h3 className="text-3xl font-black mb-2">Welcome, {profile?.full_name || 'User'}!</h3>
                <p className="text-slate-200">
                  {loading ? 'Loading appointments...' :
                    appointments.length > 0 ? `You have ${appointments.length} upcoming appointment${appointments.length !== 1 ? 's' : ''}.` :
                      'No upcoming appointments. Book one now!'}
                </p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((s) => (
              <div key={s.label} className="bg-white p-6 rounded-3xl border border-slate-50 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group hover:border-secondary transition-all">
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
              <Link to="/schedule" className="text-sm font-bold text-secondary hover:underline">View Calendar</Link>
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
                <Link to="/book/:shopId" className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-text-main font-bold px-6 py-3 rounded-xl transition-all">
                  <Plus size={20} /> Book Your First Appointment
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-text-muted">
                      <th className="px-6 py-4">Time</th>
                      <th className="px-6 py-4">Barber</th>
                      <th className="px-6 py-4">Service</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {formattedAppointments.map((a) => (
                      <tr key={a.id} className="group hover:bg-slate-50/30 transition-all">
                        <td className="px-6 py-5 font-bold text-sm">{a.time}</td>
                        <td className="px-6 py-5 text-sm">{a.barberName}</td>
                        <td className="px-6 py-5 text-sm text-text-muted">{a.service}</td>
                        <td className="px-6 py-5">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${a.status === 'Confirmed' ? 'bg-green-100 text-green-700' :
                            a.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                              'bg-slate-100 text-slate-600'
                            }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${a.status === 'Confirmed' ? 'bg-green-500' :
                              a.status === 'Pending' ? 'bg-amber-500' :
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
