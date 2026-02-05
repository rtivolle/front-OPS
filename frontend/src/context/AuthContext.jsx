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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/';
axios.defaults.baseURL = API_BASE_URL;

const getAuthErrorMessage = (error, action) => {
    const messages = {
        'auth/email-already-in-use': 'Email is already in use.',
        'auth/invalid-email': 'Invalid email address.',
        'auth/weak-password': 'Password is too weak.',
        'auth/invalid-credential': 'Invalid email or password.',
        'auth/user-not-found': 'Invalid email or password.',
        'auth/wrong-password': 'Invalid email or password.',
        'auth/too-many-requests': 'Too many attempts. Please try again later.'
    };

    return messages[error.code] || `Unable to ${action}. Please try again.`;
};

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const requestInterceptor = axios.interceptors.request.use(async (config) => {
            const currentUser = auth.currentUser;

            if (currentUser) {
                try {
                    const token = await currentUser.getIdToken();
                    config.headers = config.headers || {};
                    config.headers.Authorization = `Bearer ${token}`;
                } catch (error) {
                    console.error('Failed to attach auth token:', error);
                }
            }

            return config;
        });

        const responseInterceptor = axios.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;

                if (error.response?.status === 401 && auth.currentUser && originalRequest && !originalRequest._retry) {
                    try {
                        originalRequest._retry = true;
                        const refreshedToken = await auth.currentUser.getIdToken(true);
                        originalRequest.headers = originalRequest.headers || {};
                        originalRequest.headers.Authorization = `Bearer ${refreshedToken}`;
                        return axios(originalRequest);
                    } catch (refreshError) {
                        console.error('Token refresh failed:', refreshError);
                    }
                }

                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.request.eject(requestInterceptor);
            axios.interceptors.response.eject(responseInterceptor);
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
            return await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            error.friendlyMessage = getAuthErrorMessage(error, 'log in');
            throw error;
        }
    };

    const register = async (username, email, password) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(userCredential.user, { displayName: username });
            return userCredential;
        } catch (error) {
            error.friendlyMessage = getAuthErrorMessage(error, 'create account');
            throw error;
        }
    };

    const logout = async () => {
        try {
            return await signOut(auth);
        } catch (error) {
            error.friendlyMessage = 'Failed to log out. Please try again.';
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading, isAuthenticated: !!user }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
