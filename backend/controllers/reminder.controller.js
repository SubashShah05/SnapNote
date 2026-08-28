import Reminder from "../models/reminder.model.js";

// ============================================================
// POST /reminders
// ============================================================
export const createReminder = async (req, res) => {
    try {
        const { title, task, note, remindAt } = req.body;
        
        if (!title || !remindAt) {
            return res.status(400).json({ success: false, message: "Title and remindAt are required" });
        }

        const reminder = await Reminder.create({
            user: req.user._id,
            title,
            task: task || null,
            note: note || null,
            remindAt: new Date(remindAt)
        });

        res.status(201).json({ success: true, data: reminder });
    } catch (error) {
        console.error("Create Reminder Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// ============================================================
// GET /reminders
// ============================================================
export const getReminders = async (req, res) => {
    try {
        const reminders = await Reminder.find({ user: req.user._id })
            .populate("task", "title completed")
            .populate("note", "title")
            .sort({ remindAt: 1 });

        res.status(200).json({ success: true, data: reminders });
    } catch (error) {
        console.error("Get Reminders Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// ============================================================
// PUT /reminders/:id/dismiss
// ============================================================
export const dismissReminder = async (req, res) => {
    try {
        const reminder = await Reminder.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            { status: "dismissed" },
            { new: true }
        );

        if (!reminder) {
            return res.status(404).json({ success: false, message: "Reminder not found" });
        }

        res.status(200).json({ success: true, data: reminder });
    } catch (error) {
        console.error("Dismiss Reminder Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// ============================================================
// DELETE /reminders/:id
// ============================================================
export const deleteReminder = async (req, res) => {
    try {
        const reminder = await Reminder.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        
        if (!reminder) {
            return res.status(404).json({ success: false, message: "Reminder not found" });
        }

        res.status(200).json({ success: true, message: "Reminder deleted" });
    } catch (error) {
        console.error("Delete Reminder Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
