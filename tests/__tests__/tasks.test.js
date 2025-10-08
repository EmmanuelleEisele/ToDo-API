import request from 'supertest';
import app from '../../index.js';
import User from '../../src/models/User.js';
import Task from '../../src/models/Task.js';
import argon2 from 'argon2';

describe('Task Controller', () => {
  let authToken;
  let userId;
  let taskId;

  // Créer un utilisateur de test et récupérer son token avant chaque test
  beforeEach(async () => {
    // Créer un utilisateur de test
    const hashedPassword = await argon2.hash('password123');
    const testUser = new User({
      firstname: 'Test',
      lastname: 'User',
      email: 'test@example.com',
      password: hashedPassword
    });
    await testUser.save();
    userId = testUser._id;

    // Se connecter pour obtenir le token
    const loginResponse = await request(app)
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    authToken = loginResponse.body.token;
  });

  describe('POST /tasks', () => {
    it('devrait créer une nouvelle tâche avec authentification', async () => {
      const taskData = {
        title: 'Nouvelle tâche',
        description: 'Description de la tâche',
        status: 'en cours',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Dans 7 jours
      };

      const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(taskData)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'Tâche créée avec succès');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('title', taskData.title);
      expect(response.body.data).toHaveProperty('description', taskData.description);
      expect(response.body.data).toHaveProperty('status', taskData.status);
      expect(response.body.data).toHaveProperty('userId');

      // Sauvegarder l'ID pour les autres tests
      taskId = response.body.data._id;
    });

    it('devrait rejeter une tâche sans titre', async () => {
      const taskData = {
        description: 'Description sans titre',
        status: 'en cours'
      };

      const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(taskData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('devrait rejeter une requête sans authentification', async () => {
      const taskData = {
        title: 'Tâche sans auth',
        description: 'Cette tâche ne devrait pas être créée'
      };

      await request(app)
        .post('/tasks')
        .send(taskData)
        .expect(401);
    });

    it('devrait créer une tâche avec le statut par défaut', async () => {
      const taskData = {
        title: 'Tâche statut par défaut',
        description: 'Sans statut spécifié'
      };

      const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(taskData)
        .expect(201);

      expect(response.body.data).toHaveProperty('status', 'en cours');
    });
  });

  describe('GET /tasks', () => {
    beforeEach(async () => {
      // Créer quelques tâches de test
      const task1 = new Task({
        title: 'Tâche 1',
        description: 'Description 1',
        status: 'en cours',
        userId: userId
      });

      const task2 = new Task({
        title: 'Tâche 2',
        description: 'Description 2',
        status: 'validé',
        userId: userId
      });

      await task1.save();
      await task2.save();
    });

    it('devrait récupérer toutes les tâches de l\'utilisateur', async () => {
      const response = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Liste des tâches récupérée avec succès');
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);
    });

    it('devrait rejeter une requête sans authentification', async () => {
      await request(app)
        .get('/tasks')
        .expect(401);
    });

    it('ne devrait récupérer que les tâches de l\'utilisateur connecté', async () => {
      // Créer un autre utilisateur avec des tâches
      const otherUser = new User({
        firstname: 'Other',
        lastname: 'User',
        email: 'other@example.com',
        password: await argon2.hash('password123')
      });
      await otherUser.save();

      const otherTask = new Task({
        title: 'Tâche autre utilisateur',
        description: 'Ne devrait pas apparaître',
        userId: otherUser._id
      });
      await otherTask.save();

      const response = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Vérifier qu'aucune tâche de l'autre utilisateur n'est retournée
      const taskTitles = response.body.data.map(task => task.title);
      expect(taskTitles).not.toContain('Tâche autre utilisateur');
    });
  });

  describe('PUT /tasks/:id', () => {
    beforeEach(async () => {
      // Créer une tâche de test
      const task = new Task({
        title: 'Tâche à modifier',
        description: 'Description originale',
        status: 'en cours',
        userId: userId
      });
      await task.save();
      taskId = task._id;
    });

    it('devrait mettre à jour une tâche existante', async () => {
      const updatedData = {
        title: 'Tâche modifiée',
        description: 'Description mise à jour',
        status: 'validé'
      };

      const response = await request(app)
        .put(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updatedData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Tâche mise à jour avec succès');
    });

    it('devrait retourner 404 pour une tâche inexistante', async () => {
      const fakeId = '507f1f77bcf86cd799439011'; // ID MongoDB valide mais inexistant
      
      const response = await request(app)
        .put(`/tasks/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Nouveau titre' })
        .expect(404);

      expect(response.body).toHaveProperty('message', 'Tâche non trouvée');
    });

    it('devrait rejeter la modification d\'une tâche d\'un autre utilisateur', async () => {
      // Créer un autre utilisateur
      const otherUser = new User({
        firstname: 'Other',
        lastname: 'User',
        email: 'other@example.com',
        password: await argon2.hash('password123')
      });
      await otherUser.save();

      // Créer une tâche pour cet autre utilisateur
      const otherTask = new Task({
        title: 'Tâche autre utilisateur',
        description: 'Ne devrait pas être modifiable',
        userId: otherUser._id
      });
      await otherTask.save();

      const response = await request(app)
        .put(`/tasks/${otherTask._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Tentative de modification' })
        .expect(404);

      expect(response.body).toHaveProperty('message', 'Tâche non trouvée');
    });

    it('devrait rejeter une requête sans authentification', async () => {
      await request(app)
        .put(`/tasks/${taskId}`)
        .send({ title: 'Nouveau titre' })
        .expect(401);
    });
  });

  describe('DELETE /tasks/:id', () => {
    beforeEach(async () => {
      // Créer une tâche de test
      const task = new Task({
        title: 'Tâche à supprimer',
        description: 'Sera supprimée',
        status: 'en cours',
        userId: userId
      });
      await task.save();
      taskId = task._id;
    });

    it('devrait supprimer une tâche existante', async () => {
      const response = await request(app)
        .delete(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Tâche supprimée avec succès');

      // Vérifier que la tâche n'existe plus
      const deletedTask = await Task.findById(taskId);
      expect(deletedTask).toBeNull();
    });

    it('devrait retourner 404 pour une tâche inexistante', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      const response = await request(app)
        .delete(`/tasks/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('message', 'Tâche non trouvée');
    });

    it('devrait rejeter la suppression d\'une tâche d\'un autre utilisateur', async () => {
      // Créer un autre utilisateur avec une tâche
      const otherUser = new User({
        firstname: 'Other',
        lastname: 'User',
        email: 'other@example.com',
        password: await argon2.hash('password123')
      });
      await otherUser.save();

      const otherTask = new Task({
        title: 'Tâche autre utilisateur',
        description: 'Ne devrait pas être supprimable',
        userId: otherUser._id
      });
      await otherTask.save();

      const response = await request(app)
        .delete(`/tasks/${otherTask._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('message', 'Tâche non trouvée');

      // Vérifier que la tâche existe toujours
      const existingTask = await Task.findById(otherTask._id);
      expect(existingTask).not.toBeNull();
    });

    it('devrait rejeter une requête sans authentification', async () => {
      await request(app)
        .delete(`/tasks/${taskId}`)
        .expect(401);
    });
  });

  describe('Validation des statuts', () => {
    it('devrait accepter tous les statuts valides', async () => {
      const validStatuses = ['en cours', 'validé', 'annulé', 'en retard'];
      
      for (const status of validStatuses) {
        const taskData = {
          title: `Tâche ${status}`,
          description: `Test du statut ${status}`,
          status: status
        };

        const response = await request(app)
          .post('/tasks')
          .set('Authorization', `Bearer ${authToken}`)
          .send(taskData)
          .expect(201);

        expect(response.body.data).toHaveProperty('status', status);
      }
    });
  });
});