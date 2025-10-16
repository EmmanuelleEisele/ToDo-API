import { Router } from "express";
import { categoryController } from "../controllers/categoryController.js";

const router = Router();

// Route pour créer une catégorie
router.post("/", categoryController.createCategory);

export default router;
