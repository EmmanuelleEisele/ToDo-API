import request from 'supertest';
import app from '../../index.js';
import User from '../../src/models/User.js';
import RefreshToken from '../../src/models/RefreshToken.js';
import argon2 from 'argon2';

describe('Tests Refresh Token - Système Actuel', () => {
  let testUser;
  let userId;

  beforeEach(async () => {
    const hashedPassword = await argon2.hash('password123');
    testUser = new User({
      firstname: 'Test',
      lastname: 'Refresh',
      email: 'refresh@test.com',
      password: hashedPassword
    });
    await testUser.save();
    userId = testUser._id;
  });

  describe('🔄 Endpoint Refresh Token', () => {
    
    it('devrait rafraîchir un token valide', async () => {
      // Se connecter pour obtenir un refresh token
      const loginResponse = await request(app)
        .post('/auth/login')
        .send({
          email: 'strict@test.com',
          password: 'password123'
        });

      const cookies = loginResponse.headers['set-cookie'];
      const refreshCookie = cookies.find(cookie => cookie.startsWith('refreshToken='));

      // Utiliser le refresh token
      const refreshResponse = await request(app)
        .post('/auth/refresh')
        .set('Cookie', refreshCookie)
        .expect(200);

      expect(refreshResponse.body).toHaveProperty('message', 'Token rafraîchi avec succès');
      expect(refreshResponse.body).toHaveProperty('token');
      expect(typeof refreshResponse.body.token).toBe('string');
    });

    it('devrait rejeter une demande sans refresh token', async () => {
      const response = await request(app)
        .post('/auth/refresh')
        .expect(401);

      expect(response.body).toHaveProperty('status', 'fail');
      expect(response.body.message).toMatch(/refresh token.*manquant/i);
    });

    it('devrait rejeter un refresh token invalide', async () => {
      const fakeRefreshToken = 'refreshToken=fake_token; HttpOnly';
      
      const response = await request(app)
        .post('/auth/refresh')
        .set('Cookie', fakeRefreshToken)
        .expect(401);

      expect(response.body).toHaveProperty('status', 'fail');
      expect(response.body.message).toMatch(/refresh token.*invalide/i);
    });

    it('devrait renouveler le refresh token lors du refresh', async () => {
      // Login initial
      const loginResponse = await request(app)
        .post('/auth/login')
        .send({
          email: 'strict@test.com',
          password: 'password123'
        });

      const originalTokenDoc = await RefreshToken.findOne({ userId });
      const originalToken = originalTokenDoc.token;

      const cookies = loginResponse.headers['set-cookie'];
      const refreshCookie = cookies.find(cookie => cookie.startsWith('refreshToken='));

      // Refresh
      await request(app)
        .post('/auth/refresh')
        .set('Cookie', refreshCookie)
        .expect(200);

      // Vérifier que le token a changé
      const newTokenDoc = await RefreshToken.findOne({ userId });
      expect(newTokenDoc.token).not.toBe(originalToken);
      expect(newTokenDoc._id.toString()).toBe(originalTokenDoc._id.toString()); // Même document
    });
  });

  describe('🔒 Logout Strict', () => {
    
    it('devrait supprimer TOUS les refresh tokens au logout', async () => {
      // Se connecter plusieurs fois pour créer plusieurs tokens
      const login1 = await request(app)
        .post('/auth/login')
        .send({
          email: 'strict@test.com',
          password: 'password123'
        });

      const token = login1.body.token;

      // Vérifier qu'il y a un token
      let tokenCount = await RefreshToken.countDocuments({ userId });
      expect(tokenCount).toBe(1);

      // Se déconnecter
      await request(app)
        .post('/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // Vérifier que tous les tokens sont supprimés
      tokenCount = await RefreshToken.countDocuments({ userId });
      expect(tokenCount).toBe(0);
    });

    it('devrait supprimer les tokens même sans authentification Bearer', async () => {
      // Login pour créer un refresh token
      const loginResponse = await request(app)
        .post('/auth/login')
        .send({
          email: 'strict@test.com',
          password: 'password123'
        });

      const cookies = loginResponse.headers['set-cookie'];
      const refreshCookie = cookies.find(cookie => cookie.startsWith('refreshToken='));

      // Logout avec juste le cookie (sans Bearer token)
      await request(app)
        .post('/auth/logout')
        .set('Cookie', refreshCookie)
        .expect(200);

      // Vérifier que le token est supprimé
      const tokenCount = await RefreshToken.countDocuments({ userId });
      expect(tokenCount).toBe(0);
    });
  });

  describe('🧹 Nettoyage Automatique', () => {
    
    it('devrait nettoyer les tokens d\'utilisateurs supprimés', async () => {
      // Créer un token
      await request(app)
        .post('/auth/login')
        .send({
          email: 'strict@test.com',
          password: 'password123'
        });

      // Vérifier que le token existe
      let tokenCount = await RefreshToken.countDocuments({ userId });
      expect(tokenCount).toBe(1);

      // Supprimer l'utilisateur (simulation de suppression de compte)
      await User.findByIdAndDelete(userId);

      // Tenter un refresh (devrait nettoyer automatiquement)
      const fakeRefreshToken = await RefreshToken.findOne({});
      const refreshCookie = `refreshToken=${fakeRefreshToken.token}; HttpOnly`;
      
      await request(app)
        .post('/auth/refresh')
        .set('Cookie', refreshCookie)
        .expect(401);

      // Le token devrait être nettoyé automatiquement
      tokenCount = await RefreshToken.countDocuments({ userId });
      expect(tokenCount).toBe(0);
    });
  });

  describe('⚡ Sécurité Avancée', () => {
    
    it('devrait empêcher la réutilisation d\'anciens refresh tokens', async () => {
      // Login initial
      const loginResponse = await request(app)
        .post('/auth/login')
        .send({
          email: 'strict@test.com',
          password: 'password123'
        });

      const cookies = loginResponse.headers['set-cookie'];
      const oldRefreshCookie = cookies.find(cookie => cookie.startsWith('refreshToken='));

      // Premier refresh (renouvelle le token)
      await request(app)
        .post('/auth/refresh')
        .set('Cookie', oldRefreshCookie)
        .expect(200);

      // Tenter de réutiliser l'ancien refresh token
      const response = await request(app)
        .post('/auth/refresh')
        .set('Cookie', oldRefreshCookie)
        .expect(401);

      expect(response.body.message).toMatch(/refresh token.*invalide/i);
    });

    it('devrait limiter à un seul refresh token par utilisateur', async () => {
      // Premier login
      await request(app)
        .post('/auth/login')
        .send({
          email: 'strict@test.com',
          password: 'password123'
        });

      // Deuxième login (devrait remplacer le premier token)
      await request(app)
        .post('/auth/login')
        .send({
          email: 'strict@test.com',
          password: 'password123'
        });

      // Vérifier qu'il n'y a qu'un seul token
      const tokenCount = await RefreshToken.countDocuments({ userId });
      expect(tokenCount).toBe(1);
    });
  });
});

/*
📚 GESTION STRICTE DES REFRESH TOKENS :

🔄 RENOUVELLEMENT :
- Endpoint /auth/refresh pour renouveler les tokens
- Remplacement automatique du refresh token
- Invalidation des anciens tokens après utilisation

🔒 SÉCURITÉ RENFORCÉE :
- Un seul refresh token par utilisateur
- Suppression de tous les tokens au logout
- Nettoyage automatique des tokens orphelins
- Expiration automatique après 7 jours

🧹 NETTOYAGE :
- Middleware de nettoyage automatique
- Suppression des tokens d'utilisateurs supprimés
- Prévention de l'accumulation de tokens

⚡ AVANTAGES :
- Sécurité maximale contre le vol de tokens
- Gestion proactive des sessions
- Prévention des fuites de mémoire
- Conformité aux bonnes pratiques de sécurité
*/