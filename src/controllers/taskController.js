import Task from "../models/Task.js";

export const taskController = {

  async createTask(req, res) {
    try {
      // Logique pour créer une tâche
      const { title, description, status, deadline } = req.body;
      const newTask = new Task({
        title,
        description,
        status,
        deadline,
        userId: req.user.id,
      });
      await newTask.save();
      res
        .status(201)
        .json({ message: "Tâche créée avec succès", data: newTask });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Erreur lors de la création de la tâche" });
    }
  },


  async getTasks(req, res) {
    // Logique pour récupérer les tâches
    try {
      const userId = req.user.id;
      const tasks = await Task.find({ "user.id": userId });
      res
        .status(200)
        .json({
          message: "Liste des tâches récupérée avec succès",
          data: tasks,
        });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Erreur lors de la récupération des tâches" });
    }
  },


  async updateTask(req, res) {
    // Logique pour mettre à jour une tâche
    try {
      const userId = req.user.id;
      const taskId = req.params.id;
      const { title, description, status, deadline } = req.body;
      const task = await Task.findOneAndUpdate(
        { _id: taskId, "user.id": userId },
        { title, description, status, deadline },
        { new: true }
      );
      if (!task) {
        return res.status(404).json({ message: "Tâche non trouvée" });
      }

      res.status(200).json({ message: "Tâche mise à jour avec succès" }, { data: task });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Erreur lors de la mise à jour de la tâche" });
    }
  },


  deleteTask(req, res) {
    // Logique pour supprimer une tâche
    try {
      const userId = req.user.id;
      const taskId = req.params.id;
      const task = Task.findOneAndDelete({ _id: taskId, "user.id": userId });
      if (!task) {
        return res.status(404).json({ message: "Tâche non trouvée" });
      }
      res.status(200).json({ message: "Tâche supprimée avec succès" });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Erreur lors de la suppression de la tâche" });
    }
  },
};
