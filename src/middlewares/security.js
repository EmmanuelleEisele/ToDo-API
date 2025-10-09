/**
 * Middleware de sécurité globale pour l'application
 * Applique des protections de base contre les attaques courantes
 */

// Middleware pour définir les headers de sécurité
export const securityHeaders = (req, res, next) => {
  // Protection contre le clickjacking
  res.setHeader("X-Frame-Options", "DENY");

  // Protection contre le sniffing de type MIME
  res.setHeader("X-Content-Type-Options", "nosniff");

  // Protection XSS
  res.setHeader("X-XSS-Protection", "1; mode=block");

  // Référent policy
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  // Content Security Policy basique
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self';"
  );

  // Stricte transport security (si HTTPS)
  if (req.secure || req.headers["x-forwarded-proto"] === "https") {
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains"
    );
  }

  // Permissions policy
  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=()"
  );

  next();
};

// Middleware de limitation de taux simple
const requestCounts = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 100; // 100 requests par fenêtre

export const basicRateLimit = (req, res, next) => {
  const clientIP =
    req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
  const now = Date.now();

  // Nettoyer les anciennes entrées
  for (const [ip, data] of requestCounts) {
    if (now - data.firstRequest > RATE_LIMIT_WINDOW) {
      requestCounts.delete(ip);
    }
  }

  const clientData = requestCounts.get(clientIP) || {
    count: 0,
    firstRequest: now,
  };

  if (now - clientData.firstRequest > RATE_LIMIT_WINDOW) {
    // Réinitialiser la fenêtre
    clientData.count = 1;
    clientData.firstRequest = now;
  } else {
    clientData.count++;
  }

  requestCounts.set(clientIP, clientData);

  if (clientData.count > MAX_REQUESTS) {
    return res.status(429).json({
      error: "Trop de requêtes",
      message: "Veuillez patienter avant de faire une nouvelle requête",
      retryAfter: Math.ceil(
        (RATE_LIMIT_WINDOW - (now - clientData.firstRequest)) / 1000
      ),
    });
  }

  // Ajouter des headers informatifs
  res.setHeader("X-RateLimit-Limit", MAX_REQUESTS);
  res.setHeader(
    "X-RateLimit-Remaining",
    Math.max(0, MAX_REQUESTS - clientData.count)
  );
  res.setHeader(
    "X-RateLimit-Reset",
    Math.ceil((clientData.firstRequest + RATE_LIMIT_WINDOW) / 1000)
  );

  next();
};

// Middleware pour logger les tentatives de sécurité suspectes
export const securityLogger = (req, res, next) => {
  const suspiciousPatterns = [
    /(\.\.)|(\.\.\\)/g, // Directory traversal
    /<script|javascript:|vbscript:/gi, // XSS attempts
    /union[\s]+select|drop[\s]+table|insert[\s]+into/gi, // SQL injection attempts
    /\$where|\$ne|\$gt|\$lt/gi, // NoSQL injection attempts
  ];

  const checkSuspicious = (obj, path = "") => {
    if (typeof obj === "string") {
      for (const pattern of suspiciousPatterns) {
        if (pattern.test(obj)) {
          console.warn(`🚨 TENTATIVE SUSPECTE détectée:`, {
            ip: req.ip,
            userAgent: req.get("User-Agent"),
            path: req.path,
            method: req.method,
            field: path,
            value: obj.substring(0, 100), // Limiter la taille du log
            timestamp: new Date().toISOString(),
          });
          return true;
        }
      }
    } else if (typeof obj === "object" && obj !== null) {
      for (const [key, value] of Object.entries(obj)) {
        if (checkSuspicious(value, `${path}.${key}`)) {
          return true;
        }
      }
    }
    return false;
  };

  // Vérifier body, query et params
  checkSuspicious(req.body, "body");
  checkSuspicious(req.query, "query");
  checkSuspicious(req.params, "params");

  next();
};

// Middleware pour empêcher l'énumération d'utilisateurs
export const preventUserEnumeration = (req, res, next) => {
  // Ajouter un délai aléatoire léger pour les endpoints sensibles
  if (req.path.includes("/login") || req.path.includes("/register")) {
    const delay = Math.floor(Math.random() * 100) + 50; // 50-150ms
    setTimeout(() => next(), delay);
  } else {
    next();
  }
};

// Middleware pour valider les ObjectIds MongoDB
export const validateObjectId = (paramName = "id") => {
  return (req, res, next) => {
    const id = req.params[paramName];

    if (id && !/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({
        error: "ID invalide",
        message: "L'identifiant fourni n'est pas au bon format",
      });
    }

    next();
  };
};

export default {
  securityHeaders,
  basicRateLimit,
  securityLogger,
  preventUserEnumeration,
  validateObjectId,
};
