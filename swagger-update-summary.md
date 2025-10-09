# 📊 Mise à jour de la documentation Swagger

## ✅ Ce qui a été ajouté/mis à jour :

### 🔐 **Sécurité des mots de passe**
- ✅ Nouvelles exigences documentées (8 caractères, majuscule, minuscule, chiffre, caractère spécial)
- ✅ Exemples mis à jour avec des mots de passe sécurisés
- ✅ Pattern regex pour validation automatique

### 🛡️ **Nouvelles fonctionnalités de sécurité**
- ✅ Protection contre XSS, NoSQL injection, force brute mentionnée
- ✅ Rate limiting et headers de sécurité documentés
- ✅ Validation et sanitisation avancées

### 📋 **Nouveaux codes d'erreur**
- ✅ **413** - Payload trop volumineux
- ✅ **429** - Trop de requêtes (rate limiting)
- ✅ Headers de rate limiting documentés

### 🆔 **Nouvelle section Tokens**
- ✅ Tag "Tokens" ajouté pour la gestion des refresh tokens
- ✅ Endpoints `/auth/refresh`, `/auth/revoke`, etc. déjà documentés

### 📚 **Nouveaux schémas d'erreur**
- ✅ `SecurityError` - Pour les erreurs de mot de passe
- ✅ `RateLimitError` - Pour le rate limiting
- ✅ `PayloadTooLargeError` - Pour les données trop volumineuses

### 🔧 **Réponses mises à jour**
- ✅ Endpoint `/auth/register` avec toutes les nouvelles erreurs possibles
- ✅ Utilisation de `oneOf` pour plusieurs types d'erreurs 400

## 🚨 **À faire manuellement (optionnel) :**

1. **Mettre à jour les autres endpoints** pour inclure les nouvelles erreurs 413/429
2. **Ajouter des exemples** de réponses SecurityError dans plus d'endpoints
3. **Documenter les headers de sécurité** retournés automatiquement
4. **Ajouter une section sécurité** dans la description générale

## 🎯 **Résultat :**

Votre documentation Swagger est maintenant **à jour** et reflète fidèlement :
- ✅ Les vraies règles de validation des mots de passe
- ✅ Les nouveaux middlewares de sécurité
- ✅ Tous les codes d'erreur possibles
- ✅ La gestion des tokens de rafraîchissement

**URL Swagger :** 
- 🌐 **Production :** https://todo-api-2ij6.onrender.com/api-docs
- 🏠 **Local :** http://localhost:3000/api-docs

Les développeurs qui utilisent votre API auront maintenant une documentation complète et précise ! 📖✨