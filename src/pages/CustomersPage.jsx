import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import Sidebar from '../components/Sidebar';
import NotificationDropdown from '../components/NotificationDropdown';
import { Users, Search, Mail, Phone, Calendar, Star, Filter, ArrowUpRight, Loader2, User as UserIcon } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const CustomersPage = () => {
    const { user } = useAuthStore();
    const [customers, setCustomers] = useState([]);
    const [barberShop, setBarberShop] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchData();
    }, [user]);

    const fetchData = async () => {
        if (!user) return;
        try {
            setLoading(true);

            // 1. Get barber shop
            const { data: shop } = await supabase
                .from('barbers')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (shop) {
                setBarberShop(shop);

                // 2. Fetch unique customers from appointments
                // We want to combine guest_name (for walk-ins) and user_id (for registered users)
                const { data: appointments, error: aptError } = await supabase
                    .from('appointments')
                    .select(`
            id,
            guest_name,
            customer_id,
            appointment_date,
            status,
            users (
              id,
              full_name,
              email
            )
          `)
                    .eq('barber_id', shop.id)
                    .order('appointment_date', { ascending: false });

                if (aptError) throw aptError;

                // Process appointments into unique customers
                const customerMap = new Map();

                appointments.forEach(apt => {
                    // Identify the customer identifier
                    const id = apt.customer_id || apt.guest_name;
                    if (!id) return;

                    if (!customerMap.has(id)) {
                        customerMap.set(id, {
                            id: id,
                            name: apt.users?.full_name || apt.guest_name || 'Anonymous',
                            email: apt.users?.email || 'Guest',
                            totalBookings: 0,
                            lastVisit: apt.appointment_date,
                            type: apt.customer_id ? 'Registered' : 'Guest',
                            status: apt.status
                        });
                    }

                    const customer = customerMap.get(id);
                    customer.totalBookings += 1;

                    // Check if this visit is more recent
                    if (apt.appointment_date > customer.lastVisit) {
                        customer.lastVisit = apt.appointment_date;
                    }
                });

                setCustomers(Array.from(customerMap.values()));
            }
        } catch (err) {
            console.error('Error fetching customers:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex h-screen bg-background-light">
            <Sidebar />

            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-10">
                    <div>
                        <h2 className="text-xl font-bold">Customers</h2>
                        <p className="text-xs font-bold text-text-muted">Tracking {customers.length} unique clients</p>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                            <input
                                type="text"
                                placeholder="Search customers..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 bg-slate-50 border-transparent rounded-xl text-sm w-64 focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none"
                            />
                        </div>
                        <NotificationDropdown shopId={barberShop?.id} />
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8 max-w-7xl mx-auto w-full">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-64">
                            <Loader2 className="animate-spin text-primary mb-4" size={48} />
                            <p className="text-text-muted font-medium">Loading customer database...</p>
                        </div>
                    ) : customers.length === 0 ? (
                        <div className="bg-white rounded-3xl p-12 text-center border border-slate-50 shadow-sm mt-12">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Users className="text-slate-200" size={40} />
                            </div>
                            <h3 className="text-xl font-bold mb-2">No customers yet</h3>
                            <p className="text-text-muted mb-4 max-w-sm mx-auto">Once you start receiving bookings, your customer directory will automatically populate here.</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-3xl border border-slate-50 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-text-muted">
                                            <th className="px-8 py-5">Customer Name</th>
                                            <th className="px-8 py-5">Contact</th>
                                            <th className="px-8 py-5">Visits</th>
                                            <th className="px-8 py-5">Last Visit</th>
                                            <th className="px-8 py-5">Type</th>
                                            <th className="px-8 py-5 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {filteredCustomers.map((customer) => (
                                            <tr key={customer.id} className="group hover:bg-slate-50/50 transition-all">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                            {customer.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-sm leading-tight mb-0.5">{customer.name}</p>
                                                            <p className="text-xs text-text-muted">Client ID: {typeof customer.id === 'string' ? customer.id.slice(0, 8) : 'GUEST'}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2 text-xs text-text-muted">
                                                            <Mail size={12} className="text-secondary" /> {customer.email}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className="text-sm font-black bg-slate-100 px-3 py-1 rounded-full">{customer.totalBookings}</span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-2 text-sm font-medium">
                                                        <Calendar size={14} className="text-primary" />
                                                        {format(parseISO(customer.lastVisit), 'MMM d, yyyy')}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${customer.type === 'Registered'
                                                            ? 'bg-blue-50 text-blue-600'
                                                            : 'bg-slate-50 text-slate-500'
                                                        }`}>
                                                        {customer.type}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <button className="p-2.5 rounded-xl hover:bg-white text-slate-300 hover:text-secondary shadow-sm transition-all border border-transparent hover:border-slate-100">
                                                        <ArrowUpRight size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {filteredCustomers.length === 0 && (
                                <div className="p-12 text-center">
                                    <p className="text-text-muted">No customers match your search "{searchTerm}"</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default CustomersPage;
