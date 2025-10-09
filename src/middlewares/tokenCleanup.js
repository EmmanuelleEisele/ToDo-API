import RefreshToken from "../models/RefreshToken.js";
import User from "../models/User.js";

/**
 * Middleware de nettoyage automatique des tokens
 */
export const cleanupTokens = async (req, res, next) => {
  try {
    // Nettoyer les refresh tokens orphelins (utilisateurs supprimés)
    const orphanedTokens = await RefreshToken.find({}).populate("userId");
    const tokensToDelete = orphanedTokens.filter((token) => !token.userId);

    if (tokensToDelete.length > 0) {
      await RefreshToken.deleteMany({
        _id: { $in: tokensToDelete.map((t) => t._id) },
      });
      console.log(
        `🧹 Nettoyage : ${tokensToDelete.length} tokens orphelins supprimés`
      );
    }

    next();
  } catch (error) {
    // Ne pas bloquer la requête pour un problème de nettoyage
    console.error("Erreur lors du nettoyage des tokens:", error);
    next();
  }
};

/**
 * Fonction utilitaire pour forcer le nettoyage
 */
export const forceCleanupTokens = async () => {
  try {
    // Supprimer les tokens d'utilisateurs inexistants
    const allTokens = await RefreshToken.find({});
    let deletedCount = 0;

    for (const token of allTokens) {
      const userExists = await User.findById(token.userId);
      if (!userExists) {
        await RefreshToken.deleteOne({ _id: token._id });
        deletedCount++;
      }
    }

    console.log(
      `🧹 Nettoyage forcé : ${deletedCount} tokens orphelins supprimés`
    );
    return deletedCount;
  } catch (error) {
    console.error("Erreur lors du nettoyage forcé:", error);
    throw error;
  }
};
