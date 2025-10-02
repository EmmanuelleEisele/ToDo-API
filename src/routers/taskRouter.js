import { Router } from "express";
import { taskController } from "../controllers/taskController.js";
import { auth } from "../middlewares/auth.js";

const router = Router();

// Routes protégées
router.get("/", auth, taskController.getTasks);
router.post("/", auth, taskController.createTask);
router.put("/:id", auth, taskController.updateTask);
router.delete("/:id", auth, taskController.deleteTask);

export default router;
