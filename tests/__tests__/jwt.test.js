import request from 'supertest';
import app from '../../index.js';
import User from '../../src/models/User.js';
import RefreshToken from '../../src/models/RefreshToken.js';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';

describe('Tests JWT et Refresh Tokens', () => {
  let testUser;
  let validToken;
  let refreshToken;
  let userId;

  // Créer un utilisateur de test avant chaque test
  beforeEach(async () => {
    const hashedPassword = await argon2.hash('password123');
    testUser = new User({
      firstname: 'Test',
      lastname: 'JWT',
      email: 'jwt@test.com',
      password: hashedPassword
    });
    await testUser.save();
    userId = testUser._id;
  });

  describe('🔑 Génération et Validation des JWT', () => {
    
    it('devrait générer un token JWT valide lors du login', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'jwt@test.com',
          password: 'password123'
        })
        .expect(200);

      // Vérifier que le token est présent
      expect(response.body).toHaveProperty('token');
      expect(typeof response.body.token).toBe('string');
      expect(response.body.token.length).toBeGreaterThan(20);

      // Vérifier que le token peut être décodé
      const decoded = jwt.verify(response.body.token, process.env.JWT_SECRET);
      expect(decoded).toHaveProperty('id');
      expect(decoded.id).toBe(userId.toString());
      
      validToken = response.body.token;
    });

    it('devrait rejeter un token JWT invalide', async () => {
      const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImZha2UiLCJpYXQiOjE2MDAwMDAwMDAsImV4cCI6MTYwMDAwMzYwMH0.fake_signature';
      
      const response = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${fakeToken}`)
        .expect(401);

      expect(response.body).toHaveProperty('status', 'fail');
      expect(response.body.message).toMatch(/token.*invalide/i);
    });

    it('devrait rejeter un token JWT expiré', async () => {
      // Créer un token expiré (exp dans le passé)
      const expiredToken = jwt.sign(
        { id: userId.toString() }, 
        process.env.JWT_SECRET, 
        { expiresIn: '-1h' } // Expiré depuis 1h
      );

      const response = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);

      expect(response.body).toHaveProperty('status', 'fail');
      expect(response.body.message).toMatch(/token.*expiré/i);
    });

    it('devrait rejeter un token avec une signature incorrecte', async () => {
      // Créer un token avec une mauvaise signature
      const tokenWithWrongSecret = jwt.sign(
        { id: userId.toString() }, 
        'mauvaise_signature', 
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${tokenWithWrongSecret}`)
        .expect(401);

      expect(response.body).toHaveProperty('status', 'fail');
    });

    it('devrait rejeter un token avec un utilisateur inexistant', async () => {
      const fakeUserId = '507f1f77bcf86cd799439011';
      const tokenWithFakeUser = jwt.sign(
        { id: fakeUserId }, 
        process.env.JWT_SECRET, 
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${tokenWithFakeUser}`)
        .expect(401);

      expect(response.body).toHaveProperty('status', 'fail');
    });
  });

  describe('🔄 Gestion des Refresh Tokens', () => {
    
    it('devrait créer un refresh token lors du login', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'jwt@test.com',
          password: 'password123'
        })
        .expect(200);

      // Vérifier que le cookie refresh token est présent
      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      
      const refreshCookie = cookies.find(cookie => 
        cookie.startsWith('refreshToken=')
      );
      expect(refreshCookie).toBeDefined();
      
      // Vérifier les propriétés du cookie
      expect(refreshCookie).toMatch(/HttpOnly/);
      expect(refreshCookie).toMatch(/SameSite=Strict/);
    });

    it('devrait stocker le refresh token en base de données', async () => {
      await request(app)
        .post('/auth/login')
        .send({
          email: 'jwt@test.com',
          password: 'password123'
        })
        .expect(200);

      // Vérifier qu'un refresh token existe en BDD
      const refreshTokenInDB = await RefreshToken.findOne({ userId: userId });
      expect(refreshTokenInDB).toBeTruthy();
      expect(refreshTokenInDB.token).toBeDefined();
      expect(refreshTokenInDB.userId.toString()).toBe(userId.toString());
    });

    it('devrait supprimer le refresh token lors du logout avec cookie', async () => {
      // Se connecter d'abord
      const loginResponse = await request(app)
        .post('/auth/login')
        .send({
          email: 'jwt@test.com',
          password: 'password123'
        });

      const cookies = loginResponse.headers['set-cookie'];
      const refreshCookie = cookies.find(cookie => 
        cookie.startsWith('refreshToken=')
      );

      // Vérifier que le refresh token existe
      let refreshTokenInDB = await RefreshToken.findOne({ userId: userId });
      expect(refreshTokenInDB).toBeTruthy();

      // Se déconnecter avec le cookie (comme le fait vraiment votre app)
      await request(app)
        .post('/auth/logout')
        .set('Cookie', refreshCookie)
        .expect(200);

      // Vérifier que le refresh token a été supprimé
      refreshTokenInDB = await RefreshToken.findOne({ userId: userId });
      expect(refreshTokenInDB).toBeNull();
    });

    it('devrait remplacer l\'ancien refresh token lors d\'un nouveau login', async () => {
      // Premier login
      await request(app)
        .post('/auth/login')
        .send({
          email: 'jwt@test.com',
          password: 'password123'
        });

      const firstRefreshToken = await RefreshToken.findOne({ userId: userId });
      const firstToken = firstRefreshToken.token;
      const firstTokenId = firstRefreshToken._id;

      // Attendre un peu pour s'assurer que le timestamp sera différent
      await new Promise(resolve => setTimeout(resolve, 100));

      // Deuxième login
      await request(app)
        .post('/auth/login')
        .send({
          email: 'jwt@test.com',
          password: 'password123'
        });

      // Vérifier qu'il n'y a qu'un seul refresh token (votre logique supprime puis recrée)
      const allRefreshTokens = await RefreshToken.find({ userId: userId });
      expect(allRefreshTokens).toHaveLength(1);
      
      // Le nouveau token devrait avoir un ID différent (car supprimé puis recréé)
      const secondRefreshToken = allRefreshTokens[0];
      expect(secondRefreshToken._id.toString()).not.toBe(firstTokenId.toString());
    });
  });

  describe('🛡️ Sécurité des Tokens', () => {
    
    it('devrait avoir des tokens avec des ID utilisateur corrects', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'jwt@test.com',
          password: 'password123'
        });

      const token = response.body.token;
      const decoded = jwt.decode(token);
      
      expect(decoded.id).toBe(userId.toString());
      expect(decoded.iat).toBeDefined(); // issued at
      expect(decoded.exp).toBeDefined(); // expires at
      expect(decoded.exp).toBeGreaterThan(decoded.iat);
    });

    it('ne devrait pas exposer d\'informations sensibles dans le token', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'jwt@test.com',
          password: 'password123'
        });

      const token = response.body.token;
      const decoded = jwt.decode(token);
      
      // Vérifier que le password n'est pas dans le token
      expect(decoded).not.toHaveProperty('password');
      expect(decoded).not.toHaveProperty('email');
      expect(decoded).not.toHaveProperty('firstname');
      expect(decoded).not.toHaveProperty('lastname');
    });

    it('devrait utiliser le bon format Bearer pour l\'authentification', async () => {
      // Se connecter pour obtenir un token
      const loginResponse = await request(app)
        .post('/auth/login')
        .send({
          email: 'jwt@test.com',
          password: 'password123'
        });

      const token = loginResponse.body.token;

      // Tester avec Bearer
      const validResponse = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // Tester sans Bearer (devrait échouer)
      const invalidResponse = await request(app)
        .get('/tasks')
        .set('Authorization', token)
        .expect(401);

      expect(invalidResponse.body).toHaveProperty('status', 'fail');
    });
  });

  describe('⏰ Expiration et Durée de Vie', () => {
    
    it('devrait avoir une durée d\'expiration raisonnable', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'jwt@test.com',
          password: 'password123'
        });

      const token = response.body.token;
      const decoded = jwt.decode(token);
      
      const now = Math.floor(Date.now() / 1000);
      const expiresIn = decoded.exp - decoded.iat;
      
      // Vérifier que le token expire dans un délai raisonnable (ex: 1h = 3600s)
      expect(expiresIn).toBeGreaterThan(0);
      expect(expiresIn).toBeLessThanOrEqual(3600); // Max 1h
      expect(decoded.exp).toBeGreaterThan(now); // Pas encore expiré
    });

    it('devrait permettre l\'accès avec un token fraîchement généré', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'jwt@test.com',
          password: 'password123'
        });

      const token = response.body.token;

      // Utiliser immédiatement le token
      const tasksResponse = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(tasksResponse.body).toHaveProperty('message');
      expect(tasksResponse.body).toHaveProperty('data');
    });
  });

  describe('🔒 Tests de Concurrence et Edge Cases', () => {
    
    it('devrait gérer plusieurs logins simultanés', async () => {
      const promises = Array(3).fill().map(() => 
        request(app)
          .post('/auth/login')
          .send({
            email: 'jwt@test.com',
            password: 'password123'
          })
      );

      const responses = await Promise.all(promises);

      // Tous les logins devraient réussir
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('token');
      });

      // En cas de concurrence, il peut y avoir plusieurs tokens temporairement
      // Votre système fait deleteMany puis create, mais la concurrence peut créer des doublons
      const refreshTokens = await RefreshToken.find({ userId: userId });
      expect(refreshTokens.length).toBeGreaterThan(0);
      expect(refreshTokens.length).toBeLessThanOrEqual(3); // Pas plus que les requêtes simultanées
    });

    it('devrait supprimer les refresh tokens après logout', async () => {
      // Se connecter
      const loginResponse = await request(app)
        .post('/auth/login')
        .send({
          email: 'jwt@test.com',
          password: 'password123'
        });

      const token = loginResponse.body.token;
      const cookies = loginResponse.headers['set-cookie'];
      const refreshCookie = cookies.find(cookie => 
        cookie.startsWith('refreshToken=')
      );

      // Vérifier que le token fonctionne
      await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // Se déconnecter avec le cookie (méthode réelle)
      await request(app)
        .post('/auth/logout')
        .set('Cookie', refreshCookie)
        .expect(200);

      // Le JWT devrait encore fonctionner (stateless par nature)
      await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // Mais le refresh token devrait être supprimé de la BDD
      const refreshTokens = await RefreshToken.find({ userId: userId });
      expect(refreshTokens).toHaveLength(0);
    });
  });
});

/*
📚 GUIDE DES TESTS JWT/REFRESH TOKENS :

🔑 TESTS JWT :
- Génération de token valide
- Validation de la signature
- Gestion de l'expiration
- Format Bearer correct
- Contenu sécurisé (pas de données sensibles)

🔄 TESTS REFRESH TOKENS :
- Création lors du login
- Stockage en base de données
- Suppression lors du logout
- Remplacement lors de nouveaux logins
- Unicité par utilisateur

🛡️ TESTS SÉCURITÉ :
- Tokens avec utilisateurs inexistants
- Signatures incorrectes
- Tokens expirés
- Format d'autorisation
- Concurrence et edge cases

⏰ TESTS DURÉE DE VIE :
- Expiration raisonnable
- Utilisation immédiate
- Validation de la chronologie

💡 BONNES PRATIQUES TESTÉES :
- HttpOnly cookies pour refresh tokens
- SameSite=Strict pour la sécurité
- JWT stateless (pas de révocation côté serveur)
- Un seul refresh token par utilisateur
- Nettoyage des tokens lors du logout
*/