import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import noteRoutes from "./routes/note.route.js"; // ⚠ add .js extension

const app = express();
dotenv.config();
const port = process.env.PORT || 4004;

// Database Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
  }
};
connectDB();

// Middleware
app.use(express.json());
app.use(cors());
app.use("/api/v1/noteapp", noteRoutes);

// Start Server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});