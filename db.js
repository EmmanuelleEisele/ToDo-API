import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Bravo MongoDB Atlas connecté !");
  } catch (error) {
    console.error("❌ Erreur connexion MongoDB :", error);
    process.exit(1);
  }
};

export default connectDB;
