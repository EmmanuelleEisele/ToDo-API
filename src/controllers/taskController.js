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
    const { title, description, status, deadline, categoryId, categoryName, isDone, priority, period } = req.body;

    // Chercher la tâche
    const task = await Task.findOne({ _id: taskId, userId: userId });
    if (!task) {
      return next(new NotFoundError("Tâche non trouvée"));
    }

    // Mettre à jour les champs uniquement s'ils sont définis
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (priority !== undefined) task.priority = priority;
    if (period !== undefined) task.period = period;
    if (deadline !== undefined) task.deadline = deadline;
    if (status !== undefined) task.status = status;
    if (isDone !== undefined) task.isDone = isDone; // ✅ Cela va déclencher le pre('save')

    // Gérer la catégorie
    if (categoryName && !categoryId) {
      const category = await Category.findOne({ name: categoryName });
      if (!category) {
        return next(new ValidationError("Catégorie non trouvée: " + categoryName));
      }
      task.categoryId = category._id;
    } else if (categoryId !== undefined) {
      task.categoryId = categoryId;
    }

    // ✅ Utiliser .save() pour déclencher le middleware pre('save')
    try {
      await task.save();
    } catch (saveError) {
      console.error('Erreur lors de la sauvegarde de la tâche:', saveError);
      return next(saveError);
    }
    
    // ✅ Rafraîchir la tâche avec population
    const updatedTask = await Task.findById(task._id).populate('categoryId');

    res.status(200).json({
      message: "Tâche mise à jour avec succès",
      data: updatedTask
    });
  } catch (error) {
    console.error('Erreur updateTask:', error);
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
