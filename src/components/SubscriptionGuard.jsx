/**
 * Subscription Guard Component
 *
 * Wraps barber routes to check if trial/subscription is active.
 * If expired, shows a locked screen with contact message.
 */

import { useState, useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { supabase } from "../lib/supabase";
import { Lock, Mail, Clock, Instagram, Twitter } from "lucide-react";

const SubscriptionGuard = ({ children }) => {
    const { user, profile } = useAuthStore();
    const [barberShop, setBarberShop] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAllowed, setIsAllowed] = useState(false);

    useEffect(() => {
        const checkSubscription = async () => {
            if (!user || profile?.role !== "barber") {
                setLoading(false);
                setIsAllowed(false);
                return;
            }

            try {
                const { data: shop } = await supabase
                    .from("barbers")
                    .select("*")
                    .eq("user_id", user.id)
                    .single();

                setBarberShop(shop);

                if (!shop) {
                    // No shop yet — allow through (onboarding might still be needed)
                    setIsAllowed(true);
                    setLoading(false);
                    return;
                }

                const now = new Date();
                const status = shop.subscription_status;

                if (status === "active") {
                    // Active subscription — check end date
                    if (shop.subscription_end_date && new Date(shop.subscription_end_date) < now) {
                        setIsAllowed(false);
                    } else {
                        setIsAllowed(true);
                    }
                } else if (status === "trial") {
                    // Trial — check end date
                    if (shop.trial_end_date && new Date(shop.trial_end_date) < now) {
                        setIsAllowed(false);
                    } else {
                        setIsAllowed(true);
                    }
                } else {
                    // Inactive
                    setIsAllowed(false);
                }
            } catch (err) {
                console.error("Subscription check error:", err);
                setIsAllowed(true); // On error, allow through rather than blocking
            } finally {
                setLoading(false);
            }
        };

        checkSubscription();
    }, [user, profile]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-background-light">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-text-muted font-medium">Checking subscription...</p>
                </div>
            </div>
        );
    }

    if (!isAllowed) {
        // Locked screen
        const trialEnded = barberShop?.subscription_status === "trial" && barberShop?.trial_end_date;
        return (
            <div className="flex items-center justify-center h-screen bg-background-light p-4">
                <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-10 max-w-lg w-full text-center">
                    <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Lock className="text-red-500" size={36} />
                    </div>
                    <h2 className="text-2xl font-black mb-3">
                        {trialEnded ? "Your Trial Has Ended" : "Subscription Inactive"}
                    </h2>
                    <p className="text-text-muted mb-8">
                        {trialEnded
                            ? "Your 7-day free trial has expired. Please contact the admin to activate your subscription and continue using BarberPro."
                            : "Your subscription is currently inactive. Please contact the admin to reactivate your account."}
                    </p>

                    <div className="bg-slate-50 rounded-2xl p-6 mb-6">
                        <h3 className="font-bold text-sm mb-4">Pricing Plans</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white rounded-xl p-4 border border-slate-200">
                                <p className="text-2xl font-black">$10</p>
                                <p className="text-xs text-text-muted font-bold">per month</p>
                            </div>
                            <div className="bg-white rounded-xl p-4 border-2 border-secondary">
                                <p className="text-2xl font-black">$40</p>
                                <p className="text-xs text-text-muted font-bold">per 6 months</p>
                                <span className="text-[10px] font-bold text-secondary uppercase">Save 33%</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-4 mt-8">
                        <p className="text-sm font-bold text-text-muted">Contact admin to activate:</p>
                        <div className="flex items-center gap-4">
                            <a href="mailto:support@barbyoo.com" className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-secondary hover:text-white transition-all" title="Email Support">
                                <Mail size={20} />
                            </a>
                            <a href="https://instagram.com/barbyoo" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-pink-600 hover:text-white transition-all" title="Instagram">
                                <Instagram size={20} />
                            </a>
                            <a href="https://twitter.com/barbyoo" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-black hover:text-white transition-all" title="X (Twitter)">
                                <Twitter size={20} />
                            </a>
                        </div>
                    </div>

                    {barberShop?.trial_end_date && (
                        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-text-muted">
                            <Clock size={14} />
                            <span>
                                Trial ended: {new Date(barberShop.trial_end_date).toLocaleDateString()}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return children;
};

export default SubscriptionGuard;
