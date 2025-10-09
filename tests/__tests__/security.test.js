import request from 'supertest';
import app from '../../index.js';

describe('🛡️ Tests de Sécurité', () => {
  
  describe('Validation des mots de passe', () => {
    test('Doit rejeter un mot de passe trop court', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          firstname: 'Test',
          lastname: 'User',
          email: 'test@example.com',
          password: '123'
        });
      
      // Debug: afficher la réponse complète si erreur inattendue
      if (response.status === 500) {
        console.log('Erreur 500 détectée:', response.body);
      }
      
      expect(response.status).toBe(400);
      // Le middleware peut retourner soit le message de sanitisation, soit celui du mot de passe
      expect(['Mot de passe non sécurisé', 'Données invalides']).toContain(response.body.error);
    });

    test('Doit rejeter un mot de passe sans majuscule', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          firstname: 'Test',
          lastname: 'User',
          email: 'test2@example.com',
          password: 'motdepasse123!'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.details).toContain('Le mot de passe doit contenir au moins une lettre majuscule');
    });

    test('Doit accepter un mot de passe sécurisé', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          firstname: 'Test',
          lastname: 'User',
          email: 'secure@example.com',
          password: 'SecurePass123!'
        });
      
      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Utilisateur enregistré avec succès');
    });
  });

  describe('Protection contre NoSQL Injection', () => {
    test('Doit bloquer les objets dans les paramètres de connexion', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: { "$ne": null },
          password: "anything"
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Requête potentiellement dangereuse détectée');
    });
  });

  describe('Sanitisation des entrées', () => {
    test('Doit sanitiser les caractères dangereux dans les noms', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          firstname: '<script>alert("xss")</script>',
          lastname: 'User',
          email: 'xsstest@example.com',
          password: 'SecurePass123!'
        });
      
      // Doit soit rejeter, soit sanitiser
      if (response.status === 201) {
        expect(response.body.user.firstname).not.toContain('<script>');
      } else {
        expect(response.status).toBe(400);
      }
    });
  });

  describe('Validation ObjectId', () => {
    test('Doit rejeter un ObjectId invalide', async () => {
      const response = await request(app)
        .get('/tasks/invalid-id')
        .set('Authorization', 'Bearer fake-token');
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('ID invalide');
    });

    test('Doit accepter un ObjectId valide (même si token invalide)', async () => {
      const response = await request(app)
        .get('/tasks/507f1f77bcf86cd799439011')
        .set('Authorization', 'Bearer fake-token');
      
      // Ne doit pas échouer sur la validation ObjectId, mais sur l'auth
      expect(response.status).not.toBe(400);
      expect(response.body.error).not.toBe('ID invalide');
    });
  });

  describe('Headers de sécurité', () => {
    test('Doit inclure les headers de sécurité', async () => {
      const response = await request(app).get('/');
      
      expect(response.headers['x-frame-options']).toBe('DENY');
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-xss-protection']).toBe('1; mode=block');
      expect(response.headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
      expect(response.headers['content-security-policy']).toContain("default-src 'self'");
    });
  });

  describe('Rate Limiting', () => {
    test('Doit inclure les headers de rate limiting', async () => {
      const response = await request(app).get('/');
      
      expect(response.headers).toHaveProperty('x-ratelimit-limit');
      expect(response.headers).toHaveProperty('x-ratelimit-remaining');
      expect(response.headers).toHaveProperty('x-ratelimit-reset');
    });

    // Note: Test complet du rate limiting nécessiterait 100+ requêtes
    // Ce qui est trop pour un test unitaire rapide
  });

  describe('Limitation de taille des données', () => {
    test('Doit rejeter des données trop volumineuses', async () => {
      const largeData = {
        firstname: 'A'.repeat(50000),
        lastname: 'B'.repeat(50000),
        email: 'large@example.com',
        password: 'SecurePass123!'
      };

      const response = await request(app)
        .post('/auth/register')
        .send(largeData);
      
      expect(response.status).toBe(413);
      expect(response.body.error).toBe('Données trop volumineuses');
    });
  });

  describe('Validation des champs', () => {
    test('Doit rejeter un email invalide', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          firstname: 'Test',
          lastname: 'User',
          email: 'not-an-email',
          password: 'SecurePass123!'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.details).toContain('Format email invalide');
    });

    test('Doit rejeter des noms trop longs', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          firstname: 'A'.repeat(100),
          lastname: 'User',
          email: 'toolong@example.com',
          password: 'SecurePass123!'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.details).toContain('Le prénom doit contenir entre 1 et 50 caractères');
    });
  });

});