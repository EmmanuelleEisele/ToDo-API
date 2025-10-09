# 📋 ToDo API - Gestion de Tâches Sécurisée

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-blue.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green.svg)](https://www.mongodb.com/)
[![JWT](https://img.shields.io/badge/JWT-Auth-orange.svg)](https://jwt.io/)
[![Security](https://img.shields.io/badge/Security-Hardened-red.svg)](#-sécurité)

> **API REST moderne et sécurisée** pour la gestion de tâches personnelles avec authentification JWT, validation avancée et protection multi-couches.

## ✨ Fonctionnalités

### 🔐 **Authentification & Sécurité**
- **JWT + Refresh Tokens** avec cookies HTTP-only sécurisés
- **Validation stricte des mots de passe** (8+ caractères, complexité obligatoire)
- **Protection contre XSS, NoSQL injection, attaques par force brute**
- **Rate limiting** intelligent (100 req/15min par IP)
- **Headers de sécurité** automatiques (CSP, CORS, etc.)
- **Sanitisation automatique** des entrées utilisateur
- **Anti-énumération** d'utilisateurs

### 📋 **Gestion des Tâches**
- **CRUD complet** des tâches personnelles
- **Isolation totale** des données par utilisateur
- **Validation des données** avec messages d'erreur détaillés
- **Gestion des deadlines** avec format ISO8601
- **Statuts de tâches** : pending, in-progress, completed

### 📚 **Documentation & Tests**
- **Documentation Swagger** interactive complète
- **Tests de sécurité** automatisés (12 tests)
- **Tests JWT & refresh tokens** (23 tests)
- **Gestion d'erreurs** centralisée et normalisée

## 🚀 Démarrage Rapide

### Prérequis
- **Node.js** 18+ et npm
- **MongoDB Atlas** (ou instance MongoDB locale)
- **Git** pour cloner le projet

### Installation

```bash
# 1. Cloner le projet
git clone https://github.com/EmmanuelleEisele/ToDo-API.git
cd ToDo-API

# 2. Installer les dépendances
npm install

# 3. Configurer l'environnement
cp .env.example .env
# Éditer .env avec vos paramètres MongoDB

# 4. Démarrer en développement
npm run dev

# 5. Ouvrir Swagger
# http://localhost:3000/api-docs
```

### Variables d'environnement

Créez un fichier `.env` avec :

```env
# Base de données
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/todoapi

# JWT Secrets (générez des clés sécurisées !)
ACCESS_TOKEN_SECRET=your-super-secret-access-key-here
REFRESH_TOKEN_SECRET=your-super-secret-refresh-key-here

# Environnement
NODE_ENV=development
PORT=3000
```

> ⚠️ **Important :** Utilisez des secrets JWT longs et aléatoires en production !

## 📖 Documentation API

### 🌐 Swagger UI
Documentation interactive complète disponible sur : **http://localhost:3000/api-docs**

### 🔗 Endpoints Principaux

#### 🔐 Authentication
```http
POST   /auth/register     # Créer un compte
POST   /auth/login        # Se connecter  
POST   /auth/logout       # Se déconnecter
POST   /auth/refresh      # Rafraîchir le token
POST   /auth/revoke       # Révoquer le refresh token
POST   /auth/revoke-all   # Déconnexion de tous les appareils
GET    /auth/token-info   # Infos du token actuel
```

#### 📋 Tasks
```http
GET    /tasks             # Lister mes tâches
POST   /tasks             # Créer une tâche
GET    /tasks/:id         # Récupérer une tâche
PUT    /tasks/:id         # Modifier une tâche  
DELETE /tasks/:id         # Supprimer une tâche
```

### 🛡️ Sécurité

#### Exigences des mots de passe
- **Minimum 8 caractères**
- **Au moins 1 majuscule (A-Z)**
- **Au moins 1 minuscule (a-z)**  
- **Au moins 1 chiffre (0-9)**
- **Au moins 1 caractère spécial** (!@#$%^&*...)
- **Pas de suites évidentes** (1234, abcd, qwerty...)
- **Pas de répétitions** (aaa, 111...)

#### Protection implémentée
```javascript
✅ Sanitisation XSS        ✅ Protection NoSQL injection
✅ Rate limiting           ✅ Headers sécurisés (CSP, CORS)
✅ Validation ObjectId     ✅ Anti-énumération utilisateurs  
✅ Limitation taille       ✅ Logging tentatives d'attaque
✅ JWT sécurisé           ✅ Cookies HttpOnly
```

## 🧪 Tests

```bash
# Lancer tous les tests
npm test

# Tests de sécurité uniquement  
npm test tests/__tests__/security.test.js

# Tests JWT et refresh tokens
npm test tests/__tests__/jwt.test.js
npm test tests/__tests__/refresh-adapted.test.js
```

**Couverture de tests :** 35 tests au total
- ✅ 12 tests de sécurité
- ✅ 16 tests JWT/auth  
- ✅ 7 tests refresh tokens

## 🏗️ Architecture

### Structure du projet
```
ToDo-API/
├── 📁 src/
│   ├── 📁 config/           # Configuration (Swagger, DB)
│   ├── 📁 controllers/      # Logique métier
│   │   ├── authController.js    # Authentification
│   │   ├── taskController.js    # Gestion tâches  
│   │   └── tokenController.js   # Gestion tokens
│   ├── 📁 middlewares/      # Middlewares de sécurité
│   │   ├── sanitization.js     # Nettoyage données
│   │   ├── security.js         # Headers & rate limiting
│   │   ├── passwordValidator.js # Validation mots de passe
│   │   └── auth.js             # Authentification JWT
│   ├── 📁 models/           # Modèles MongoDB
│   │   ├── User.js             # Utilisateurs
│   │   ├── Task.js             # Tâches
│   │   └── RefreshToken.js     # Tokens de rafraîchissement
│   ├── 📁 routers/          # Routes Express
│   └── 📁 helper/           # Utilitaires JWT
├── 📁 tests/                # Tests automatisés
└── 📁 Docs/                # Documentation technique
```

### Stack technique
- **Backend :** Node.js + Express.js
- **Base de données :** MongoDB + Mongoose
- **Authentification :** JWT + Refresh tokens
- **Sécurité :** Middlewares custom + validation
- **Documentation :** Swagger/OpenAPI 3.0
- **Tests :** Jest + Supertest

## 🔧 Scripts NPM

```bash
npm run dev        # Démarrage développement (watch mode)
npm start          # Démarrage production
npm test           # Lancer tous les tests
npm run docs       # Générer la documentation
```

## 📊 Codes de Réponse HTTP

| Code | Signification | Utilisation |
|------|---------------|-------------|
| `200` | ✅ Succès | Opération réussie |
| `201` | ✅ Créé | Ressource créée |
| `400` | ❌ Mauvaise requête | Données invalides/mot de passe faible |
| `401` | 🔒 Non autorisé | Token manquant/invalide/expiré |
| `404` | 🔍 Non trouvé | Ressource inexistante |
| `409` | ⚠️ Conflit | Email déjà utilisé |
| `413` | 📦 Trop volumineux | Payload > limite |
| `429` | ⏰ Trop de requêtes | Rate limiting activé |
| `500` | 💥 Erreur serveur | Erreur interne |

## 🚨 Sécurité en Production

### Recommandations essentielles

1. **Secrets JWT** : Utilisez des clés de 256+ bits générées aléatoirement
2. **HTTPS obligatoire** : Activez SSL/TLS en production
3. **Base de données** : Connexions chiffrées + whitelist IP
4. **Monitoring** : Surveillez les logs d'attaques suspectes
5. **Updates** : Maintenez les dépendances à jour

### Variables d'environnement production
```env
NODE_ENV=production
ACCESS_TOKEN_SECRET=your-256-bit-secret-here
REFRESH_TOKEN_SECRET=your-other-256-bit-secret
MONGODB_URI=mongodb+srv://prod-user:secure-password@prod-cluster
```

## 🤝 Contribution

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/new-feature`)
3. Committez vos changements (`git commit -m 'Add: nouvelle fonctionnalité'`)
4. Pushez sur la branche (`git push origin feature/new-feature`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence **MIT**. Voir le fichier `LICENSE` pour plus de détails.

## 👥 Auteur

**Emmanuelle Eisele**
- GitHub: [@EmmanuelleEisele](https://github.com/EmmanuelleEisele)
- Projet: [ToDo-API](https://github.com/EmmanuelleEisele/ToDo-API)

---

## 🔗 Liens Utiles

- 📖 **Documentation Swagger** : http://localhost:3000/api-docs
- 🧪 **Tests en ligne** : Utilisez Swagger UI ou Postman
- 🐛 **Signaler un bug** : [Issues GitHub](https://github.com/EmmanuelleEisele/ToDo-API/issues)
- 💡 **Demander une fonctionnalité** : [Discussions](https://github.com/EmmanuelleEisele/ToDo-API/discussions)

---

<div align="center">

**⭐ Si ce projet vous aide, n'hésitez pas à lui mettre une étoile ! ⭐**

*Créé avec ❤️ et beaucoup de ☕*

</div>
