import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  inviteCollaborator,
  respondToInvite,
  getNoteCollaborators,
  changeRole,
  revokeAccess,
  getSharedNotes,
  getNotifications,
  markNotificationsRead
} from "../controllers/share.controller.js";

const router = express.Router();

router.use(protect); // All routes require authentication

router.post("/invite", inviteCollaborator);
router.post("/respond", respondToInvite);
router.get("/note/:noteId", getNoteCollaborators);
router.put("/role", changeRole);
router.delete("/revoke/:shareId", revokeAccess);
router.get("/shared-with-me", getSharedNotes);

// Notifications
router.get("/notifications", getNotifications);
router.put("/notifications/read", markNotificationsRead);

export default router;
