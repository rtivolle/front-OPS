# Front-OPS Frontend

Ce dossier contient le code source du frontend de l'application Front-OPS, développé avec React et Vite.

## 🚀 Fonctionnalités

- **Authentification complète** : Connexion, inscription, récupération de mot de passe
- **Interface moderne** : Design responsive avec CSS variables et animations
- **Gestion d'état** : Gestion des tokens d'authentification (localStorage/sessionStorage)
- **Validation de formulaires** : Validation côté client avec feedback utilisateur
- **Indicateur de force de mot de passe** : Aide l'utilisateur à choisir un mot de passe sécurisé
- **Navigation protégée** : Routes publiques et privées avec redirection automatique
- **Tableau de bord** : Interface utilisateur avec statistiques et actions rapides

## 🏗️ Structure du projet

```
frontend/
├── public/                 # Fichiers statiques
│   └── vite.svg
├── src/
│   ├── assets/            # Images et ressources
│   │   └── react.svg
│   ├── pages/             # Composants de pages
│   │   ├── LoginPage.jsx          # Page de connexion
│   │   ├── RegisterPage.jsx       # Page d'inscription  
│   │   ├── DashboardPage.jsx      # Tableau de bord
│   │   └── ForgotPasswordPage.jsx # Récupération mot de passe
│   ├── App.jsx            # Composant racine avec routing
│   ├── App.css            # Styles principaux de l'application
│   ├── index.css          # Reset CSS et styles globaux
│   └── main.jsx           # Point d'entrée de l'application
├── index.html             # Template HTML
├── package.json           # Dépendances et scripts
├── vite.config.js         # Configuration Vite
└── eslint.config.js       # Configuration ESLint
```

## 📦 Installation

1. Placez-vous dans le dossier `frontend` :
   ```bash
   cd frontend
   ```

2. Installez les dépendances :
   ```bash
   npm install
   ```

## 🚀 Démarrage

Pour démarrer le serveur de développement :
```bash
npm run dev
```
L'application sera accessible à l'adresse : **http://localhost:5173**

## 📝 Scripts disponibles

- `npm run dev` : Démarre le serveur de développement avec hot reload
- `npm run build` : Génère la version de production dans le dossier `dist`
- `npm run preview` : Prévisualise la version de production localement
- `npm run lint` : Analyse le code avec ESLint

## 🎨 Design System

L'application utilise un système de design cohérent avec :

### Variables CSS
- **Couleurs** : Palette de couleurs avec mode clair/sombre
- **Espacement** : Système d'espacement uniforme
- **Typographie** : Police Inter pour une meilleure lisibilité
- **Ombres** : Système d'ombres cohérent

### Composants réutilisables
- **Formulaires** : Champs de saisie stylisés avec validation
- **Boutons** : Boutons primaires et secondaires avec états
- **Alertes** : Messages de succès, d'erreur et d'avertissement
- **Conteneurs** : Layouts responsives

## 🔐 Authentification

### Fonctionnalités d'authentification
- **Connexion** : Email/mot de passe avec option "Se souvenir de moi"
- **Inscription** : Formulaire complet avec validation
- **Récupération** : Processus de récupération de mot de passe
- **Sécurité** : Indicateur de force de mot de passe

### Gestion des tokens
- **Session** : Token stocké en sessionStorage (temporaire)
- **Persistance** : Token stocké en localStorage (permanent)
- **Redirection** : Redirection automatique selon l'état d'authentification

## 📱 Responsive Design

L'application est entièrement responsive et optimisée pour :
- **Desktop** : Layout pleine largeur avec navigation horizontale
- **Tablet** : Adaptation des grilles et espacement
- **Mobile** : Navigation verticale et formulaires optimisés

## 🛠️ Technologies utilisées

### Framework et outils
- **React 19.1.1** : Bibliothèque UI moderne
- **Vite 7.1.0** : Bundler rapide avec HMR
- **React Router 7.8.0** : Navigation côté client

### HTTP et state management
- **Axios 1.11.0** : Client HTTP pour les API calls
- **Local/Session Storage** : Gestion de l'état d'authentification

### Qualité de code
- **ESLint** : Linting avec règles React
- **CSS moderne** : Variables CSS, Grid, Flexbox

## 🔧 Configuration

### Variables d'environnement
Créez un fichier `.env` pour les variables d'environnement :
```env
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=Front-OPS
```

### Configuration Vite
Le fichier `vite.config.js` contient la configuration du serveur de développement.

## 🎯 Fonctionnalités futures

- [ ] Mode sombre/clair
- [ ] Authentification à deux facteurs
- [ ] Notifications push
- [ ] Gestion des rôles utilisateur
- [ ] Internationalisation (i18n)
- [ ] Tests unitaires et d'intégration

## 🤝 Contribution

1. **Code style** : Respectez les règles ESLint configurées
2. **Composants** : Créez des composants réutilisables
3. **Responsive** : Testez sur différentes tailles d'écran
4. **Accessibilité** : Respectez les standards WCAG

## 📧 Support

Pour toute question ou suggestion, contactez l'équipe de développement.

---

**Projet Front-OPS** - Application de gestion opérationnelle