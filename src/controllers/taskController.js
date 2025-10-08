import Task from "../models/Task.js";
import { ValidationError, NotFoundError } from "../errors/AppError.js";

export const taskController = {

  async createTask(req, res, next) {
    try {
      const { title, description, status, deadline } = req.body;
      
      if (!title) {
        return next(new ValidationError("Le titre est requis"));
      }
      
      const newTask = new Task({
        title,
        description,
        status,
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

      const task = await Task.findOne({ _id: taskId, userId: userId });
      
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
      const userId = req.user.id;
      const taskId = req.params.id;
      const { title, description, status, deadline } = req.body;
      
      const task = await Task.findOneAndUpdate(
        { _id: taskId, userId: userId },
        { title, description, status, deadline },
        { new: true }
      );
      
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
