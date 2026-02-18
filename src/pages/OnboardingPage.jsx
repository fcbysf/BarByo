
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { createBarberShop } from '../services/barberService';
import { createService } from '../services/barberService';
import { Scissors, HelpCircle, CheckCircle2, MapPin, Upload, ArrowRight, Plus, Trash2, Clock } from 'lucide-react';

const OnboardingPage = () => {
  const navigate = useNavigate();
  const { user, profile, updateProfile } = useAuthStore();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [checkingShop, setCheckingShop] = useState(true);
  const [error, setError] = useState(null);

  // Step 1: Shop Info
  const [shopData, setShopData] = useState({
    name: '',
    address: '',
    phone: '',
    image_url: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=300', // Default image
  });

  // Step 2: Services
  const [services, setServices] = useState([
    { name: 'Haircut', description: 'Standard haircut with styling', duration: 30, price: 30 },
    { name: 'Beard Trim', description: 'Beard grooming and shaping', duration: 20, price: 20 },
  ]);

  // Step 3: Hours
  const [availability, setAvailability] = useState({
    monday: ['09:00-17:00'],
    tuesday: ['09:00-17:00'],
    wednesday: ['09:00-17:00'],
    thursday: ['09:00-17:00'],
    friday: ['09:00-18:00'],
    saturday: ['10:00-16:00'],
    sunday: [],
  });

  // Check if barber already has a shop and redirect to dashboard
  useEffect(() => {
    const checkExistingShop = async () => {
      // Wait for user to be available from auth store
      if (user) {
        setCheckingShop(true);
        try {
          const { data: shop } = await supabase
            .from('barbers')
            .select('id')
            .eq('user_id', user.id)
            .single();

          if (shop) {
            // Already onboarded, skip to dashboard
            navigate('/dashboard', { replace: true });
            return;
          }
        } catch (err) {
          // ignore error (probably PG 116 "no rows") and just show the form
          console.log('No existing shop found or error checking:', err.message);
        } finally {
          setCheckingShop(false);
        }
      } else if (user === null) {
        // user explicitly null means signed out or not loaded yet
        // if user is null we wait for auth to load or redirect will happen in ProtectedRoute
      }
    };

    checkExistingShop();
  }, [user, navigate]);

  if (checkingShop) {
    return (
      <div className="flex items-center justify-center h-screen bg-background-light">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-muted font-medium">Preparing your setup...</p>
        </div>
      </div>
    );
  }

  const handleShopChange = (e) => {
    setShopData({
      ...shopData,
      [e.target.name]: e.target.value,
    });
  };

  const handleServiceChange = (index, field, value) => {
    const newServices = [...services];
    newServices[index][field] = value;
    setServices(newServices);
  };

  const addService = () => {
    setServices([...services, { name: '', description: '', duration: 30, price: 0 }]);
  };

  const removeService = (index) => {
    if (services.length > 1) {
      setServices(services.filter((_, i) => i !== index));
    }
  };

  const toggleDay = (day) => {
    setAvailability({
      ...availability,
      [day]: availability[day].length > 0 ? [] : ['09:00-17:00'],
    });
  };

  const updateHours = (day, value) => {
    setAvailability({
      ...availability,
      [day]: [value],
    });
  };

  const validateHours = (hours) => {
    if (hours.length === 0) return true; // Closed is fine
    const timeRangeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]-([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return hours.every(h => timeRangeRegex.test(h));
  };

  const nextStep = async () => {
    setError(null);

    if (step === 1) {
      if (!shopData.name || !shopData.address || !shopData.phone) {
        setError('Please fill in all shop details.');
        return;
      }
      setStep(2);
      return;
    }

    if (step === 2) {
      const invalidService = services.find(s => !s.name || isNaN(s.price) || isNaN(s.duration));
      if (invalidService) {
        setError('Please ensure all services have a name, valid price, and duration.');
        return;
      }
      setStep(3);
      return;
    }

    if (step === 3) {
      // Validate hours format
      for (const [day, hours] of Object.entries(availability)) {
        if (hours.length > 0 && !validateHours(hours)) {
          setError(`Invalid hours format for ${day}. Please use HH:MM-HH:MM (e.g., 09:00-17:00).`);
          return;
        }
      }

      // Save everything
      setLoading(true);

      try {
        if (!user) throw new Error('No user found. Please log in again.');

        // 1. Ensure Profile exists and upsert with barber role
        // We do this directly via supabase (not through the store) so we can
        // await the DB commit before inserting into barbers (RLS requires user_type='barber')
        const { data: updatedProfile, error: profileUpsertError } = await supabase
          .from('users')
          .upsert([
            {
              user_id: user.id,
              email: user.email,
              full_name: user.user_metadata?.full_name || profile?.full_name || user.email?.split('@')[0] || 'Barber',
              phone: shopData.phone,
              user_type: 'barber', // Set role BEFORE inserting into barbers table
            },
          ], { onConflict: 'user_id' })
          .select()
          .single();

        if (profileUpsertError) throw new Error('Could not update user profile: ' + profileUpsertError.message);

        const currentProfile = updatedProfile;

        // 2. Create/Update Barber Shop
        // Now that user_type='barber' is committed in the DB, RLS will allow this insert
        const barberData = {
          user_id: user.id,
          name: shopData.name,
          owner_name: currentProfile?.full_name || user.email?.split('@')[0] || 'Barber',
          address: shopData.address,
          phone: shopData.phone,
          image_url: shopData.image_url,
          availability: availability,
          is_active: true
        };

        const newShop = await createBarberShop(barberData);

        // 3. Create Services
        if (newShop && newShop.id) {
          for (const service of services) {
            if (service.name) {
              await createService({
                barber_id: newShop.id,
                name: service.name,
                description: service.description,
                duration: parseInt(service.duration),
                price: parseFloat(service.price)
              });
            }
          }
        }

        // 4. Update the store's profile state to reflect new role
        await updateProfile({ user_type: 'barber', phone: shopData.phone });

        navigate('/dashboard');
      } catch (err) {
        console.error('Error saving onboarding data:', err);
        // Better error messages for common Supabase failures
        if (err.code === '23505') {
          setError('You already have a shop registered. Redirecting to dashboard...');
          setTimeout(() => navigate('/dashboard'), 2000);
        } else {
          setError(err.message || 'Failed to save shop details. Please verify your info and try again.');
        }
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="bg-background-light min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-8 py-4 bg-white border-b border-slate-100">
        <div className="flex items-center gap-3">
          <Scissors className="text-secondary" size={24} />
          <span className="text-lg font-bold">BarberPro</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium border border-slate-200 rounded-lg hover:bg-slate-50">
            <HelpCircle size={16} /> Help & Support
          </button>
          <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center font-bold text-sm">JS</div>
        </div>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto py-12 px-6">
        {/* Stepper */}
        <div className="relative flex justify-between mb-16 px-10">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 z-0"></div>
          {[1, 2, 3].map((s) => (
            <div key={s} className="relative z-10 flex flex-col items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all ${s <= step ? 'bg-primary border-primary text-text-main shadow-md' : 'bg-white border-slate-200 text-slate-400'
                }`}>
                {s}
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest ${s <= step ? 'text-text-main' : 'text-slate-400'
                }`}>
                {s === 1 ? 'Shop Info' : s === 2 ? 'Services' : 'Hours'}
              </span>
            </div>
          ))}
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="p-10 border-b border-slate-50">
            <h2 className="text-3xl font-black mb-2">Tell us about your shop</h2>
            <p className="text-text-muted">Enter the basic details so clients can find and book you easily.</p>
          </div>
          <form className="p-10 space-y-8" onSubmit={(e) => { e.preventDefault(); }}>
            {error && (
              <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm font-bold border border-red-100 mb-6">
                {error}
              </div>
            )}

            {/* Step 1: Shop Info */}
            {step === 1 && (
              <>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-text-main">Shop Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="name"
                      value={shopData.name}
                      onChange={handleShopChange}
                      placeholder="The Gentleman's Cut"
                      className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    />
                    <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary" size={20} />
                  </div>
                  <p className="text-xs text-text-muted">This will be visible on your public booking page.</p>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-bold text-text-main">Business Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                    <input
                      type="text"
                      name="address"
                      value={shopData.address}
                      onChange={handleShopChange}
                      placeholder="Start typing address..."
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-bold text-text-main">Business Phone</label>
                  <div className="flex">
                    <div className="bg-slate-50 border border-r-0 border-slate-200 rounded-l-xl px-4 flex items-center text-sm font-medium text-text-muted">US +1</div>
                    <input
                      type="tel"
                      name="phone"
                      value={shopData.phone}
                      onChange={handleShopChange}
                      placeholder="(555) 000-0000"
                      className="flex-1 px-4 py-3.5 rounded-r-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-bold text-text-main">Shop Logo</label>
                  <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:border-secondary transition-all cursor-pointer group">
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-secondary/10 transition-all">
                      <Upload className="text-slate-400 group-hover:text-secondary" size={24} />
                    </div>
                    <p className="text-sm font-bold"><span className="text-secondary">Upload a file</span> or drag and drop</p>
                    <p className="text-xs text-text-muted mt-1">PNG, JPG, GIF up to 5MB</p>
                  </div>
                </div>
              </>
            )}

            {/* Step 2: Services */}
            {step === 2 && (
              <div className="space-y-6">
                {services.map((service, index) => (
                  <div key={index} className="bg-slate-50 p-6 rounded-2xl border border-slate-100 relative group">
                    <button onClick={() => removeService(index)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors">
                      <Trash2 size={18} />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-text-muted uppercase">Service Name</label>
                        <input
                          type="text"
                          value={service.name}
                          onChange={(e) => handleServiceChange(index, 'name', e.target.value)}
                          placeholder="e.g. Haircut"
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-text-muted uppercase">Price ($)</label>
                        <input
                          type="number"
                          value={service.price}
                          onChange={(e) => handleServiceChange(index, 'price', parseFloat(e.target.value))}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary outline-none"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-text-muted uppercase">Duration (min)</label>
                        <select
                          value={service.duration}
                          onChange={(e) => handleServiceChange(index, 'duration', parseInt(e.target.value))}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary outline-none bg-white"
                        >
                          <option value="15">15 min</option>
                          <option value="30">30 min</option>
                          <option value="45">45 min</option>
                          <option value="60">1 hour</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-text-muted uppercase">Description</label>
                        <input
                          type="text"
                          value={service.description}
                          onChange={(e) => handleServiceChange(index, 'description', e.target.value)}
                          placeholder="Short description"
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addService}
                  className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-text-muted font-bold hover:border-secondary hover:text-secondary transition-all flex items-center justify-center gap-2"
                >
                  <Plus size={20} /> Add Another Service
                </button>
              </div>
            )}

            {/* Step 3: Hours */}
            {step === 3 && (
              <div className="space-y-4">
                {Object.entries(availability).map(([day, hours]) => (
                  <div key={day} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-6 rounded-full transition-colors cursor-pointer relative ${hours.length > 0 ? 'bg-secondary' : 'bg-slate-300'}`} onClick={() => toggleDay(day)}>
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${hours.length > 0 ? 'left-5' : 'left-1'}`}></div>
                      </div>
                      <span className="font-bold capitalize w-24">{day}</span>
                    </div>
                    {hours.length > 0 ? (
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-2">
                          <Clock size={16} className="text-text-muted" />
                          <input
                            type="text"
                            value={hours[0]}
                            onChange={(e) => updateHours(day, e.target.value)}
                            placeholder="09:00-17:00"
                            className="bg-white border border-slate-200 rounded-lg px-3 py-1 text-sm font-medium w-32 text-center focus:ring-2 focus:ring-primary outline-none"
                          />
                        </div>
                        <p className="text-[10px] text-text-muted">Format: HH:MM-HH:MM</p>
                      </div>
                    ) : (
                      <span className="text-sm font-medium text-slate-400">Closed</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="pt-6 flex justify-between items-center border-t border-slate-50">
              {step > 1 ? (
                <button type="button" onClick={() => setStep(step - 1)} className="text-sm font-bold text-text-muted hover:text-text-main">Back</button>
              ) : (
                <div></div>
              )}

              <button
                type="button"
                onClick={nextStep}
                disabled={loading}
                className="bg-primary hover:bg-primary-hover text-text-main font-black py-4 px-10 rounded-xl shadow-lg shadow-primary/30 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : step === 3 ? 'Finish Setup' : 'Continue'} <ArrowRight size={18} />
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default OnboardingPage;
