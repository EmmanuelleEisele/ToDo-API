import validator from "validator";

/**
 * Middleware de sanitisation des entrées utilisateur
 * Nettoie et valide les données pour prévenir les attaques XSS, NoSQL injection, etc.
 */

// Fonction utilitaire pour nettoyer une chaîne
const sanitizeString = (str) => {
  if (typeof str !== "string") return str;

  // Échapper les caractères HTML dangereux
  return (
    str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;")
      .replace(/\//g, "&#x2F;")
      // Supprimer les caractères de contrôle
      .replace(/[\x00-\x1f\x7f-\x9f]/g, "")
      // Trim les espaces
      .trim()
  );
};

// Fonction récursive pour nettoyer un objet
const sanitizeObject = (obj) => {
  if (obj === null || obj === undefined) return obj;

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  if (typeof obj === "object") {
    const sanitized = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        // Nettoyer aussi les clés d'objet
        const cleanKey = sanitizeString(key);
        sanitized[cleanKey] = sanitizeObject(obj[key]);
      }
    }
    return sanitized;
  }

  if (typeof obj === "string") {
    return sanitizeString(obj);
  }

  return obj;
};

// Validation spécifique pour les champs utilisateur
const validateUserInput = (data) => {
  const errors = [];

  if (data.email && !validator.isEmail(data.email)) {
    errors.push("Format email invalide");
  }

  if (
    data.firstname &&
    (data.firstname.length < 1 || data.firstname.length > 50)
  ) {
    errors.push("Le prénom doit contenir entre 1 et 50 caractères");
  }

  if (
    data.lastname &&
    (data.lastname.length < 1 || data.lastname.length > 50)
  ) {
    errors.push("Le nom doit contenir entre 1 et 50 caractères");
  }

  if (data.password && data.password.length < 6) {
    errors.push("Le mot de passe doit contenir au moins 6 caractères");
  }

  // Vérifier les caractères dangereux dans les noms
  if (data.firstname && /[<>\"'&]/.test(data.firstname)) {
    errors.push("Le prénom contient des caractères non autorisés");
  }

  if (data.lastname && /[<>\"'&]/.test(data.lastname)) {
    errors.push("Le nom contient des caractères non autorisés");
  }

  return errors;
};

// Validation pour les tâches
const validateTaskInput = (data) => {
  const errors = [];

  if (data.title && (data.title.length < 1 || data.title.length > 100)) {
    errors.push("Le titre doit contenir entre 1 et 100 caractères");
  }

  if (data.description && data.description.length > 500) {
    errors.push("La description ne peut pas dépasser 500 caractères");
  }

  if (
    data.status &&
    !["pending", "in-progress", "completed"].includes(data.status)
  ) {
    errors.push("Statut invalide");
  }

  if (data.deadline && !validator.isISO8601(data.deadline)) {
    errors.push("Format de date invalide pour la deadline");
  }

  return errors;
};

// Middleware principal de sanitisation
export const sanitizeInput = (options = {}) => {
  return (req, res, next) => {
    try {
      // Sanitiser le body
      if (req.body && typeof req.body === "object") {
        req.body = sanitizeObject(req.body);
      }

      // Pour query et params, on ne peut pas les réassigner directement
      // On sanitise les valeurs en place
      if (req.query && typeof req.query === "object") {
        for (const key in req.query) {
          if (
            req.query.hasOwnProperty(key) &&
            typeof req.query[key] === "string"
          ) {
            req.query[key] = sanitizeString(req.query[key]);
          }
        }
      }

      if (req.params && typeof req.params === "object") {
        for (const key in req.params) {
          if (
            req.params.hasOwnProperty(key) &&
            typeof req.params[key] === "string"
          ) {
            req.params[key] = sanitizeString(req.params[key]);
          }
        }
      }

      // Validation spécifique selon le type de données
      let validationErrors = [];

      if (options.type === "user") {
        validationErrors = validateUserInput(req.body || {});
      } else if (options.type === "task") {
        validationErrors = validateTaskInput(req.body || {});
      }

      if (validationErrors.length > 0) {
        return res.status(400).json({
          error: "Données invalides",
          details: validationErrors,
        });
      }

      next();
    } catch (error) {
      console.error("Erreur dans la sanitisation:", error);
      return res.status(500).json({
        error: "Erreur interne du serveur",
      });
    }
  };
};

// Middleware de protection contre les attaques NoSQL
export const sanitized = (req, res, next) => {
  const checkForInjection = (obj) => {
    if (typeof obj === "object" && obj !== null) {
      for (const key in obj) {
        if (typeof key === "string" && key.startsWith("$")) {
          return true;
        }
        if (typeof obj[key] === "object" && checkForInjection(obj[key])) {
          return true;
        }
      }
    }
    return false;
  };

  if (
    checkForInjection(req.body) ||
    checkForInjection(req.query) ||
    checkForInjection(req.params)
  ) {
    return res.status(400).json({
      error: "Requête potentiellement dangereuse détectée",
    });
  }

  next();
};

// Middleware de limitation de taille des données
export const limitDataSize = (maxSize = 1024 * 1024) => {
  // 1MB par défaut
  return (req, res, next) => {
    const bodySize = JSON.stringify(req.body || {}).length;

    if (bodySize > maxSize) {
      return res.status(413).json({
        error: "Données trop volumineuses",
      });
    }

    next();
  };
};

export default {
  sanitizeInput,
  sanitized,
  limitDataSize,
};
