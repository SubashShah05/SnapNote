import User from "../models/user.model.js";
import Note from "../models/note.model.js";
import Task from "../models/task.model.js";
import AuditLog from "../models/auditLog.model.js";

// @desc    Get system stats
// @route   GET /api/v1/admin/stats
// @access  Private/Admin
export const getStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({});
        const totalNotes = await Note.countDocuments({});
        const totalTasks = await Task.countDocuments({});
        const recentLogins = await AuditLog.countDocuments({ action: 'LOGIN', createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } });

        res.json({
            success: true,
            data: {
                totalUsers,
                totalNotes,
                totalTasks,
                recentLogins
            }
        });
    } catch (error) {
        console.error("Get Admin Stats Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// @desc    Get audit logs
// @route   GET /api/v1/admin/audit
// @access  Private/Admin
export const getAuditLogs = async (req, res) => {
    try {
        const logs = await AuditLog.find({}).sort({ createdAt: -1 }).limit(100).populate('userId', 'name email');
        res.json({ success: true, data: logs });
    } catch (error) {
        console.error("Get Audit Logs Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
