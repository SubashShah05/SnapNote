import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
    changePassword,
    getSessions,
    revokeSession,
    exportData,
    deleteAccount,
    updatePreferences
} from "../controllers/user.controller.js";

const router = express.Router();

router.use(protect); // All user routes are protected

router.put("/password", changePassword);
router.get("/sessions", getSessions);
router.delete("/sessions/:id", revokeSession);
router.get("/export", exportData);
router.delete("/account", deleteAccount);
router.put("/preferences", updatePreferences);

export default router;
