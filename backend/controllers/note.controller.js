import Note from "../models/note.model.js";
import Folder from "../models/folder.model.js";
import Activity from "../models/activity.model.js";

// --- Helpers ---
const normalizeTags = (tags) => {
    if (!Array.isArray(tags)) return [];
    return [...new Set(
        tags
            .map(t => t.toString().toLowerCase().trim().replace(/[^a-z0-9-_]/g, ""))
            .filter(t => t.length > 0 && t.length <= 30)
    )].slice(0, 10);
};

const verifyFolderOwnership = async (folderId, userId) => {
    if (!folderId) return true;
    const folder = await Folder.findOne({ _id: folderId, user: userId });
    return !!folder;
};

// Escape special regex characters from user input
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Allowed sort fields — whitelist prevents arbitrary MongoDB operator injection
const SORT_MAP = {
    updated_desc: { isPinned: -1, updatedAt: -1 },
    updated_asc:  { isPinned: -1, updatedAt:  1 },
    created_desc: { isPinned: -1, createdAt: -1 },
    created_asc:  { isPinned: -1, createdAt:  1 },
    title_asc:    { isPinned: -1, title: 1 },
    title_desc:   { isPinned: -1, title: -1 },
};

// Log activity — fire-and-forget (don't await in critical path)
const logActivity = (userId, type, entityId, entityType, metadata = {}) => {
    Activity.create({ user: userId, type, entityId, entityType, metadata })
        .catch(err => console.error("Activity log error:", err));
};

