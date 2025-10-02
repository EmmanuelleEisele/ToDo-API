// importation des variables d'environnement
import 'dotenv/config';

import express from "express";
import router from "./src/routers/taskRouter.js"; 
import cors from "cors";

const app = express();
const PORT = process.env.PORT ?? 3000;

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
app.use(router);

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