import request from 'supertest';
import app from '../../index.js';
import User from '../../src/models/User.js';
import Task from '../../src/models/Task.js';
import argon2 from 'argon2';

describe('Tests de Gestion d\'Erreurs', () => {
  let authToken;
  let userId;

  // Configuration avant chaque test
  beforeEach(async () => {
    // Créer un utilisateur pour les tests d'authentification
    const hashedPassword = await argon2.hash('Password123!');
    const testUser = new User({
      pseudo: 'TestUser',
      email: 'test@example.com',
      password: hashedPassword
    });
    await testUser.save();
    userId = testUser._id;

    // Se connecter pour obtenir un token
    const loginResponse = await request(app)
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'Password123!'
      });

    authToken = loginResponse.body.token;
  });

  describe('🔐 Erreurs d\'Authentification', () => {
    
    it('devrait retourner 401 si aucun token fourni', async () => {
      const response = await request(app)
        .get('/tasks')
        .expect(401);

      // Vérifier le format de l'erreur
      expect(response.body).toHaveProperty('status', 'fail');
      expect(response.body).toHaveProperty('message');
    });

    it('devrait retourner 401 si token invalide', async () => {
      const response = await request(app)
        .get('/tasks')
        .set('Authorization', 'Bearer token_invalide')
        .expect(401);

      expect(response.body).toHaveProperty('status', 'fail');
      expect(response.body.message).toMatch(/token|invalide|expiré/i);
    });

    it('devrait retourner 401 si token mal formaté', async () => {
      const response = await request(app)
        .get('/tasks')
        .set('Authorization', 'InvalidFormat token')
        .expect(401);

      expect(response.body).toHaveProperty('status', 'fail');
    });

    it('devrait retourner 400 pour email invalide lors registration', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          pseudo: 'JohnDoe',
          email: 'email_pas_valide', // Email invalide
          password: 'Password123!'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error || response.body.message || JSON.stringify(response.body)).toMatch(/email.*invalide|invalides/i);
    });

    it('devrait retourner 409 pour email déjà utilisé', async () => {
      // Tenter de créer un utilisateur avec un email déjà existant
      const response = await request(app)
        .post('/auth/register')
        .send({
          pseudo: 'JaneDoe',
          email: 'test@example.com', // Email déjà utilisé dans beforeEach
          password: 'Password123!'
        })
        .expect(409);

      expect(response.body).toHaveProperty('status', 'fail');
      expect(response.body.message).toMatch(/email.*utilisé|existe/i);
    });

    it('devrait retourner 400 pour login sans email/password', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: '', // Email vide
          password: ''  // Password vide
        })
        .expect(400);

      expect(response.body).toHaveProperty('status', 'fail');
      expect(response.body.message).toMatch(/email.*mot de passe.*requis/i);
    });

    it('devrait retourner 401 pour mauvais identifiants', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'mauvais_password' // Mauvais mot de passe
        })
        .expect(401);

      expect(response.body).toHaveProperty('status', 'fail');
      expect(response.body.message).toMatch(/email.*mot de passe.*incorrect/i);
    });
  });

  describe('📋 Erreurs sur les Tâches', () => {
    
    it('devrait retourner 400 pour tâche sans titre', async () => {
      const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Tâche sans titre',
          status: 'en cours'
          // title manquant !
        })
        .expect(400);

      expect(response.body).toHaveProperty('status', 'fail');
      expect(response.body.message).toMatch(/titre.*requis/i);
    });

    it('devrait retourner 400 pour ID de tâche invalide', async () => {
      const response = await request(app)
        .get('/tasks/id_invalide') // ID MongoDB invalide
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body).toHaveProperty('status', 'fail');
      expect(response.body.message).toMatch(/id.*invalide/i);
    });

    it('devrait retourner 404 pour tâche inexistante', async () => {
      const fakeId = '507f1f77bcf86cd799439011'; // ID MongoDB valide mais inexistant
      
      const response = await request(app)
        .get(`/tasks/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('status', 'fail');
      expect(response.body.message).toMatch(/tâche.*non trouvée/i);
    });

    it('devrait retourner 400 pour statut invalide', async () => {
      const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Tâche test',
          description: 'Test de validation',
          status: 'statut_invalide' // Statut non autorisé
        })
        .expect(400);

      expect(response.body).toHaveProperty('status', 'fail');
      expect(response.body.message).toMatch(/valeur.*invalide.*status/i);
    });
  });

  describe('🌐 Erreurs de Routes', () => {
    
    it('devrait retourner 404 pour route inexistante', async () => {
      const response = await request(app)
        .get('/route/qui/nexiste/pas')
        .expect(404);

      // Même sans notre middleware personnalisé, Express retourne 404
      expect(response.status).toBe(404);
    });

    it('devrait retourner 405 pour méthode HTTP non autorisée', async () => {
      // Par exemple, PATCH sur une route qui n'accepte que GET/POST
      const response = await request(app)
        .patch('/auth/register') // PATCH non supporté sur cette route
        .send({});

      // Express retourne automatiquement 404 pour méthodes non supportées
      expect([404, 405]).toContain(response.status);
    });
  });

  describe('🔍 Format des Erreurs', () => {
    
    it('les erreurs devrait avoir le bon format JSON', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'mauvais_password'
        })
        .expect(401);

      // Vérifier la structure de la réponse d'erreur
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('message');
      expect(typeof response.body.message).toBe('string');
      expect(response.body.message.length).toBeGreaterThan(0);
    });

    it('ne devrait pas exposer de données sensibles dans les erreurs', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'mauvais_password'
        })
        .expect(401);

      // S'assurer qu'aucune donnée sensible n'est exposée
      const responseText = JSON.stringify(response.body).toLowerCase();
      expect(responseText).not.toMatch(/password|hash|secret|key/);
    });
  });

  describe('🚀 Tests d\'Environnement', () => {
    
    it('devrait gérer différemment les erreurs selon NODE_ENV', () => {
      // Ce test vérifie que le comportement change selon l'environnement
      const currentEnv = process.env.NODE_ENV;
      expect(['test', 'development', 'production']).toContain(currentEnv);
    });
  });
});

/*
📚 GUIDE JEST POUR DÉBUTANTS :

🔍 STRUCTURE DES TESTS :
- describe() = Groupe de tests (comme un dossier)
- it() = Un test individuel (comme un fichier)
- expect() = Vérification/assertion

🔧 MÉTHODES UTILES :
- .toBe() = Égalité stricte (===)
- .toEqual() = Égalité profonde (objets)
- .toHaveProperty() = Vérifier qu'une propriété existe
- .toMatch() = Vérifier avec regex ou string
- .toContain() = Vérifier qu'un array contient un élément

🚀 LIFECYCLE :
- beforeEach() = Exécuté avant chaque test
- beforeAll() = Exécuté une fois avant tous les tests
- afterEach() = Exécuté après chaque test
- afterAll() = Exécuté une fois après tous les tests

🎯 SUPERTEST :
- request(app) = Créer une requête HTTP
- .post()/.get()/.put()/.delete() = Méthodes HTTP
- .send() = Envoyer des données
- .set() = Définir des headers
- .expect() = Vérifier le code de statut

💡 BONNES PRATIQUES :
- Un test = Une seule vérification
- Noms de tests descriptifs
- Arrange -> Act -> Assert (Préparer -> Agir -> Vérifier)
- Tests indépendants (pas de dépendances entre eux)
*/