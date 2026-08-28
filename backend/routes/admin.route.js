import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { admin } from "../middleware/admin.middleware.js";
import { getStats, getAuditLogs } from "../controllers/admin.controller.js";

const router = express.Router();

router.use(protect);
router.use(admin);

router.get("/stats", getStats);
router.get("/audit", getAuditLogs);

export default router;
