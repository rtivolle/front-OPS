import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success', 'error', 'warning'
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  // Vérifier si l'utilisateur est déjà connecté
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      // Optionnel : vérifier la validité du token
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Effacer les messages d'erreur lors de la saisie
    if (message) {
      setMessage('');
      setMessageType('');
    }
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setMessage('Veuillez remplir tous les champs requis.');
      setMessageType('error');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setMessage('Veuillez entrer une adresse email valide.');
      setMessageType('error');
      return false;
    }

    if (formData.password.length < 6) {
      setMessage('Le mot de passe doit contenir au moins 6 caractères.');
      setMessageType('error');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setMessage('');
    setMessageType('');

    try {
      const response = await axios.post('/api/auth/login', formData);
      
      // Stockage du token
      const { token, user } = response.data;
      if (rememberMe) {
        localStorage.setItem('authToken', token);
        localStorage.setItem('userData', JSON.stringify(user));
      } else {
        sessionStorage.setItem('authToken', token);
        sessionStorage.setItem('userData', JSON.stringify(user));
      }

      setMessage('Connexion réussie ! Redirection en cours...');
      setMessageType('success');
      
      // Redirection après 1.5 secondes
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);

    } catch (error) {
      console.error('Erreur de connexion:', error);
      
      if (error.response) {
        // Erreur du serveur avec réponse
        const errorMessage = error.response.data.error || error.response.data.message;
        setMessage(errorMessage || 'Identifiants incorrects.');
      } else if (error.request) {
        // Erreur réseau
        setMessage('Impossible de se connecter au serveur. Vérifiez votre connexion internet.');
      } else {
        // Autre erreur
        setMessage('Une erreur inattendue s\'est produite. Veuillez réessayer.');
      }
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="form-container fade-in">
      <div className="form-header">
        <h1>Connexion</h1>
        <p>Connectez-vous à votre compte Front-OPS</p>
      </div>

      {message && (
        <div className={`alert alert-${messageType}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="email" className="form-label">
            Adresse email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="form-input"
            placeholder="votre@email.com"
            required
            autoComplete="email"
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="password" className="form-label">
            Mot de passe
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Votre mot de passe"
              required
              autoComplete="current-password"
              disabled={isLoading}
              style={{ paddingRight: '40px' }}
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-secondary)',
                fontSize: '14px'
              }}
              disabled={isLoading}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input
            type="checkbox"
            id="rememberMe"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            disabled={isLoading}
          />
          <label htmlFor="rememberMe" className="form-label" style={{ margin: 0, fontSize: '0.9rem' }}>
            Se souvenir de moi
          </label>
        </div>

        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={isLoading}
        >
          {isLoading && <span className="loading-spinner"></span>}
          {isLoading ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>

      <div className="form-footer">
        <p>
          Pas encore de compte ? {' '}
          <Link to="/register">Créer un compte</Link>
        </p>
        <p style={{ marginTop: '0.5rem' }}>
          <Link to="/forgot-password">Mot de passe oublié ?</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
