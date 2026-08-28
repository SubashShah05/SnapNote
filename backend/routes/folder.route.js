import express from "express";
import {
    getFolders,
    createFolder,
    updateFolder,
    deleteFolder
} from "../controllers/folder.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protect, getFolders);
router.post("/", protect, createFolder);
router.put("/:id", protect, updateFolder);
router.delete("/:id", protect, deleteFolder);

export default router;
