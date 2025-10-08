import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ToDo API',
      version: '1.0.0',
      description: `
        ## 📋 API de Gestion de Tâches
        
        Cette API permet de gérer des tâches personnelles avec authentification JWT.
        
        ### 🚀 Fonctionnalités
        - ✅ Authentification avec JWT et cookies HTTP-only
        - ✅ CRUD complet des tâches
        - ✅ Isolation des données par utilisateur
        - ✅ Gestion d'erreurs centralisée
        - ✅ Validation des données
        
        ### 🔐 Authentification
        Pour utiliser les endpoints protégés:
        1. Créez un compte avec \`POST /auth/register\`
        2. Ou connectez-vous avec \`POST /auth/login\`
        3. Copiez le token JWT reçu
        4. Cliquez sur **"Authorize"** 🔓 et entrez: \`Bearer <votre-token>\`
        
        ### 📚 Codes d'erreur
        - **400**: Données invalides ou manquantes
        - **401**: Token manquant, invalide ou expiré
        - **404**: Ressource non trouvée
        - **409**: Conflit (ex: email déjà utilisé)
        - **500**: Erreur serveur
      `
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Serveur de développement'
      },
      {
        url: 'https://your-api-domain.com',
        description: 'Serveur de production'
      }
    ],
    tags: [
      {
        name: 'Authentication',
        description: '🔐 Gestion des comptes et authentification'
      },
      {
        name: 'Tasks',
        description: '📋 Gestion des tâches personnelles'
      }
    ]
  },
  apis: [
    './src/routers/*.js',           // Routes avec documentation
    './src/config/swagger-schemas.js' // Schémas de données
  ]
};

const swaggerSpec = swaggerJSDoc(options);

// Options personnalisées pour l'interface Swagger UI
const swaggerUiOptions = {
  customCss: `
    .topbar-wrapper .link { 
      content: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMTAwIDQwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8dGV4dCB4PSI1IiB5PSIyNSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE2IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0iIzFmNzdjNCI+VG9EbyBBUEk8L3RleHQ+Cjwvc3ZnPg=='); 
      width: 100px; 
      height: 40px; 
    }
    .swagger-ui .topbar { 
      background-color: #1f77c4; 
    }
  `,
  customSiteTitle: "ToDo API - Documentation",
  customfavIcon: "/favicon.ico",
  swaggerOptions: {
    persistAuthorization: true,  // Garde l'auth même après refresh
    filter: true,                // Active la recherche
    tagsSorter: 'alpha',        // Trie les sections alphabétiquement
    operationsSorter: 'method'   // Trie par méthode HTTP
  }
};

// Fonction pour initialiser Swagger dans l'app Express
export const swaggerDocs = (app) => {
  // Route pour la documentation
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));
  
  // Route pour récupérer le JSON de l'API (optionnel)
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
  
  console.log('📖 Swagger UI disponible sur: http://localhost:3000/api-docs');
  console.log('📄 Swagger JSON disponible sur: http://localhost:3000/api-docs.json');
};
