/**
 * Admin Shops Overview Page
 *
 * Shows all barber shops with associated barber info and booking stats.
 */

import { useState, useEffect } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import { getAllShopsWithStats } from "../../services/adminService";
import {
    Store,
    MapPin,
    Phone,
    Calendar,
    User,
    RefreshCw,
} from "lucide-react";

const AdminShopsPage = () => {
    const [shops, setShops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchShops = async () => {
        try {
            setLoading(true);
            const data = await getAllShopsWithStats();
            setShops(data);
        } catch (err) {
            setError("Failed to fetch shops: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchShops();
    }, []);

    const subscriptionBadge = (status) => {
        const config = {
            trial: { bg: "bg-blue-100 text-blue-700", dot: "bg-blue-500" },
            active: { bg: "bg-green-100 text-green-700", dot: "bg-green-500" },
            inactive: { bg: "bg-slate-100 text-slate-600", dot: "bg-slate-400" },
        };
        const c = config[status] || config.inactive;
        return (
            <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${c.bg}`}
            >
                <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`}></span>
                {status?.charAt(0).toUpperCase() + status?.slice(1)}
            </span>
        );
    };

    return (
        <div className="flex h-screen bg-background-light">
            <AdminSidebar />

            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-4 md:px-8 sticky top-0 z-10 pl-16 md:pl-8">
                    <div>
                        <h2 className="text-xl font-bold">Shops Overview</h2>
                        <p className="text-xs font-bold text-text-muted">
                            {shops.length} shop{shops.length !== 1 ? "s" : ""} on platform
                        </p>
                    </div>
                    <button
                        onClick={fetchShops}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-text-muted hover:text-text-main border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
                    >
                        <RefreshCw size={16} />
                        Refresh
                    </button>
                </header>

                <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-7xl mx-auto w-full">
                    {error && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => (
                                <div
                                    key={i}
                                    className="bg-white rounded-2xl p-6 border border-slate-50 animate-pulse"
                                >
                                    <div className="h-4 bg-slate-100 rounded w-2/3 mb-4"></div>
                                    <div className="h-3 bg-slate-100 rounded w-1/2 mb-2"></div>
                                    <div className="h-3 bg-slate-100 rounded w-1/3"></div>
                                </div>
                            ))}
                        </div>
                    ) : shops.length === 0 ? (
                        <div className="bg-white rounded-2xl p-12 border border-slate-50 text-center">
                            <Store className="text-slate-200 mx-auto mb-4" size={64} />
                            <p className="text-text-muted text-lg">No shops registered yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {shops.map((shop) => (
                                <div
                                    key={shop.id}
                                    className="bg-white rounded-2xl border border-slate-50 shadow-sm hover:shadow-md transition-all overflow-hidden"
                                >
                                    {/* Shop Image */}
                                    <div className="h-36 bg-slate-100 relative">
                                        {shop.image_url ? (
                                            <img
                                                src={shop.image_url}
                                                alt={shop.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-100 flex items-center justify-center">
                                                <Store className="text-slate-300" size={40} />
                                            </div>
                                        )}
                                        <div className="absolute top-3 right-3">
                                            {subscriptionBadge(shop.subscription_status)}
                                        </div>
                                    </div>

                                    {/* Shop Details */}
                                    <div className="p-5">
                                        <h3 className="font-bold text-lg mb-3">{shop.name}</h3>

                                        <div className="space-y-2 mb-4">
                                            <div className="flex items-center gap-2 text-sm text-text-muted">
                                                <User size={14} />
                                                <span>{shop.owner_name || "Unknown"}</span>
                                            </div>
                                            {shop.address && (
                                                <div className="flex items-center gap-2 text-sm text-text-muted">
                                                    <MapPin size={14} />
                                                    <span className="truncate">{shop.address}</span>
                                                </div>
                                            )}
                                            {shop.phone && (
                                                <div className="flex items-center gap-2 text-sm text-text-muted">
                                                    <Phone size={14} />
                                                    <span>{shop.phone}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Stats */}
                                        <div className="pt-4 border-t border-slate-50">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Calendar size={14} className="text-secondary" />
                                                    <span className="font-bold">
                                                        {shop.bookingCount} bookings
                                                    </span>
                                                </div>
                                                <span
                                                    className={`text-xs font-bold ${shop.is_active ? "text-green-600" : "text-slate-400"
                                                        }`}
                                                >
                                                    {shop.is_active ? "● Active" : "● Inactive"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AdminShopsPage;
