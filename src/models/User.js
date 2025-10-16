import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    pseudo: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, trim: true, minlength: 8 },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
  },
  { timestamps: true } // ajoute createdAt et updatedAt automatiquement
);

const User = mongoose.model("User", userSchema);
export default User;