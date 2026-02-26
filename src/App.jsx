
import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { trackPageView } from './services/analytics';
import ProtectedRoute from './components/ProtectedRoute';
import SubscriptionGuard from './components/SubscriptionGuard';

// Public pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import ClientPage from './pages/ClientPage';
import BookingPage from './pages/BookingPage';

// Auth flow pages
import RequestAccessPage from './pages/RequestAccessPage';
import AccessPendingPage from './pages/AccessPendingPage';

// Barber pages (require barber role)
import DashboardPage from './pages/DashboardPage';
import SchedulePage from './pages/SchedulePage';
import ServicesPage from './pages/ServicesPage';
import CustomersPage from './pages/CustomersPage';
import OnboardingPage from './pages/OnboardingPage';

// Admin pages (require admin role)
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminRequestsPage from './pages/admin/AdminRequestsPage';
import AdminBarbersPage from './pages/admin/AdminBarbersPage';
import AdminShopsPage from './pages/admin/AdminShopsPage';

const AnalyticsTracker = () => {
  const location = useLocation();
  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location]);
  return null;
};

const App = () => {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <Router>
      <AnalyticsTracker />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/client" element={<ClientPage />} />
        <Route path="/book/:barberId" element={<BookingPage />} />

        {/* Auth flow — require login but no specific role */}
        <Route path="/request-access" element={
          <ProtectedRoute>
            <RequestAccessPage />
          </ProtectedRoute>
        } />
        <Route path="/access-pending" element={
          <ProtectedRoute>
            <AccessPendingPage />
          </ProtectedRoute>
        } />

        {/* Barber routes — require barber role + active subscription */}
        <Route path="/onboarding" element={
          <ProtectedRoute requiredRole="barber">
            <OnboardingPage />
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute requiredRole="barber">
            <SubscriptionGuard>
              <DashboardPage />
            </SubscriptionGuard>
          </ProtectedRoute>
        } />
        <Route path="/schedule" element={
          <ProtectedRoute requiredRole="barber">
            <SubscriptionGuard>
              <SchedulePage />
            </SubscriptionGuard>
          </ProtectedRoute>
        } />
        <Route path="/services" element={
          <ProtectedRoute requiredRole="barber">
            <SubscriptionGuard>
              <ServicesPage />
            </SubscriptionGuard>
          </ProtectedRoute>
        } />
        <Route path="/customers" element={
          <ProtectedRoute requiredRole="barber">
            <SubscriptionGuard>
              <CustomersPage />
            </SubscriptionGuard>
          </ProtectedRoute>
        } />

        {/* Admin routes — require admin role */}
        <Route path="/admin" element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboardPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/requests" element={
          <ProtectedRoute requiredRole="admin">
            <AdminRequestsPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/barbers" element={
          <ProtectedRoute requiredRole="admin">
            <AdminBarbersPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/shops" element={
          <ProtectedRoute requiredRole="admin">
            <AdminShopsPage />
          </ProtectedRoute>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
