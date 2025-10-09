import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

let mongoServer;

beforeAll(async () => {
  // Créer une instance MongoDB en mémoire pour les tests
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Se connecter à la base de test
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  // Nettoyer après tous les tests
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  // Nettoyer la base après chaque test
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});