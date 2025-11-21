// importation des variables d'environnement
import dotenv from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";
import taskRouter from "./src/routers/taskRouter.js";
import authRouter from "./src/routers/authRouter.js";
import tokenRouter from "./src/routers/tokenRouter.js";
import categoryRouter from "./src/routers/categoryRouter.js";
import statsRouter from "./src/routers/statsRouter.js";
import cors from "cors";
import connectDB from './db.js';
import { globalErrorHandler } from './src/middlewares/errorHandler.js';
import { swaggerDocs } from "./src/config/swagger.js";
import { securityHeaders, basicRateLimit, securityLogger, preventUserEnumeration } from "./src/middlewares/security.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT ?? 3000;

swaggerDocs(app);


// Connexion à la base de données (seulement en prod/dev, pas en test)
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://todoom-green.vercel.app");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://todoom-green.vercel.app'
  ],
  credentials: true,
}));


// Middlewares de sécurité globaux
app.use(securityHeaders);
if (process.env.NODE_ENV === 'production') {
  app.use(basicRateLimit);
}
app.use(securityLogger);
app.use(preventUserEnumeration);

app.use(express.json({ limit: '10mb' })); // Limite la taille des requêtes JSON
app.use(cookieParser()); // Pour lire les cookies

// Routes
app.use('/auth', authRouter);
app.use('/auth', tokenRouter);
app.use('/tasks', taskRouter);
app.use('/categories', categoryRouter);
app.use('/stats', statsRouter);

app.get("/", (req, res) => {
  res.json({ 
    message: "Bienvenue sur l’API To-Do ✅. Que la force soit avec toi apprenti dev ! 🚀"
  });
});

// Middleware de gestion d'erreurs (doit être en dernier)
app.use(globalErrorHandler);

// Démarrer le serveur seulement si on n'est pas en mode test
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
      console.log(`Server ready at http://localhost:${PORT}`);
  }).on('error', (err) => {
      console.error('Erreur serveur:', err);
  });
}

// Exporter l'app pour les tests
export default app;