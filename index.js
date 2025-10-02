// importation des variables d'environnement
import dotenv from "dotenv";
import express from "express";
import taskRouter from "./src/routers/taskRouter.js";
import authRouter from "./src/routers/authRouter.js"; 
import cors from "cors";
import connectDB from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT ?? 3000;

// Connexion à la base de données
connectDB();


app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://127.0.0.1:3000',
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5174',
  ],
  credentials: true, 
}));


app.use(express.json());
app.use('/auth', authRouter);
app.use('/tasks', taskRouter);

app.get("/", (req, res) => {
  res.json({ 
    message: "Bienvenue sur l’API To-Do ✅. Que la force soit avec toi apprenti dev ! 🚀"
  });
});

app.listen(PORT, () => {
    console.log(`Server ready at http://localhost:${PORT}`);
}).on('error', (err) => {
    console.error('Erreur serveur:', err);
});