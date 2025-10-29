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

      let categoryObjectId = null;
      if (categoryId) {
        // Si categoryId est un nom, cherche l'_id correspondant
        if (typeof categoryId === "string" && categoryId.length < 24) {
          const category = await Category.findOne({ name: categoryId });
          if (!category) {
            return next(new ValidationError("Catégorie invalide"));
          }
          categoryObjectId = category._id;
        } else {
          // On suppose que c'est déjà un ObjectId valide
          categoryObjectId = categoryId;
        }
      }

      const newTask = new Task({
        title,
        description,
        status,
        isDone,
        period,
        priority,
        categoryId: categoryObjectId,
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

      const task = await Task.findOne({ _id: taskId, userId: userId });

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
      const tasks = await Task.find({ userId: userId });

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
      console.log("=== updateTask START ===");
      console.log("Body reçu:", req.body);

      const userId = req.user.id;
      const taskId = req.params.id;
      const {
        title,
        description,
        status,
        deadline,
        categoryId,
        categoryName,
        isDone,
        priority,
        period,
      } = req.body;

      console.log("userId:", userId, "taskId:", taskId);

      // Chercher la tâche
      const task = await Task.findOne({ _id: taskId, userId: userId });
      if (!task) {
        return next(new NotFoundError("Tâche non trouvée"));
      }

      console.log("Tâche trouvée:", task.title);

      // Mettre à jour les champs uniquement s'ils sont définis
      if (title !== undefined) task.title = title;
      if (description !== undefined) task.description = description;
      if (priority !== undefined) task.priority = priority;
      if (period !== undefined) task.period = period;
      if (deadline !== undefined) task.deadline = deadline;
      if (status !== undefined) task.status = status;
      if (isDone !== undefined) {
        console.log("Changement isDone:", task.isDone, "->", isDone);
        task.isDone = isDone; // ✅ Cela va déclencher le pre('save')
      }

      // Gérer la catégorie
      if (categoryName && !categoryId) {
        const category = await Category.findOne({ name: categoryName });
        if (!category) {
          return next(
            new ValidationError("Catégorie non trouvée: " + categoryName)
          );
        }
        task.categoryId = category._id;
      } else if (categoryId !== undefined) {
        task.categoryId = categoryId;
      }

      console.log("Avant save - status:", task.status, "isDone:", task.isDone);

      // ✅ Utiliser .save() pour déclencher le middleware pre('save')
      await task.save();

      console.log("Après save - status:", task.status, "isDone:", task.isDone);

      // ✅ Rafraîchir la tâche avec population
      const updatedTask = await Task.findById(task._id).populate("categoryId");

      console.log("=== updateTask END - SUCCESS ===");
      res.status(200).json({
        message: "Tâche mise à jour avec succès",
        data: updatedTask,
      });
    } catch (error) {
      console.error("=== updateTask ERROR ===", error);
      console.error("Stack:", error.stack);
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
