// db.js
const mongoose = require("mongoose");

async function connectDB() {
  try {
    await mongoose.connect("mongodb+srv://khansaif86783:saifkhan@cluster0.im8kvce.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");
    console.log("MongoDB connected");
  } catch (err) {
    console.error("Connection failed", err);
  }
}

module.exports = connectDB;
