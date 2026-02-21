import { ArrowUp, Scissors, Play, X, CheckCircle2, Check, MinusCircle, Smartphone, MessageSquare, CalendarCheck, Zap, Star, ShieldCheck, Twitter, Instagram, DollarSign, MoreVertical, User, Mail, MessageCircle } from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useFadeIn, useStagger } from '../hooks/useAnimations';

const LandingPage = () => {
  const { user } = useAuthStore();

  // Modal States
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

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
    <div className="bg-[#fafafa] min-h-screen">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50">
        <header className="flex items-center justify-between px-4 md:px-8 py-4 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-2">
            <Scissors className="text-secondary" size={28} />
            <span className="text-xl font-bold tracking-tight">BarByoo</span>
          </div>
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
                <Link to="/login" className="bg-primary hover:bg-primary-hover text-text-main text-xs md:text-sm font-bold py-2.5 md:px-5 px-3 rounded-xl transition-all shadow-sm">
                  Request Access
                </Link>
              </>
            )}
          </div>
        </header>
      </div>

      {/* Hero */}
      <section className="pt-24 pb-32 px-4 md:px-8 max-w-7xl mx-auto overflow-hidden" ref={heroRef}>
        <div className="flex flex-col lg:flex-row items-center justify-between gap-16">

          {/* Left Column - Text & CTAs */}
          <div className="flex-1 w-full max-w-2xl text-left relative z-10">

            <h1 className="text-5xl lg:text-7xl font-black text-slate-900 mb-6 leading-[1.1] tracking-tight">
              Next Haircut,<br />One <span className="text-secondary">Click Away</span>
            </h1>

            <p className="text-lg text-slate-500 mb-12 font-medium max-w-lg leading-relaxed">
              Your barber schedule at your fingertips — no calls, no hassle, just haircuts.            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              {user ? (
                <>
                  <Link to="/dashboard" className="bg-primary hover:bg-primary-hover text-text-main text-lg font-bold py-4 px-10 rounded-2xl shadow-lg shadow-primary/30 transition-all flex items-center justify-center gap-2 w-full sm:w-auto">
                    Go to Dashboard
                    <ArrowUp size={20} className="rotate-45" />
                  </Link>
                  <Link to="/client" className="bg-white border-2 border-slate-100 text-text-main text-lg font-bold py-4 px-10 rounded-2xl hover:border-secondary transition-all flex items-center justify-center gap-2 w-full sm:w-auto">
                    <Scissors className="text-secondary" size={20} />
                    Book a Cut
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/login" className="bg-primary hover:bg-primary-hover text-text-main text-lg font-bold py-4 px-12 rounded-2xl shadow-xl shadow-primary/30 transition-all flex flex-col items-center justify-center group w-full sm:w-auto">
                    <span className="text-lg gap-2 items-center font-black flex">I am a Barber <Scissors size={17} /></span>
                  </Link>
                  <Link to="/client" className="bg-white border-2 border-slate-100 text-text-main text-lg font-bold py-4 px-12 rounded-2xl hover:border-secondary transition-all flex flex-col items-center justify-center group w-full sm:w-auto">
                    <span className="text-xl gap-2 items-center font-black flex">I am a Client <User size={17} /></span>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Right Column - Floating UI Mockups */}
          <div className="flex-1 relative w-full h-[500px] hidden lg:block">
            {/* Main Center Card - Appointment */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 bg-white p-8 rounded-[2rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-50 w-80">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                  <Scissors className="text-text-main" size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">New Booking</p>
                  <p className="font-bold">Skin Fade & Beard</p>
                </div>
              </div>
              <h2 className="text-4xl font-black mb-2">$45.00</h2>
              <p className="text-xs text-slate-500 mb-8 border-b border-slate-100 pb-6 leading-relaxed">
                Client: Mike Ross<br />
                Time: Today, 2:30 PM
              </p>
              <button className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-colors">
                Accept Booking
              </button>
            </div>

            {/* Top Right Card - Revenue */}
            <div className="absolute -top-4 right-0 z-10 bg-white p-6 rounded-[2rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-slate-50 w-64 animate-float">
              <div className="flex justify-between items-center mb-6">
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                  <DollarSign className="text-green-600" size={20} />
                </div>
                <MoreVertical className="text-slate-300" size={20} />
              </div>
              <p className="text-sm font-bold mb-1">Weekly Revenue</p>
              <h3 className="text-2xl font-black mb-6">$1,489</h3>
              {/* Fake Bar Chart */}
              <div className="flex items-end justify-between gap-2 h-16">
                {[40, 20, 60, 100, 30, 80, 50].map((h, i) => (
                  <div key={i} className="w-full bg-slate-100 rounded-t-sm" style={{ height: `${h}%` }}>
                    <div className={`w-full bg-slate-900 rounded-t-sm ${i === 3 ? 'opacity-100' : 'opacity-0'}`} style={{ height: '100%' }}></div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2 text-[8px] font-bold text-slate-400 uppercase">
                <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
              </div>
            </div>

            {/* Bottom Right Card - Update */}
            <div className="absolute bottom-4 -right-12 z-30 bg-white p-6 rounded-3xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.08)] border border-slate-50 w-64 animate-float-delayed">
              <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-2">Platform Update</p>
              <h4 className="font-bold text-sm mb-4">Zero No-Shows Feature Enabled</h4>
              <div className="flex items-center gap-2">
                <div className="h-1 flex-1 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full w-2/3 bg-secondary"></div>
                </div>
                <span className="text-[10px] font-bold text-slate-400">Complete</span>
              </div>
            </div>

            {/* Background Accent Shapes */}
            <div className="absolute top-1/4 left-1/4 w-4 h-4 rounded-full border-2 border-slate-200"></div>
            <div className="absolute bottom-1/4 right-1/4 w-3 h-3 rounded-full bg-primary/20"></div>
            <div className="absolute top-1/2 -right-8 w-24 h-24 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-2xl"></div>

          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 bg-[#fafafa]">
        <div className="max-w-7xl mx-auto px-4 md:px-8 text-center">
          <p className="text-xs font-bold text-text-muted uppercase tracking-widest">Trusted by 2,000+ Modern Barbershops</p>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-24 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
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
      <section className="py-24 md:py-32 bg-[#fafafa] border-t border-slate-100" id='features'>
        <div className="max-w-7xl mx-auto px-4 md:px-8">
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

      {/* Pricing */}
      <section className="py-24 md:py-32 bg-white border-t border-slate-100" id="pricing">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
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
      <section className="py-24 md:py-32 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1503951914875-452162b7f304?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-slate-900/30"></div>

        <div className="max-w-5xl mx-auto px-4 md:px-8 text-center relative z-10">
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
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <Scissors className="text-secondary" size={24} />
                <span className="text-lg font-bold tracking-tight">BarByoo</span>
              </div>
              <p className="text-text-muted text-sm leading-relaxed">
                The #1 scheduling platform for modern barbers.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-6">Product</h4>
              <ul className="space-y-4 text-sm text-text-muted">
                <li><a href="#features" className="hover:text-secondary transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-secondary transition-colors">Pricing</a></li>
                <li><span className="opacity-50 cursor-not-allowed">For Shops</span></li>
                <li><span className="opacity-50 cursor-not-allowed">Mobile App</span></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6">Resources</h4>
              <ul className="space-y-4 text-sm text-text-muted">
                <li><span className="opacity-50 cursor-not-allowed">Blog</span></li>
                <li><span className="opacity-50 cursor-not-allowed">Help Center</span></li>
                <li><span className="opacity-50 cursor-not-allowed">Barber Academy</span></li>
                <li><span className="opacity-50 cursor-not-allowed">Community</span></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6">Company</h4>
              <ul className="space-y-4 text-sm">
                <li><span className="text-text-muted opacity-50 cursor-not-allowed">About</span></li>
                <li><span className="text-text-muted opacity-50 cursor-not-allowed">Careers</span></li>
                <li><button onClick={() => setIsContactOpen(true)} className="text-text-muted hover:text-secondary transition-colors text-left w-full">Contact</button></li>
                <li><button onClick={() => setIsPrivacyOpen(true)} className="text-text-muted hover:text-secondary transition-colors text-left w-full">Privacy</button></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-text-muted text-xs">© 2026 BarByoo Inc. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="text-text-muted hover:text-secondary transition-colors"><Twitter size={18} /></a>
              <a href="#" className="text-text-muted hover:text-secondary transition-colors"><Instagram size={18} /></a>
            </div>
          </div>
        </div>
      </footer>

      {/* Contact Modal */}
      {isContactOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsContactOpen(false)}></div>
          <div className="bg-white rounded-3xl p-8 max-w-md w-full relative z-10 shadow-2xl animate-fade-in-up">
            <button onClick={() => setIsContactOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors">
              <X size={24} />
            </button>
            <h3 className="text-2xl font-black mb-2">Get in Touch</h3>
            <p className="text-sm text-text-muted mb-8">Have a question or need help? Send us a message.</p>

            <form className="space-y-4 mb-8" onSubmit={(e) => { e.preventDefault(); alert('Message sent!'); setIsContactOpen(false); }}>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Name</label>
                <input type="text" required className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Email</label>
                <input type="email" required className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" placeholder="john@example.com" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Message</label>
                <textarea required rows="4" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none" placeholder="How can we help you?"></textarea>
              </div>
              <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-slate-800 transition-colors">
                Send Message
              </button>
            </form>

            <div className="pt-6 border-t border-slate-100 flex justify-center gap-6">
              <a href="#" className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition-all" title="Twitter / X">
                <Twitter size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-pink-500 hover:bg-pink-50 transition-all" title="Instagram">
                <Instagram size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-green-500 hover:bg-green-50 transition-all" title="WhatsApp">
                <MessageCircle size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all" title="Email">
                <Mail size={18} />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Modal */}
      {isPrivacyOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsPrivacyOpen(false)}></div>
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full relative z-10 shadow-2xl max-h-[80vh] flex flex-col animate-fade-in-up">
            <button onClick={() => setIsPrivacyOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors z-20">
              <X size={24} />
            </button>
            <h3 className="text-2xl font-black mb-6 shrink-0">Privacy Policy</h3>

            <div className="overflow-y-auto pr-4 space-y-6 text-sm text-slate-600 leading-relaxed custom-scrollbar">
              <p><strong>Last Updated: {new Date().toLocaleDateString()}</strong></p>

              <section>
                <h4 className="text-base font-bold text-slate-900 mb-2">1. Information We Collect</h4>
                <p>We collect information you provide directly to us, such as when you create or modify your account, request on-demand services, contact customer support, or otherwise communicate with us. This information may include: name, email, phone number, postal address, profile picture, payment method, and other information you choose to provide.</p>
              </section>

              <section>
                <h4 className="text-base font-bold text-slate-900 mb-2">2. How We Use Information</h4>
                <p>We may use the information we collect about you to Provide, maintain, and improve our Services, including, for example, to facilitate payments, send receipts, provide products and services you request (and send related information), develop new features, provide customer support to Users and Barbers, develop safety features, authenticate users, and send product updates and administrative messages.</p>
              </section>

              <section>
                <h4 className="text-base font-bold text-slate-900 mb-2">3. Sharing Information</h4>
                <p>We may share the information we collect about you as described in this Statement or as described at the time of collection or sharing, including as follows: With Barbers to enable them to provide the Services you request. For example, we share your name, photo (if you provide one), average User rating given by Barbers, and pickup and/or drop-off locations with Barbers.</p>
              </section>

              <section>
                <h4 className="text-base font-bold text-slate-900 mb-2">4. Data Security</h4>
                <p>We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction. However, no internet or email transmission is ever fully secure or error free.</p>
              </section>

              <section>
                <h4 className="text-base font-bold text-slate-900 mb-2">5. Your Choices</h4>
                <p>You may correct your account information at any time by logging into your online or in-app account. If you wish to cancel your account, please contact us. Please note that in some cases we may retain certain information about you as required by law, or for legitimate business purposes to the extent permitted by law.</p>
              </section>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100 shrink-0">
              <button onClick={() => setIsPrivacyOpen(false)} className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-slate-800 transition-colors">
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default LandingPage;
