import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";
import rateLimit from "express-rate-limit";
import { createServer } from "http";
import noteRoutes     from "./routes/note.route.js";
import authRoutes     from "./routes/auth.route.js";
import folderRoutes   from "./routes/folder.route.js";
import taskRoutes     from "./routes/task.route.js";
import activityRoutes from "./routes/activity.route.js";
import statsRoutes    from "./routes/stats.route.js";
import aiRoutes       from "./routes/ai.route.js";
import shareRoutes    from "./routes/share.route.js";
import analyticsRoutes from "./routes/analytics.route.js";
import reminderRoutes from "./routes/reminder.route.js";
import userRoutes     from "./routes/user.route.js";
import adminRoutes    from "./routes/admin.route.js";
import { initSocket } from "./socket/socket.js";
import { startCronJobs } from "./services/cron.service.js";

const app = express();
const httpServer = createServer(app);
dotenv.config();
const port = process.env.PORT || 4004;

// Database Connection with Retry
const connectDB = async (retries = 5) => {
  while (retries) {
    try {
      await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log("Connected to MongoDB successfully");
      break;
    } catch (error) {
      console.error(`MongoDB connection failed. Retries left: ${retries - 1}`, error.message);
      retries -= 1;
      if (retries === 0) {
        console.error("Could not connect to MongoDB. Exiting...");
        process.exit(1);
      }
      await new Promise(res => setTimeout(res, 5000));
    }
  }
};
connectDB();

// Start Cron Jobs
startCronJobs();

// Security Middleware
app.use(helmet());
app.use(express.json({ limit: "50kb" })); // Reduced payload size for production
app.use(mongoSanitize());
app.use(xss());

// Global Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per windowMs
  message: { success: false, message: "Too many requests from this IP, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", apiLimiter);

// CORS Configuration
const allowedOrigins = [
  "http://localhost:5173", // Development
  "http://localhost:5174", // Development (alternate)
  "https://snapnote.app",  // Production
];
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests) only if appropriate,
    // but typically for web apps we restrict it:
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

// Initialize Socket.IO
initSocket(httpServer, allowedOrigins);

// Health and Readiness Checks
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/api/health/ready", (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  if (isDbConnected) {
    res.status(200).json({ status: "ok", database: "connected" });
  } else {
    res.status(503).json({ status: "error", database: "disconnected" });
  }
});

// Routes
app.use("/api/v1/auth",     authRoutes);
app.use("/api/v1/noteapp",  noteRoutes);
app.use("/api/v1/folders",  folderRoutes);
app.use("/api/v1/tasks",    taskRoutes);
app.use("/api/v1/activity", activityRoutes);
app.use("/api/v1/stats",    statsRoutes);
app.use("/api/v1/ai",       aiRoutes);
app.use("/api/v1/share",    shareRoutes);
app.use("/api/v1/analytics", analyticsRoutes);
app.use("/api/v1/reminders", reminderRoutes);
app.use("/api/v1/user",      userRoutes);
app.use("/api/v1/admin",     adminRoutes);

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  // Only log stack trace in development mode
  if (process.env.NODE_ENV !== "production") {
    console.error("Unhandled Error:", err);
  } else {
    console.error(`[${new Date().toISOString()}] Unhandled Error: ${err.message}`);
  }
  
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({ success: false, message: "CORS origin blocked" });
  }
  
  res.status(500).json({ 
    success: false, 
    message: "Something went wrong. Please try again later." 
  });
});

// Start Server using httpServer instead of app
const server = httpServer.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

// Graceful Shutdown
const shutdown = async (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  
  server.close(async () => {
    console.log("HTTP server closed.");
    
    try {
      await mongoose.connection.close();
      console.log("MongoDB connection closed.");
      process.exit(0);
    } catch (err) {
      console.error("Error during MongoDB disconnect", err);
      process.exit(1);
    }
  });

  // Force close after 10 seconds
  setTimeout(() => {
    console.error("Could not close connections in time, forcefully shutting down");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

export { app, server };