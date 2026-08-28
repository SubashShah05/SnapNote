import express from "express";
import {
  getNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  restoreNote,
  permanentDelete,
  toggleFavorite,
  togglePin,
  toggleArchive,
  duplicateNote
} from "../controllers/note.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// Core CRUD
router.get("/get-notes", protect, getNotes);
router.get("/:id", protect, getNoteById);
router.post("/create-note", protect, createNote);
router.put("/update-note/:id", protect, updateNote);
router.delete("/delete-note/:id", protect, deleteNote);   // Soft delete

// Trash operations
router.patch("/:id/restore", protect, restoreNote);
router.delete("/:id/permanent", protect, permanentDelete);

// Toggle flags (optimistic-UI friendly)
router.patch("/:id/favorite", protect, toggleFavorite);
router.patch("/:id/pin", protect, togglePin);
router.patch("/:id/archive", protect, toggleArchive);

// Duplicate
router.post("/:id/duplicate", protect, duplicateNote);

export default router;