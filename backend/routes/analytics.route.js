import express from "express";
import { getDashboardOverview, getActivityTimeline, getProductivityChart, getCalendarData } from "../controllers/analytics.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect); // All routes require authentication

router.get("/overview", getDashboardOverview);
router.get("/activity", getActivityTimeline);
router.get("/productivity", getProductivityChart);
router.get("/calendar", getCalendarData);

export default router;
