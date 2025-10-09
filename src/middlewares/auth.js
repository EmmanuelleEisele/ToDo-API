import { verifyToken } from '../helper/JWT.js';
import { AuthenticationError } from '../errors/AppError.js';
import { catchAsync } from './errorHandler.js';
import User from '../models/User.js';

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
  const decoded = verifyToken(token);
  
  // Vérifier que l'utilisateur existe encore en base
  const user = await User.findById(decoded.id).select('-password');
  if (!user) {
    throw new AuthenticationError('Utilisateur non trouvé');
  }
  
  req.user = { id: user._id.toString() }; // Attacher les informations de l'utilisateur à la requête
  
  next();
});