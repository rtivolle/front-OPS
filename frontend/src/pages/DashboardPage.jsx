import React, { useState, useEffect } from 'react';

const DashboardPage = () => {
  const [userData, setUserData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalTasks: 42,
    completedTasks: 28,
    pendingTasks: 14,
    todayTasks: 8,
    unreadEmails: 23,
    totalDocuments: 156,
    recentDocuments: 12
  });

  // États pour la configuration IMAP
  const [imapConfig, setImapConfig] = useState({
    host: '',
    port: 993,
    username: '',
    password: '',
    tls: true,
    connected: false
  });

  // États pour Nextcloud
  const [nextcloudConfig, setNextcloudConfig] = useState({
    serverUrl: '',
    username: '',
    password: '',
    connected: false
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

  useEffect(() => {
    // Récupérer les données utilisateur
    const storedUserData = localStorage.getItem('userData') || sessionStorage.getItem('userData');
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }
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

  const handleImapConnect = async () => {
    try {
      // Ici vous ajouteriez la logique de connexion IMAP
      console.log('Connexion IMAP...', imapConfig);
      // Simulation de connexion
      setTimeout(() => {
        setImapConfig(prev => ({ ...prev, connected: true }));
      }, 1000);
    } catch (error) {
      console.error('Erreur de connexion IMAP:', error);
    }
  };

  const handleNextcloudConnect = async () => {
    try {
      // Ici vous ajouteriez la logique de connexion Nextcloud
      console.log('Connexion Nextcloud...', nextcloudConfig);
      // Simulation de connexion
      setTimeout(() => {
        setNextcloudConfig(prev => ({ ...prev, connected: true }));
      }, 1000);
    } catch (error) {
      console.error('Erreur de connexion Nextcloud:', error);
    }
  };

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

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'email':
        return renderEmailTab();
      case 'documents':
        return renderDocumentsTab();
      case 'chat':
        return renderChatTab();
      default:
        return renderOverviewTab();
    }
  };

  const renderOverviewTab = () => (
    <>
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
          { label: 'Emails non lus', value: stats.unreadEmails, icon: '📧', color: 'var(--warning-color)' },
          { label: 'Documents', value: stats.totalDocuments, icon: '�', color: 'var(--secondary-color)' }
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
    </>
  );

  const renderEmailTab = () => (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
      gap: '2rem'
    }}>
      {/* Configuration IMAP */}
      <div style={{
        background: 'var(--surface)',
        padding: '1.5rem',
        borderRadius: 'var(--border-radius)',
        boxShadow: 'var(--shadow)'
      }}>
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          📧 Configuration Email IMAP
          {imapConfig.connected && <span style={{ color: 'var(--success-color)', fontSize: '0.8rem' }}>● Connecté</span>}
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Serveur IMAP</label>
            <input
              type="text"
              className="form-input"
              placeholder="imap.gmail.com"
              value={imapConfig.host}
              onChange={(e) => setImapConfig(prev => ({ ...prev, host: e.target.value }))}
            />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Nom d'utilisateur</label>
              <input
                type="email"
                className="form-input"
                placeholder="votre@email.com"
                value={imapConfig.username}
                onChange={(e) => setImapConfig(prev => ({ ...prev, username: e.target.value }))}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Port</label>
              <input
                type="number"
                className="form-input"
                value={imapConfig.port}
                onChange={(e) => setImapConfig(prev => ({ ...prev, port: parseInt(e.target.value) }))}
              />
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">Mot de passe</label>
            <input
              type="password"
              className="form-input"
              placeholder="Mot de passe de l'application"
              value={imapConfig.password}
              onChange={(e) => setImapConfig(prev => ({ ...prev, password: e.target.value }))}
            />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              id="tls"
              checked={imapConfig.tls}
              onChange={(e) => setImapConfig(prev => ({ ...prev, tls: e.target.checked }))}
            />
            <label htmlFor="tls" className="form-label" style={{ margin: 0 }}>
              Utiliser TLS/SSL
            </label>
          </div>
          
          <button
            onClick={handleImapConnect}
            className="btn btn-primary"
            disabled={!imapConfig.host || !imapConfig.username || !imapConfig.password}
          >
            {imapConfig.connected ? 'Reconnecter' : 'Se connecter'}
          </button>
        </div>
      </div>

      {/* Liste des emails */}
      <div style={{
        background: 'var(--surface)',
        padding: '1.5rem',
        borderRadius: 'var(--border-radius)',
        boxShadow: 'var(--shadow)'
      }}>
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>
          Emails récents
        </h2>
        
        {imapConfig.connected ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { id: 1, from: 'client@example.com', subject: 'Demande de devis urgent', time: '10:30', unread: true },
              { id: 2, from: 'team@company.com', subject: 'Réunion équipe demain', time: '09:15', unread: true },
              { id: 3, from: 'noreply@service.com', subject: 'Rapport mensuel disponible', time: 'Hier', unread: false },
              { id: 4, from: 'support@platform.com', subject: 'Mise à jour système programmée', time: 'Hier', unread: false }
            ].map((email) => (
              <div
                key={email.id}
                style={{
                  padding: '1rem',
                  background: email.unread ? '#f0f9ff' : 'var(--background)',
                  borderRadius: 'var(--border-radius)',
                  borderLeft: `4px solid ${email.unread ? 'var(--primary-color)' : 'var(--border-color)}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => e.target.style.transform = 'translateX(4px)'}
                onMouseOut={(e) => e.target.style.transform = 'translateX(0)'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <strong style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                    {email.from}
                  </strong>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                    {email.time}
                  </span>
                </div>
                <p style={{ 
                  margin: 0, 
                  color: 'var(--text-primary)', 
                  fontSize: '0.9rem',
                  fontWeight: email.unread ? '600' : '400'
                }}>
                  {email.subject}
                </p>
              </div>
            ))}
            
            <button className="btn btn-secondary" style={{ marginTop: '1rem' }}>
              Voir tous les emails
            </button>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📧</div>
            <p>Configurez votre connexion IMAP pour voir vos emails</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderDocumentsTab = () => (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
      gap: '2rem'
    }}>
      {/* Configuration Nextcloud */}
      <div style={{
        background: 'var(--surface)',
        padding: '1.5rem',
        borderRadius: 'var(--border-radius)',
        boxShadow: 'var(--shadow)'
      }}>
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          ☁️ Configuration Nextcloud
          {nextcloudConfig.connected && <span style={{ color: 'var(--success-color)', fontSize: '0.8rem' }}>● Connecté</span>}
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">URL du serveur</label>
            <input
              type="url"
              className="form-input"
              placeholder="https://cloud.example.com"
              value={nextcloudConfig.serverUrl}
              onChange={(e) => setNextcloudConfig(prev => ({ ...prev, serverUrl: e.target.value }))}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Nom d'utilisateur</label>
            <input
              type="text"
              className="form-input"
              placeholder="votre_nom_utilisateur"
              value={nextcloudConfig.username}
              onChange={(e) => setNextcloudConfig(prev => ({ ...prev, username: e.target.value }))}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Mot de passe d'application</label>
            <input
              type="password"
              className="form-input"
              placeholder="Mot de passe d'application"
              value={nextcloudConfig.password}
              onChange={(e) => setNextcloudConfig(prev => ({ ...prev, password: e.target.value }))}
            />
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.5rem 0 0 0' }}>
              Utilisez un mot de passe d'application généré dans Nextcloud
            </p>
          </div>
          
          <button
            onClick={handleNextcloudConnect}
            className="btn btn-primary"
            disabled={!nextcloudConfig.serverUrl || !nextcloudConfig.username || !nextcloudConfig.password}
          >
            {nextcloudConfig.connected ? 'Reconnecter' : 'Se connecter'}
          </button>
        </div>
      </div>

      {/* Liste des documents */}
      <div style={{
        background: 'var(--surface)',
        padding: '1.5rem',
        borderRadius: 'var(--border-radius)',
        boxShadow: 'var(--shadow)'
      }}>
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>
          Documents récents
        </h2>
        
        {nextcloudConfig.connected ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { id: 1, name: 'Rapport_Q4_2024.pdf', type: 'pdf', size: '2.3 MB', modified: 'Il y a 2h' },
              { id: 2, name: 'Presentation_Client.pptx', type: 'presentation', size: '5.1 MB', modified: 'Il y a 4h' },
              { id: 3, name: 'Budget_2025.xlsx', type: 'spreadsheet', size: '456 KB', modified: 'Hier' },
              { id: 4, name: 'Contrat_Service.docx', type: 'document', size: '1.2 MB', modified: '2 jours' },
              { id: 5, name: 'Architecture_Diagram.png', type: 'image', size: '890 KB', modified: '3 jours' }
            ].map((doc) => {
              const getIcon = (type) => {
                switch (type) {
                  case 'pdf': return '📄';
                  case 'presentation': return '📊';
                  case 'spreadsheet': return '📈';
                  case 'document': return '📝';
                  case 'image': return '🖼️';
                  default: return '📁';
                }
              };

              return (
                <div
                  key={doc.id}
                  style={{
                    padding: '1rem',
                    background: 'var(--background)',
                    borderRadius: 'var(--border-radius)',
                    border: '1px solid var(--border-color)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = 'var(--primary-color)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ fontSize: '2rem' }}>
                    {getIcon(doc.type)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: '0 0 0.25rem 0', fontWeight: '500', color: 'var(--text-primary)' }}>
                      {doc.name}
                    </p>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {doc.size} • Modifié {doc.modified}
                    </p>
                  </div>
                  <button
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--primary-color)',
                      cursor: 'pointer',
                      padding: '0.5rem',
                      borderRadius: '4px'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('Télécharger', doc.name);
                    }}
                  >
                    ⬇️
                  </button>
                </div>
              );
            })}
            
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button className="btn btn-primary" style={{ flex: 1 }}>
                📁 Parcourir les dossiers
              </button>
              <button className="btn btn-secondary" style={{ flex: 1 }}>
                📤 Uploader un fichier
              </button>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>☁️</div>
            <p>Configurez votre connexion Nextcloud pour accéder à vos documents</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
