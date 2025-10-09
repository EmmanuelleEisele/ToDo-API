import User from "../models/User.js";
import RefreshToken from "../models/RefreshToken.js";
import { generateRefreshToken, generateToken } from "../helper/JWT.js";
import { AuthenticationError } from "../errors/AppError.js";

export const tokenController = {
  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.cookies;
      
      if (!refreshToken) {
        return next(new AuthenticationError('Refresh token manquant'));
      }

      // Vérifier si le refresh token existe en BDD
      const tokenDoc = await RefreshToken.findOne({ token: refreshToken }).populate('userId');
      if (!tokenDoc) {
        return next(new AuthenticationError('Refresh token invalide'));
      }

      // Vérifier que l'utilisateur existe toujours
      const user = await User.findById(tokenDoc.userId);
      if (!user) {
        // Supprimer les tokens orphelins
        await RefreshToken.deleteMany({ userId: tokenDoc.userId });
        return next(new AuthenticationError('Utilisateur non trouvé'));
      }

      // Générer de nouveaux tokens
      const newAccessToken = generateToken({ id: user._id });
      const newRefreshToken = generateRefreshToken({ id: user._id });

      // GESTION STRICTE : Remplacer l'ancien refresh token
      await RefreshToken.findByIdAndUpdate(tokenDoc._id, { 
        token: newRefreshToken,
        createdAt: new Date() // Mettre à jour la date
      });

      // Envoyer le nouveau refresh token en cookie
      const isProd = process.env.NODE_ENV === "production";
      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: "Strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
        partitioned: true,
      });

      res.status(200).json({
        message: "Token rafraîchi avec succès",
        token: newAccessToken
      });

    } catch (error) {
      console.error("Erreur lors du rafraîchissement du token :", error);
      next(error);
    }
  },

  async revokeToken(req, res, next) {
    try {
      const { refreshToken } = req.cookies;
      
      if (!refreshToken) {
        return next(new AuthenticationError('Refresh token manquant'));
      }

      // Supprimer le refresh token de la BDD
      const result = await RefreshToken.findOneAndDelete({ token: refreshToken });
      
      if (!result) {
        return next(new AuthenticationError('Refresh token invalide'));
      }

      // Effacer le cookie côté client
      const isProd = process.env.NODE_ENV === "production";
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: isProd,
        sameSite: "Strict",
        partitioned: true,
      });

      res.status(200).json({
        message: "Token révoqué avec succès"
      });

    } catch (error) {
      console.error("Erreur lors de la révocation du token :", error);
      next(error);
    }
  },

  async revokeAllTokens(req, res, next) {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return next(new AuthenticationError('Utilisateur non authentifié'));
      }

      // Supprimer tous les refresh tokens de l'utilisateur
      await RefreshToken.deleteMany({ userId: userId });

      // Effacer le cookie côté client
      const isProd = process.env.NODE_ENV === "production";
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: isProd,
        sameSite: "Strict",
        partitioned: true,
      });

      res.status(200).json({
        message: "Tous les tokens ont été révoqués avec succès"
      });

    } catch (error) {
      console.error("Erreur lors de la révocation de tous les tokens :", error);
      next(error);
    }
  },

  async getTokenInfo(req, res, next) {
    try {
      const { refreshToken } = req.cookies;
      
      if (!refreshToken) {
        return next(new AuthenticationError('Refresh token manquant'));
      }

      // Récupérer les infos du token
      const tokenDoc = await RefreshToken.findOne({ token: refreshToken })
        .populate('userId', 'firstname lastname email')
        .select('createdAt userId');
      
      if (!tokenDoc) {
        return next(new AuthenticationError('Refresh token invalide'));
      }

      res.status(200).json({
        message: "Informations du token récupérées",
        tokenInfo: {
          createdAt: tokenDoc.createdAt,
          user: tokenDoc.userId,
          expiresAt: new Date(tokenDoc.createdAt.getTime() + (7 * 24 * 60 * 60 * 1000)) // 7 jours
        }
      });

    } catch (error) {
      console.error("Erreur lors de la récupération des infos du token :", error);
      next(error);
    }
  }
};