import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

/**
 * Authentication provider powered by Supabase.
 *
 * Manages the Supabase Auth session and fetches the corresponding user profile
 * (including roles and permissions) from the public database schema.
 */
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    /**
     * Fetches the complete profile for a given auth user ID.
     */
    const fetchProfile = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*, roles(name, permissions)')
                .eq('id', userId)
                .maybeSingle(); // Use maybeSingle to avoid 406 error if not found

            if (error) throw error;
            
            if (!data) {
                console.warn('No profile found for user:', userId);
                return null;
            }

            return {
                ...data,
                permissions: data.roles?.permissions || []
            };
        } catch (error) {
            console.error('Error fetching profile:', error.message);
            return null;
        }
    };

    useEffect(() => {
        // 1. Check for an existing session on mount
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                fetchProfile(session.user.id).then(setUser);
            }
            setLoading(false);
        });

        // 2. Listen for auth changes (login, logout, token refresh)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session) {
                const profile = await fetchProfile(session.user.id);
                setUser(profile);
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    /**
     * Authenticates a user with email and password.
     */
    const login = async (email, password) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });
            if (error) throw error;
            
            const profile = await fetchProfile(data.user.id);
            setUser(profile);
            return { success: true, user: profile };
        } catch (error) {
            return { success: false, message: error.message };
        }
    };

    /**
     * Registers a new customer.
     * Includes a fallback to manually create the profile if the trigger fails.
     */
    const register = async (userData) => {
        try {
            const { data, error } = await supabase.auth.signUp({
                email: userData.email,
                password: userData.password,
                options: {
                    data: {
                        name: userData.nombre || userData.name
                    }
                }
            });
            if (error) throw error;
            if (!data.user) throw new Error('No se pudo crear el usuario');
            
            // 1. Give the trigger a small window to work
            let profile = await fetchProfile(data.user.id);
            
            // 2. FALLBACK: If trigger didn't create the profile, do it manually
            if (!profile) {
                console.log('Trigger not detected, performing manual profile creation...');
                const { error: insertError } = await supabase
                    .from('users')
                    .insert({
                        id: data.user.id,
                        name: userData.nombre || userData.name,
                        email: userData.email,
                        type: 'customer',
                        status: 'Activo'
                    });
                
                if (!insertError) {
                    profile = await fetchProfile(data.user.id);
                } else {
                    console.error('Manual insert failed:', insertError.message);
                }
            }

            setUser(profile);
            return { success: true, user: profile };
        } catch (error) {
            console.error('Registration error:', error.message);
            return { success: false, message: error.message };
        }
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
    };

    /**
     * Checks whether the current user can access a given module.
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
