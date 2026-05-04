import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import videoRoutes from "./routes/videos.js";
import authRoutes from "./routes/auth.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// Basic route
app.get("/", (req, res) => {
  res.json({ message: "CloneTube Backend API running!" });
});

// MongoDB connection
const startServer = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error("MONGO_URI is missing in .env file");
    }

    console.log("Connecting to MongoDB Atlas...");

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      family: 4
    });

    console.log("MongoDB Atlas connected successfully!");

    // Routes
    app.use("/api/videos", videoRoutes);
    app.use("/api/auth", authRoutes);

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error("Server startup error:", err.message);
    process.exit(1);
  }
};

startServer();