import express from "express";
import { getTasks, createTask, updateTask, toggleTask, deleteTask } from "../controllers/task.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// All task routes require authentication
router.get("/",          protect, getTasks);
router.post("/",         protect, createTask);
router.put("/:id",       protect, updateTask);
router.patch("/:id/toggle", protect, toggleTask);
router.delete("/:id",    protect, deleteTask);

export default router;
