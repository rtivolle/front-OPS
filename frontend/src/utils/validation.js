// Validation utilities for frontend

// Email validation
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password strength validation
export const validatePassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const errors = [];
  
  if (password.length < minLength) {
    errors.push(`Le mot de passe doit contenir au moins ${minLength} caractères`);
  }
  
  if (!hasUpperCase) {
    errors.push('Le mot de passe doit contenir au moins une lettre majuscule');
  }
  
  if (!hasLowerCase) {
    errors.push('Le mot de passe doit contenir au moins une lettre minuscule');
  }
  
  if (!hasNumbers) {
    errors.push('Le mot de passe doit contenir au moins un chiffre');
  }
  
  if (!hasSpecialChar) {
    errors.push('Le mot de passe doit contenir au moins un caractère spécial');
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength: getPasswordStrength(password)
  };
};

// Calculate password strength
export const getPasswordStrength = (password) => {
  let score = 0;
  
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  
  if (score < 3) return { level: 'weak', color: '#ff4757', text: 'Faible' };
  if (score < 5) return { level: 'medium', color: '#ffa502', text: 'Moyen' };
  return { level: 'strong', color: '#2ed573', text: 'Fort' };
};

// Name validation
export const validateName = (name) => {
  const nameRegex = /^[a-zA-ZÀ-ÿ\s-']{2,50}$/;
  
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: 'Ce champ est requis' };
  }
  
  if (!nameRegex.test(name.trim())) {
    return { 
      isValid: false, 
      error: 'Le nom ne peut contenir que des lettres, espaces, tirets et apostrophes' 
    };
  }
  
  if (name.trim().length < 2) {
    return { isValid: false, error: 'Le nom doit contenir au moins 2 caractères' };
  }
  
  if (name.trim().length > 50) {
    return { isValid: false, error: 'Le nom ne peut pas dépasser 50 caractères' };
  }
  
  return { isValid: true, error: null };
};

// Form validation helper
export const validateForm = (formData, rules) => {
  const errors = {};
  let isValid = true;

  Object.keys(rules).forEach(field => {
    const value = formData[field];
    const fieldRules = rules[field];

    if (fieldRules.required && (!value || value.trim() === '')) {
      errors[field] = 'Ce champ est requis';
      isValid = false;
      return;
    }

    if (value && fieldRules.email && !validateEmail(value)) {
      errors[field] = 'Veuillez entrer une adresse email valide';
      isValid = false;
      return;
    }

    if (value && fieldRules.name) {
      const nameValidation = validateName(value);
      if (!nameValidation.isValid) {
        errors[field] = nameValidation.error;
        isValid = false;
        return;
      }
    }

    if (value && fieldRules.password) {
      const passwordValidation = validatePassword(value);
      if (!passwordValidation.isValid) {
        errors[field] = passwordValidation.errors[0];
        isValid = false;
        return;
      }
    }

    if (value && fieldRules.minLength && value.length < fieldRules.minLength) {
      errors[field] = `Ce champ doit contenir au moins ${fieldRules.minLength} caractères`;
      isValid = false;
      return;
    }

    if (value && fieldRules.maxLength && value.length > fieldRules.maxLength) {
      errors[field] = `Ce champ ne peut pas dépasser ${fieldRules.maxLength} caractères`;
      isValid = false;
      return;
    }

    if (fieldRules.match && formData[fieldRules.match] !== value) {
      errors[field] = 'Les mots de passe ne correspondent pas';
      isValid = false;
      return;
    }
  });

  return { isValid, errors };
};

// Debounce utility for input validation
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Format utilities
export const formatDate = (date) => {
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
};

export const formatRelativeTime = (date) => {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now - past) / 1000);

  if (diffInSeconds < 60) return 'À l\'instant';
  if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} min`;
  if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)} h`;
  if (diffInSeconds < 2592000) return `Il y a ${Math.floor(diffInSeconds / 86400)} j`;
  
  return formatDate(date);
};

// Storage utilities
export const storage = {
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key) || sessionStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error getting ${key} from storage:`, error);
      return defaultValue;
    }
  },
  
  set: (key, value, useSessionStorage = false) => {
    try {
      const storage = useSessionStorage ? sessionStorage : localStorage;
      storage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting ${key} in storage:`, error);
    }
  },
  
  remove: (key) => {
    try {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key} from storage:`, error);
    }
  }
};
