import argon2 from "argon2";
import validator from "validator";
import User from "../models/User.js";
import RefreshToken from "../models/RefreshToken.js";
import { generateRefreshToken, generateToken } from "../helper/JWT.js";

export const authController = {
  async registerUser(req, res) {
    try {
      const { firstname, lastname, email, password } = req.body;
      //verification de l'email
      if (!validator.isEmail(email)) {
        return res.status(400).json({ message: "Email invalide" });
      }
      const existantEmail = await User.findOne({ email });
      if (existantEmail) {
        return res.status(400).json({ message: "Email déjà utilisé" });
      }
      //hashage du mot de passe
      const hashedPassword = await argon2.hash(password);

      //création de l'utilisateur
      const newUser = new User({
        firstname,
        lastname,
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
      res.status(500).json({ message: "Erreur serveur" });
    }
  },

  async loginUser(req, res) {
    try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email et mot de passe requis" });
    }
    // Vérification de l'existence de l'utilisateur
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ message: "Email ou mot de passe incorrect" });
    }
    // Vérification du mot de passe
    const validPassword = await argon2.verify(user.password, password);
    if (!validPassword) {
      return res
        .status(400)
        .json({ message: "Email ou mot de passe incorrect" });
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
    res.status(500).json({ message: "Erreur serveur" });
  }
  },

  async logoutUser(req, res) {
    try {
      const refreshToken = req.cookies.refreshToken;
      const isProd = process.env.NODE_ENV === "production";
      
      if (refreshToken) {
        // Supprimer le refresh token de la base de données
        await RefreshToken.deleteOne({ token: refreshToken });
      }
      
      // Effacer le cookie côté client
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: isProd,
        sameSite: "Strict",
        partitioned: true,
      });
      
      res.status(200).json({ message: "Utilisateur déconnecté avec succès" });
    } catch (error) {
      console.error("Erreur lors de la déconnexion de l'utilisateur :", error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  },
};
