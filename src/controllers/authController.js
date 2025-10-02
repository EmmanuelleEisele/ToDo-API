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
        pseudo: newUser.pseudo,
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

      res
        .status(201)
        .json({ message: "Utilisateur enregistré avec succès", data: newUser, token });
    } catch (error) {
      console.error(
        "Erreur lors de l'enregistrement de l'utilisateur :",
        error
      );
      res.status(500).json({ message: "Erreur serveur" });
    }
  },
  loginUser(req, res) {
    // Logique pour connecter un utilisateur
    res.status(200).json({ message: "Utilisateur connecté avec succès" });
  },
  logoutUser(req, res) {
    // Logique pour déconnecter un utilisateur
    res.status(200).json({ message: "Utilisateur déconnecté avec succès" });
  },
};
