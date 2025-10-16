
import argon2 from "argon2";
import validator from "validator";
import User from "../models/User.js";
import RefreshToken from "../models/RefreshToken.js";
import { generateRefreshToken, generateToken } from "../helper/JWT.js";
import {
  ValidationError,
  ConflictError,
  AuthenticationError,
} from "../errors/AppError.js";

export const authController = {
  async registerUser(req, res, next) {
    try {
      const { pseudo, email, password } = req.body;
      //verification de l'email
      if (!validator.isEmail(email)) {
        return next(new ValidationError("Email invalide"));
      }
      const existantEmail = await User.findOne({ email });
      if (existantEmail) {
        return next(new ConflictError("Email déjà utilisé"));
      }
      //hashage du mot de passe
      const hashedPassword = await argon2.hash(password);

      //création de l'utilisateur
      const newUser = new User({
        pseudo,
        email,
        password: hashedPassword,
      });
      await newUser.save();

      // Création du payload
      const payload = {
        id: newUser._id,
      };

      // Génération des tokens
      const token = generateToken(payload);
      const refreshToken = generateRefreshToken({ id: newUser._id });

      // Supprimer d’éventuels anciens tokens de ce user
      await RefreshToken.deleteMany({ userId: newUser._id });

      // Sauvegarder le nouveau refresh token
      await RefreshToken.create({ token: refreshToken, userId: newUser._id });

      // Envoyer le refresh token en cookie HttpOnly
      const isProd = process.env.NODE_ENV === "production";
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: "Strict",
        partitioned: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
      });

      res.status(201).json({
        message: "Utilisateur enregistré avec succès",
        token,
        user: {
          id: newUser._id,
          firstname: newUser.firstname,
          lastname: newUser.lastname,
          email: newUser.email,
        },
      });
    } catch (error) {
      console.error(
        "Erreur lors de l'enregistrement de l'utilisateur :",
        error
      );
      next(error);
    }
  },

  /* Demande de réinitialisation du mot de passe Génère un token et le retourne dans la réponse*/
  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      if (!validator.isEmail(email)) {
        return next(new ValidationError("Email invalide"));
      }
      const user = await User.findOne({ email });
      if (!user) {
        return next(new ValidationError("Aucun utilisateur avec cet email"));
      }
      // Générer un token de reset simple (à améliorer en prod)
      const resetToken = generateToken(
        { userId: user._id, type: "reset" },
        "1h"
      );
      // Stocker le token et sa date d'expiration dans le user (à ajouter dans le modèle)
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = Date.now() + 3600000; // 1h
      await user.save();
      // Envoyer le token par email
      const { sendResetPasswordEmail } = await import("../helper/mailer.js");
      await sendResetPasswordEmail(email, resetToken);
      res.status(200).json({ message: "Email de réinitialisation envoyé" });
    } catch (error) {
      next(error);
    }
  },

  async loginUser(req, res, next) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return next(new ValidationError("Email et mot de passe requis"));
      }
      // Vérification de l'existence de l'utilisateur
      const user = await User.findOne({ email });
      if (!user) {
        return next(new AuthenticationError("Email ou mot de passe incorrect"));
      }
      // Vérification du mot de passe
      const validPassword = await argon2.verify(user.password, password);
      if (!validPassword) {
        return next(new AuthenticationError("Email ou mot de passe incorrect"));
      }
      const payload = { id: user._id };
      const token = generateToken(payload);
      const refreshToken = generateRefreshToken({ id: user._id });
      // Supprimer d’éventuels anciens tokens de ce user
      await RefreshToken.deleteMany({ userId: user._id });
      // Sauvegarder le nouveau refresh token
      await RefreshToken.create({ token: refreshToken, userId: user._id });

      // Envoyer le refresh token en cookie HttpOnly
      const isProd = process.env.NODE_ENV === "production";
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: "Strict",
        partitioned: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
      });

      res.status(200).json({
        message: "Utilisateur connecté avec succès",
        token,
        user: {
          id: user._id,
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
        },
        refreshToken,
      });
    } catch (error) {
      console.error("Erreur lors de la connexion de l'utilisateur :", error);
      next(error);
    }
  },

  async logoutUser(req, res, next) {
    try {
      const refreshToken = req.cookies.refreshToken;
      const isProd = process.env.NODE_ENV === "production";

      // GESTION STRICTE : Toujours supprimer TOUS les refresh tokens de l'utilisateur
      if (req.user && req.user.id) {
        // Si utilisateur authentifié, supprimer tous ses tokens
        await RefreshToken.deleteMany({ userId: req.user.id });
      } else if (refreshToken) {
        // Sinon, trouver l'utilisateur via le refresh token et supprimer tous ses tokens
        const tokenDoc = await RefreshToken.findOne({
          token: refreshToken,
        }).populate("userId");
        if (tokenDoc) {
          await RefreshToken.deleteMany({ userId: tokenDoc.userId });
        }
      }

      // Effacer le cookie côté client dans tous les cas
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: isProd,
        sameSite: "Strict",
        partitioned: true,
      });

      res.status(200).json({ message: "Utilisateur déconnecté avec succès" });
    } catch (error) {
      console.error("Erreur lors de la déconnexion de l'utilisateur :", error);
      next(error);
    }
  },
  /* Réinitialisation du mot de passe avec le token */
  async resetPassword(req, res, next) {
    try {
      const { token, newPassword } = req.body;
      if (!token || !newPassword) {
        return next(
          new ValidationError("Token et nouveau mot de passe requis")
        );
      }
      // Vérifier le token et trouver l'utilisateur
      const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
      });
      if (!user) {
        return next(new ValidationError("Token invalide ou expiré"));
      }
      // Vérifier la complexité du mot de passe
      if (!validator.isStrongPassword(newPassword, { minLength: 8 })) {
        return next(new ValidationError("Mot de passe trop faible"));
      }
      // Mettre à jour le mot de passe
      user.password = await argon2.hash(newPassword);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      res
        .status(200)
        .json({ message: "Mot de passe réinitialisé avec succès" });
    } catch (error) {
      next(error);
    }
  },
  /* Changement du mot de passe pour un utilisateur connecté */
  async changePassword(req, res, next) {
    try {
      const userId = req.user?.id;
      const { oldPassword, newPassword } = req.body;
      if (!userId) {
        return next(new AuthenticationError("Utilisateur non authentifié"));
      }
      if (!oldPassword || !newPassword) {
        return next(new ValidationError("Ancien et nouveau mot de passe requis"));
      }
      const user = await User.findById(userId);
      if (!user) {
        return next(new AuthenticationError("Utilisateur introuvable"));
      }
      const validPassword = await argon2.verify(user.password, oldPassword);
      if (!validPassword) {
        return next(new ValidationError("Ancien mot de passe incorrect"));
      }
      if (!validator.isStrongPassword(newPassword, { minLength: 8 })) {
        return next(new ValidationError("Mot de passe trop faible"));
      }
      user.password = await argon2.hash(newPassword);
      await user.save();
      res.status(200).json({ message: "Mot de passe changé avec succès" });
    } catch (error) {
      next(error);
    }
  },
};
