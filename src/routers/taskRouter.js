import { Router } from "express";
import { taskController } from "../controllers/taskController.js";
import { auth } from "../middlewares/auth.js";
import { sanitizeInput, sanitized, limitDataSize } from "../middlewares/sanitization.js";
import { validateObjectId } from "../middlewares/security.js";

const router = Router();

/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: Récupérer toutes les tâches de l'utilisateur connecté
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des tâches récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Liste des tâches récupérée avec succès"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Task'
 *       401:
 *         description: Token manquant ou invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/", 
  auth, 
  sanitized,
  taskController.getTasks
);

/**
 * @swagger
 * /tasks/{id}:
 *   get:
 *     summary: Récupérer une tâche spécifique
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *         description: ID de la tâche
 *     responses:
 *       200:
 *         description: Tâche récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Tâche récupérée avec succès"
 *                 data:
 *                   $ref: '#/components/schemas/Task'
 *       400:
 *         description: ID invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Tâche non trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Token manquant ou invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/:id", 
  validateObjectId(),
  auth, 
  sanitized,
  taskController.getTaskById
);

/**
 * @swagger
 * /tasks:
 *   post:
 *     summary: Créer une nouvelle tâche
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Terminer le projet"
 *               description:
 *                 type: string
 *                 example: "Finaliser la documentation et les tests"
 *               status:
 *                 type: string
 *                 enum: [en cours, validé, annulé, en retard]
 *                 default: "en cours"
 *                 example: "en cours"
 *               deadline:
 *                 type: string
 *                 format: date
 *                 description: Date limite pour accomplir la tâche (optionnel)
 *                 example: "2024-12-25"
 *     responses:
 *       201:
 *         description: Tâche créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Tâche créée avec succès"
 *                 data:
 *                   $ref: '#/components/schemas/Task'
 *       400:
 *         description: Données invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Token manquant ou invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/", 
  auth, 
  sanitized,
  limitDataSize(20 * 1024), // 20KB max pour une tâche
  sanitizeInput({ type: 'task' }),
  taskController.createTask
);

/**
 * @swagger
 * /tasks/{id}:
 *   put:
 *     summary: Modifier une tâche existante
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *         description: ID de la tâche à modifier
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Projet terminé"
 *               description:
 *                 type: string
 *                 example: "Documentation et tests finalisés"
 *               status:
 *                 type: string
 *                 enum: [en cours, validé, annulé, en retard]
 *                 example: "validé"
 *               deadline:
 *                 type: string
 *                 format: date
 *                 description: Nouvelle date limite (optionnel)
 *                 example: "2024-12-31"
 *     responses:
 *       200:
 *         description: Tâche mise à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Tâche mise à jour avec succès"
 *                 data:
 *                   $ref: '#/components/schemas/Task'
 *       400:
 *         description: Données invalides ou ID invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Tâche non trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Token manquant ou invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put("/:id", 
  validateObjectId(),
  auth, 
  sanitized,
  limitDataSize(20 * 1024), // 20KB max pour une tâche
  sanitizeInput({ type: 'task' }),
  taskController.updateTask
);

/**
 * @swagger
 * /tasks/{id}:
 *   delete:
 *     summary: Supprimer une tâche
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *         description: ID de la tâche à supprimer
 *     responses:
 *       200:
 *         description: Tâche supprimée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Tâche supprimée avec succès"
 *       400:
 *         description: ID invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Tâche non trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Token manquant ou invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete("/:id", 
  validateObjectId(),
  auth, 
  sanitized,
  taskController.deleteTask
);

/**
 * @swagger
 * /tasks/archived:
 *   get:
 *     summary: Récupérer toutes les tâches archivées de l'utilisateur connecté
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des tâches archivées récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Liste des tâches archivées récupérée avec succès"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Task'
 *       401:
 *         description: Token manquant ou invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/archived", 
  auth, 
  sanitized,
  taskController.getArchivedTasks
);

/**
 * @swagger
 * /tasks/{id}/archive:
 *   post:
 *     summary: Archiver une tâche
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *         description: ID de la tâche à archiver
 *     responses:
 *       200:
 *         description: Tâche archivée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Tâche archivée avec succès"
 *       404:
 *         description: Tâche non trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Token manquant ou invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/:id/archive",
  validateObjectId(),
  auth,
  sanitized,
  taskController.archiveTask
);

export default router;
