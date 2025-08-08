import { useState, useEffect, useContext, createContext, useCallback } from 'react';
import { authService } from '../services/api';

// Create auth context
const AuthContext = createContext({});

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      console.warn('Logout error');
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  // Initialize auth state
  const initializeAuth = useCallback(async () => {
    try {
      if (authService.isAuthenticated()) {
        const userData = authService.getStoredUser();
        if (userData) {
          setUser(userData);
          setIsAuthenticated(true);
          
          // Optionally verify token with server
          try {
            const response = await authService.getCurrentUser();
            if (response.success) {
              setUser(response.user);
            }
          } catch {
            // If token is invalid, clear auth state
            await logout();
          }
        }
      }
    } catch {
      console.error('Auth initialization error');
      await logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const login = async (credentials, rememberMe = false) => {
    try {
      setLoading(true);
      const response = await authService.login(credentials, rememberMe);
      
      if (response.success) {
        setUser(response.user);
        setIsAuthenticated(true);
        return { success: true, user: response.user };
      }
      
      throw new Error(response.error || 'Login failed');
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await authService.register(userData);
      
      if (response.success) {
        setUser(response.user);
        setIsAuthenticated(true);
        return { success: true, user: response.user };
      }
      
      throw new Error(response.error || 'Registration failed');
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (userData) => {
    const response = await authService.updateDetails(userData);
    if (response.success) {
      setUser(response.user);
      return { success: true, user: response.user };
    }
    throw new Error(response.error || 'Update failed');
  };

  const updatePassword = async (passwordData) => {
    const response = await authService.updatePassword(passwordData);
    if (response.success) {
      // Password update successful, user stays logged in with new token
      return { success: true };
    }
    throw new Error(response.error || 'Password update failed');
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
    updatePassword,
    refreshUser: initializeAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Hook for protected routes
export const useAuthRequired = () => {
  const { user, loading, isAuthenticated } = useAuth();
  
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = '/login';
    }
  }, [loading, isAuthenticated]);

  return { user, loading, isAuthenticated };
};

export default AuthContext;
