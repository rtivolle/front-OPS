import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Outlet, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import './App.css';

const Layout = () => {
  const isAuthenticated = () => {
    return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('userData');
    window.location.href = '/login';
  };

  return (
    <div>
      <nav>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <Link 
              to="/" 
              style={{ 
                fontWeight: 'bold', 
                fontSize: '1.25rem',
                color: 'var(--primary-color)',
                textDecoration: 'none'
              }}
            >
              Front-OPS
            </Link>
            
            {!isAuthenticated() && (
              <ul style={{ display: 'flex', gap: '1.5rem', margin: 0, padding: 0, listStyle: 'none' }}>
                <li>
                  <Link to="/login">Connexion</Link>
                </li>
                <li>
                  <Link to="/register">Inscription</Link>
                </li>
              </ul>
            )}
          </div>

          {isAuthenticated() && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Link to="/dashboard">Tableau de bord</Link>
              <button 
                onClick={handleLogout}
                style={{
                  background: 'none',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--border-radius)',
                  padding: '0.5rem 1rem',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)',
                  fontSize: '0.9rem'
                }}
              >
                Déconnexion
              </button>
            </div>
          )}
        </div>
      </nav>
      
      <main style={{ minHeight: 'calc(100vh - 80px)' }}>
        <Outlet />
      </main>

      <footer style={{
        backgroundColor: 'var(--surface)',
        borderTop: '1px solid var(--border-color)',
        padding: '2rem',
        textAlign: 'center',
        color: 'var(--text-secondary)',
        fontSize: '0.9rem'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <p>&copy; 2025 Front-OPS. Tous droits réservés.</p>
          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <Link to="/terms">Conditions d'utilisation</Link>
            <Link to="/privacy">Politique de confidentialité</Link>
            <Link to="/contact">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Composant pour protéger les routes authentifiées
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Composant pour rediriger les utilisateurs connectés
const PublicRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route 
            index 
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            } 
          />
          <Route 
            path="login" 
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            } 
          />
          <Route 
            path="register" 
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            } 
          />
          <Route 
            path="forgot-password" 
            element={
              <PublicRoute>
                <ForgotPasswordPage />
              </PublicRoute>
            } 
          />
          <Route 
            path="dashboard" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          {/* Routes statiques */}
          <Route path="terms" element={<div className="container"><h1>Conditions d'utilisation</h1><p>Contenu des conditions d'utilisation...</p></div>} />
          <Route path="privacy" element={<div className="container"><h1>Politique de confidentialité</h1><p>Contenu de la politique de confidentialité...</p></div>} />
          <Route path="contact" element={<div className="container"><h1>Contact</h1><p>Informations de contact...</p></div>} />
          {/* Route 404 */}
          <Route path="*" element={<div className="container"><h1>Page non trouvée</h1><p>La page que vous cherchez n'existe pas.</p></div>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
