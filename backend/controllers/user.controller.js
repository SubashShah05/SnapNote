import User from "../models/user.model.js";
import Session from "../models/session.model.js";
import AuditLog from "../models/auditLog.model.js";
import Note from "../models/note.model.js";
import Task from "../models/task.model.js";
import Folder from "../models/folder.model.js";
import Notification from "../models/notification.model.js";
import Reminder from "../models/reminder.model.js";
import ActivityEvent from "../models/activity.model.js";
import NoteShare from "../models/noteshare.model.js";
import bcrypt from "bcryptjs";

// @desc    Change user password
// @route   PUT /api/v1/user/password
// @access  Private
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: "Please provide both current and new password" });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: "New password must be at least 6 characters" });
        }

        const user = await User.findById(req.user._id);

        // Verify current password
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid current password" });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        await AuditLog.create({
            userId: user._id,
            action: 'PASSWORD_CHANGED',
            ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress
        });

        res.json({ success: true, message: "Password updated successfully" });
    } catch (error) {
        console.error("Change Password Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// @desc    Get active sessions
// @route   GET /api/v1/user/sessions
// @access  Private
export const getSessions = async (req, res) => {
    try {
        const sessions = await Session.find({ userId: req.user._id }).sort({ lastActive: -1 }).select("-tokenHash");
        res.json({ success: true, data: sessions });
    } catch (error) {
        console.error("Get Sessions Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// @desc    Revoke a session
// @route   DELETE /api/v1/user/sessions/:id
// @access  Private
export const revokeSession = async (req, res) => {
    try {
        const session = await Session.findById(req.params.id);

        if (!session) {
            return res.status(404).json({ message: "Session not found" });
        }

        if (session.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized" });
        }

        await Session.findByIdAndDelete(req.params.id);

        await AuditLog.create({
            userId: req.user._id,
            action: 'ACCOUNT_SETTINGS_CHANGED',
            resource: 'Session Revoked',
            ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress
        });

        res.json({ success: true, message: "Session revoked" });
    } catch (error) {
        console.error("Revoke Session Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// @desc    Export user data
// @route   GET /api/v1/user/export
// @access  Private
export const exportData = async (req, res) => {
    try {
        const notes = await Note.find({ owner: req.user._id }).select("-__v");
        const tasks = await Task.find({ user: req.user._id }).select("-__v");
        const folders = await Folder.find({ user: req.user._id }).select("-__v");

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename=snapnote-export.json');

        res.json({
            user: { name: req.user.name, email: req.user.email },
            notes,
            tasks,
            folders
        });
    } catch (error) {
        console.error("Export Data Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// @desc    Delete user account and all associated data
// @route   DELETE /api/v1/user/account
// @access  Private
export const deleteAccount = async (req, res) => {
    try {
        const userId = req.user._id;

        // Cascade delete all resources
        await Promise.all([
            Note.deleteMany({ owner: userId }),
            Task.deleteMany({ user: userId }),
            Folder.deleteMany({ user: userId }),
            Session.deleteMany({ userId }),
            Reminder.deleteMany({ userId }),
            ActivityEvent.deleteMany({ userId }),
            Notification.deleteMany({ userId }),
            NoteShare.deleteMany({ $or: [{ owner: userId }, { sharedWith: userId }] })
        ]);

        await User.findByIdAndDelete(userId);

        await AuditLog.create({
            userId,
            action: 'ACCOUNT_DELETED',
            ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress
        });

        res.json({ success: true, message: "Account deleted successfully" });
    } catch (error) {
        console.error("Delete Account Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// @desc    Update preferences
// @route   PUT /api/v1/user/preferences
// @access  Private
export const updatePreferences = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const { theme, dashboardLayout, aiEnabled } = req.body;

        if (theme) user.preferences.theme = theme;
        if (dashboardLayout) user.preferences.dashboardLayout = dashboardLayout;
        if (typeof aiEnabled === 'boolean') user.preferences.aiEnabled = aiEnabled;

        await user.save();

        await AuditLog.create({
            userId: req.user._id,
            action: 'ACCOUNT_SETTINGS_CHANGED',
            resource: 'Preferences',
            ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress
        });

        res.json({ success: true, preferences: user.preferences });
    } catch (error) {
        console.error("Update Preferences Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
