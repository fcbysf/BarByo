/**
 * Request Access Page
 *
 * Shown to authenticated users who don't have a role yet.
 * Users fill out details to request barber access.
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { submitAccessRequest, getMyAccessRequest } from "../services/accessRequestService";
import {
    Scissors,
    User,
    Phone,
    MapPin,
    Store,
    MessageSquare,
    CheckCircle2,
    ArrowRight,
    Clock,
} from "lucide-react";

const RequestAccessPage = () => {
    const navigate = useNavigate();
    const { user, profile } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [checkingExisting, setCheckingExisting] = useState(true);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        shop_name: "",
        phone: "",
        location: "",
        message: "",
    });

    // Check if user already has a request
    useEffect(() => {
        const check = async () => {
            if (!user) return;

            // If user already has a role, redirect
            if (profile?.role === "admin") {
                navigate("/admin", { replace: true });
                return;
            }
            if (profile?.role === "barber") {
                navigate("/dashboard", { replace: true });
                return;
            }

            try {
                const existing = await getMyAccessRequest(user.id);
                if (existing) {
                    if (existing.status === "pending") {
                        navigate("/access-pending", { replace: true });
                        return;
                    }
                    if (existing.status === "approved") {
                        navigate("/dashboard", { replace: true });
                        return;
                    }
                    // If rejected, allow re-submit
                }
            } catch (err) {
                // No existing request — that's fine
            } finally {
                setCheckingExisting(false);
            }
        };

        check();

        // Prefill name from profile
        if (profile?.full_name) {
            setFormData((prev) => ({ ...prev, name: profile.full_name }));
        }
    }, [user, profile, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            if (!formData.name || !formData.shop_name || !formData.phone) {
                throw new Error("Please fill in all required fields.");
            }

            await submitAccessRequest({
                user_id: user.id,
                name: formData.name,
                shop_name: formData.shop_name,
                phone: formData.phone,
                location: formData.location || null,
                message: formData.message || null,
                status: "pending",
            });

            setSubmitted(true);
        } catch (err) {
            setError(err.message || "Failed to submit request. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (checkingExisting) {
        return (
            <div className="flex items-center justify-center h-screen bg-background-light">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-text-muted font-medium">Loading...</p>
                </div>
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background-light p-4">
                <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-10 max-w-lg w-full text-center">
                    <div className="w-20 h-20 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="text-green-500" size={36} />
                    </div>
                    <h2 className="text-2xl font-black mb-3">Request Submitted!</h2>
                    <p className="text-text-muted mb-6">
                        Your access request has been submitted successfully. Our admin team
                        will review your application and get back to you soon.
                    </p>
                    <div className="bg-slate-50 rounded-2xl p-4 mb-6 flex items-center gap-3">
                        <Clock className="text-secondary" size={20} />
                        <span className="text-sm font-medium">
                            Typical response time: 24-48 hours
                        </span>
                    </div>
                    <button
                        onClick={() => navigate("/access-pending")}
                        className="bg-primary hover:bg-primary-hover text-text-main font-bold py-3 px-8 rounded-xl transition-all"
                    >
                        View Status
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-background-light">
            {/* Left branding */}
            <div className="hidden lg:flex w-1/2 relative bg-slate-900 items-center justify-center">
                <div className="absolute inset-0 opacity-60">
                    <img
                        src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=1000"
                        alt="Barbershop"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent"></div>
                </div>
                <div className="relative z-10 p-16 max-w-xl text-white">
                    <div className="flex items-center gap-3 mb-12">
                        <Scissors className="text-primary" size={40} />
                        <span className="text-2xl font-bold">BarberPro</span>
                    </div>
                    <h1 className="text-4xl font-bold leading-tight mb-6">
                        Join the BarberPro Platform
                    </h1>
                    <p className="text-xl text-slate-300 leading-relaxed mb-8">
                        Request access to start managing your barbershop with our powerful
                        tools. Get a 7-day free trial upon approval!
                    </p>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-slate-300">
                            <CheckCircle2 className="text-secondary" size={20} />
                            <span>7-day free trial included</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-300">
                            <CheckCircle2 className="text-secondary" size={20} />
                            <span>Full dashboard access</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-300">
                            <CheckCircle2 className="text-secondary" size={20} />
                            <span>Online booking system</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 md:p-8 overflow-y-auto">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex justify-center items-center gap-2 mb-6 text-text-main">
                        <Scissors className="text-primary" size={32} />
                        <span className="text-2xl font-bold">BarberPro</span>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-3xl font-black mb-3">Request Access</h2>
                        <p className="text-text-muted">
                            Fill out the form below to request access to the platform. We'll
                            review your application and activate your account.
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-bold text-text-main mb-2">
                                Full Name *
                            </label>
                            <div className="relative">
                                <User
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
                                    size={18}
                                />
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="John Doe"
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-text-main mb-2">
                                Barber Shop Name *
                            </label>
                            <div className="relative">
                                <Store
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
                                    size={18}
                                />
                                <input
                                    type="text"
                                    name="shop_name"
                                    value={formData.shop_name}
                                    onChange={handleChange}
                                    placeholder="The Gentleman's Cut"
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-text-main mb-2">
                                Phone Number *
                            </label>
                            <div className="relative">
                                <Phone
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
                                    size={18}
                                />
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="(555) 000-0000"
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-text-main mb-2">
                                Location{" "}
                                <span className="text-text-muted font-normal">(optional)</span>
                            </label>
                            <div className="relative">
                                <MapPin
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
                                    size={18}
                                />
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    placeholder="123 Main St, City"
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-text-main mb-2">
                                Message{" "}
                                <span className="text-text-muted font-normal">(optional)</span>
                            </label>
                            <div className="relative">
                                <MessageSquare
                                    className="absolute left-4 top-3 text-text-muted"
                                    size={18}
                                />
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    placeholder="Tell us about your barbershop..."
                                    rows={3}
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-primary hover:bg-primary-hover text-text-main font-black rounded-xl shadow-lg shadow-primary/30 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? "Submitting..." : "Submit Request"}
                            {!loading && <ArrowRight size={18} />}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-xs text-text-muted">
                        Already approved?{" "}
                        <button
                            onClick={() => navigate("/login")}
                            className="text-secondary font-bold hover:underline"
                        >
                            Sign in here
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RequestAccessPage;
