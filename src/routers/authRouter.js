import { Router } from "express";
import { authController } from "../controllers/authController.js";

const router = Router();

//  POST /auth/register
router.post("/register", authController.registerUser);

//  POST /auth/login
router.post("/login", authController.loginUser);

//  POST /auth/logout
router.post("/logout", authController.logoutUser);

export default router;
