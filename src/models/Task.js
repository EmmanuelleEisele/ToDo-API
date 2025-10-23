import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    status: {
      type: String,
      enum: ["todo", "done", "cancelled", "overdue"],
      default: "todo",
    },
    isDone: {
      type: Boolean,
      default: false
    },
    period: {
      type: String,
      enum: ["day", "week", "month", "year"],
      required: true,
    },
    deadline: { // optionnel : date limite
      type: Date
     },
    completedAt: {
      type: Date,
      default: null
    },
    priority: { 
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category"
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Met à jour le status automatiquement si isDone est true
taskSchema.pre('save', function(next) {
  try {
    if (this.isDone === true) {
      this.status = 'done';
      if (!this.completedAt) {
        this.completedAt = new Date();
      }
    } else if (this.isDone === false) {
      // Si isDone est false et status est 'done', on le remet à 'todo'
      if (this.status === 'done') {
        this.status = 'todo';
      }
      this.completedAt = null;
    }
    next();
  } catch (error) {
    next(error);
  }
});

const Task = mongoose.model("Task", taskSchema);
export default Task;
