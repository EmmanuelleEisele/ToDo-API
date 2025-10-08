import { verifyToken } from '../helper/JWT.js';
import { AuthenticationError } from '../errors/AppError.js';
import { catchAsync } from './errorHandler.js';

export const auth = catchAsync(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AuthenticationError('Token manquant ou mal formaté');
  }

  const token = authHeader.split(' ')[1];
  
  if (!token) {
    throw new AuthenticationError('Token manquant');
  }

  // Vérifier le token
  const user = verifyToken(token);
  req.user = user; // Attacher les informations de l'utilisateur à la requête
  
  next();
});