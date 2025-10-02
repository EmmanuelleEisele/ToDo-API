import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, trim: true, minlength: 8,  },
  },
  { timestamps: true } // ajoute createdAt et updatedAt automatiquement
);

const User = mongoose.model("User", userSchema);
export default User;