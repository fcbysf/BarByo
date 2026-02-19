/**
 * Admin Barbers Management Page
 *
 * List all barbers with subscription management, activation, and deletion.
 */

import { useState, useEffect } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import {
    getAllBarbersAdmin,
    toggleBarberActive,
    updateBarberSubscription,
    deleteBarber,
} from "../../services/adminService";
import {
    Users,
    Phone,
    Store,
    Calendar,
    ToggleLeft,
    ToggleRight,
    Trash2,
    RefreshCw,
    Plus,
    Clock,
    AlertTriangle,
} from "lucide-react";

const AdminBarbersPage = () => {
    const [barbers, setBarbers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [extendModal, setExtendModal] = useState(null);
    const [extendDays, setExtendDays] = useState(30);

    const fetchBarbers = async () => {
        try {
            setLoading(true);
            const data = await getAllBarbersAdmin();
            setBarbers(data);
        } catch (err) {
            setError("Failed to fetch barbers: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBarbers();
    }, []);

    const handleToggleActive = async (barber) => {
        setActionLoading(barber.id);
        try {
            await toggleBarberActive(barber.id, !barber.is_active);
            setSuccess(
                `${barber.name} is now ${barber.is_active ? "deactivated" : "activated"}.`
            );
            fetchBarbers();
        } catch (err) {
            setError("Failed to toggle: " + err.message);
        } finally {
            setActionLoading(null);
        }
    };

    const handleExtendSubscription = async () => {
        if (!extendModal) return;
        setActionLoading(extendModal.id);

        try {
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + extendDays);

            await updateBarberSubscription(extendModal.id, {
                subscription_status: "active",
                subscription_end_date: endDate.toISOString(),
            });
            setSuccess(
                `Subscription extended for ${extendModal.name} by ${extendDays} days.`
            );
            setExtendModal(null);
            fetchBarbers();
        } catch (err) {
            setError("Failed to extend: " + err.message);
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (barber) => {
        if (
            !window.confirm(
                `Are you sure you want to delete ${barber.name}? This cannot be undone.`
            )
        )
            return;

        setActionLoading(barber.id);
        try {
            await deleteBarber(barber.id);
            setSuccess(`${barber.name} has been deleted.`);
            fetchBarbers();
        } catch (err) {
            setError("Failed to delete: " + err.message);
        } finally {
            setActionLoading(null);
        }
    };

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
                        <h2 className="text-xl font-bold">Barbers Management</h2>
                        <p className="text-xs font-bold text-text-muted">
                            {barbers.length} barber{barbers.length !== 1 ? "s" : ""}{" "}
                            registered
                        </p>
                    </div>
                    <button
                        onClick={fetchBarbers}
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
                    {success && (
                        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
                            {success}
                        </div>
                    )}

                    {loading ? (
                        <div className="space-y-4">
                            {[...Array(3)].map((_, i) => (
                                <div
                                    key={i}
                                    className="bg-white rounded-2xl p-6 border border-slate-50 animate-pulse"
                                >
                                    <div className="h-4 bg-slate-100 rounded w-1/3 mb-4"></div>
                                    <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                                </div>
                            ))}
                        </div>
                    ) : barbers.length === 0 ? (
                        <div className="bg-white rounded-2xl p-12 border border-slate-50 text-center">
                            <Users className="text-slate-200 mx-auto mb-4" size={64} />
                            <p className="text-text-muted text-lg">
                                No barbers registered yet.
                            </p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl border border-slate-50 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-text-muted">
                                            <th className="px-6 py-4">Barber</th>
                                            <th className="px-6 py-4">Shop Name</th>
                                            <th className="px-6 py-4">Phone</th>
                                            <th className="px-6 py-4">Subscription</th>
                                            <th className="px-6 py-4">Trial Ends</th>
                                            <th className="px-6 py-4">Sub. Ends</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {barbers.map((barber) => (
                                            <tr
                                                key={barber.id}
                                                className="hover:bg-slate-50/30 transition-all"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center text-xs font-bold">
                                                            {barber.owner_name
                                                                ?.split(" ")
                                                                .map((n) => n[0])
                                                                .join("")
                                                                .slice(0, 2) || "?"}
                                                        </div>
                                                        <span className="font-medium text-sm">
                                                            {barber.owner_name || "—"}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm">{barber.name}</td>
                                                <td className="px-6 py-4 text-sm text-text-muted">
                                                    {barber.phone || "—"}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {subscriptionBadge(barber.subscription_status)}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-text-muted">
                                                    {barber.trial_end_date
                                                        ? new Date(
                                                            barber.trial_end_date
                                                        ).toLocaleDateString()
                                                        : "—"}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-text-muted">
                                                    {barber.subscription_end_date
                                                        ? new Date(
                                                            barber.subscription_end_date
                                                        ).toLocaleDateString()
                                                        : "—"}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${barber.is_active
                                                                ? "bg-green-100 text-green-700"
                                                                : "bg-slate-100 text-slate-600"
                                                            }`}
                                                    >
                                                        <span
                                                            className={`w-1.5 h-1.5 rounded-full ${barber.is_active ? "bg-green-500" : "bg-slate-400"}`}
                                                        ></span>
                                                        {barber.is_active ? "Active" : "Inactive"}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => handleToggleActive(barber)}
                                                            disabled={actionLoading === barber.id}
                                                            className="p-2 rounded-lg hover:bg-slate-100 text-text-muted hover:text-text-main transition-all"
                                                            title={
                                                                barber.is_active ? "Deactivate" : "Activate"
                                                            }
                                                        >
                                                            {barber.is_active ? (
                                                                <ToggleRight
                                                                    size={18}
                                                                    className="text-green-500"
                                                                />
                                                            ) : (
                                                                <ToggleLeft size={18} />
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={() => setExtendModal(barber)}
                                                            className="p-2 rounded-lg hover:bg-slate-100 text-text-muted hover:text-blue-500 transition-all"
                                                            title="Extend subscription"
                                                        >
                                                            <Plus size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(barber)}
                                                            disabled={actionLoading === barber.id}
                                                            className="p-2 rounded-lg hover:bg-red-50 text-text-muted hover:text-red-500 transition-all"
                                                            title="Delete barber"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Extend Subscription Modal */}
                    {extendModal && (
                        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
                                <h3 className="text-xl font-bold mb-2">
                                    Extend Subscription
                                </h3>
                                <p className="text-text-muted mb-6 text-sm">
                                    Extend subscription for{" "}
                                    <strong>{extendModal.name}</strong>
                                </p>

                                <div className="space-y-4 mb-6">
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => setExtendDays(30)}
                                            className={`p-4 rounded-xl border text-center transition-all ${extendDays === 30
                                                    ? "border-secondary bg-secondary/5"
                                                    : "border-slate-200 hover:border-slate-300"
                                                }`}
                                        >
                                            <p className="text-lg font-black">$10</p>
                                            <p className="text-xs text-text-muted">1 Month</p>
                                        </button>
                                        <button
                                            onClick={() => setExtendDays(180)}
                                            className={`p-4 rounded-xl border text-center transition-all ${extendDays === 180
                                                    ? "border-secondary bg-secondary/5"
                                                    : "border-slate-200 hover:border-slate-300"
                                                }`}
                                        >
                                            <p className="text-lg font-black">$40</p>
                                            <p className="text-xs text-text-muted">6 Months</p>
                                        </button>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setExtendModal(null)}
                                        className="flex-1 py-3 border border-slate-200 text-text-muted font-bold rounded-xl hover:bg-slate-50 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleExtendSubscription}
                                        disabled={actionLoading === extendModal.id}
                                        className="flex-1 py-3 bg-secondary hover:bg-secondary-dark text-white font-bold rounded-xl transition-all disabled:opacity-50"
                                    >
                                        {actionLoading === extendModal.id
                                            ? "Extending..."
                                            : `Extend ${extendDays} days`}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AdminBarbersPage;
