import { Router } from "express";
import { statsController } from "../controllers/statsController.js";
import { auth } from "../middlewares/auth.js";

const router = Router();

router.get("/taskByDay", auth, statsController.completedTasksByDay);
router.get("/taskByWeek", auth, statsController.completedTasksByWeek);
router.get("/taskByMonth", auth, statsController.completedTasksByMonth);
router.get("/taskByYear", auth, statsController.completedTasksByYear);

export default router;