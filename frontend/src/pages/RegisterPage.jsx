import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Calculer la force du mot de passe
    if (name === 'password') {
      calculatePasswordStrength(value);
    }
    
    // Effacer les messages d'erreur lors de la saisie
    if (message) {
      setMessage('');
      setMessageType('');
    }
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    
    if (password.length >= 8) strength += 1;
    if (password.match(/[a-z]/)) strength += 1;
    if (password.match(/[A-Z]/)) strength += 1;
    if (password.match(/[0-9]/)) strength += 1;
    if (password.match(/[^a-zA-Z0-9]/)) strength += 1;
    
    setPasswordStrength(strength);
  };

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 0:
      case 1: return { text: 'Très faible', color: '#ef4444' };
      case 2: return { text: 'Faible', color: '#f59e0b' };
      case 3: return { text: 'Moyen', color: '#eab308' };
      case 4: return { text: 'Fort', color: '#22c55e' };
      case 5: return { text: 'Très fort', color: '#10b981' };
      default: return { text: '', color: '' };
    }
  };

  const validateForm = () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.confirmPassword) {
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

    if (formData.password.length < 8) {
      setMessage('Le mot de passe doit contenir au moins 8 caractères.');
      setMessageType('error');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage('Les mots de passe ne correspondent pas.');
      setMessageType('error');
      return false;
    }

    if (passwordStrength < 3) {
      setMessage('Veuillez choisir un mot de passe plus fort.');
      setMessageType('error');
      return false;
    }

    if (!acceptTerms) {
      setMessage('Vous devez accepter les conditions d\'utilisation.');
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
      const { confirmPassword, ...dataToSend } = formData;
      const response = await axios.post('/api/auth/register', dataToSend);
      
      setMessage('Inscription réussie ! Vous allez être redirigé vers la page de connexion...');
      setMessageType('success');
      
      // Redirection après 2 secondes
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      
      if (error.response) {
        const errorMessage = error.response.data.error || error.response.data.message;
        setMessage(errorMessage || 'Une erreur s\'est produite lors de l\'inscription.');
      } else if (error.request) {
        setMessage('Impossible de se connecter au serveur. Vérifiez votre connexion internet.');
      } else {
        setMessage('Une erreur inattendue s\'est produite. Veuillez réessayer.');
      }
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="form-container fade-in">
      <div className="form-header">
        <h1>Inscription</h1>
        <p>Créez votre compte Front-OPS</p>
      </div>

      {message && (
        <div className={`alert alert-${messageType}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label htmlFor="firstName" className="form-label">
              Prénom
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Votre prénom"
              required
              autoComplete="given-name"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="lastName" className="form-label">
              Nom
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Votre nom"
              required
              autoComplete="family-name"
              disabled={isLoading}
            />
          </div>
        </div>

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
              placeholder="Choisissez un mot de passe fort"
              required
              autoComplete="new-password"
              disabled={isLoading}
              style={{ paddingRight: '40px' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
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
          
          {formData.password && (
            <div style={{ marginTop: '0.5rem' }}>
              <div style={{ 
                display: 'flex', 
                gap: '2px', 
                marginBottom: '0.25rem' 
              }}>
                {[1, 2, 3, 4, 5].map((level) => (
                  <div
                    key={level}
                    style={{
                      height: '4px',
                      flex: 1,
                      backgroundColor: level <= passwordStrength 
                        ? getPasswordStrengthText().color 
                        : 'var(--border-color)',
                      borderRadius: '2px'
                    }}
                  />
                ))}
              </div>
              <p style={{ 
                fontSize: '0.8rem', 
                color: getPasswordStrengthText().color,
                margin: 0
              }}>
                Force : {getPasswordStrengthText().text}
              </p>
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword" className="form-label">
            Confirmer le mot de passe
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Confirmez votre mot de passe"
              required
              autoComplete="new-password"
              disabled={isLoading}
              style={{ paddingRight: '40px' }}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
              {showConfirmPassword ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        <div className="form-group" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
          <input
            type="checkbox"
            id="acceptTerms"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            disabled={isLoading}
            style={{ marginTop: '0.25rem' }}
          />
          <label htmlFor="acceptTerms" className="form-label" style={{ margin: 0, fontSize: '0.9rem' }}>
            J'accepte les <Link to="/terms" target="_blank">conditions d'utilisation</Link> et la{' '}
            <Link to="/privacy" target="_blank">politique de confidentialité</Link>
          </label>
        </div>

        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={isLoading}
        >
          {isLoading && <span className="loading-spinner"></span>}
          {isLoading ? 'Inscription...' : 'Créer mon compte'}
        </button>
      </form>

      <div className="form-footer">
        <p>
          Vous avez déjà un compte ? {' '}
          <Link to="/login">Se connecter</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
