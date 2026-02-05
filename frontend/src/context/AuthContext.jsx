import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('authToken'));

    useEffect(() => {
        if (token) {
            // Validate token or just set user as "Authenticated" for now
            // Ideally call /api/auth/me to get user details
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setUser({ email: 'user@example.com' }); // Placeholder until we have a real /me endpoint
        } else {
            delete axios.defaults.headers.common['Authorization'];
            setUser(null);
        }
        setLoading(false);
    }, [token]);

    const login = async (email, password) => {
        const response = await axios.post('/api/auth/login', { email, password });
        const newToken = response.data.token;
        localStorage.setItem('authToken', newToken);
        setToken(newToken);
        return response.data;
    };

    const register = async (username, email, password) => {
        await axios.post('/api/auth/register', { username, email, password });
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
