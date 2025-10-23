import Task from "../models/Task.js";
import Category from "../models/Category.js";
import { ValidationError, NotFoundError } from "../errors/AppError.js";

export const taskController = {

  async createTask(req, res, next) {
    try {
      const { title, description, status, deadline, categoryId, categoryName, isDone, priority, period } = req.body;

      if (!title) {
        return next(new ValidationError("Le titre est requis"));
      }
      if (!period) {
        return next(new ValidationError("La période est requise"));
      }

      let finalCategoryId = categoryId;
      // Si categoryId n'est pas fourni mais categoryName oui, on cherche l'ObjectId
      if (!finalCategoryId && req.body.categoryName) {
        const category = await Category.findOne({ name: req.body.categoryName });
        if (!category) {
          return next(new ValidationError("Catégorie non trouvée: " + req.body.categoryName));
        }
        finalCategoryId = category._id;
      }

      // Permet aussi d'accepter categoryId comme string (ObjectId)
      const newTask = new Task({
        title,
        description,
        status,
        isDone,
        period,
        priority,
        categoryId: finalCategoryId,
        deadline,
        userId: req.user.id,
      });

      await newTask.save();
      res.status(201).json({
        message: "Tâche créée avec succès",
        data: newTask
      });
    } catch (error) {
      next(error);
    }
  },

  async getTaskById(req, res, next) {
    try {
      const userId = req.user.id;
      const taskId = req.params.id;

      const task = await Task.findOne({ _id: taskId, userId: userId }).populate('categoryId');
      
      if (!task) {
        return next(new NotFoundError("Tâche non trouvée"));
      }

      res.status(200).json({
        message: "Tâche récupérée avec succès",
        data: task
      });
    } catch (error) {
      next(error);
    }
  },

  async getTasks(req, res, next) {
    try {
      const userId = req.user.id;
      const tasks = await Task.find({ userId: userId }).populate('categoryId');
      
      res.status(200).json({
        message: "Liste des tâches récupérée avec succès",
        data: tasks,
      });
    } catch (error) {
      next(error);
    }
  },


  async updateTask(req, res, next) {
    try {
      const userId = req.user.id;
      const taskId = req.params.id;
      const updateFields = req.body;

      if (!updateFields.categoryId && req.body.categoryName) {
        const category = await Category.findOne({ name: req.body.categoryName });
        if (!category) {
          return next(new ValidationError("Catégorie non trouvée: " + req.body.categoryName));
        }
        updateFields.categoryId = category._id;
      }

      const task = await Task.findOneAndUpdate(
        { _id: taskId, userId: userId },
        updateFields, // Mise à jour avec les champs fournis
        { new: true }
      ).populate('categoryId');

      if (!task) {
        return next(new NotFoundError("Tâche non trouvée"));
      }

      res.status(200).json({
        message: "Tâche mise à jour avec succès",
        data: task
      });
    } catch (error) {
      next(error);
    }
  },


  async deleteTask(req, res, next) {
    try {
      const userId = req.user.id;
      const taskId = req.params.id;
      
      const task = await Task.findOneAndDelete({ _id: taskId, userId: userId });
      
      if (!task) {
        return next(new NotFoundError("Tâche non trouvée"));
      }
      
      res.status(200).json({ message: "Tâche supprimée avec succès" });
    } catch (error) {
      next(error);
    }
  },
};
