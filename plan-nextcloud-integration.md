# Plan pour l'intégration de Nextcloud avec OCR et recherche (Étape 1)

## Objectif principal
Créer un système fonctionnel de gestion de documents intégré à Nextcloud avec OCR, indexation, et une interface de recherche simple.

---

## Liste des tâches (sous-tâches simples et détaillées)

### Semaine 1 : Mise en place de l'infrastructure de base

#### 1. Création de l'infrastructure de base
- [ ] Créer deux conteneurs/VM sur Proxmox :
  - [ ] Nom : **nc-core** pour Nextcloud
  - [ ] Nom : **doc-worker** pour les traitements OCR et indexation
  - [ ] Assigner des adresses IP fixes
  - [ ] Configurer les pare-feu pour sécuriser les conteneurs

#### 2. Configuration des datasets ZFS sur Proxmox
- [ ] Créer un dataset pour stocker les données Nextcloud (zfs/nc_data)
- [ ] Créer un dataset pour stocker l’index des documents (zfs/doc_index)
- [ ] Configurer des snapshots horaires et journaliers

#### 3. Initialisation du dépôt Git
- [x] Créer une structure de fichier pour un **monorepo**
- [x] Ajouter un fichier `docker-compose.yml` pour déployer **nc-core** et **doc-worker**
- [x] Ajouter des Dockerfiles pour chaque service :
  - [x] Dockerfile pour nc-core
  - [x] Dockerfile pour doc-worker

#### 4. Déploiement de Nextcloud (**nc-core**) - DONE - DONE - DONE - DONE
- [x] Installer :
  - [x] Nginx
  - [x] PHP 8.2
  - [x] Postgres
  - [x] Redis
- [x] Configurer Nextcloud :
  - [x] **memcache.local** et **memcache.locking** sur Redis
  - [x] Activer le verrouillage des fichiers
  - [x] Désactiver les prévisualisations au départ
  - [x] Limite max de téléchargement : 200 MB
  - [x] Activer le cron (fréquence : 5 minutes)
- [x] Créer un **compte service** (exemple : `doc-bot`) et un group **test**

#### 5. Configuration du Webhook Flow
- [ ] Activer Flow dans Nextcloud
- [ ] Créer une règle :
  - [ ] Déclenchement à l’upload/mise à jour d’un fichier dans le dossier `/Inbox/**`
  - [ ] Envoi d’un POST HTTP vers le service **doc-worker**
- [ ] Authentification du webhook via un jeton d’application ou une clé secrète partagée

#### 6. Développement du squelette de **doc-worker**
- [ ] Configuration de base de FastAPI et des routes nécessaires :
  - [ ] Endpoint `/hook/nextcloud` pour valider et traiter les notifications HTTP
- [ ] Implémenter le téléchargement des fichiers via WebDAV avec un app password dédié au compte service
- [ ] Mettre en place une queue Celery connectée à Redis avec une tâche basique :
  - [ ] Prototype de tâche `ocr_and_index(path, fileId)`

#### 7. Implémentation de l’OCR et stockage texte
- [ ] Ajouter la gestion des OCRs avec **OCRmyPDF** et **Tesseract** (langues : FR/EN)
- [ ] Si le fichier est une image : convertir en PDF avant traitement
- [ ] Implémenter le stockage du texte extrait et des métadonnées (nom, chemin, hash, owner, horodatage) dans la base de données du **doc-worker**

#### 8. Mise en place de l’index et de l’API de recherche
- [ ] Configurer Qdrant/Chroma pour créer une collection “docs”
- [ ] Implémenter un endpoint `/search?q=...` sur le service **doc-worker** qui :
  - [ ] Accepte une requête de recherche (ex : `/search?q=<text>`)
  - [ ] Renvoie une liste des résultats avec les champs : `score`, `extrait`, `lien NC`, et mettre en place un surlignage naïf

