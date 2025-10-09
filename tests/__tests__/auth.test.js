import request from 'supertest';
import app from '../../index.js';

describe('Auth Controller', () => {
  describe('POST /auth/register', () => {
    it('devrait enregistrer un nouvel utilisateur', async () => {
      const userData = {
        firstname: 'John',
        lastname: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'Utilisateur enregistré avec succès');
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email', userData.email);
      expect(response.body.user).toHaveProperty('firstname', userData.firstname);
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('devrait rejeter un email invalide', async () => {
      const userData = {
        firstname: 'John',
        lastname: 'Doe',
        email: 'email-invalide',
        password: 'password123'
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Email invalide');
    });

    it('devrait rejeter un email déjà utilisé', async () => {
      const userData = {
        firstname: 'John',
        lastname: 'Doe',
        email: 'duplicate@example.com',
        password: 'password123'
      };

      // Premier enregistrement
      await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(201);

      // Tentative de doublon
      const response = await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(409);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      // Créer un utilisateur de test
      await request(app)
        .post('/auth/register')
        .send({
          firstname: 'Test',
          lastname: 'User',
          email: 'test@example.com',
          password: 'password123'
        });
    });

    it('devrait connecter un utilisateur avec des identifiants valides', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Utilisateur connecté avec succès');
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email', loginData.email);
    });

    it('devrait rejeter des identifiants invalides', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Email ou mot de passe incorrect');
    });

    it('devrait rejeter un email inexistant', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Email ou mot de passe incorrect');
    });
  });

  describe('POST /auth/logout', () => {
    let cookies;

    beforeEach(async () => {
      // Créer et connecter un utilisateur
      await request(app)
        .post('/auth/register')
        .send({
          firstname: 'Test',
          lastname: 'User',
          email: 'test@example.com',
          password: 'password123'
        });

      const loginResponse = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      cookies = loginResponse.headers['set-cookie'];
    });

    it('devrait déconnecter un utilisateur', async () => {
      const response = await request(app)
        .post('/auth/logout')
        .set('Cookie', cookies)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Utilisateur déconnecté avec succès');
    });
  });
});