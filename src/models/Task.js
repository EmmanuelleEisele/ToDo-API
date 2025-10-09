import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    status: { 
      type: String, 
      enum: ["en cours", "validé", "annulé", "en retard"], 
      default: "en cours" 
    },
    deadline: { type: Date }, // optionnel : date limite
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
  },
  { timestamps: true } // ajoute createdAt et updatedAt
);

const Task = mongoose.model("Task", taskSchema);
export default Task;
