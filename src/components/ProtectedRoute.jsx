import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Restricts access based on authentication and module permissions.
 * @param {React.ReactNode} children - Component to render if authorized.
 * @param {string} [moduleRequired] - Module key the user must have (crm|scm|erp).
 * @param {boolean} [staffOnly] - When true, only staff accounts may enter.
 */
const ProtectedRoute = ({ children, moduleRequired, staffOnly }) => {
    const { user, isAuthenticated, loading, hasModule } = useAuth();
    const location = useLocation();

    // Avoid redirecting before the session has been revalidated on reload.
    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-white/10 border-t-accent rounded-full animate-spin" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (staffOnly && user.type !== 'staff') {
        return <Navigate to="/" replace />;
    }

    if (moduleRequired && !hasModule(moduleRequired)) {
        return <Navigate to="/hub" replace />;
    }

    return children;
};

export default ProtectedRoute;
