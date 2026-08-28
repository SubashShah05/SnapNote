import Folder from "../models/folder.model.js";
import Note from "../models/note.model.js";
import Activity from "../models/activity.model.js";

// ============================================================
// GET /folders
// ============================================================
export const getFolders = async (req, res) => {
    try {
        const folders = await Folder.find({ user: req.user._id }).sort({ name: 1 });
        res.status(200).json(folders);
    } catch (error) {
        console.error("Get Folders Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// ============================================================
// POST /folders
// ============================================================
export const createFolder = async (req, res) => {
    try {
        const { name, color = "#4f6ef7" } = req.body;
        if (!name || name.trim().length === 0) {
            return res.status(400).json({ message: "Folder name is required" });
        }
        if (name.trim().length > 50) {
            return res.status(400).json({ message: "Folder name cannot exceed 50 characters" });
        }

        const existing = await Folder.findOne({ user: req.user._id, name: { $regex: new RegExp(`^${name.trim()}$`, "i") } });
        if (existing) return res.status(400).json({ message: "A folder with this name already exists" });

        const folder = new Folder({
            user: req.user._id,
            name: name.trim(),
            color
        });
        await folder.save();
        Activity.create({ user: req.user._id, type: "FOLDER_CREATED", entityId: folder._id, entityType: "FOLDER", metadata: { name: folder.name } })
            .catch(err => console.error("Activity log error:", err));
        res.status(201).json(folder);
    } catch (error) {
        console.error("Create Folder Error:", error);
        if (error.code === 11000) {
            return res.status(400).json({ message: "A folder with this name already exists" });
        }
        res.status(500).json({ message: "Server error" });
    }
};

// ============================================================
// PUT /folders/:id
// ============================================================
export const updateFolder = async (req, res) => {
    try {
        const { name, color } = req.body;
        const folder = await Folder.findOne({ _id: req.params.id, user: req.user._id });
        if (!folder) return res.status(404).json({ message: "Folder not found or unauthorized" });

        if (name !== undefined) {
            if (name.trim().length === 0) return res.status(400).json({ message: "Folder name cannot be empty" });
            if (name.trim().length > 50) return res.status(400).json({ message: "Folder name cannot exceed 50 characters" });
            const existing = await Folder.findOne({
                user: req.user._id,
                name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
                _id: { $ne: folder._id }
            });
            if (existing) return res.status(400).json({ message: "A folder with this name already exists" });
            folder.name = name.trim();
        }
        if (color !== undefined) folder.color = color;

        await folder.save();
        res.status(200).json(folder);
    } catch (error) {
        console.error("Update Folder Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// ============================================================
// DELETE /folders/:id
// Notes in this folder become uncategorized (folder = null)
// ============================================================
export const deleteFolder = async (req, res) => {
    try {
        const folder = await Folder.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        if (!folder) return res.status(404).json({ message: "Folder not found or unauthorized" });

        // Uncategorize all notes in this folder
        await Note.updateMany(
            { folder: folder._id, user: req.user._id },
            { $set: { folder: null } }
        );

        Activity.create({ user: req.user._id, type: "FOLDER_DELETED", entityId: folder._id, entityType: "FOLDER", metadata: { name: folder.name } })
            .catch(err => console.error("Activity log error:", err));

        res.status(200).json({ message: "Folder deleted. Notes have been uncategorized.", id: req.params.id });
    } catch (error) {
        console.error("Delete Folder Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
