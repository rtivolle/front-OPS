# Front-OPS

> Une application de gestion opérationnelle moderne développée avec React et Node.js

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19.1.1-blue.svg)](https://reactjs.org/)

## 🚀 Vue d'ensemble

Front-OPS est une application full-stack de gestion opérationnelle qui permet aux équipes de gérer leurs tâches, collaborateurs et projets de manière efficace. L'application est construite avec une architecture moderne séparant le frontend (React) et le backend (Node.js/Express).

### ✨ Fonctionnalités principales

- **Authentification complète** : Inscription, connexion, récupération de mot de passe
- **Tableau de bord interactif** : Vue d'ensemble avec statistiques et actions rapides
- **Gestion des tâches** : Création, suivi et gestion des tâches
- **Chat AI intégré** : Assistant intelligent pour améliorer la productivité
- **Interface responsive** : Design adaptatif pour tous les appareils
- **Sécurité renforcée** : JWT, rate limiting, validation des données
- **Multilingue** : Support français et anglais

## 🏗️ Architecture du projet

```
front-OPS/
├── backend/                    # API Node.js/Express
│   ├── middleware/            # Middlewares d'authentification et sécurité
│   ├── models/               # Modèles MongoDB (User, Document, etc.)
│   ├── routes/              # Routes API
│   ├── index.js             # Point d'entrée du serveur
│   └── package.json         # Dépendances backend
├── frontend/                  # Application React
│   ├── src/
│   │   ├── pages/          # Composants de pages (Login, Dashboard, etc.)
│   │   ├── hooks/          # Hooks React personnalisés
│   │   ├── services/       # Services API et utilitaires
│   │   ├── utils/          # Fonctions utilitaires
│   │   └── App.jsx         # Composant racine avec routing
│   └── package.json        # Dépendances frontend
└── README.md               # Ce fichier
```

## 📦 Installation

### Prérequis

- **Node.js** 18.0.0 ou plus récent
- **npm** 9.0.0 ou plus récent
- **MongoDB** (local ou distant)

### Installation rapide

1. **Cloner le repository**
   ```bash
   git clone https://github.com/rtivolle/front-OPS.git
   cd front-OPS
   ```

2. **Installer les dépendances backend**
   ```bash
   cd backend
   npm install
   ```

3. **Installer les dépendances frontend**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Configuration de l'environnement**
   ```bash
   cd ../backend
   cp .env.example .env
   # Éditer le fichier .env avec vos configurations
   ```

## ⚙️ Configuration

### Variables d'environnement (Backend)

Créez un fichier `.env` dans le dossier `backend/` :

```env
# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017/front-ops

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
JWT_COOKIE_EXPIRE=7

# Server Configuration
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173

# Email Configuration (optionnel)
EMAIL_FROM=noreply@front-ops.com
EMAIL_HOST=
EMAIL_PORT=
EMAIL_USER=
EMAIL_PASS=

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
AUTH_RATE_LIMIT_MAX=5

# Security
BCRYPT_ROUNDS=12
ACCOUNT_LOCK_TIME=2
MAX_LOGIN_ATTEMPTS=5
```

### Configuration Frontend

Les variables d'environnement du frontend sont gérées par Vite. Créez un fichier `.env` dans le dossier `frontend/` si nécessaire :

```env
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=Front-OPS
```

## 🚀 Démarrage

### Développement

1. **Démarrer le backend** (Terminal 1)
   ```bash
   cd backend
   npm run dev
   ```
   Le serveur API démarre sur http://localhost:5000

2. **Démarrer le frontend** (Terminal 2)
   ```bash
   cd frontend
   npm run dev
   ```
   L'application web démarre sur http://localhost:5173

### Production

1. **Build du frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Démarrage du backend en production**
   ```bash
   cd backend
   NODE_ENV=production npm start
   ```

## 📝 Scripts disponibles

### Backend
- `npm start` : Démarre le serveur en mode production
- `npm run dev` : Démarre le serveur en mode développement avec nodemon
- `npm test` : Exécute les tests (à implémenter)
- `npm run lint` : Vérifie la qualité du code avec ESLint
- `npm run lint:fix` : Corrige automatiquement les erreurs ESLint

### Frontend
- `npm run dev` : Démarre le serveur de développement Vite
- `npm run build` : Génère la version de production
- `npm run preview` : Prévisualise la version de production
- `npm run lint` : Vérifie la qualité du code avec ESLint
- `npm run lint:fix` : Corrige automatiquement les erreurs ESLint
- `npm test` : Exécute les tests avec Vitest (à configurer)

## 🛠️ Technologies utilisées

### Backend
- **Express.js** : Framework web pour Node.js
- **MongoDB** avec **Mongoose** : Base de données NoSQL
- **JWT** : Authentification par tokens
- **bcryptjs** : Hachage des mots de passe
- **Helmet** : Sécurisation des en-têtes HTTP
- **CORS** : Gestion des requêtes cross-origin
- **Rate Limiting** : Protection contre les attaques DDoS

### Frontend
- **React 19.1.1** : Bibliothèque UI moderne
- **Vite 7.1.0** : Bundler rapide avec HMR
- **React Router 7.8.0** : Navigation côté client
- **Axios** : Client HTTP pour les API calls
- **CSS Variables** : Système de design cohérent

### Outils de développement
- **ESLint** : Linting et qualité de code
- **Nodemon** : Rechargement automatique du serveur
- **Terser** : Minification JavaScript

## 🔐 Sécurité

- **Authentification JWT** : Tokens sécurisés avec expiration
- **Hachage des mots de passe** : bcrypt avec 12 rounds
- **Rate Limiting** : Protection contre les attaques par force brute
- **Validation des données** : Validation côté serveur et client
- **Headers de sécurité** : Configuration Helmet
- **CORS** : Configuration restrictive des origines

## 🎨 Interface utilisateur

### Design System
- **Palette de couleurs** : Variables CSS pour un thème cohérent
- **Typographie** : Police Inter pour une meilleure lisibilité
- **Composants réutilisables** : Boutons, formulaires, alertes
- **Responsive Design** : Adaptation mobile et desktop

### Pages disponibles
- **Connexion** : Authentification avec option "Se souvenir de moi"
- **Inscription** : Formulaire complet avec validation
- **Tableau de bord** : Vue d'ensemble avec statistiques
- **Chat AI** : Interface pour l'assistant intelligent
- **Paramètres** : Gestion du profil et préférences

## 🔧 API Endpoints

### Authentification
- `POST /api/auth/register` : Inscription d'un nouvel utilisateur
- `POST /api/auth/login` : Connexion utilisateur
- `POST /api/auth/logout` : Déconnexion
- `GET /api/auth/me` : Profil utilisateur actuel
- `PUT /api/auth/updatedetails` : Mise à jour du profil
- `PUT /api/auth/updatepassword` : Changement de mot de passe
- `POST /api/auth/forgot-password` : Récupération de mot de passe

### Santé de l'application
- `GET /health` : Vérification de l'état du serveur

## 🧪 Tests

Les tests ne sont pas encore implémentés. Framework prévu :
- **Backend** : Jest
- **Frontend** : Vitest

## 🚧 Fonctionnalités à venir

- [ ] Tests unitaires et d'intégration
- [ ] Gestion avancée des tâches
- [ ] Système de notifications
- [ ] Gestion des rôles et permissions
- [ ] Rapports et analytics
- [ ] Mode sombre/clair
- [ ] Authentification à deux facteurs
- [ ] API REST complète
- [ ] Documentation API avec Swagger

## 🐛 Dépannage

### Problèmes courants

1. **Erreur de connexion MongoDB**
   ```
   MongoDB connection error: The `uri` parameter must be a string
   ```
   **Solution** : Vérifiez que `MONGO_URI` est défini dans votre fichier `.env`

2. **Port déjà utilisé**
   ```
   Error: listen EADDRINUSE :::5000
   ```
   **Solution** : Changez le port dans `.env` ou arrêtez le processus utilisant le port

3. **Erreurs de CORS**
   **Solution** : Vérifiez que `FRONTEND_URL` dans le backend correspond à l'URL du frontend

4. **Erreurs ESLint**
   **Solution** : Exécutez `npm run lint:fix` pour corriger automatiquement

### Logs utiles

- **Backend** : Les logs du serveur s'affichent dans la console
- **Frontend** : Utilisez les outils de développement du navigateur

## 🤝 Contribution

1. **Fork** le projet
2. **Créez** une branche pour votre fonctionnalité (`git checkout -b feature/amazing-feature`)
3. **Commitez** vos changements (`git commit -m 'Add amazing feature'`)
4. **Push** vers la branche (`git push origin feature/amazing-feature`)
5. **Ouvrez** une Pull Request

### Conventions de code

- Respectez les configurations ESLint
- Utilisez des noms de variables explicites
- Commentez le code complexe
- Testez vos modifications

## 📄 Licence

Ce projet est sous licence ISC. Voir le fichier `LICENSE` pour plus de détails.

## 👥 Équipe

- **Romain Tivolle** - Développeur principal - [@rtivolle](https://github.com/rtivolle)

## 📞 Support

Pour toute question ou suggestion :
- Ouvrez une [issue](https://github.com/rtivolle/front-OPS/issues)
- Contactez l'équipe de développement

---

**Front-OPS** © 2025 - Application de gestion opérationnelle moderne