// ============================================================
// GET /noteapp/get-notes
// ?view=active|archived|trash|favorites|pinned|folder:ID|tag:NAME
// &search=query
// &sort=updated_desc|updated_asc|created_desc|created_asc|title_asc|title_desc
// &page=1&limit=20
// &dateFrom=ISO&dateTo=ISO
// ============================================================
export const getNotes = async (req, res) => {
    try {
        const {
            view    = "active",
            search  = "",
            sort    = "updated_desc",
            page    = "1",
            limit   = "20",
            dateFrom,
            dateTo
        } = req.query;

        const userId = req.user._id;

        // Validate pagination
        const pageNum  = Math.max(1, parseInt(page, 10)  || 1);
        const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
        const skip     = (pageNum - 1) * limitNum;

        // Validate sort — only allow whitelisted values
        const sortObj = SORT_MAP[sort] || SORT_MAP.updated_desc;

        // --- Build base filter ---
        let filter = { user: userId };

        if (view === "active") {
            filter.isDeleted = false;
            filter.isArchived = false;
        } else if (view === "archived") {
            filter.isDeleted = false;
            filter.isArchived = true;
        } else if (view === "trash") {
            filter.isDeleted = true;
        } else if (view === "favorites") {
            filter.isDeleted = false;
            filter.isArchived = false;
            filter.isFavorite = true;
        } else if (view === "pinned") {
            filter.isDeleted = false;
            filter.isArchived = false;
            filter.isPinned = true;
        } else if (view.startsWith("folder:")) {
            const folderId = view.split(":")[1];
            // Verify folder belongs to user
            if (!(await verifyFolderOwnership(folderId, userId))) {
                return res.status(403).json({ message: "Folder not found or unauthorized" });
            }
            filter.isDeleted = false;
            filter.isArchived = false;
            filter.folder = folderId;
        } else if (view.startsWith("tag:")) {
            const tag = view.split(":")[1].toLowerCase().replace(/[^a-z0-9-_]/g, "");
            filter.isDeleted = false;
            filter.isArchived = false;
            filter.tags = tag;
        } else {
            filter.isDeleted = false;
            filter.isArchived = false;
        }

        // --- Date range filter ---
        if (dateFrom || dateTo) {
            filter.createdAt = {};
            if (dateFrom) {
                const from = new Date(dateFrom);
                if (!isNaN(from.getTime())) filter.createdAt.$gte = from;
            }
            if (dateTo) {
                const to = new Date(dateTo);
                if (!isNaN(to.getTime())) {
                    to.setHours(23, 59, 59, 999);
                    filter.createdAt.$lte = to;
                }
            }
            if (Object.keys(filter.createdAt).length === 0) delete filter.createdAt;
        }

        // --- Search filter ---
        const trimmedSearch = search.trim().slice(0, 200); // hard limit on query length
        if (trimmedSearch) {
            const safeSearch = escapeRegex(trimmedSearch);
            const regex = new RegExp(safeSearch, "i");
            filter.$or = [
                { title:   regex },
                { content: regex },
                { tags:    { $elemMatch: { $regex: safeSearch, $options: "i" } } }
            ];
        }

        // --- Execute query with pagination ---
        const [notes, total] = await Promise.all([
            Note.find(filter)
                .populate("folder", "name color")
                .sort(sortObj)
                .skip(skip)
                .limit(limitNum),
            Note.countDocuments(filter)
        ]);

        res.status(200).json({
            notes,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum),
                hasMore: pageNum * limitNum < total
            }
        });
    } catch (error) {
        console.error("Get Notes Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// ============================================================
// GET /noteapp/:id
// ============================================================
export const getNoteById = async (req, res) => {
    try {
        const note = await Note.findOne({ _id: req.params.id, user: req.user._id })
            .populate("folder", "name color");
        if (!note) return res.status(404).json({ message: "Note not found or unauthorized" });
        res.status(200).json(note);
    } catch (error) {
        console.error("Get Note Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// ============================================================
// POST /noteapp/create-note
// ============================================================
export const createNote = async (req, res) => {
    try {
        const { title, content = "", folder = null, tags = [] } = req.body;

        if (!title || title.trim().length === 0) {
            return res.status(400).json({ message: "Title is required" });
        }
        if (title.trim().length > 200) {
            return res.status(400).json({ message: "Title cannot exceed 200 characters" });
        }

        // Verify folder ownership
        if (folder && !(await verifyFolderOwnership(folder, req.user._id))) {
            return res.status(403).json({ message: "Folder not found or unauthorized" });
        }

        const normalizedTags = normalizeTags(tags);

        const newNote = new Note({
            title: title.trim(),
            content,
            user: req.user._id,
            folder: folder || null,
            tags: normalizedTags
        });
        await newNote.save();
        await newNote.populate("folder", "name color");

        logActivity(req.user._id, "NOTE_CREATED", newNote._id, "NOTE", { title: newNote.title });

        res.status(201).json(newNote);
    } catch (error) {
        console.error("Create Note Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// ============================================================
// PUT /noteapp/update-note/:id
// ============================================================
export const updateNote = async (req, res) => {
    try {
        const { title, content, folder, tags } = req.body;

        const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
        if (!note) return res.status(404).json({ message: "Note not found or unauthorized" });
        if (note.isDeleted) return res.status(400).json({ message: "Cannot edit a deleted note" });

        // Validate title
        if (title !== undefined) {
            if (title.trim().length === 0) return res.status(400).json({ message: "Title cannot be empty" });
            if (title.trim().length > 200) return res.status(400).json({ message: "Title cannot exceed 200 characters" });
            note.title = title.trim();
        }
        if (content !== undefined) note.content = content;

        // Validate folder
        if (folder !== undefined) {
            if (folder && !(await verifyFolderOwnership(folder, req.user._id))) {
                return res.status(403).json({ message: "Folder not found or unauthorized" });
            }
            note.folder = folder || null;
        }

        if (tags !== undefined) note.tags = normalizeTags(tags);

        await note.save();
        await note.populate("folder", "name color");

        logActivity(req.user._id, "NOTE_UPDATED", note._id, "NOTE", { title: note.title });

        res.status(200).json(note);
    } catch (error) {
        console.error("Update Note Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// ============================================================
// DELETE /noteapp/delete-note/:id  →  SOFT DELETE (move to trash)
// ============================================================
export const deleteNote = async (req, res) => {
    try {
        const note = await Note.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id, isDeleted: false },
            { isDeleted: true, deletedAt: new Date() },
            { new: true }
        );
        if (!note) return res.status(404).json({ message: "Note not found or unauthorized" });

        logActivity(req.user._id, "NOTE_DELETED", note._id, "NOTE", { title: note.title });

        res.status(200).json({ message: "Note moved to trash", id: req.params.id });
    } catch (error) {
        console.error("Delete Note Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// ============================================================
// PATCH /noteapp/:id/restore
// ============================================================
export const restoreNote = async (req, res) => {
    try {
        const note = await Note.findOne({ _id: req.params.id, user: req.user._id, isDeleted: true });
        if (!note) return res.status(404).json({ message: "Note not found in trash" });

        // If note's folder was deleted, unset it
        if (note.folder) {
            const folderExists = await Folder.findOne({ _id: note.folder, user: req.user._id });
            if (!folderExists) note.folder = null;
        }

        note.isDeleted = false;
        note.deletedAt = null;
        note.isArchived = false;
        await note.save();
        await note.populate("folder", "name color");

        logActivity(req.user._id, "NOTE_RESTORED", note._id, "NOTE", { title: note.title });

        res.status(200).json(note);
    } catch (error) {
        console.error("Restore Note Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// ============================================================
// DELETE /noteapp/:id/permanent
// ============================================================
export const permanentDelete = async (req, res) => {
    try {
        // Only allow permanent delete for trashed notes
        const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.user._id, isDeleted: true });
        if (!note) return res.status(404).json({ message: "Note not found in trash" });
        res.status(200).json({ message: "Note permanently deleted", id: req.params.id });
    } catch (error) {
        console.error("Permanent Delete Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// ============================================================
// PATCH /noteapp/:id/favorite
// ============================================================
export const toggleFavorite = async (req, res) => {
    try {
        const note = await Note.findOne({ _id: req.params.id, user: req.user._id, isDeleted: false });
        if (!note) return res.status(404).json({ message: "Note not found or unauthorized" });
        note.isFavorite = !note.isFavorite;
        await note.save();

        logActivity(
            req.user._id,
            note.isFavorite ? "NOTE_FAVORITED" : "NOTE_UNFAVORITED",
            note._id, "NOTE", { title: note.title }
        );

        res.status(200).json({ isFavorite: note.isFavorite, _id: note._id });
    } catch (error) {
        console.error("Toggle Favorite Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// ============================================================
// PATCH /noteapp/:id/pin
// ============================================================
export const togglePin = async (req, res) => {
    try {
        const note = await Note.findOne({ _id: req.params.id, user: req.user._id, isDeleted: false });
        if (!note) return res.status(404).json({ message: "Note not found or unauthorized" });
        note.isPinned = !note.isPinned;
        await note.save();

        logActivity(
            req.user._id,
            note.isPinned ? "NOTE_PINNED" : "NOTE_UNPINNED",
            note._id, "NOTE", { title: note.title }
        );

        res.status(200).json({ isPinned: note.isPinned, _id: note._id });
    } catch (error) {
        console.error("Toggle Pin Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// ============================================================
// PATCH /noteapp/:id/archive
// ============================================================
export const toggleArchive = async (req, res) => {
    try {
        const note = await Note.findOne({ _id: req.params.id, user: req.user._id, isDeleted: false });
        if (!note) return res.status(404).json({ message: "Note not found or unauthorized" });
        note.isArchived = !note.isArchived;
        if (note.isArchived) {
            note.isPinned = false; // Unpin when archiving
        }
        await note.save();

        logActivity(
            req.user._id,
            note.isArchived ? "NOTE_ARCHIVED" : "NOTE_UNARCHIVED",
            note._id, "NOTE", { title: note.title }
        );

        res.status(200).json({ isArchived: note.isArchived, _id: note._id });
    } catch (error) {
        console.error("Toggle Archive Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// ============================================================
// POST /noteapp/:id/duplicate
// ============================================================
export const duplicateNote = async (req, res) => {
    try {
        const original = await Note.findOne({ _id: req.params.id, user: req.user._id });
        if (!original) return res.status(404).json({ message: "Note not found or unauthorized" });

        const duplicate = new Note({
            title: `${original.title} (copy)`,
            content: original.content,
            user: req.user._id,   // Always current user
            folder: original.folder,
            tags: [...original.tags],
            isFavorite: false,
            isPinned: false,
            isArchived: false,
            isDeleted: false
        });
        await duplicate.save();
        await duplicate.populate("folder", "name color");
        res.status(201).json(duplicate);
    } catch (error) {
        console.error("Duplicate Note Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};