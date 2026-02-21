
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Scissors } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const Navbar = () => {
    const { user } = useAuthStore();
    const location = useLocation();
    const isHomePage = location.pathname === '/';

    const NavLink = ({ href, children }) => {
        const fullHref = isHomePage ? href : `/${href}`;
        return (
            <a
                href={fullHref}
                className="text-sm font-medium hover:text-secondary transition-colors"
            >
                {children}
            </a>
        );
    };

    return (
        <div className="bg-white/90 backdrop-blur-md border-b border-slate-100 sticky top-0 z-[100] w-full">
            <header className="flex items-center justify-between px-4 md:px-8 py-4 max-w-7xl mx-auto w-full">
                <Link to="/" className="flex items-center gap-2">
                    <Scissors className="text-secondary" size={28} />
                    <span className="text-xl font-bold tracking-tight">BarByoo</span>
                </Link>

                <nav className="hidden md:flex gap-8">
                    <NavLink href="#features">Features</NavLink>
                    <NavLink href="#pricing">Pricing</NavLink>
                </nav>

                <div className="flex items-center gap-4">
                    {user ? (
                        <>
                            <Link to="/dashboard" className="text-sm font-medium hover:text-secondary transition-colors hidden sm:block">Dashboard</Link>
                            <Link to="/client" className="bg-primary hover:bg-primary-hover text-text-main text-sm font-bold py-2.5 px-5 rounded-xl transition-all shadow-sm">
                                Book a Cut
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="text-sm font-medium">Login</Link>
                            <Link to="/login" className="bg-primary hover:bg-primary-hover text-text-main text-xs md:text-sm font-bold py-2.5 md:px-5 px-3 rounded-xl transition-all shadow-sm">
                                Request Access
                            </Link>
                        </>
                    )}
                </div>
            </header>
        </div>
    );
};

export default Navbar;
