/**
 * Classe d'erreur personnalisée pour l'API
 */
export class AppError extends Error {
  constructor(message, statusCode, isOperational = true) {
    super(message);
    
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = isOperational;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Erreurs prédéfinies courantes
 */
export class ValidationError extends AppError {
  constructor(message = 'Données invalides') {
    super(message, 400);
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Non authentifié') {
    super(message, 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Non autorisé') {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Ressource non trouvée') {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflit de données') {
    super(message, 409);
  }
}

export class InternalServerError extends AppError {
  constructor(message = 'Erreur interne du serveur') {
    super(message, 500);
  }
}