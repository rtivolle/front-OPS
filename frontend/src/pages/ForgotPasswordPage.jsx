import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const validateEmail = () => {
    if (!email) {
      setMessage('Veuillez entrer votre adresse email.');
      setMessageType('error');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage('Veuillez entrer une adresse email valide.');
      setMessageType('error');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateEmail()) {
      return;
    }

    setIsLoading(true);
    setMessage('');
    setMessageType('');

    try {
      await axios.post('/api/auth/forgot-password', { email });
      
      setMessage(
        'Un email de réinitialisation a été envoyé à votre adresse. ' +
        'Vérifiez votre boîte de réception et suivez les instructions.'
      );
      setMessageType('success');
      setEmailSent(true);

    } catch (error) {
      console.error('Erreur lors de la demande de réinitialisation:', error);
      
      if (error.response) {
        const errorMessage = error.response.data.error || error.response.data.message;
        if (error.response.status === 404) {
          setMessage('Aucun compte associé à cette adresse email n\'a été trouvé.');
        } else {
          setMessage(errorMessage || 'Une erreur s\'est produite.');
        }
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

  const handleInputChange = (e) => {
    setEmail(e.target.value);
    
    // Effacer les messages d'erreur lors de la saisie
    if (message) {
      setMessage('');
      setMessageType('');
    }
  };

  return (
    <div className="form-container fade-in">
      <div className="form-header">
        <h1>Mot de passe oublié</h1>
        <p>
          {emailSent 
            ? 'Email envoyé avec succès' 
            : 'Entrez votre email pour réinitialiser votre mot de passe'
          }
        </p>
      </div>

      {message && (
        <div className={`alert alert-${messageType}`}>
          {message}
        </div>
      )}

      {!emailSent ? (
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Adresse email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={handleInputChange}
              className="form-input"
              placeholder="votre@email.com"
              required
              autoComplete="email"
              disabled={isLoading}
              autoFocus
            />
            <p style={{ 
              fontSize: '0.8rem', 
              color: 'var(--text-secondary)', 
              marginTop: '0.5rem',
              margin: '0.5rem 0 0 0'
            }}>
              Nous vous enverrons un lien pour réinitialiser votre mot de passe.
            </p>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading && <span className="loading-spinner"></span>}
            {isLoading ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation'}
          </button>
        </form>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '4rem',
            marginBottom: '1rem',
            color: 'var(--success-color)'
          }}>
            ✉️
          </div>
          
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: 'var(--success-color)', marginBottom: '1rem' }}>
              Email envoyé !
            </h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Si un compte associé à <strong>{email}</strong> existe, 
              vous recevrez un email avec les instructions pour réinitialiser votre mot de passe.
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '1rem' }}>
              N'oubliez pas de vérifier votre dossier spam.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <button
              onClick={() => {
                setEmailSent(false);
                setEmail('');
                setMessage('');
                setMessageType('');
              }}
              className="btn btn-secondary"
            >
              Essayer avec une autre adresse
            </button>
            
            <Link to="/login" className="btn btn-primary" style={{ textDecoration: 'none' }}>
              Retour à la connexion
            </Link>
          </div>
        </div>
      )}

      {!emailSent && (
        <div className="form-footer">
          <p>
            Vous vous souvenez de votre mot de passe ? {' '}
            <Link to="/login">Se connecter</Link>
          </p>
          <p style={{ marginTop: '0.5rem' }}>
            Pas encore de compte ? {' '}
            <Link to="/register">Créer un compte</Link>
          </p>
        </div>
      )}
    </div>
  );
};

export default ForgotPasswordPage;
