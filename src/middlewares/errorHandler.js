import { AppError } from '../errors/AppError.js';

/**
 * Gestion des erreurs de validation Mongoose
 */
const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map(val => {
    // Personnaliser les messages d'erreur en français
    if (val.kind === 'required') {
      return `Le champ '${val.path}' est requis`;
    }
    if (val.kind === 'enum') {
      return `Valeur invalide pour '${val.path}': '${val.value}'`;
    }
    return val.message;
  });
  const message = errors.join('. ');
  return new AppError(message, 400);
};

/**
 * Gestion des erreurs de duplication Mongoose
 */
const handleDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  const message = `${field}: '${value}' existe déjà`;
  return new AppError(message, 409);
};

/**
 * Gestion des erreurs de cast Mongoose (ID invalide)
 */
const handleCastError = (err) => {
  const message = `ID invalide: ${err.value}`;
  return new AppError(message, 400);
};

/**
 * Gestion des erreurs JWT
 */
const handleJWTError = () => {
  return new AppError('Token invalide', 401);
};

const handleJWTExpiredError = () => {
  return new AppError('Token expiré', 401);
};

/**
 * Envoie la réponse d'erreur en développement
 */
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

/**
 * Envoie la réponse d'erreur en production
 */
const sendErrorProd = (err, res) => {
  // Erreurs opérationnelles : envoyer le message au client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  } 
  // Erreurs de programmation : ne pas divulguer les détails
  else {
    console.error('ERROR 💥', err);
    
    res.status(500).json({
      status: 'error',
      message: 'Une erreur est survenue'
    });
  }
};

export default function errorHandler(err, req, res, next) {
  res.status(err.statusCode || 500).json({
    message: err.message || "Erreur serveur",
  });
}
/**
 * Middleware principal de gestion d'erreurs
 */
export const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Gestion des erreurs Mongoose en premier (même en dev)
  let error = err;

  // Transformer les erreurs Mongoose en erreurs personnalisées
  if (err.name === 'ValidationError') error = handleValidationError(err);
  if (err.code === 11000) error = handleDuplicateKeyError(err);
  if (err.name === 'CastError') error = handleCastError(err);
  if (err.name === 'JsonWebTokenError') error = handleJWTError();
  if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, res);
  } else {
    sendErrorProd(error, res);
  }
};

/**
 * Middleware pour capturer les erreurs async
 */
export const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};