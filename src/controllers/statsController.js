import Task from "../models/Task.js";

export const statsController = {
  // Tâches accomplies par jour
  async completedTasksByDay(req, res, next) {
    try {
      const userId = req.user.id;
      const result = await Task.aggregate([
        { $match: { userId: Task.schema.path('userId').instance === 'ObjectID' ? userId : userId.toString(), isDone: true, completedAt: { $ne: null } } },
        {
          $group: {
            _id: {
              year: { $year: "$completedAt" },
              month: { $month: "$completedAt" },
              day: { $dayOfMonth: "$completedAt" }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
      ]);
      res.status(200).json({ stats: result });
    } catch (error) {
      next(error);
    }
  },
  async completedTasksByWeek(req, res, next) {
    try {
      const userId = req.user.id;
      const result = await Task.aggregate([
        { $match: { userId: Task.schema.path('userId').instance === 'ObjectID' ? userId : userId.toString(), isDone: true, completedAt: { $ne: null } } },
        {
          $group: {
            _id: {
              year: { $year: "$completedAt" },
              week: { $isoWeek: "$completedAt" }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { "_id.year": 1, "_id.week": 1 } }
      ]);
      res.status(200).json({ stats: result });
    } catch (error) {
      next(error);
    }
  },
  // Tâches accomplies par mois
  async completedTasksByMonth(req, res, next) {
    try {
      const userId = req.user.id;
      const result = await Task.aggregate([
        { $match: { userId: Task.schema.path('userId').instance === 'ObjectID' ? userId : userId.toString(), isDone: true, completedAt: { $ne: null } } },
        {
          $group: {
            _id: {
              year: { $year: "$completedAt" },
              month: { $month: "$completedAt" }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
      ]);
      res.status(200).json({ stats: result });
    } catch (error) {
      next(error);
    }
  },
  // Tâches accomplies par année
  async completedTasksByYear(req, res, next) {
    try {
      const userId = req.user.id;
      const result = await Task.aggregate([
        { $match: { userId: Task.schema.path('userId').instance === 'ObjectID' ? userId : userId.toString(), isDone: true, completedAt: { $ne: null } } },
        {
          $group: {
            _id: { year: { $year: "$completedAt" } },
            count: { $sum: 1 }
          }
        },
        { $sort: { "_id.year": 1 } }
      ]);
      res.status(200).json({ stats: result });
    } catch (error) {
      next(error);
    }
  }
};
