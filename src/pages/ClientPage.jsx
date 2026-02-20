
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllBarbers, searchBarbers } from '../services/barberService';
import { Scissors, Search, MapPin, Star, Loader2, ArrowRight, Filter } from 'lucide-react';
import { useFadeIn, useStagger } from '../hooks/useAnimations';
import logo from '../assets/logo.png';

const ClientPage = () => {
    const navigate = useNavigate();
    const [barbers, setBarbers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    // Animation Refs
    const mainRef = React.useRef(null);
    const gridRef = React.useRef(null);

    useFadeIn(mainRef, [loading], { y: 20 });
    useStagger(gridRef, '.gsap-card', [barbers.length], { y: 30, stagger: 0.1 });

    useEffect(() => {
        fetchBarbers();
    }, []);

    const fetchBarbers = async () => {
        try {
            setLoading(true);
            const data = await getAllBarbers();
            setBarbers(data);
        } catch (error) {
            console.error('Error fetching barbers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (query.length > 2) {
            setIsSearching(true);
            try {
                const data = await searchBarbers(query);
                setBarbers(data);
            } catch (error) {
                console.error('Error searching barbers:', error);
            } finally {
                setIsSearching(false);
            }
        } else if (query.length === 0) {
            fetchBarbers();
        }
    };

    return (
        <div className="bg-background-light min-h-screen">
            {/* Header */}
            <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-secondary/10 sticky top-0 z-50">
                <div className="flex items-center gap-2 cursor-pointer group" onClick={() => navigate('/')}>
                    <img src={logo} alt="BarByoo Logo" className="w-9 h-9 object-contain" />
                    <span className="text-xl font-bold tracking-tight group-hover:text-secondary transition-colors">BarByoo</span>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/login')}
                        className="text-sm font-medium hover:text-secondary transition-colors"
                    >
                        I am a Barber
                    </button>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 py-12" ref={mainRef}>
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-black text-text-main mb-4">Find Your Perfect Cut</h1>
                    <p className="text-lg text-text-muted max-w-2xl mx-auto">
                        Browse top-rated barbers in your area and book your next appointment in seconds.
                    </p>
                </div>

                {/* Search Bar */}
                <div className="max-w-2xl mx-auto mb-16 relative">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-secondary transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Search by shop name, barber, or style..."
                            value={searchQuery}
                            onChange={handleSearch}
                            className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-100 rounded-2xl shadow-sm focus:border-secondary focus:ring-4 focus:ring-secondary/10 outline-none transition-all text-lg"
                        />
                        {isSearching && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                <Loader2 className="animate-spin text-secondary" size={20} />
                            </div>
                        )}
                    </div>
                    <div className="flex gap-2 mt-4 overflow-x-auto pb-2 hide-scrollbar">
                        {['Fades', 'Beard Trim', 'Haircut', 'Shave', 'Buzz Cut'].map((tag) => (
                            <button
                                key={tag}
                                onClick={() => handleSearch({ target: { value: tag } })}
                                className="px-4 py-1.5 bg-white border border-slate-200 rounded-full text-xs font-bold text-text-muted hover:border-secondary hover:text-secondary transition-all whitespace-nowrap"
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Barbers Grid */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="animate-spin text-secondary mb-4" size={48} />
                        <p className="text-text-muted font-medium">Finding the best barbers for you...</p>
                    </div>
                ) : barbers.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                            <Search size={40} />
                        </div>
                        <h3 className="text-2xl font-bold text-text-main mb-2">No barbers found</h3>
                        <p className="text-text-muted">Try adjusting your search or browse all barbers.</p>
                        <button
                            onClick={() => { setSearchQuery(''); fetchBarbers(); }}
                            className="mt-6 text-secondary font-bold hover:underline"
                        >
                            Clear search
                        </button>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8" ref={gridRef}>
                        {barbers.map((barber) => (
                            <div
                                key={barber.id}
                                onClick={() => navigate(`/book/${barber.id}`)}
                                className="gsap-card bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
                            >
                                <div className="relative h-48 rounded-t-3xl overflow-hidden">
                                    <img
                                        src={barber.image_url || "https://images.unsplash.com/photo-1503951914875-452162b7f304?auto=format&fit=crop&q=80&w=600"}
                                        alt={barber.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-sm">
                                        <Star className="text-secondary" size={14} fill="currentColor" />
                                        <span className="text-sm font-black">{barber.rating || 'New'}</span>
                                    </div>
                                    {barber.is_open && (
                                        <div className="absolute bottom-4 left-4 bg-green-500 text-white text-[10px] font-black px-3 py-1 rounded-full border-2 border-white uppercase tracking-widest">
                                            Open Now
                                        </div>
                                    )}
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-black mb-1 group-hover:text-secondary transition-colors">{barber.name}</h3>
                                    <div className="flex items-center gap-1 text-text-muted text-sm mb-4">
                                        <MapPin size={14} />
                                        <span className="truncate">{barber.address || 'Location on map'}</span>
                                    </div>

                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {(barber.services || ['Haircut', 'Fade', 'Beard']).slice(0, 3).map((s, i) => (
                                            <span key={i} className="px-2.5 py-1 bg-slate-50 text-[10px] font-bold text-text-muted rounded-md uppercase tracking-wider">
                                                {typeof s === 'string' ? s : s.name}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                                        <div>
                                            <span className="block text-[10px] font-black text-text-muted uppercase tracking-widest">Starting from</span>
                                            <span className="text-lg font-black text-secondary">$25</span>
                                        </div>
                                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center group-hover:bg-primary-hover transition-colors">
                                            <ArrowRight size={20} className="text-text-main" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="py-12 border-t border-slate-100 bg-white mt-20">
                <div className="max-w-6xl mx-auto px-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-6">
                        <img src={logo} alt="BarByoo Logo" className="w-7 h-7 object-contain" />
                        <span className="text-lg font-bold tracking-tight">BarByoo</span>
                    </div>
                    <p className="text-text-muted text-sm">© 2023 BarByoo Inc. The easiest way to book your next cut.</p>
                </div>
            </footer>
        </div>
    );
};

export default ClientPage;
