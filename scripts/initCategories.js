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

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/todo";

async function initCategories() {
  await mongoose.connect(MONGO_URI);
  // Supprime le champ 'icon' de toutes les catégories existantes
  await Category.updateMany({}, { $unset: { icon: "" } });
  for (const cat of categories) {
    await Category.updateOne({ name: cat.name }, cat, { upsert: true });
  }
  console.log("Catégories fixes initialisées et champ 'icon' supprimé.");
  await mongoose.disconnect();
}

initCategories().catch(console.error);
