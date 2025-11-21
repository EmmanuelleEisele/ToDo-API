import mongoose from "mongoose";
import Category from "../src/models/Category.js";
import dotenv from "dotenv";

dotenv.config();

const categories = [
  { name: "work" },
  { name: "personal" },
  { name: "shopping" },
  { name: "health" },
  { name: "finance" },
  { name: "others" }
];

async function initCategories() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    for (const cat of categories) {
      await Category.updateOne(
        { name: cat.name },
        { $setOnInsert: cat },
        { upsert: true }
      );
    }

    console.log("✔ Catégories initiales insérées si manquantes (aucune suppression).");
  } catch (err) {
    console.error("❌ Erreur :", err);
  } finally {
    await mongoose.disconnect();
  }
}

initCategories();
