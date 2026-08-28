import express from "express";
import { createReminder, getReminders, dismissReminder, deleteReminder } from "../controllers/reminder.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.post("/", createReminder);
router.get("/", getReminders);
router.put("/:id/dismiss", dismissReminder);
router.delete("/:id", deleteReminder);

export default router;
