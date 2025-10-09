/**
 * Middleware de validation des mots de passe
 * Applique des règles de sécurité strictes pour les mots de passe
 */

export const validatePassword = (req, res, next) => {
  const { password } = req.body;

  if (!password) {
    return next(); // Laisser d'autres middlewares gérer les champs requis
  }

  const errors = [];

  // Longueur minimale
  if (password.length < 8) {
    errors.push("Le mot de passe doit contenir au moins 8 caractères");
  }

  // Longueur maximale (pour éviter les attaques DoS)
  if (password.length > 128) {
    errors.push("Le mot de passe ne peut pas dépasser 128 caractères");
  }

  // Au moins une lettre minuscule
  if (!/[a-z]/.test(password)) {
    errors.push("Le mot de passe doit contenir au moins une lettre minuscule");
  }

  // Au moins une lettre majuscule
  if (!/[A-Z]/.test(password)) {
    errors.push("Le mot de passe doit contenir au moins une lettre majuscule");
  }

  // Au moins un chiffre
  if (!/\d/.test(password)) {
    errors.push("Le mot de passe doit contenir au moins un chiffre");
  }

  // Au moins un caractère spécial
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push("Le mot de passe doit contenir au moins un caractère spécial");
  }

  // Vérifier les patterns communs faibles
  const commonPatterns = [
    /123456/,
    /password/i,
    /qwerty/i,
    /azerty/i,
    /admin/i,
    /(.)\1{2,}/, // Caractères répétés 3 fois ou plus
  ];

  for (const pattern of commonPatterns) {
    if (pattern.test(password)) {
      errors.push("Le mot de passe contient des éléments trop prévisibles");
      break;
    }
  }

  // Vérifier les suites de caractères
  const hasSequence = (str) => {
    const sequences = [
      "abcdefghijklmnopqrstuvwxyz",
      "0123456789",
      "qwertyuiop",
      "asdfghjkl",
      "zxcvbnm",
      "azerty",
      "qsdfgh",
      "wxcvbn",
    ];
    for (const seq of sequences) {
      for (let i = 0; i <= seq.length - 4; i++) {
        const subseq = seq.substring(i, i + 4);
        if (
          str.toLowerCase().includes(subseq) ||
          str.toLowerCase().includes(subseq.split("").reverse().join(""))
        ) {
          return true;
        }
      }
    }
    return false;
  };

  if (hasSequence(password)) {
    errors.push("Le mot de passe ne doit pas contenir de suites de caractères");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: "Mot de passe non sécurisé",
      details: errors,
      suggestions: [
        "Utilisez au moins 8 caractères",
        "Mélangez majuscules, minuscules, chiffres et symboles",
        "Évitez les mots courants et les suites de caractères",
        "Ne répétez pas les mêmes caractères",
      ],
    });
  }

  next();
};

// Middleware pour vérifier la force du mot de passe (optionnel, plus permissif)
export const checkPasswordStrength = (req, res, next) => {
  const { password } = req.body;

  if (!password) {
    return next();
  }

  let score = 0;
  let feedback = [];

  // Longueur
  if (password.length >= 8) score += 1;
  else feedback.push("Augmentez la longueur (minimum 8 caractères)");

  if (password.length >= 12) score += 1;

  // Complexité
  if (/[a-z]/.test(password)) score += 1;
  else feedback.push("Ajoutez des lettres minuscules");

  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push("Ajoutez des lettres majuscules");

  if (/\d/.test(password)) score += 1;
  else feedback.push("Ajoutez des chiffres");

  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 1;
  else feedback.push("Ajoutez des caractères spéciaux");

  // Diversité
  const uniqueChars = new Set(password).size;
  if (uniqueChars >= password.length * 0.7) score += 1;

  let strength = "Très faible";
  if (score >= 6) strength = "Fort";
  else if (score >= 4) strength = "Moyen";
  else if (score >= 2) strength = "Faible";

  // Ajouter les informations à la requête pour utilisation ultérieure
  req.passwordStrength = {
    score,
    strength,
    feedback: feedback.length > 0 ? feedback : ["Mot de passe sécurisé"],
  };

  next();
};

export default {
  validatePassword,
  checkPasswordStrength,
};
