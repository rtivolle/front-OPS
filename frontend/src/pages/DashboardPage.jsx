import React, { useState, useEffect } from 'react';
import { useTranslation } from '../utils/translations';

const DashboardPage = () => {
  const { t, language: currentLanguage } = useTranslation();
  const [userData, setUserData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats] = useState({
    totalTasks: 42,
    completedTasks: 28,
    pendingTasks: 14,
    todayTasks: 8
  });

  // États pour le chat AI
  const [chatMessages, setChatMessages] = useState([
    { id: 1, text: 'Bonjour ! Comment puis-je vous aider aujourd\'hui ?', sender: 'ai', timestamp: new Date() }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [aiConfig, setAiConfig] = useState({
    endpoint: 'http://localhost:11434/api/generate',
    model: 'llama2',
    connected: false
  });

  // États pour les paramètres
  const [language, setLanguage] = useState(currentLanguage);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordChangeLoading, setPasswordChangeLoading] = useState(false);
  const [passwordChangeMessage, setPasswordChangeMessage] = useState('');

  useEffect(() => {
    // Récupérer les données utilisateur
    const storedUserData = localStorage.getItem('userData') || sessionStorage.getItem('userData');
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }

    // Écouter les changements de langue
    const handleLanguageChange = () => {
      setLanguage(localStorage.getItem('language') || 'fr');
    };

    window.addEventListener('languageChange', handleLanguageChange);
    
    return () => {
      window.removeEventListener('languageChange', handleLanguageChange);
    };
  }, []);

  const quickActions = [
    { title: 'Nouvelle tâche', icon: '➕', action: () => console.log('Nouvelle tâche') },
    { title: 'Gérer équipe', icon: '👥', action: () => console.log('Gérer équipe') },
    { title: 'Rapports', icon: '📊', action: () => console.log('Rapports') },
    { title: 'Paramètres', icon: '⚙️', action: () => console.log('Paramètres') }
  ];

  const recentActivities = [
    { id: 1, text: 'Tâche "Révision du code" complétée', time: 'Il y a 2h', type: 'success' },
    { id: 2, text: 'Nouveau membre ajouté à l\'équipe', time: 'Il y a 4h', type: 'info' },
    { id: 3, text: 'Rapport mensuel généré', time: 'Il y a 1j', type: 'warning' },
    { id: 4, text: 'Sauvegarde automatique effectuée', time: 'Il y a 2j', type: 'info' }
  ];

  const handleChatSend = async () => {
    if (!chatInput.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: chatInput,
      sender: 'user',
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');

    try {
      // Ici vous ajouteriez la logique pour communiquer avec votre AI local
      const response = await fetch(aiConfig.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: aiConfig.model,
          prompt: chatInput,
          stream: false
        })
      });

      if (response.ok) {
        const data = await response.json();
        const aiMessage = {
          id: Date.now() + 1,
          text: data.response || 'Désolé, je n\'ai pas pu traiter votre demande.',
          sender: 'ai',
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error('Erreur de communication avec l\'AI');
      }
    } catch (error) {
      console.error('Erreur AI:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Désolé, je ne peux pas me connecter à l\'AI en ce moment.',
        sender: 'ai',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    }
  };

  // Fonction pour changer la langue
  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
    // Ici on pourrait ajouter la logique pour recharger les textes dans la nouvelle langue
    window.dispatchEvent(new Event('languageChange'));
  };

  // Fonction pour changer le mot de passe
  const changePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordChangeMessage(t('passwordMismatch'));
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordChangeMessage(t('passwordTooShort'));
      return;
    }

    setPasswordChangeLoading(true);
    setPasswordChangeMessage('');

    try {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      const response = await fetch('http://localhost:5000/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        setPasswordChangeMessage(t('passwordSuccess'));
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        setPasswordChangeMessage(data.message || 'Erreur lors du changement de mot de passe.');
      }
    } catch (error) {
      console.error('Erreur changement mot de passe:', error);
      setPasswordChangeMessage(t('connectionError'));
    } finally {
      setPasswordChangeLoading(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'tasks':
        return renderTasksTab();
      case 'team':
        return renderTeamTab();
      case 'reports':
        return renderReportsTab();
      case 'chat':
        return renderChatTab();
      case 'settings':
        return renderSettingsTab();
      default:
        return renderOverviewTab();
    }
  };

  const renderOverviewTab = () => (
    <div>
      {/* Statistiques */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {[
          { label: 'Total tâches', value: stats.totalTasks, icon: '📋', color: 'var(--primary-color)' },
          { label: 'Terminées', value: stats.completedTasks, icon: '✅', color: 'var(--success-color)' },
          { label: 'En attente', value: stats.pendingTasks, icon: '⏳', color: 'var(--warning-color)' },
          { label: 'Aujourd\'hui', value: stats.todayTasks, icon: '📅', color: 'var(--error-color)' }
        ].map((stat, index) => (
          <div
            key={index}
            style={{
              background: 'var(--surface)',
              padding: '1.5rem',
              borderRadius: 'var(--border-radius)',
              boxShadow: 'var(--shadow)',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}
          >
            <div style={{
              fontSize: '2rem',
              width: '60px',
              height: '60px',
              background: `${stat.color}15`,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {stat.icon}
            </div>
            <div>
              <h3 style={{ 
                fontSize: '2rem', 
                fontWeight: 'bold', 
                color: stat.color,
                margin: 0
              }}>
                {stat.value}
              </h3>
              <p style={{ 
                color: 'var(--text-secondary)', 
                margin: 0,
                fontSize: '0.9rem'
              }}>
                {stat.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '2rem'
      }}>
        {/* Actions rapides */}
        <div style={{
          background: 'var(--surface)',
          padding: '1.5rem',
          borderRadius: 'var(--border-radius)',
          boxShadow: 'var(--shadow)'
        }}>
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>
            Actions rapides
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '1rem'
          }}>
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className="btn btn-secondary"
                style={{
                  padding: '1rem',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <div style={{ fontSize: '2rem' }}>
                  {action.icon}
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: '500' }}>
                  {action.title}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Activités récentes */}
        <div style={{
          background: 'var(--surface)',
          padding: '1.5rem',
          borderRadius: 'var(--border-radius)',
          boxShadow: 'var(--shadow)'
        }}>
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>
            Activités récentes
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                style={{
                  padding: '1rem',
                  background: 'var(--background)',
                  borderRadius: 'var(--border-radius)',
                  borderLeft: `4px solid ${
                    activity.type === 'success' ? 'var(--success-color)' :
                    activity.type === 'warning' ? 'var(--warning-color)' :
                    'var(--primary-color)'
                  }`
                }}
              >
                <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.9rem' }}>
                  {activity.text}
                </p>
                <p style={{ 
                  margin: 0, 
                  fontSize: '0.8rem', 
                  color: 'var(--text-secondary)' 
                }}>
                  {activity.time}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderTasksTab = () => (
    <div style={{
      background: 'var(--surface)',
      padding: '2rem',
      borderRadius: 'var(--border-radius)',
      boxShadow: 'var(--shadow)',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📋</div>
      <h2 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>
        Gestion des tâches
      </h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        Cette section sera développée pour gérer vos tâches et projets.
      </p>
      <button className="btn btn-primary">
        Créer une nouvelle tâche
      </button>
    </div>
  );

  const renderTeamTab = () => (
    <div style={{
      background: 'var(--surface)',
      padding: '2rem',
      borderRadius: 'var(--border-radius)',
      boxShadow: 'var(--shadow)',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>👥</div>
      <h2 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>
        Gestion d'équipe
      </h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        Cette section sera développée pour gérer votre équipe et les collaborateurs.
      </p>
      <button className="btn btn-primary">
        Inviter un membre
      </button>
    </div>
  );

  const renderReportsTab = () => (
    <div style={{
      background: 'var(--surface)',
      padding: '2rem',
      borderRadius: 'var(--border-radius)',
      boxShadow: 'var(--shadow)',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📊</div>
      <h2 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>
        Rapports et analyses
      </h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        Cette section sera développée pour visualiser vos données et générer des rapports.
      </p>
      <button className="btn btn-primary">
        Générer un rapport
      </button>
    </div>
  );

  const renderChatTab = () => (
    <div style={{
      background: 'var(--surface)',
      padding: '1.5rem',
      borderRadius: 'var(--border-radius)',
      boxShadow: 'var(--shadow)',
      height: '600px',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        🤖 Assistant AI Local
        <span style={{ 
          color: aiConfig.connected ? 'var(--success-color)' : 'var(--error-color)',
          fontSize: '0.8rem' 
        }}>
          ● {aiConfig.connected ? 'Connecté' : 'Déconnecté'}
        </span>
      </h2>

      {/* Configuration AI */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '1rem',
        padding: '1rem',
        background: 'var(--background)',
        borderRadius: 'var(--border-radius)',
        fontSize: '0.9rem'
      }}>
        <div className="form-group" style={{ flex: 1 }}>
          <label className="form-label">Endpoint AI</label>
          <input
            type="text"
            className="form-input"
            value={aiConfig.endpoint}
            onChange={(e) => setAiConfig(prev => ({ ...prev, endpoint: e.target.value }))}
            placeholder="http://localhost:11434/api/generate"
          />
        </div>
        <div className="form-group" style={{ flex: 1 }}>
          <label className="form-label">Modèle</label>
          <input
            type="text"
            className="form-input"
            value={aiConfig.model}
            onChange={(e) => setAiConfig(prev => ({ ...prev, model: e.target.value }))}
            placeholder="llama2"
          />
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--border-radius)',
        padding: '1rem',
        marginBottom: '1rem',
        background: 'var(--background)'
      }}>
        {chatMessages.map((message) => (
          <div
            key={message.id}
            style={{
              marginBottom: '1rem',
              display: 'flex',
              justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start'
            }}
          >
            <div
              style={{
                maxWidth: '70%',
                padding: '0.75rem 1rem',
                borderRadius: '1rem',
                background: message.sender === 'user' 
                  ? 'var(--primary-color)' 
                  : 'var(--surface)',
                color: message.sender === 'user' 
                  ? 'white' 
                  : 'var(--text-primary)',
                fontSize: '0.9rem',
                boxShadow: 'var(--shadow)'
              }}
            >
              <p style={{ margin: 0 }}>{message.text}</p>
              <div style={{
                fontSize: '0.7rem',
                opacity: 0.7,
                marginTop: '0.25rem'
              }}>
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          type="text"
          className="form-input"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleChatSend()}
          placeholder="Tapez votre message..."
          style={{ flex: 1 }}
        />
        <button
          onClick={handleChatSend}
          className="btn btn-primary"
          disabled={!chatInput.trim()}
        >
          Envoyer
        </button>
      </div>
    </div>
  );

  const renderSettingsTab = () => (
    <div>
      <h2 style={{
        color: 'var(--text-primary)',
        marginBottom: '2rem',
        fontSize: '1.5rem',
        fontWeight: '600'
      }}>
        {t('settings')}
      </h2>

      <div style={{
        display: 'grid',
        gap: '2rem',
        maxWidth: '800px'
      }}>
        {/* Section Langue */}
        <div style={{
          background: 'var(--surface)',
          padding: '1.5rem',
          borderRadius: 'var(--border-radius)',
          border: '1px solid var(--border-color)'
        }}>
          <h3 style={{
            color: 'var(--text-primary)',
            marginBottom: '1rem',
            fontSize: '1.2rem',
            fontWeight: '500'
          }}>
            🌍 {t('languageSettings')}
          </h3>
          <p style={{
            color: 'var(--text-secondary)',
            marginBottom: '1rem',
            fontSize: '0.9rem'
          }}>
            {t('languageDescription')}
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => changeLanguage('fr')}
              style={{
                padding: '0.75rem 1.5rem',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--border-radius)',
                background: language === 'fr' ? 'var(--primary-color)' : 'var(--surface)',
                color: language === 'fr' ? 'white' : 'var(--text-primary)',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: language === 'fr' ? '500' : '400'
              }}
            >
              🇫🇷 Français
            </button>
            <button
              onClick={() => changeLanguage('en')}
              style={{
                padding: '0.75rem 1.5rem',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--border-radius)',
                background: language === 'en' ? 'var(--primary-color)' : 'var(--surface)',
                color: language === 'en' ? 'white' : 'var(--text-primary)',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: language === 'en' ? '500' : '400'
              }}
            >
              🇺🇸 English
            </button>
          </div>
        </div>

        {/* Section Changement de mot de passe */}
        <div style={{
          background: 'var(--surface)',
          padding: '1.5rem',
          borderRadius: 'var(--border-radius)',
          border: '1px solid var(--border-color)'
        }}>
          <h3 style={{
            color: 'var(--text-primary)',
            marginBottom: '1rem',
            fontSize: '1.2rem',
            fontWeight: '500'
          }}>
            🔒 {t('passwordSettings')}
          </h3>
          <p style={{
            color: 'var(--text-secondary)',
            marginBottom: '1rem',
            fontSize: '0.9rem'
          }}>
            {t('passwordDescription')}
          </p>
          
          <div style={{ display: 'grid', gap: '1rem', maxWidth: '400px' }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                fontWeight: '500'
              }}>
                {t('currentPassword')}
              </label>
              <input
                type="password"
                className="form-input"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                placeholder={t('currentPassword')}
              />
            </div>
            
            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                fontWeight: '500'
              }}>
                {t('newPassword')}
              </label>
              <input
                type="password"
                className="form-input"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                placeholder={t('newPassword')}
              />
            </div>
            
            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                fontWeight: '500'
              }}>
                {t('confirmPassword')}
              </label>
              <input
                type="password"
                className="form-input"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder={t('confirmPassword')}
              />
            </div>
            
            {passwordChangeMessage && (
              <div style={{
                padding: '0.75rem',
                borderRadius: 'var(--border-radius)',
                background: passwordChangeMessage.includes('succès') || passwordChangeMessage.includes('success') ? '#d4edda' : '#f8d7da',
                border: `1px solid ${passwordChangeMessage.includes('succès') || passwordChangeMessage.includes('success') ? '#c3e6cb' : '#f5c6cb'}`,
                color: passwordChangeMessage.includes('succès') || passwordChangeMessage.includes('success') ? '#155724' : '#721c24',
                fontSize: '0.9rem'
              }}>
                {passwordChangeMessage}
              </div>
            )}
            
            <button
              onClick={changePassword}
              disabled={passwordChangeLoading || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'var(--primary-color)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--border-radius)',
                cursor: passwordChangeLoading ? 'not-allowed' : 'pointer',
                fontSize: '0.9rem',
                fontWeight: '500',
                opacity: passwordChangeLoading ? 0.7 : 1
              }}
            >
              {passwordChangeLoading ? t('changingPassword') : t('changePassword')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--background)',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
    }}>
      {/* Header */}
      <header style={{
        background: 'var(--surface)',
        boxShadow: 'var(--shadow)',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: 'var(--primary-color)',
          margin: 0
        }}>
          Dashboard
        </h1>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {userData && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--text-primary)'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'var(--primary-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold'
              }}>
                {userData.firstName?.charAt(0)}{userData.lastName?.charAt(0)}
              </div>
              <span style={{ fontWeight: '500' }}>
                {userData.firstName} {userData.lastName}
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Navigation */}
      <nav style={{
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border-color)',
        padding: '0 2rem',
        display: 'flex',
        gap: '2rem'
      }}>
        {[
          { id: 'overview', label: 'Vue d\'ensemble', icon: '🏠' },
          { id: 'tasks', label: 'Tâches', icon: '📋' },
          { id: 'team', label: 'Équipe', icon: '👥' },
          { id: 'reports', label: 'Rapports', icon: '📊' },
          { id: 'chat', label: 'Chat AI', icon: '🤖' },
          { id: 'settings', label: 'Paramètres', icon: '⚙️' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: 'none',
              border: 'none',
              padding: '1rem 0',
              color: activeTab === tab.id ? 'var(--primary-color)' : 'var(--text-secondary)',
              borderBottom: activeTab === tab.id ? '2px solid var(--primary-color)' : '2px solid transparent',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease'
            }}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Main Content */}
      <main style={{
        padding: '2rem',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {renderTabContent()}
      </main>
    </div>
  );
};

export default DashboardPage;
