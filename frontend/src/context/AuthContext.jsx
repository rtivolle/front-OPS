import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    updateProfile
} from 'firebase/auth';
import { auth } from '../firebase';

// Configure axios base URL for production deployments
if (import.meta.env.VITE_API_BASE_URL) {
    axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;
}

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Setup automatic token refresh on 401 responses
    useEffect(() => {
        let refreshPromise = null;

        const handleUnauthorized = async (err) => {
            const originalConfig = err.config;
            
            if (err.response?.status === 401 && !originalConfig._tokenRetry) {
                originalConfig._tokenRetry = true;
                
                const currentUser = auth.currentUser;
                if (currentUser) {
                    try {
                        // Use existing refresh promise if one is in progress
                        if (!refreshPromise) {
                            refreshPromise = currentUser.getIdToken(true)
                                .finally(() => { refreshPromise = null; });
                        }
                        const freshToken = await refreshPromise;
                        
                        axios.defaults.headers.common['Authorization'] = `Bearer ${freshToken}`;
                        originalConfig.headers['Authorization'] = `Bearer ${freshToken}`;
                        return axios(originalConfig);
                    } catch (refreshErr) {
                        console.error("Token refresh failed:", refreshErr);
                        refreshPromise = null;
                        return Promise.reject(refreshErr);
                    }
                }
            }
            return Promise.reject(err);
        };

        const responseInterceptor = axios.interceptors.response.use(
            (res) => res,
            handleUnauthorized
        );

        return () => {
            axios.interceptors.response.eject(responseInterceptor);
            refreshPromise = null;
        };
    }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                try {
                    const token = await currentUser.getIdToken();
                    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                    // Sync user with backend
                    await axios.post('/api/auth/sync');
                } catch (error) {
                    console.error("Error setting up auth:", error);
                }
            } else {
                delete axios.defaults.headers.common['Authorization'];
            }
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const login = async (email, password) => {
        try {
            const result = await signInWithEmailAndPassword(auth, email, password);
            return result;
        } catch (err) {
            console.error('Login failed:', err);
            throw err;
        }
    };

    const register = async (username, email, password) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(userCredential.user, { displayName: username });
            return userCredential;
        } catch (err) {
            console.error('Registration failed:', err);
            throw err;
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
        } catch (err) {
            console.error('Logout failed:', err);
            throw err;
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading, isAuthenticated: !!user }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
