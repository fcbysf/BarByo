/**
 * Access Pending Page
 *
 * Shown when a user has submitted a request and is waiting for admin approval.
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { getMyAccessRequest } from "../services/accessRequestService";
import { Scissors, Clock, CheckCircle2, XCircle, LogOut, RefreshCw } from "lucide-react";

const AccessPendingPage = () => {
    const navigate = useNavigate();
    const { user, profile, signOut, refreshProfile } = useAuthStore();
    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // If user already has a role, redirect
        if (profile?.role === "admin") {
            navigate("/admin", { replace: true });
            return;
        }
        if (profile?.role === "barber") {
            navigate("/dashboard", { replace: true });
            return;
        }

        fetchRequest();
    }, [user, profile, navigate]);

    const fetchRequest = async () => {
        if (!user) return;

        try {
            setLoading(true);
            const data = await getMyAccessRequest(user.id);
            setRequest(data);

            if (data?.status === "approved") {
                if (profile?.role !== "barber") {
                    await refreshProfile();
                    return;
                }
                navigate("/dashboard", { replace: true });
                return;
            }

            if (!data) {
                // No request found, redirect to request access
                navigate("/request-access", { replace: true });
            }
        } catch (err) {
            console.error("Error fetching request:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        await refreshProfile();
        await fetchRequest();
    };

    const handleLogout = async () => {
        await signOut();
        navigate("/login");
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-background-light">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-text-muted font-medium">Loading...</p>
                </div>
            </div>
        );
    }

    const statusConfig = {
        pending: {
            icon: Clock,
            color: "text-amber-500",
            bg: "bg-amber-50",
            badge: "bg-amber-100 text-amber-700",
            title: "Your request is being reviewed",
            message:
                "Thank you for your interest in BarByoo! Our admin team is reviewing your application. You'll receive access once approved.",
        },
        rejected: {
            icon: XCircle,
            color: "text-red-500",
            bg: "bg-red-50",
            badge: "bg-red-100 text-red-700",
            title: "Request Not Approved",
            message:
                "Unfortunately, your access request was not approved. You can submit a new request with updated information.",
        },
        approved: {
            icon: CheckCircle2,
            color: "text-green-500",
            bg: "bg-green-50",
            badge: "bg-green-100 text-green-700",
            title: "You're Approved!",
            message: "Your access has been approved. Redirecting to your dashboard...",
        },
    };

    const config = statusConfig[request?.status] || statusConfig.pending;
    const StatusIcon = config.icon;

    return (
        <div className="flex items-center justify-center min-h-screen bg-background-light p-4">
            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-10 max-w-lg w-full text-center">
                {/* Logo */}
                <div className="flex justify-center items-center gap-2 mb-8">
                    <Scissors className="text-secondary" size={28} />
                    <span className="text-xl font-bold">BarByoo</span>
                </div>

                {/* Status Icon */}
                <div
                    className={`w-20 h-20 ${config.bg} rounded-2xl flex items-center justify-center mx-auto mb-6`}
                >
                    <StatusIcon className={config.color} size={36} />
                </div>

                {/* Status Badge */}
                <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-4 ${config.badge}`}
                >
                    <span
                        className={`w-1.5 h-1.5 rounded-full ${request?.status === "pending"
                            ? "bg-amber-500 animate-pulse"
                            : request?.status === "rejected"
                                ? "bg-red-500"
                                : "bg-green-500"
                            }`}
                    ></span>
                    {request?.status?.charAt(0).toUpperCase() + request?.status?.slice(1)}
                </span>

                <h2 className="text-2xl font-black mb-3">{config.title}</h2>
                <p className="text-text-muted mb-8">{config.message}</p>

                {/* Request Details */}
                {request && (
                    <div className="bg-slate-50 rounded-2xl p-4 mb-6 text-left space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-text-muted">Shop Name</span>
                            <span className="font-bold">{request.shop_name}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-text-muted">Submitted</span>
                            <span className="font-bold">
                                {new Date(request.created_at).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="space-y-3">
                    <button
                        onClick={handleRefresh}
                        className="w-full py-3 bg-primary hover:bg-primary-hover text-text-main font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                        <RefreshCw size={16} />
                        Check for Updates
                    </button>

                    {request?.status === "rejected" && (
                        <button
                            onClick={() => navigate("/request-access")}
                            className="w-full py-3 bg-secondary hover:bg-secondary-dark text-white font-bold rounded-xl transition-all"
                        >
                            Submit New Request
                        </button>
                    )}

                    <button
                        onClick={handleLogout}
                        className="w-full py-3 border border-slate-200 text-text-muted font-bold rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                    >
                        <LogOut size={16} />
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AccessPendingPage;
