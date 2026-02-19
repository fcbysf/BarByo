/**
 * Admin Dashboard Page — Platform Overview
 *
 * Shows key platform metrics: total users, barbers, bookings,
 * active subscriptions, and pending requests.
 */

import { useState, useEffect } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import { getPlatformStats } from "../../services/adminService";
import {
    Users,
    Scissors,
    Calendar,
    CreditCard,
    Clock,
    TrendingUp,
    ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";

const AdminDashboardPage = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await getPlatformStats();
                setStats(data);
            } catch (err) {
                console.error("Error fetching stats:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const statCards = stats
        ? [
            {
                label: "Total Users",
                value: stats.totalUsers,
                icon: Users,
                color: "text-blue-500",
                bg: "bg-blue-50",
            },
            {
                label: "Total Barbers",
                value: stats.totalBarbers,
                icon: Scissors,
                color: "text-secondary",
                bg: "bg-green-50",
            },
            {
                label: "Total Bookings",
                value: stats.totalBookings,
                icon: Calendar,
                color: "text-purple-500",
                bg: "bg-purple-50",
            },
            {
                label: "Active Subscriptions",
                value: stats.activeSubscriptions,
                icon: CreditCard,
                color: "text-emerald-500",
                bg: "bg-emerald-50",
            },
            {
                label: "Pending Requests",
                value: stats.pendingRequests,
                icon: Clock,
                color: "text-amber-500",
                bg: "bg-amber-50",
            },
        ]
        : [];

    return (
        <div className="flex h-screen bg-background-light">
            <AdminSidebar />

            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-4 md:px-8 sticky top-0 z-10 pl-16 md:pl-8">
                    <div>
                        <h2 className="text-xl font-bold">Platform Overview</h2>
                        <p className="text-xs font-bold text-text-muted">
                            {new Date().toLocaleDateString("en-US", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            })}
                        </p>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-7xl mx-auto w-full space-y-8">
                    {/* Welcome Banner */}
                    <div className="relative h-40 rounded-3xl overflow-hidden bg-slate-900">
                        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 flex items-center p-8 md:p-12">
                            <div className="text-white">
                                <h3 className="text-2xl md:text-3xl font-black mb-2">
                                    Admin Dashboard
                                </h3>
                                <p className="text-slate-300">
                                    Manage your platform, review requests, and monitor barber
                                    activity.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
                            {[...Array(5)].map((_, i) => (
                                <div
                                    key={i}
                                    className="bg-white p-6 rounded-2xl border border-slate-50 shadow-sm animate-pulse"
                                >
                                    <div className="w-12 h-12 bg-slate-100 rounded-xl mb-4"></div>
                                    <div className="h-4 bg-slate-100 rounded w-1/2 mb-2"></div>
                                    <div className="h-8 bg-slate-100 rounded w-1/3"></div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
                            {statCards.map((card) => (
                                <div
                                    key={card.label}
                                    className="bg-white p-6 rounded-2xl border border-slate-50 shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
                                >
                                    <div
                                        className={`w-12 h-12 ${card.bg} rounded-xl flex items-center justify-center mb-4`}
                                    >
                                        <card.icon className={card.color} size={22} />
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1">
                                        {card.label}
                                    </p>
                                    <h4 className="text-3xl font-black">{card.value}</h4>
                                    <card.icon
                                        className="absolute -right-4 -bottom-4 text-slate-100 group-hover:text-slate-200 transition-all"
                                        size={80}
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Link
                            to="/admin/requests"
                            className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:border-amber-200 transition-all group flex items-center justify-between"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
                                    <Clock className="text-amber-500" size={22} />
                                </div>
                                <div>
                                    <h3 className="font-bold">Pending Requests</h3>
                                    <p className="text-sm text-text-muted">
                                        Review and approve access requests
                                    </p>
                                </div>
                            </div>
                            <ArrowRight
                                className="text-text-muted group-hover:text-amber-500 transition-colors"
                                size={20}
                            />
                        </Link>

                        <Link
                            to="/admin/barbers"
                            className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:border-secondary transition-all group flex items-center justify-between"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                                    <Users className="text-secondary" size={22} />
                                </div>
                                <div>
                                    <h3 className="font-bold">Manage Barbers</h3>
                                    <p className="text-sm text-text-muted">
                                        View subscriptions and manage access
                                    </p>
                                </div>
                            </div>
                            <ArrowRight
                                className="text-text-muted group-hover:text-secondary transition-colors"
                                size={20}
                            />
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboardPage;
