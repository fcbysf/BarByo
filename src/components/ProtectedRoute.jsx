/**
 * Protected Route Component
 *
 * Wraps routes that require authentication.
 * Supports role-based access control via requiredRole prop.
 * Redirects unauthenticated users to login, and unauthorized users based on their role.
 */

import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const ProtectedRoute = ({ children, requiredRole = null }) => {
    const { user, profile, loading } = useAuthStore();
    const location = useLocation();

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

    // If a role is required, we need the profile to be loaded before deciding
    if (requiredRole) {
        const userRole = profile?.role;

        if (userRole !== requiredRole) {
            // Redirect based on actual role
            if (userRole === "admin") {
                return <Navigate to="/admin" replace />;
            } else if (userRole === "barber") {
                return <Navigate to="/dashboard" replace />;
            } else {
                // No role — redirect to request access
                return <Navigate to="/request-access" replace />;
            }
        }
    }

    // User is authenticated and authorized, render the protected content
    return children;
};

export default ProtectedRoute;
