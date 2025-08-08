// Gestion des traductions pour l'application
const translations = {
  fr: {
    // Navigation
    dashboard: 'Tableau de bord',
    overview: 'Vue d\'ensemble',
    tasks: 'Tâches',
    team: 'Équipe',
    reports: 'Rapports',
    chat: 'Chat AI',
    settings: 'Paramètres',
    logout: 'Déconnexion',

    // Dashboard
    welcomeBack: 'Bon retour',
    quickActions: 'Actions rapides',
    recentActivity: 'Activité récente',
    statistics: 'Statistiques',
    totalTasks: 'Total des tâches',
    completedTasks: 'Tâches terminées',
    pendingTasks: 'Tâches en attente',
    todayTasks: 'Tâches du jour',

    // Settings
    languageSettings: 'Langue de l\'interface',
    languageDescription: 'Choisissez votre langue préférée pour l\'interface utilisateur.',
    passwordSettings: 'Changer le mot de passe',
    passwordDescription: 'Modifiez votre mot de passe pour sécuriser votre compte.',
    currentPassword: 'Mot de passe actuel',
    newPassword: 'Nouveau mot de passe',
    confirmPassword: 'Confirmer le nouveau mot de passe',
    changePassword: 'Changer le mot de passe',
    changingPassword: 'Changement en cours...',

    // Messages
    passwordSuccess: 'Mot de passe changé avec succès !',
    passwordMismatch: 'Les nouveaux mots de passe ne correspondent pas.',
    passwordTooShort: 'Le nouveau mot de passe doit contenir au moins 8 caractères.',
    connectionError: 'Erreur de connexion au serveur.',

    // Auth
    login: 'Connexion',
    register: 'Inscription',
    email: 'Email',
    password: 'Mot de passe',
    firstName: 'Prénom',
    lastName: 'Nom',
    rememberMe: 'Se souvenir de moi',
    forgotPassword: 'Mot de passe oublié ?',
    signIn: 'Se connecter',
    signUp: 'S\'inscrire',
    alreadyHaveAccount: 'Vous avez déjà un compte ?',
    noAccount: 'Vous n\'avez pas de compte ?'
  },

  en: {
    // Navigation
    dashboard: 'Dashboard',
    overview: 'Overview',
    tasks: 'Tasks',
    team: 'Team',
    reports: 'Reports',
    chat: 'AI Chat',
    settings: 'Settings',
    logout: 'Logout',

    // Dashboard
    welcomeBack: 'Welcome back',
    quickActions: 'Quick Actions',
    recentActivity: 'Recent Activity',
    statistics: 'Statistics',
    totalTasks: 'Total Tasks',
    completedTasks: 'Completed Tasks',
    pendingTasks: 'Pending Tasks',
    todayTasks: 'Today\'s Tasks',

    // Settings
    languageSettings: 'Interface Language',
    languageDescription: 'Choose your preferred language for the user interface.',
    passwordSettings: 'Change Password',
    passwordDescription: 'Modify your password to secure your account.',
    currentPassword: 'Current Password',
    newPassword: 'New Password',
    confirmPassword: 'Confirm New Password',
    changePassword: 'Change Password',
    changingPassword: 'Changing...',

    // Messages
    passwordSuccess: 'Password changed successfully!',
    passwordMismatch: 'New passwords do not match.',
    passwordTooShort: 'New password must contain at least 8 characters.',
    connectionError: 'Server connection error.',

    // Auth
    login: 'Login',
    register: 'Register',
    email: 'Email',
    password: 'Password',
    firstName: 'First Name',
    lastName: 'Last Name',
    rememberMe: 'Remember me',
    forgotPassword: 'Forgot password?',
    signIn: 'Sign In',
    signUp: 'Sign Up',
    alreadyHaveAccount: 'Already have an account?',
    noAccount: 'Don\'t have an account?'
  }
};

// Hook pour utiliser les traductions
export const useTranslation = () => {
  const language = localStorage.getItem('language') || 'fr';
  
  const t = (key, defaultValue = key) => {
    return translations[language]?.[key] || translations.fr[key] || defaultValue;
  };

  return { t, language };
};

// Fonction pour changer la langue
export const changeLanguage = (newLanguage) => {
  localStorage.setItem('language', newLanguage);
  window.dispatchEvent(new Event('languageChange'));
};

export default translations;
