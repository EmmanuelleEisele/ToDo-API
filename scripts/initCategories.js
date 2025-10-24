import mongoose from "mongoose";
import Category from "../src/models/Category.js";

const categories = [
  { name: "work", icon: "briefcase" },
  { name: "personal", icon: "user" },
  { name: "shopping", icon: "shopping-cart" },
  { name: "health", icon: "heartbeat" },
  { name: "finance", icon: "dollar-sign" },
  { name: "others", icon: "star" }
];

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/todo";

async function initCategories() {
  await mongoose.connect(MONGO_URI);
  for (const cat of categories) {
    await Category.updateOne({ name: cat.name }, cat, { upsert: true });
  }
  console.log("Catégories fixes initialisées.");
  await mongoose.disconnect();
}

initCategories().catch(console.error);
