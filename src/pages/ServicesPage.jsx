import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { getBarberServices, createService, updateService, deleteService } from '../services/barberService';
import Sidebar from '../components/Sidebar';
import NotificationDropdown from '../components/NotificationDropdown';
import { Plus, Scissors, Clock, DollarSign, Trash2, Edit2, X, Check, Loader2, AlertCircle } from 'lucide-react';

const ServicesPage = () => {
    const { user } = useAuthStore();
    const [services, setServices] = useState([]);
    const [barberShop, setBarberShop] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [error, setError] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        duration: 30,
        price: 30
    });

    useEffect(() => {
        fetchData();
    }, [user]);

    const fetchData = async () => {
        if (!user) return;
        try {
            setLoading(true);
            const { data: shop } = await supabase
                .from('barbers')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (shop) {
                setBarberShop(shop);
                const data = await getBarberServices(shop.id);
                setServices(data);
            }
        } catch (err) {
            console.error('Error fetching services:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (service = null) => {
        if (service) {
            setEditingService(service);
            setFormData({
                name: service.name,
                description: service.description || '',
                duration: service.duration,
                price: service.price
            });
        } else {
            setEditingService(null);
            setFormData({
                name: '',
                description: '',
                duration: 30,
                price: 30
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!barberShop) return;

        try {
            setLoading(true);
            if (editingService) {
                await updateService(editingService.id, formData);
            } else {
                await createService({
                    ...formData,
                    barber_id: barberShop.id
                });
            }
            await fetchData();
            setIsModalOpen(false);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this service?')) return;
        try {
            await deleteService(id);
            setServices(services.filter(s => s.id !== id));
        } catch (err) {
            alert('Error deleting service: ' + err.message);
        }
    };

    return (
        <div className="flex h-screen bg-background-light">
            <Sidebar />

            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-4 md:px-8 sticky top-0 z-10 pl-16 md:pl-8">
                    <div>
                        <h2 className="text-xl font-bold">Services</h2>
                        <p className="text-xs font-bold text-text-muted">Manage your shop offerings and pricing</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <NotificationDropdown shopId={barberShop?.id} />
                        <button
                            onClick={() => handleOpenModal()}
                            className="bg-primary hover:bg-primary-hover text-text-main px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-sm transition-all"
                        >
                            <Plus size={20} /> Add New Service
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8 max-w-7xl mx-auto w-full">
                    {error && (
                        <div className="mb-6 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl flex items-center gap-3">
                            <AlertCircle size={20} />
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    )}

                    {loading && services.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64">
                            <Loader2 className="animate-spin text-primary mb-4" size={48} />
                            <p className="text-text-muted font-medium">Loading services...</p>
                        </div>
                    ) : services.length === 0 ? (
                        <div className="bg-white rounded-3xl p-12 text-center border border-slate-50 shadow-sm mt-12">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Scissors className="text-slate-200" size={40} />
                            </div>
                            <h3 className="text-xl font-bold mb-2">No services found</h3>
                            <p className="text-text-muted mb-8 max-w-sm mx-auto">Start by adding your first service so clients can see what you offer and book appointments.</p>
                            <button
                                onClick={() => handleOpenModal()}
                                className="bg-primary hover:bg-primary-hover text-text-main px-8 py-3 rounded-xl font-bold shadow-lg"
                            >
                                Add Your First Service
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {services.map((service) => (
                                <div key={service.id} className="bg-white p-6 rounded-3xl border border-slate-50 shadow-sm hover:border-primary transition-all group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                                            <Scissors className="text-primary" size={24} />
                                        </div>
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                            <button
                                                onClick={() => handleOpenModal(service)}
                                                className="p-2 bg-slate-50 text-text-muted hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(service.id)}
                                                className="p-2 bg-slate-50 text-text-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    <h4 className="text-lg font-bold mb-1">{service.name}</h4>
                                    <p className="text-sm text-text-muted mb-6 line-clamp-2 h-10">{service.description || 'No description provided.'}</p>

                                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-text-muted">
                                                <Clock size={14} className="text-primary" />
                                                {service.duration} min
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-text-muted">
                                                <DollarSign size={14} className="text-secondary" />
                                                ${service.price}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 pb-0 flex justify-between items-center">
                            <h3 className="text-2xl font-bold">{editingService ? 'Edit Service' : 'Add New Service'}</h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 hover:bg-slate-50 rounded-xl text-text-muted"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-text-muted mb-2">Service Name</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-slate-50 border-transparent rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:bg-white outline-none transition-all"
                                    placeholder="e.g. Skin Fade"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-text-muted mb-2">Description (Optional)</label>
                                <textarea
                                    rows="3"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-slate-50 border-transparent rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:bg-white outline-none transition-all resize-none"
                                    placeholder="What's included in this service?"
                                ></textarea>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-text-muted mb-2">Duration (min)</label>
                                    <div className="relative">
                                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                                        <input
                                            required
                                            type="number"
                                            value={formData.duration}
                                            onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-transparent rounded-xl focus:ring-2 focus:ring-primary focus:bg-white outline-none transition-all"
                                            min="5"
                                            step="5"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-text-muted mb-2">Price ($)</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary" size={18} />
                                        <input
                                            required
                                            type="number"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-transparent rounded-xl focus:ring-2 focus:ring-primary focus:bg-white outline-none transition-all"
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-4 text-sm font-bold text-text-muted hover:bg-slate-50 rounded-xl transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 bg-primary hover:bg-primary-hover text-text-main font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
                                >
                                    {loading && <Loader2 className="animate-spin" size={18} />}
                                    {editingService ? 'Save Changes' : 'Create Service'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ServicesPage;
