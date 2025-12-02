// db.js
import mongoose from "mongoose";

export async function connectDB() {
  try {
    await mongoose.connect("mongodb+srv://saifkhan77806:saifkhan@lovetowncluster.2j1qkkj.mongodb.net/?appName=lovetownCluster");
    console.log("MongoDB connected");
  } catch (err) {
    console.error("Connection failed", err);
  }
}


