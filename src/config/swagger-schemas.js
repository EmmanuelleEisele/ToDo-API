/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - firstname
 *         - lastname
 *         - email
 *         - password
 *       properties:
 *         _id:
 *           type: string
 *           description: ID unique de l'utilisateur
 *           example: "507f1f77bcf86cd799439011"
 *         firstname:
 *           type: string
 *           description: Prénom de l'utilisateur
 *           example: "Jean"
 *         lastname:
 *           type: string
 *           description: Nom de famille de l'utilisateur
 *           example: "Dupont"
 *         email:
 *           type: string
 *           format: email
 *           description: Adresse email unique de l'utilisateur
 *           example: "jean.dupont@email.com"
 *         password:
 *           type: string
 *           description: |
 *             Mot de passe sécurisé (non visible dans les réponses).
 *             Exigences: 8+ caractères, majuscule, minuscule, chiffre, caractère spécial.
 *           writeOnly: true
 *           minLength: 8
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date de création du compte
 *           example: "2024-01-15T10:30:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date de dernière modification
 *           example: "2024-01-15T10:30:00Z"
 * 
 *     Task:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - userId
 *       properties:
 *         _id:
 *           type: string
 *           description: ID unique de la tâche
 *           example: "507f1f77bcf86cd799439011"
 *         title:
 *           type: string
 *           description: Titre de la tâche
 *           example: "Terminer le projet"
 *           maxLength: 100
 *         description:
 *           type: string
 *           description: Description détaillée de la tâche
 *           example: "Finaliser la documentation et les tests unitaires"
 *           maxLength: 500
 *         status:
 *           type: string
 *           description: Statut actuel de la tâche
 *           enum: 
 *             - en cours
 *             - validé
 *             - annulé
 *             - en retard
 *           default: "en cours"
 *           example: "en cours"
 *         deadline:
 *           type: string
 *           format: date
 *           description: Date limite pour accomplir la tâche (optionnel)
 *           example: "2024-12-25"
 *         userId:
 *           type: string
 *           description: ID de l'utilisateur propriétaire de la tâche
 *           example: "507f1f77bcf86cd799439011"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date de création de la tâche
 *           example: "2024-01-15T10:30:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date de dernière modification
 *           example: "2024-01-15T14:45:00Z"
 * 
 *     TaskInput:
 *       type: object
 *       required:
 *         - title
 *         - description
 *       properties:
 *         title:
 *           type: string
 *           description: Titre de la tâche
 *           example: "Terminer le projet"
 *           maxLength: 100
 *         description:
 *           type: string
 *           description: Description de la tâche
 *           example: "Finaliser la documentation"
 *           maxLength: 500
 *         status:
 *           type: string
 *           description: Statut de la tâche
 *           enum: 
 *             - en cours
 *             - validé
 *             - annulé
 *             - en retard
 *           default: "en cours"
 *           example: "en cours"
 *         deadline:
 *           type: string
 *           format: date
 *           description: Date limite pour accomplir la tâche (optionnel)
 *           example: "2024-12-25"
 * 
 *     TaskUpdate:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           description: Nouveau titre de la tâche
 *           example: "Projet terminé"
 *           maxLength: 100
 *         description:
 *           type: string
 *           description: Nouvelle description
 *           example: "Documentation et tests finalisés"
 *           maxLength: 500
 *         status:
 *           type: string
 *           description: Nouveau statut
 *           enum: 
 *             - en cours
 *             - validé
 *             - annulé
 *             - en retard
 *           example: "validé"
 *         deadline:
 *           type: string
 *           format: date
 *           description: Nouvelle date limite (optionnel)
 *           example: "2024-12-31"
 * 
 *     UserRegistration:
 *       type: object
 *       required:
 *         - firstname
 *         - lastname
 *         - email
 *         - password
 *       properties:
 *         firstname:
 *           type: string
 *           description: Prénom
 *           example: "Jean"
 *           minLength: 2
 *           maxLength: 50
 *         lastname:
 *           type: string
 *           description: Nom de famille
 *           example: "Dupont"
 *           minLength: 2
 *           maxLength: 50
 *         email:
 *           type: string
 *           format: email
 *           description: Adresse email
 *           example: "jean.dupont@email.com"
 *         password:
 *           type: string
 *           description: |
 *             Mot de passe sécurisé (minimum 8 caractères).
 *             Doit contenir: majuscule, minuscule, chiffre, caractère spécial.
 *             Éviter: suites (1234, abcd), répétitions (aaa), mots courants.
 *           example: "MonP@ssw0rd!"
 *           minLength: 8
 *           maxLength: 128
 * 
 *     UserLogin:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: Adresse email
 *           example: "jean.dupont@email.com"
 *         password:
 *           type: string
 *           description: Mot de passe
 *           example: "motdepasse123"
 * 
 *     AuthResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Message de confirmation
 *           example: "Connexion réussie"
 *         token:
 *           type: string
 *           description: Token JWT d'authentification
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1YjFhMjM0NTY3ODkwYWJjZGVmIiwiaWF0IjoxNzA2MjA4NzU2LCJleHAiOjE3MDYyMTIzNTZ9.abc123"
 * 
 *     SuccessResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Message de succès
 *           example: "Opération réussie"
 *         data:
 *           type: object
 *           description: Données de la réponse (optionnel)
 * 
 *     Error:
 *       type: object
 *       required:
 *         - status
 *         - message
 *       properties:
 *         status:
 *           type: string
 *           description: Type d'erreur
 *           enum: [fail, error]
 *           example: "fail"
 *         message:
 *           type: string
 *           description: Description de l'erreur
 *           example: "Email déjà utilisé"
 *         error:
 *           type: object
 *           description: Détails techniques de l'erreur (uniquement en développement)
 *         stack:
 *           type: string
 *           description: Stack trace de l'erreur (uniquement en développement)
 * 
 *     ValidationError:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: "fail"
 *         message:
 *           type: string
 *           example: "Le champ 'title' est requis"
 * 
 *     AuthenticationError:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: "fail"
 *         message:
 *           type: string
 *           example: "Token invalide ou manquant"
 * 
 *     NotFoundError:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: "fail"
 *         message:
 *           type: string
 *           example: "Tâche non trouvée"
 * 
 *     ConflictError:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: "fail"
 *         message:
 *           type: string
 *           example: "Email déjà utilisé"
 * 
 *     SecurityError:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           example: "Mot de passe non sécurisé"
 *         details:
 *           type: array
 *           items:
 *             type: string
 *           example:
 *             - "Le mot de passe doit contenir au moins 8 caractères"
 *             - "Le mot de passe doit contenir au moins une lettre majuscule"
 *         suggestions:
 *           type: array
 *           items:
 *             type: string
 *           example:
 *             - "Utilisez au moins 8 caractères"
 *             - "Mélangez majuscules, minuscules, chiffres et symboles"
 * 
 *     RateLimitError:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           example: "Trop de requêtes"
 *         message:
 *           type: string
 *           example: "Veuillez patienter avant de faire une nouvelle requête"
 *         retryAfter:
 *           type: integer
 *           example: 600
 *           description: "Nombre de secondes à attendre"
 * 
 *     PayloadTooLargeError:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           example: "Données trop volumineuses"
 * 
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: |
 *         Entrez votre token JWT dans le format: `Bearer <votre-token>`
 *         
 *         Pour obtenir un token:
 *         1. Créez un compte avec POST /auth/register
 *         2. Ou connectez-vous avec POST /auth/login
 *         3. Copiez le token reçu dans la réponse
 *         4. Cliquez sur "Authorize" ci-dessus et entrez: `Bearer <votre-token>`
 * 
 *   responses:
 *     UnauthorizedError:
 *       description: Token d'authentification manquant ou invalide
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AuthenticationError'
 *     
 *     NotFound:
 *       description: Ressource non trouvée
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NotFoundError'
 *     
 *     ValidationError:
 *       description: Erreur de validation des données
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ValidationError'
 *     
 *     ConflictError:
 *       description: Conflit avec les données existantes
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ConflictError'
 *     
 *     SecurityError:
 *       description: Erreur de sécurité (mot de passe faible, données dangereuses)
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SecurityError'
 *     
 *     RateLimitError:
 *       description: Trop de requêtes (rate limiting)
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RateLimitError'
 *       headers:
 *         X-RateLimit-Limit:
 *           description: Nombre maximum de requêtes autorisées
 *           schema:
 *             type: integer
 *         X-RateLimit-Remaining:
 *           description: Nombre de requêtes restantes
 *           schema:
 *             type: integer
 *         X-RateLimit-Reset:
 *           description: Timestamp de réinitialisation du compteur
 *           schema:
 *             type: integer
 *     
 *     PayloadTooLarge:
 *       description: Données envoyées trop volumineuses
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PayloadTooLargeError'
 */

// Ce fichier contient uniquement les définitions de schémas Swagger
// Il sera importé par la configuration Swagger principale
export default {};