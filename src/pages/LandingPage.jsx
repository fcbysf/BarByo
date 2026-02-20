
import { ArrowUp, Scissors, Play, X, CheckCircle2, Check, MinusCircle, Smartphone, MessageSquare, CalendarCheck, Zap, Star, ShieldCheck, Twitter, Instagram } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useFadeIn, useStagger } from '../hooks/useAnimations';
import logo from '../assets/logo.png';

const LandingPage = () => {
  const { user } = useAuthStore();

  // Animation Refs
  const heroRef = React.useRef(null);
  const stepsRef = React.useRef(null);
  const featuresRef = React.useRef(null);
  const pricingRef = React.useRef(null);

  useFadeIn(heroRef, [], { y: 30, duration: 0.8 });
  useStagger(stepsRef, '.gsap-step', [], { y: 40, stagger: 0.15 });
  useStagger(featuresRef, '.gsap-feature', [], { y: 40, stagger: 0.15 });
  useStagger(pricingRef, '.gsap-plan', [], { y: 40, stagger: 0.2 });

  const plans = [
    {
      name: "7-Day Free Trial",
      price: "Free",
      description: "Try all features free for 7 days after admin approval.",
      features: ["Full Dashboard Access", "Online Booking Page", "Calendar Management", "Client Management"],
      cta: "Request Access"
    },
    {
      name: "Monthly",
      price: "$10",
      description: "Full access, billed monthly. Cancel anytime.",
      features: ["Everything in Trial", "Unlimited Bookings", "Client CRM & Notes", "Priority Support"],
      cta: "Request Access",
      popular: true
    },
    {
      name: "6 Months",
      price: "$40",
      description: "Save 33% with our best value plan.",
      features: ["Everything in Monthly", "6-Month Lock-in Savings", "Early Feature Access", "Dedicated Support"],
      cta: "Request Access",
      savings: "Save 33%"
    }
  ];

  return (
    <div className="bg-background-light min-h-screen">
      {/* Header */}
      <header className="flex items-center justify-between px-4 md:px-28 py-4 bg-white border-b border-secondary/10 sticky top-0 z-50">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 overflow-hidden">
            <img src={logo} alt="BarByoo Logo" className="w-full h-full object-contain" />
          </div>
          <span className="text-xl font-bold tracking-tight group-hover:text-secondary transition-colors">BarByoo</span>
        </Link>
        <nav className="hidden md:flex gap-8">
          <a href="#features" className="text-sm font-medium hover:text-secondary transition-colors">Features</a>
          <a href="#pricing" className="text-sm font-medium hover:text-secondary transition-colors">Pricing</a>
        </nav>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link to="/dashboard" className="text-sm font-medium hover:text-secondary transition-colors">Dashboard</Link>
              <Link to="/client" className="bg-primary hover:bg-primary-hover text-text-main text-sm font-bold py-2.5 px-5 rounded-xl transition-all shadow-sm">
                Book a Cut
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium">Login</Link>
              <Link to="/login" className="bg-primary hover:bg-primary-hover text-text-main text-sm font-bold py-2.5 px-5 rounded-xl transition-all shadow-sm">
                Request Access
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="pt-20 pb-32 text-center px-4 max-w-5xl mx-auto" ref={heroRef}>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-bold uppercase tracking-wider mb-8">
          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
          NEW: AUTOMATED DEPOSITS
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-text-main mb-6 leading-tight">
          Let Clients Book Your <span className="text-secondary">Chair 24/7</span>
        </h1>
        <p className="text-lg md:text-xl text-text-muted mb-10 max-w-2xl mx-auto">
          Stop playing phone tag. Automate your appointments, reduce no-shows by 80%, and get paid while you sleep. No credit card required.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {user ? (
            <>
              <Link to="/dashboard" className="bg-primary hover:bg-primary-hover text-text-main text-lg font-bold py-4 px-10 rounded-xl shadow-lg shadow-primary/30 transition-all flex items-center gap-2">
                Go to Dashboard
                <ArrowUp size={20} />
              </Link>
              <Link to="/client" className="bg-white border border-slate-200 text-text-main text-lg font-bold py-4 px-10 rounded-xl hover:bg-slate-50 transition-all flex items-center gap-2">
                <Scissors className="text-secondary" size={20} />
                Book a Cut
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="bg-primary hover:bg-primary-hover text-text-main text-lg font-bold py-4 px-12 rounded-2xl shadow-xl shadow-primary/30 transition-all flex flex-col items-center group">
                <span className="text-xl font-black">I am a Barber</span>
                <span className="text-xs opacity-70 group-hover:opacity-100 transition-opacity">Request Access & Try Free</span>
              </Link>
              <Link to="/client" className="bg-white border-2 border-slate-200 text-text-main text-lg font-bold py-4 px-12 rounded-2xl hover:border-secondary transition-all flex flex-col items-center group">
                <span className="text-xl font-black">I am a Client</span>
                <span className="text-xs text-text-muted group-hover:text-secondary transition-colors">Book a Barber</span>
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-10 border-y border-slate-100 bg-white/50">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-8">Trusted by 2,000+ Modern Barbershops</p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            {['SharpCuts', 'FadeMasters', 'EliteBarber', 'TopTier', 'TheShop'].map((brand) => (
              <div key={brand} className="flex items-center gap-2 font-black text-xl text-text-main">
                <Scissors size={20} />
                {brand}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-black text-center mb-16">The Old Way vs. The New Way</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-8 border-2 border-red-50/50 bg-red-50/10 rounded-3xl">
              <h3 className="text-red-500 font-bold text-xl mb-6 flex items-center gap-2">
                <X size={20} /> Manual Booking
              </h3>
              <ul className="space-y-4 text-text-muted">
                <li className="flex gap-3">
                  <MinusCircle className="text-red-300 shrink-0" size={20} />
                  Phone tag interrupting your cuts constantly.
                </li>
                <li className="flex gap-3">
                  <MinusCircle className="text-red-300 shrink-0" size={20} />
                  No-shows costing you $100s every week.
                </li>
                <li className="flex gap-3">
                  <MinusCircle className="text-red-300 shrink-0" size={20} />
                  Manual reminders sent late at night.
                </li>
              </ul>
            </div>
            <div className="p-8 border-2 border-secondary bg-secondary/5 rounded-3xl relative">
              <div className="absolute -top-4 right-8 bg-secondary text-white text-xs font-bold px-3 py-1 rounded-full uppercase">RECOMENDED</div>
              <h3 className="text-secondary font-bold text-xl mb-6 flex items-center gap-2">
                <CheckCircle2 size={20} /> BarberBook System
              </h3>
              <ul className="space-y-4 text-text-main font-medium">
                <li className="flex gap-3">
                  <CheckCircle2 className="text-secondary shrink-0" size={20} />
                  Clients book themselves 24/7 via link.
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="text-secondary shrink-0" size={20} />
                  Automated deposits reduce no-shows to 0%.
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="text-secondary shrink-0" size={20} />
                  SMS reminders sent automatically.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-white border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4">Set Up Your Shop in Minutes</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-12 text-center" ref={stepsRef}>
            <div className="gsap-step flex flex-col items-center">
              <div className="w-20 h-20 bg-green-50 rounded-3xl flex items-center justify-center text-green-600 mb-6">
                <CalendarCheck size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3">1. Connect Calendar</h3>
              <p className="text-text-muted text-sm">Sync with Google or Apple Calendar to block off personal time instantly.</p>
            </div>
            <div className="gsap-step flex flex-col items-center">
              <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-600 mb-6">
                <Scissors size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3">2. Set Services</h3>
              <p className="text-text-muted text-sm">Define your cuts, set your prices, and choose your duration.</p>
            </div>
            <div className="gsap-step flex flex-col items-center">
              <div className="w-20 h-20 bg-purple-50 rounded-3xl flex items-center justify-center text-purple-600 mb-6">
                <Zap size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3">3. Get Booked</h3>
              <p className="text-text-muted text-sm">Share your personal booking link on Instagram and start filling seats.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-background-light">
        <div className="max-w-6xl mx-auto px-4">
          <div className="mb-16 flex justify-between items-end">
            <div className="max-w-xl">
              <h2 className="text-4xl font-black mb-4">Everything You Need to Run Your Shop</h2>
              <p className="text-text-muted">Powerful tools designed specifically for modern barbers, not salons or spas.</p>
            </div>
            <a href="#" className="hidden md:flex items-center gap-1 text-sm font-bold text-secondary hover:text-secondary-dark transition-colors">
              View All Features <ArrowUp className="rotate-45" size={16} />
            </a>
          </div>

          <div className="grid md:grid-cols-3 gap-8" ref={featuresRef}>
            <div className="gsap-feature bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:border-secondary/20 transition-all group">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-700 mb-6 group-hover:scale-110 transition-transform">
                <MessageSquare size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">SMS Reminders</h3>
              <p className="text-text-muted text-sm mb-6">Automatically remind clients 24 hours and 1 hour before their appointment to eliminate no-shows.</p>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <div className="flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex-shrink-0"></div>
                  <div className="space-y-2 w-full">
                    <div className="h-2 bg-slate-200 rounded w-2/3"></div>
                    <div className="h-2 bg-slate-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="gsap-feature bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:border-secondary/20 transition-all group">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-700 mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Client CRM</h3>
              <p className="text-text-muted text-sm mb-6">Keep track of client cuts, preferences, birthday notes, and payment history in one place.</p>
              <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 h-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent z-10"></div>
              </div>
            </div>

            <div className="gsap-feature bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:border-secondary/20 transition-all group">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-700 mb-6 group-hover:scale-110 transition-transform">
                <Smartphone size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Mobile App</h3>
              <p className="text-text-muted text-sm mb-6">Manage your entire schedule from your pocket. Your business is where you are.</p>
              <div className="flex justify-center">
                <div className="w-16 h-24 bg-orange-100 rounded-xl border-4 border-white shadow-lg transform rotate-12"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 bg-background-light" id="pricing">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4">Simple, Transparent Pricing</h2>
            <p className="text-text-muted">Start for free, upgrade as you grow.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8" ref={pricingRef}>
            {plans.map((plan) => (
              <div key={plan.name} className={`gsap-plan bg-white p-8 rounded-3xl shadow-sm border ${plan.popular ? 'border-secondary ring-2 ring-secondary/20' : 'border-slate-100'}`}>
                {plan.popular && <div className="text-secondary text-xs font-bold uppercase tracking-widest mb-4">Most Popular</div>}
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="text-4xl font-black mb-4">{plan.price}<span className="text-sm text-text-muted font-normal">/mo</span></div>
                <p className="text-text-muted text-sm mb-8">{plan.description}</p>
                <button className={`w-full py-3 rounded-xl font-bold mb-8 transition-all ${plan.popular ? 'bg-primary shadow-lg shadow-primary/20' : 'bg-slate-100 hover:bg-slate-200'}`}>
                  {plan.cta}
                </button>
                <ul className="space-y-4">
                  {plan.features.map((f) => (
                    <li key={f} className="flex gap-3 text-sm">
                      <Check className="text-secondary" size={16} />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* CTA Section */}
      <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1503951914875-452162b7f304?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-slate-900/30"></div>

        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-black mb-6">Ready to Fill Your Chair?</h2>
          <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
            Join thousands of barbers who have taken control of their schedule and income. Start your 7-day free trial today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {user ? (
              <Link to="/dashboard" className="bg-primary hover:bg-primary-hover text-text-main text-lg font-bold py-4 px-10 rounded-xl shadow-lg shadow-primary/30 transition-all">
                Go to Dashboard
              </Link>
            ) : (
              <Link to="/login" className="bg-primary hover:bg-primary-hover text-text-main text-lg font-bold py-4 px-10 rounded-xl shadow-lg shadow-primary/30 transition-all">
                Request Access — 7 Days Free
              </Link>
            )}
            <p className="text-xs text-slate-400 mt-4 sm:mt-0 sm:absolute sm:-bottom-12">No credit card required. Cancel anytime.</p>
          </div>
        </div>
      </section>

      <footer className="py-20 border-t border-slate-100 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <img src={logo} alt="BarByoo Logo" className="w-8 h-8 object-contain" />
                <span className="text-lg font-bold tracking-tight">BarByoo</span>
              </div>
              <p className="text-text-muted text-sm leading-relaxed">
                The #1 scheduling platform for modern barbers.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-6">Product</h4>
              <ul className="space-y-4 text-sm text-text-muted">
                <li><a href="#" className="hover:text-secondary transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-secondary transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-secondary transition-colors">For Shops</a></li>
                <li><a href="#" className="hover:text-secondary transition-colors">Mobile App</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6">Resources</h4>
              <ul className="space-y-4 text-sm text-text-muted">
                <li><a href="#" className="hover:text-secondary transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-secondary transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-secondary transition-colors">Barber Academy</a></li>
                <li><a href="#" className="hover:text-secondary transition-colors">Community</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6">Company</h4>
              <ul className="space-y-4 text-sm text-text-muted">
                <li><a href="#" className="hover:text-secondary transition-colors">About</a></li>
                <li><a href="#" className="hover:text-secondary transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-secondary transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-secondary transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-text-muted text-xs">© 2023 BarByoo Inc. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="text-text-muted hover:text-secondary transition-colors"><Twitter size={18} /></a>
              <a href="#" className="text-text-muted hover:text-secondary transition-colors"><Instagram size={18} /></a>
            </div>
          </div>
        </div>
      </footer>
    </div >
  );
};

export default LandingPage;
