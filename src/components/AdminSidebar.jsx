/**
 * Admin Sidebar Component
 *
 * Navigation sidebar for admin panel pages.
 * Uses the same design system as the barber sidebar.
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Scissors, LayoutDashboard, UserCheck, Users, Store, LogOut, Menu, X, Shield } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const AdminSidebar = () => {
    const { user, profile, signOut } = useAuthStore();
    const location = useLocation();
    const [isOpen, setIsOpen] = React.useState(false);

    const menuItems = [
        { path: '/admin', label: 'Overview', icon: LayoutDashboard },
        { path: '/admin/requests', label: 'Requests', icon: UserCheck },
        { path: '/admin/barbers', label: 'Barbers', icon: Users },
        { path: '/admin/shops', label: 'Shops', icon: Store },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="md:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded-xl shadow-md text-text-muted hover:text-primary transition-colors"
            >
                <Menu size={24} />
            </button>

            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
        fixed md:sticky top-0 h-screen bg-white border-r border-slate-100 flex flex-col p-6 z-50 transition-transform duration-300 ease-in-out
        w-72 md:w-64
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-sm">
                            <Shield className="text-primary" size={20} />
                        </div>
                        <div>
                            <h1 className="font-bold text-lg leading-tight">BarberPro</h1>
                            <p className="text-[10px] text-text-muted font-black uppercase tracking-widest">Admin Panel</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="md:hidden text-text-muted hover:text-red-500"
                    >
                        <X size={24} />
                    </button>
                </div>

                <nav className="flex-1 space-y-2">
                    {menuItems.map((item) => {
                        const ActiveIcon = item.icon;
                        const active = isActive(item.path);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${active
                                    ? 'bg-slate-900 font-bold text-white shadow-sm'
                                    : 'text-text-muted hover:bg-slate-50'
                                    }`}
                            >
                                <ActiveIcon size={20} /> {item.label}
                            </Link>
                        );
                    })}

                    {/* Mobile Logout */}
                    <button
                        onClick={() => {
                            signOut();
                            setIsOpen(false);
                        }}
                        className="md:hidden flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-red-500 hover:bg-red-50 w-full mt-4 border border-red-100"
                    >
                        <LogOut size={20} /> Logout
                    </button>
                </nav>

                <div className="pt-6 border-t border-slate-50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center font-bold text-sm text-primary">
                            {profile?.full_name?.split(' ').map(n => n[0]).join('') || 'A'}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-bold truncate">{profile?.full_name || user?.email}</p>
                            <p className="text-[10px] text-text-muted uppercase font-black">Admin</p>
                        </div>
                        <button onClick={() => signOut()} className="text-text-muted hover:text-text-main"><LogOut size={20} /></button>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default AdminSidebar;
