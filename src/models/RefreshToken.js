import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema({
  token: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now, expires: "7d" } // auto-suppression après 7 jours
});

export default mongoose.model("RefreshToken", refreshTokenSchema);