/**
 * Admin Requests Management Page
 *
 * View, approve, and reject access requests.
 */

import { useState, useEffect } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import {
    getAccessRequests,
    approveRequest,
    rejectRequest,
} from "../../services/adminService";
import {
    UserCheck,
    Check,
    X,
    Clock,
    CheckCircle2,
    XCircle,
    RefreshCw,
    Mail,
    Phone,
    MapPin,
    Store,
    Filter,
} from "lucide-react";

const AdminRequestsPage = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [filter, setFilter] = useState("pending");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const data = await getAccessRequests(filter === "all" ? null : filter);
            setRequests(data);
        } catch (err) {
            setError("Failed to fetch requests: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, [filter]);

    const handleApprove = async (request) => {
        setActionLoading(request.id);
        setError("");
        setSuccess("");

        try {
            await approveRequest(request);
            setSuccess(`Approved ${request.name}'s request. Barber profile and 7-day trial activated.`);
            fetchRequests();
        } catch (err) {
            setError("Failed to approve: " + err.message);
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (requestId) => {
        setActionLoading(requestId);
        setError("");
        setSuccess("");

        try {
            await rejectRequest(requestId);
            setSuccess("Request rejected.");
            fetchRequests();
        } catch (err) {
            setError("Failed to reject: " + err.message);
        } finally {
            setActionLoading(null);
        }
    };

    const statusBadge = (status) => {
        const config = {
            pending: {
                bg: "bg-amber-100 text-amber-700",
                dot: "bg-amber-500 animate-pulse",
            },
            approved: { bg: "bg-green-100 text-green-700", dot: "bg-green-500" },
            rejected: { bg: "bg-red-100 text-red-700", dot: "bg-red-500" },
        };
        const c = config[status] || config.pending;
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
                        <h2 className="text-xl font-bold">Access Requests</h2>
                        <p className="text-xs font-bold text-text-muted">
                            Review and manage access requests
                        </p>
                    </div>
                    <button
                        onClick={fetchRequests}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-text-muted hover:text-text-main border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
                    >
                        <RefreshCw size={16} />
                        Refresh
                    </button>
                </header>

                <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-7xl mx-auto w-full space-y-6">
                    {/* Alerts */}
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
                            {success}
                        </div>
                    )}

                    {/* Filters */}
                    <div className="flex gap-2">
                        {["pending", "approved", "rejected", "all"].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filter === f
                                        ? "bg-slate-900 text-white"
                                        : "bg-white text-text-muted border border-slate-200 hover:bg-slate-50"
                                    }`}
                            >
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* Requests */}
                    {loading ? (
                        <div className="space-y-4">
                            {[...Array(3)].map((_, i) => (
                                <div
                                    key={i}
                                    className="bg-white rounded-2xl p-6 border border-slate-50 animate-pulse"
                                >
                                    <div className="h-4 bg-slate-100 rounded w-1/3 mb-4"></div>
                                    <div className="h-3 bg-slate-100 rounded w-1/2 mb-2"></div>
                                    <div className="h-3 bg-slate-100 rounded w-1/4"></div>
                                </div>
                            ))}
                        </div>
                    ) : requests.length === 0 ? (
                        <div className="bg-white rounded-2xl p-12 border border-slate-50 text-center">
                            <UserCheck
                                className="text-slate-200 mx-auto mb-4"
                                size={64}
                            />
                            <p className="text-text-muted text-lg">
                                No {filter !== "all" ? filter : ""} requests found.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {requests.map((req) => (
                                <div
                                    key={req.id}
                                    className="bg-white rounded-2xl p-6 border border-slate-50 shadow-sm hover:shadow-md transition-all"
                                >
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center font-bold text-sm">
                                                {req.name
                                                    ?.split(" ")
                                                    .map((n) => n[0])
                                                    .join("")
                                                    .slice(0, 2) || "?"}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg">{req.name}</h3>
                                                <p className="text-sm text-text-muted">
                                                    Submitted{" "}
                                                    {new Date(req.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        {statusBadge(req.status)}
                                    </div>

                                    {/* Request Details */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                                        <div className="flex items-center gap-2 text-sm text-text-muted">
                                            <Store size={14} />
                                            <span>{req.shop_name}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-text-muted">
                                            <Phone size={14} />
                                            <span>{req.phone}</span>
                                        </div>
                                        {req.location && (
                                            <div className="flex items-center gap-2 text-sm text-text-muted">
                                                <MapPin size={14} />
                                                <span>{req.location}</span>
                                            </div>
                                        )}
                                    </div>

                                    {req.message && (
                                        <div className="bg-slate-50 rounded-xl p-3 mb-4">
                                            <p className="text-sm text-text-muted italic">
                                                "{req.message}"
                                            </p>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    {req.status === "pending" && (
                                        <div className="flex gap-3 pt-2 border-t border-slate-50">
                                            <button
                                                onClick={() => handleApprove(req)}
                                                disabled={actionLoading === req.id}
                                                className="flex items-center gap-2 px-5 py-2.5 bg-secondary hover:bg-secondary-dark text-white font-bold text-sm rounded-xl transition-all disabled:opacity-50"
                                            >
                                                <Check size={16} />
                                                {actionLoading === req.id
                                                    ? "Approving..."
                                                    : "Approve & Activate Trial"}
                                            </button>
                                            <button
                                                onClick={() => handleReject(req.id)}
                                                disabled={actionLoading === req.id}
                                                className="flex items-center gap-2 px-5 py-2.5 border border-red-200 text-red-600 font-bold text-sm rounded-xl hover:bg-red-50 transition-all disabled:opacity-50"
                                            >
                                                <X size={16} />
                                                Reject
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AdminRequestsPage;