#### 9. Création d’une interface utilisateur minimale
- [ ] Développer une page web simple (FastAPI + template Jinja ou React)
- [ ] Ajouter un champ de recherche pour les utilisateurs et afficher 10 résultats avec :
  - Titre du document
  - Extrait (texte OCR extrait)
  - Un lien direct vers le fichier dans Nextcloud

#### 10. Vérifications et tests (S1)
- [ ] Tester : upload d’un document scanné dans `/Inbox`
- [ ] Vérifier que le texte OCR est indexé avec une latence inférieure à 30 secondes pour un document A4
- [ ] Vérifier que le texte est consultable depuis la page de recherche
- [ ] Mettre en place des journaux (JSON) pour suivre les étapes du traitement

---

### Semaine 2 : Améliorations et robustesse

#### 1. Gestion des fichiers volumineux et robustesse
- [ ] Ajouter une confirmation d’événement “post-upload” (éviter déclenchement prématuré)
- [ ] Mettre en place des mécanismes de retry/backoff en cas d’échec
- [ ] Gérer l’idempotence via un hash des fichiers

#### 2. Amélioration de la qualité OCR
- [ ] Ajouter des prétraitements pour améliorer la qualité OCR :
  - [ ] Correction de rotation (deskew)
  - [ ] Réduction de bruit (denoise)
  - [ ] Détection automatique de la langue source (FR/EN)
- [ ] Mesurer le taux de caractères reconnus sur 10 documents de test (objectif : > 95 % de reconnaissance sur des scans clairs)

#### 3. Index et génération de résumés
- [x] Implémenter un nouvel endpoint `/summarize?id=...` dans **doc-worker** qui génère un résumé pour un document donné
- [x] Utiliser un modèle CPU (3–8B, ex. llama.cpp) pour générer des résumés courts

#### 4. Renforcement de la sécurité
- [x] Créer un `app password` dédié pour le compte bot dans Nextcloud
- [x] Activer TLS pour les communications internes entre les conteneurs
- [x] Configurer une liste blanche d’adresses IP autorisées à accéder au système
- [x] Restreindre les permissions de Flow aux utilisateurs du groupe test uniquement

#### 5. Observabilité et sauvegardes
- [ ] Mettre en place un dashboard simple avec les métriques suivantes :
  - Nombre de documents traités par jour
  - Temps moyen pour l’OCR
  - Nombre d’échecs par étape
- [ ] Configurer des sauvegardes pour Nextcloud (données + DB) via PBS
- [ ] Implémenter un mécanisme pour réaliser des dumps quotidiens de l’index (Qdrant/Chroma)

#### 6. Démonstration et validation
- [ ] Réaliser une démo avec un jeu de 10–20 documents (exemples : factures, contrats, reçus)
- [ ] Vérifier la latence typique et récapituler les problèmes rencontrés
- [ ] Rédiger une liste d’éventuels irritants ou points bloquants observés
- [ ] Organiser une revue GO/NO-GO pour valider ou réorienter le projet

---

## Points d’attention spécifiques

### Si vous choisissez Nextcloud :
- Ne pas modifier les fichiers source. Stoker les résultats OCR et leurs métadonnées dans une base du côté **doc-worker**, en gardant des références aux fichiers d’origine dans Nextcloud.
- Éviter l’activation du chiffrement de bout en bout pour les dossiers traités.
- Choisir une application Flow permettant d’envoyer un HTTP POST simple avec les métadonnées essentielles.
- Conserver les versions dans Nextcloud (pour l’utilisateur) et prévoir des snapshots ZFS (pour la gestion admin).

### Si vous choisissez pipeline simple :
- Démarrer avec une interface utilisateur simple pour permettre une recherche et un aperçu rapides.
- Gestion des droits limitée, avec des règles simplifiées (lecture seule pour SMB, et écriture seulement dans un répertoire `/inbox`).
- Les triggers locaux (inotify/fswatch) fonctionnent bien, mais pour des postes distants, prévoir une approche Syncthing/rsync.

---