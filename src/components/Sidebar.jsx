import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Scissors, LayoutDashboard, Calendar, Users, Settings, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const Sidebar = () => {
    const { user, profile, signOut } = useAuthStore();
    const location = useLocation();

    const menuItems = [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/schedule', label: 'Calendar', icon: Calendar },
        { path: '/services', label: 'Services', icon: Scissors },
        { path: '/customers', label: 'Customers', icon: Users },
        { path: '/settings', label: 'Settings', icon: Settings },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <aside className="w-64 bg-white border-r border-slate-100 flex flex-col p-6 h-screen sticky top-0">
            <div className="flex items-center gap-3 mb-10">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-sm">
                    <Scissors className="text-text-main" size={20} />
                </div>
                <div>
                    <h1 className="font-bold text-lg leading-tight">BarberPro</h1>
                    <p className="text-[10px] text-text-muted font-black uppercase tracking-widest">Management</p>
                </div>
            </div>

            <nav className="flex-1 space-y-2">
                {menuItems.map((item) => {
                    const ActiveIcon = item.icon;
                    const active = isActive(item.path);
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${active
                                    ? 'bg-primary font-bold text-text-main shadow-sm'
                                    : 'text-text-muted hover:bg-slate-50'
                                }`}
                        >
                            <ActiveIcon size={20} /> {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="pt-6 border-t border-slate-50">
                <div className="flex items-center gap-3">
                    {profile?.avatar_url ? (
                        <img src={profile.avatar_url} className="w-10 h-10 rounded-full" alt={profile.full_name} />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center font-bold text-sm">
                            {profile?.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                        </div>
                    )}
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-bold truncate">{profile?.full_name || user?.email}</p>
                        <p className="text-[10px] text-text-muted uppercase font-black">{profile?.user_type || 'User'}</p>
                    </div>
                    <button onClick={() => signOut()} className="text-text-muted hover:text-text-main"><LogOut size={20} /></button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
