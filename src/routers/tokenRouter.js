import { Router } from "express";
import { tokenController } from "../controllers/tokenController.js";
import { auth } from "../middlewares/auth.js";
import { sanitized } from "../middlewares/sanitization.js";
import User from "../models/User.js";

const tokenRouter = Router();
// Vérification du token d'accès et récupération de l'utilisateur connecté
tokenRouter.get("/", auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Rafraîchir le token d'accès
 *     description: Génère un nouveau token d'accès et refresh token en utilisant le refresh token stocké en cookie
 *     tags: [Authentication]
 *     security: []
 *     responses:
 *       200:
 *         description: Token rafraîchi avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Token rafraîchi avec succès"
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *         headers:
 *           Set-Cookie:
 *             description: Nouveau refresh token en cookie HttpOnly
 *             schema:
 *               type: string
 *               example: "refreshToken=xyz123; HttpOnly; Secure; SameSite=Strict"
 *       401:
 *         description: Refresh token manquant ou invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
tokenRouter.post("/refresh", 
  sanitized, 
  tokenController.refreshToken
);

/**
 * @swagger
 * /auth/revoke:
 *   post:
 *     summary: Révoquer le refresh token actuel
 *     description: Révoque le refresh token stocké en cookie et le supprime de la base de données
 *     tags: [Authentication]
 *     security: []
 *     responses:
 *       200:
 *         description: Token révoqué avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Token révoqué avec succès"
 *       401:
 *         description: Refresh token manquant ou invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
tokenRouter.post("/revoke", //revoke pour logout
  sanitized, 
  tokenController.revokeToken
);

/**
 * @swagger
 * /auth/revoke-all:
 *   post:
 *     summary: Révoquer tous les refresh tokens de l'utilisateur
 *     description: Révoque tous les refresh tokens de l'utilisateur authentifié (déconnexion de tous les appareils)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tous les tokens ont été révoqués avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Tous les tokens ont été révoqués avec succès"
 *       401:
 *         description: Utilisateur non authentifié
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
tokenRouter.post("/revoke-all", // revokeAll pour logout de tous les appareils
  auth, 
  sanitized, 
  tokenController.revokeAllTokens
);

/**
 * @swagger
 * /auth/token-info:
 *   get:
 *     summary: Obtenir les informations du refresh token
 *     description: Récupère les informations du refresh token actuel (date de création, expiration, utilisateur associé)
 *     tags: [Authentication]
 *     security: []
 *     responses:
 *       200:
 *         description: Informations du token récupérées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Informations du token récupérées"
 *                 tokenInfo:
 *                   type: object
 *                   properties:
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-15T10:30:00.000Z"
 *                     expiresAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-22T10:30:00.000Z"
 *                     user:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: "507f1f77bcf86cd799439011"
 *                         firstname:
 *                           type: string
 *                           example: "John"
 *                         lastname:
 *                           type: string
 *                           example: "Doe"
 *                         email:
 *                           type: string
 *                           example: "john.doe@example.com"
 *       401:
 *         description: Refresh token manquant ou invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
tokenRouter.get("/token-info", // pour récupérer les infos du token
  sanitized, 
  tokenController.getTokenInfo
);

export default tokenRouter;