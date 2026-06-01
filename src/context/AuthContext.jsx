import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('dvl_user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    /**
     * Authenticates a user.
     * @param {string} email 
     * @param {string} password 
     * @returns {Promise<Object>} Success status and message.
     */
    const login = async (email, password) => {
        try {
            const data = await apiService.login(email, password);
            
            if (data.success) {
                // Robust user data handling
                const userData = data.user || { name: email.split('@')[0], email: email };
                
                // Asignar rol de admin si es Said Alejandro Hernandez o el correo específico
                const isAdmin = 
                    userData.email?.toLowerCase() === 'saidhdzdno@gmail.com' || 
                    userData.name?.toLowerCase().includes('said');

                const userWithRole = { 
                    ...userData, 
                    role: isAdmin ? 'admin' : 'user' 
                };
                
                setUser(userWithRole);
                localStorage.setItem('dvl_user', JSON.stringify(userWithRole));
                return { success: true };
            }
            return { success: false, message: data.message || 'Credenciales incorrectas' };
        } catch (error) {
            return { success: false, message: 'Error de conexión con el servidor' };
        }
    };

    /**
     * Registers a new user.
     * @param {Object} userData 
     * @returns {Promise<Object>} Success status and message.
     */
    const register = async (userData) => {
        try {
            const data = await apiService.register(userData);
            
            if (data.success) {
                const name = userData.nombre || userData.name;
                const email = userData.email;

                // Asignar rol de admin si es Said Alejandro Hernandez o el correo específico
                const isAdmin = 
                    email?.toLowerCase() === 'saidhdzdno@gmail.com' || 
                    name?.toLowerCase().includes('said');

                const newUser = { 
                    name, 
                    email,
                    role: isAdmin ? 'admin' : 'user'
                };
                setUser(newUser);
                localStorage.setItem('dvl_user', JSON.stringify(newUser));
                return { success: true };
            }
            return { success: false, message: data.message || 'Error al crear la cuenta' };
        } catch (error) {
            return { success: false, message: 'Error de conexión' };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('dvl_user');
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};
