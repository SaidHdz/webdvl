import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute component to restrict access based on authentication and roles.
 * @param {React.ReactNode} children - The component to render if authorized.
 * @param {string} roleRequired - (Optional) The specific role needed to access.
 */
const ProtectedRoute = ({ children, roleRequired }) => {
    const { user, isAuthenticated } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Verificación robusta de rol
    const userRole = user?.role || 'user';

    if (roleRequired && userRole !== roleRequired) {
        console.warn(`Access denied for role: ${userRole}. Required: ${roleRequired}`);
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
