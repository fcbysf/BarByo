/**
 * Protected Route Component
 * 
 * Wraps routes that require authentication.
 * Redirects to login page if user is not authenticated.
 */

import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const ProtectedRoute = ({ children }) => {
    const { user, loading, initialize } = useAuthStore();
    const location = useLocation();

    // Initialize auth state on mount
    useEffect(() => {
        initialize();

        // Safety: if it's still loading after 6 seconds, something is wrong
        const timer = setTimeout(() => {
            if (loading) {
                console.warn('ProtectedRoute: Auth still loading after 6s, forcing render');
                useAuthStore.setState({ loading: false });
            }
        }, 6000);

        return () => clearTimeout(timer);
    }, [initialize]);

    // Show loading state while checking authentication
    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-background-light">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-text-muted font-medium">Loading...</p>
                </div>
            </div>
        );
    }

    // If not authenticated, redirect to login with return URL
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // User is authenticated, render the protected content
    return children;
};

export default ProtectedRoute;
