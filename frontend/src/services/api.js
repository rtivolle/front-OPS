import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error);
      return Promise.reject({
        message: 'Erreur de connexion. Vérifiez votre connexion internet.',
        type: 'network'
      });
    }

    // Handle 401 errors (unauthorized)
    if (error.response.status === 401) {
      // Clear tokens and redirect to login
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      sessionStorage.removeItem('authToken');
      sessionStorage.removeItem('userData');
      
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      
      return Promise.reject({
        message: 'Session expirée. Veuillez vous reconnecter.',
        type: 'auth'
      });
    }

    // Handle rate limiting
    if (error.response.status === 429) {
      return Promise.reject({
        message: 'Trop de tentatives. Veuillez patienter quelques minutes.',
        type: 'rate_limit'
      });
    }

    // Handle server errors
    if (error.response.status >= 500) {
      return Promise.reject({
        message: 'Erreur serveur. Veuillez réessayer plus tard.',
        type: 'server'
      });
    }

    // Return API error message if available
    const apiError = error.response.data?.error || error.response.data?.message;
    return Promise.reject({
      message: apiError || 'Une erreur est survenue',
      type: 'api',
      status: error.response.status
    });
  }
);

// Auth service
export const authService = {
  // Register new user
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.success && response.data.token) {
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('userData', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Login user
  login: async (credentials, rememberMe = false) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.success && response.data.token) {
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('authToken', response.data.token);
      storage.setItem('userData', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Logout user
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      // Always clear local data
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      sessionStorage.removeItem('authToken');
      sessionStorage.removeItem('userData');
    }
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    if (response.data.success) {
      const storage = localStorage.getItem('authToken') ? localStorage : sessionStorage;
      storage.setItem('userData', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Update user details
  updateDetails: async (userData) => {
    const response = await api.put('/auth/updatedetails', userData);
    if (response.data.success) {
      const storage = localStorage.getItem('authToken') ? localStorage : sessionStorage;
      storage.setItem('userData', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Update password
  updatePassword: async (passwordData) => {
    const response = await api.put('/auth/updatepassword', passwordData);
    return response.data;
  },

  // Forgot password
  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!(localStorage.getItem('authToken') || sessionStorage.getItem('authToken'));
  },

  // Get stored user data
  getStoredUser: () => {
    const userData = localStorage.getItem('userData') || sessionStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  }
};

// Generic API service for other endpoints
export const apiService = {
  get: (url, config = {}) => api.get(url, config),
  post: (url, data = {}, config = {}) => api.post(url, data, config),
  put: (url, data = {}, config = {}) => api.put(url, data, config),
  delete: (url, config = {}) => api.delete(url, config),
  patch: (url, data = {}, config = {}) => api.patch(url, data, config)
};

export default api;
