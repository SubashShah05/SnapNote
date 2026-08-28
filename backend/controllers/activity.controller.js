import Activity from "../models/activity.model.js";

// ============================================================
// GET /activity
// Returns the most recent 30 activity items for the current user
// ============================================================
export const getActivity = async (req, res) => {
    try {
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 30));

        const activity = await Activity.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        res.status(200).json(activity);
    } catch (error) {
        console.error("Get Activity Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
