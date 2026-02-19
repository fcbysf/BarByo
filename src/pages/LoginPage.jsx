
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { getMyAccessRequest } from '../services/accessRequestService';
import { Scissors, Mail, Lock, Eye, EyeOff } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signUp, signInWithGoogle, user, profile, loading: authLoading } = useAuthStore();

  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Handle role-based redirect when user state changes
  useEffect(() => {
    const handleRedirect = async () => {
      if (user && !authLoading && !loading) {
        const role = profile?.role;

        if (role === 'admin') {
          navigate('/admin', { replace: true });
        } else if (role === 'barber') {
          navigate('/dashboard', { replace: true });
        } else {
          // No role — check if they have a pending request
          try {
            const request = await getMyAccessRequest(user.id);
            if (request && request.status === 'pending') {
              navigate('/access-pending', { replace: true });
            } else {
              navigate('/request-access', { replace: true });
            }
          } catch {
            navigate('/request-access', { replace: true });
          }
        }
      }
    };

    handleRedirect();
  }, [user, authLoading, loading, profile, navigate]);

  // Show loading while checking auth status on page load
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background-light">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-muted font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let result;
      if (isSignUp) {
        result = await signUp(formData.email, formData.password);
      } else {
        result = await signIn(formData.email, formData.password);
      }

      if (!result.success) {
        setError(result.error || 'Authentication failed. Please try again.');
        setLoading(false);
      }
      // Role-based redirect happens in useEffect above
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);

    try {
      const result = await signInWithGoogle();

      if (!result.success) {
        setError(result.error || 'Google sign in failed.');
        setLoading(false);
      }
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="flex h-screen w-full overflow-hidden">
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
          <h1 className="text-5xl font-bold leading-tight mb-6">Master your craft, manage your business.</h1>
          <p className="text-xl text-slate-300 leading-relaxed mb-10">
            Join over 10,000 barbershops using BarberPro to streamline bookings, manage staff, and grow their client base effortlessly.
          </p>
          <div className="flex items-center gap-4">
            <div className="flex -space-x-4">
              {[1, 2, 3].map((i) => (
                <img key={i} src={`https://picsum.photos/seed/${i + 10}/100/100`} className="w-10 h-10 rounded-full border-2 border-slate-900" alt="user" />
              ))}
              <div className="w-10 h-10 rounded-full border-2 border-slate-900 bg-secondary flex items-center justify-center text-xs font-bold">+2k</div>
            </div>
            <p className="text-sm font-medium text-slate-400">
              <span className="text-primary">4.9/5</span> rating from our partners
            </p>
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 md:p-8 bg-white overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="mb-10 text-center lg:text-left pt-10 lg:pt-0">
            {/* Mobile Logo */}
            <div className="lg:hidden flex justify-center items-center gap-2 mb-6 text-text-main">
              <Scissors className="text-primary" size={32} />
              <span className="text-2xl font-bold">BarberPro</span>
            </div>

            <h2 className="text-3xl font-bold mb-3">
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </h2>
            <p className="text-text-muted">
              {isSignUp
                ? 'Sign up to request access to the platform.'
                : 'Sign in to your BarberPro account.'}
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Google Sign In */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 border border-slate-200 py-3 rounded-xl hover:bg-slate-50 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed mb-6"
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="google" />
            Continue with Google
          </button>

          <div className="relative mb-6 text-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
            <span className="relative px-4 bg-white text-sm text-text-muted">Or continue with email</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-text-main mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="name@barbershop.com"
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-bold text-text-main">Password</label>
                {!isSignUp && (
                  <a href="#" className="text-sm text-secondary font-bold hover:underline">Forgot?</a>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••••••"
                  className="w-full pl-12 pr-12 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main"
                >
                  {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>
              {isSignUp && (
                <p className="mt-2 text-xs text-text-muted">Password must be at least 6 characters</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-primary hover:bg-primary-hover text-text-main font-black rounded-xl shadow-lg shadow-primary/30 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In')}
            </button>
          </form>

          <p className="mt-8 text-center text-text-muted">
            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
                setFormData({ email: '', password: '' });
              }}
              className="text-secondary font-bold hover:underline"
            >
              {isSignUp ? 'Sign in' : 'Sign up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
