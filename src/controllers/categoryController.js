import Category from "../models/Category.js";
import { ValidationError, NotFoundError } from "../errors/AppError.js";

export const categoryController = {
  async getAllCategories(req, res, next) {
    try {
      const categories = await Category.find();
      res.status(200).json({
        message: "Catégories récupérées avec succès",
        data: categories
      });
    } catch (error) {
      next(error);
    }
  },

  async createCategory(req, res, next) {
    try {
      const { name, color } = req.body;
      const category = new Category({ name, color });
      await category.save();
      res.status(201).json({ 
        message: "Catégorie créée", 
        data: category 
      });
    } catch (error) {
      // Gestion des erreurs de validation mongoose
      if (error.name === "ValidationError") {
        return next(new ValidationError(error.message));
      }
      next(error);
    }
  },

  async deleteCategory(req, res, next) {
    try {
      const { id } = req.params;
      const category = await Category.findByIdAndDelete(id);
      
      if (!category) {
        return next(new NotFoundError("Catégorie non trouvée"));
      }

      res.status(200).json({
        message: "Catégorie supprimée avec succès"
      });
    } catch (error) {
      next(error);
    }
  }
};
