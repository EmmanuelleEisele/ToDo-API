import Task from "../models/Task.js";
import Category from "../models/Category.js";
import { ValidationError, NotFoundError } from "../errors/AppError.js";

export const taskController = {
  async createTask(req, res, next) {
    try {
      const {
        title,
        description,
        status,
        deadline,
        categoryId,
        isDone,
        priority,
        period,
      } = req.body;

      if (!title) {
        return next(new ValidationError("Le titre est requis"));
      }
      if (!period) {
        return next(new ValidationError("La période est requise"));
      }

      // Permet aussi d'accepter categoryId comme string (ObjectId)
      const newTask = new Task({
        title,
        description,
        status,
        isDone,
        period,
        priority,
        categoryId,
        deadline,
        userId: req.user.id,
      });

      await newTask.save();
      res.status(201).json({
        message: "Tâche créée avec succès",
        data: newTask,
      });
    } catch (error) {
      next(error);
    }
  },

  async getTaskById(req, res, next) {
    try {
      const userId = req.user.id;
      const taskId = req.params.id;

      const task = await Task.findOne({ _id: taskId, userId: userId }).populate(
        "categoryId"
      );

      if (!task) {
        return next(new NotFoundError("Tâche non trouvée"));
      }

      res.status(200).json({
        message: "Tâche récupérée avec succès",
        data: task,
      });
    } catch (error) {
      next(error);
    }
  },

  async getTasks(req, res, next) {
    try {
      const userId = req.user.id;
      const tasks = await Task.find({ userId: userId }).populate("categoryId");

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
      const updateFields = {};
      const {
        title,
        description,
        status,
        deadline,
        categoryId,
        isDone,
        priority,
        period,
      } = req.body;

      if (title !== undefined) updateFields.title = title;
      if (description !== undefined) updateFields.description = description;
      if (status !== undefined) updateFields.status = status;
      if (deadline !== undefined) updateFields.deadline = deadline;
      if (isDone !== undefined) updateFields.isDone = isDone;
      if (priority !== undefined) updateFields.priority = priority;
      if (period !== undefined) updateFields.period = period;
      if (categoryId !== undefined) updateFields.categoryId = categoryId;

      const task = await Task.findOneAndUpdate(
        { _id: taskId, userId: userId },
        updateFields,
        { new: true }
      ).populate("categoryId");

      if (!task) {
        return next(new NotFoundError("Tâche non trouvée"));
      }

      res.status(200).json({
        message: "Tâche mise à jour avec succès",
        data: task,
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
