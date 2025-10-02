import jwt from 'jsonwebtoken';

// Génère un access token (court terme)
export const generateToken=(payload, expiresIn = '15m')=>{
    return jwt.sign(payload, process.env.JWT_SECRET, {expiresIn}) 
}

// Génère un refresh token (long terme)
export const generateRefreshToken = (payload, expiresIn = '7d') => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn });
};

// Vérifie access token
export const verifyToken=(token)=>{
   return jwt.verify(token, process.env.JWT_SECRET)
}

// Vérifie refresh token
export const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};