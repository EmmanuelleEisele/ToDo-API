import Category from "../models/Category.js";
import { ValidationError } from "../errors/AppError.js";

export const categoryController = {
  async createCategory(req, res, next) {
    try {
      const { name, color } = req.body;
      const category = new Category({ name, color });
      await category.save();
      res.status(201).json({ message: "Catégorie créée", category });
    } catch (error) {
      // Gestion des erreurs de validation mongoose
      if (error.name === "ValidationError") {
        return next(new ValidationError(error.message));
      }
      next(error);
    }
  },
};
