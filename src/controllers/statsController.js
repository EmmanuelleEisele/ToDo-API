import Task from "../models/Task.js";
import mongoose from "mongoose";

export const statsController = {
  // Tâches accomplies par jour
  async completedTasksByDay(req, res, next) {
    try {
      const userId = new mongoose.Types.ObjectId(req.user.id);
      const today = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);
      const result = await Task.aggregate([
        { $match: {
            userId,
            isDone: true,
            completedAt: { $gte: thirtyDaysAgo, $lte: today },
            isArchived: false
          }
        },
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
      console.log(result);
      res.status(200).json({ stats: result });
    } catch (error) {
      next(error);
    }
  },
  async completedTasksByWeek(req, res, next) {
    try {
      const userId = new mongoose.Types.ObjectId(req.user.id);
      const result = await Task.aggregate([
        { $match: { userId, isDone: true, completedAt: { $ne: null }, isArchived: false } },
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
      console.log(result);
      res.status(200).json({ stats: result });
    } catch (error) {
      next(error);
    }
  },
  // Tâches accomplies par mois
  async completedTasksByMonth(req, res, next) {
    try {
      const userId = new mongoose.Types.ObjectId(req.user.id);
      const result = await Task.aggregate([
        { $match: { userId, isDone: true, completedAt: { $ne: null }, isArchived: false } },
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
      console.log(result);
      res.status(200).json({ stats: result });
    } catch (error) {
      next(error);
    }
  },
  // Tâches accomplies par année
  async completedTasksByYear(req, res, next) {
    try {
      const userId = new mongoose.Types.ObjectId(req.user.id);
      const result = await Task.aggregate([
        { $match: { userId, isDone: true, completedAt: { $ne: null }, isArchived: false } },
        {
          $group: {
            _id: { year: { $year: "$completedAt" } },
            count: { $sum: 1 }
          }
        },
        { $sort: { "_id.year": 1 } }
      ]);
      console.log(result);
      res.status(200).json({ stats: result });
    } catch (error) {
      next(error);
    }
  }
};
