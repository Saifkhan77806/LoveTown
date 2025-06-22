// db.js
import mongoose from "mongoose";

export async function connectDB() {
  try {
    await mongoose.connect("mongodb+srv://khansaif86783:saifkhan@lovetown.potp8o4.mongodb.net/?retryWrites=true&w=majority&appName=LoveTown");
    console.log("MongoDB connected");
  } catch (err) {
    console.error("Connection failed", err);
  }
}


