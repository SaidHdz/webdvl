import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService, setToken, getToken } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

/**
 * Authentication provider backed by the Express API.
 *
 * The session is a JWT stored in localStorage. On mount, if a token exists we
 * revalidate it against /me so the app rehydrates with fresh role/permissions
 * (a stale cached user could otherwise show modules it no longer has).
 */
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = getToken();
        if (!token) {
            setLoading(false);
            return;
        }
        apiService.auth.me()
            .then((data) => setUser(data.user))
            .catch(() => {
                // Token invalid or expired: drop it silently.
                setToken(null);
                setUser(null);
            })
            .finally(() => setLoading(false));
    }, []);

    /**
     * Authenticates a user and stores the session token.
     * @param {string} email
     * @param {string} password
     * @returns {Promise<{success: boolean, message?: string}>}
     */
    const login = async (email, password) => {
        try {
            const data = await apiService.auth.login(email, password);
            setToken(data.token);
            setUser(data.user);
            return { success: true, user: data.user };
        } catch (error) {
            return { success: false, message: error.message };
        }
    };

    /**
     * Registers a storefront customer and starts a session.
     * @param {Object} userData - { name|nombre, email, password }
     * @returns {Promise<{success: boolean, message?: string}>}
     */
    const register = async (userData) => {
        try {
            const data = await apiService.auth.register({
                nombre: userData.nombre || userData.name,
                email: userData.email,
                password: userData.password,
            });
            setToken(data.token);
            setUser(data.user);
            return { success: true, user: data.user };
        } catch (error) {
            return { success: false, message: error.message };
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
    };

    /**
     * Checks whether the current user can access a given module.
     * @param {string} module - Module key (crm | scm | erp).
     * @returns {boolean}
     */
    const hasModule = (module) => Boolean(user?.permissions?.includes(module));

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            login,
            register,
            logout,
            hasModule,
            isAuthenticated: !!user,
            isStaff: user?.type === 'staff',
        }}>
            {children}
        </AuthContext.Provider>
    );
};
