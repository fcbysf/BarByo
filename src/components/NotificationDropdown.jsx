import React, { useState, useEffect, useRef } from 'react';
import { Bell, Calendar, X, Clock, User, Scissors } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';

const NotificationDropdown = ({ shopId }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [hasUnread, setHasUnread] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        if (!shopId) return;

        // Initial fetch of recent activities
        fetchRecentActivities();

        // Subscribe to changes
        const channel = supabase
            .channel('notification-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'appointments',
                    filter: `barber_id=eq.${shopId}`
                },
                (payload) => {
                    handleNewActivity(payload);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [shopId]);

    // Handle clicks outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchRecentActivities = async () => {
        try {
            const { data, error } = await supabase
                .from('appointments')
                .select('*')
                .eq('barber_id', shopId)
                .order('created_at', { ascending: false })
                .limit(10);

            if (error) throw error;
            setNotifications(data.map(apt => formatAptToNotification(apt, 'initial')));
        } catch (err) {
            console.error('Error fetching notifications:', err);
        }
    };

    const handleNewActivity = (payload) => {
        const { eventType, new: newRecord, old: oldRecord } = payload;
        let notification;

        if (eventType === 'INSERT') {
            notification = formatAptToNotification(newRecord, 'new');
        } else if (eventType === 'DELETE' || (eventType === 'UPDATE' && newRecord.status === 'cancelled')) {
            notification = formatAptToNotification(newRecord || oldRecord, 'cancelled');
        } else {
            return; // Ignore other updates for now
        }

        setNotifications(prev => [notification, ...prev].slice(0, 10));
        if (!isOpen) setHasUnread(true);
    };

    const formatAptToNotification = (apt, type) => {
        const timeStr = format(new Date(apt.created_at || new Date()), 'MMM d, h:mm a');
        const guestName = apt.guest_name || 'A customer';

        let title = '';
        let description = '';
        let color = '';

        if (type === 'new' || (type === 'initial' && apt.status === 'confirmed')) {
            title = 'New Booking';
            description = `${guestName} booked ${apt.service}`;
            color = 'bg-green-500';
        } else if (type === 'cancelled' || apt.status === 'cancelled') {
            title = 'Cancelled';
            description = `Appointment for ${apt.service} was cancelled`;
            color = 'bg-red-500';
        } else {
            title = 'Update';
            description = `${guestName} appointment updated`;
            color = 'bg-blue-500';
        }

        return {
            id: apt.id + (apt.status || ''),
            title,
            description,
            time: timeStr,
            color,
            aptTime: `${apt.appointment_date} at ${apt.appointment_time?.slice(0, 5)}`
        };
    };

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
        if (!isOpen) setHasUnread(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={toggleDropdown}
                className="text-text-muted hover:text-text-main relative p-2 rounded-xl hover:bg-slate-100 transition-all"
            >
                <Bell size={20} />
                {hasUnread && (
                    <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                        <h3 className="font-bold text-sm">Recent Activity</h3>
                        <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Last 10</span>
                    </div>

                    <div className="max-h-[400px] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center">
                                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Bell className="text-slate-300" size={20} />
                                </div>
                                <p className="text-xs text-text-muted">No recent notifications</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-50">
                                {notifications.map((n) => (
                                    <div key={n.id} className="p-4 hover:bg-slate-50 transition-all cursor-default group">
                                        <div className="flex gap-3">
                                            <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.color}`}></div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start mb-0.5">
                                                    <p className="text-xs font-bold">{n.title}</p>
                                                    <p className="text-[10px] text-text-muted">{n.time}</p>
                                                </div>
                                                <p className="text-xs text-text-muted mb-2 leading-relaxed">{n.description}</p>
                                                <div className="flex items-center gap-2 text-[10px] font-bold text-secondary bg-secondary/5 px-2 py-1 rounded-md w-fit">
                                                    <Calendar size={10} /> {n.aptTime}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="p-3 border-t border-slate-50 text-center">
                        <button className="text-[10px] font-black uppercase tracking-widest text-secondary hover:text-secondary-hover">
                            View All Activities
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;
