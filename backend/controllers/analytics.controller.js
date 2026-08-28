import Activity from "../models/activity.model.js";
import Note from "../models/note.model.js";
import Task from "../models/task.model.js";
import mongoose from "mongoose";

// ============================================================
// GET /analytics/overview
// ============================================================
export const getDashboardOverview = async (req, res) => {
    try {
        const userId = req.user._id;
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfWeek = new Date(startOfToday);
        startOfWeek.setDate(startOfToday.getDate() - 6);

        // Fetch counts and simple aggregations
        const [noteStats, taskStats, todayActivity] = await Promise.all([
            Note.aggregate([
                { $match: { user: userId, isDeleted: false } },
                {
                    $facet: {
                        total: [{ $count: "count" }],
                        createdWeek: [{ $match: { createdAt: { $gte: startOfWeek } } }, { $count: "count" }],
                        createdToday: [{ $match: { createdAt: { $gte: startOfToday } } }, { $count: "count" }]
                    }
                }
            ]),
            Task.aggregate([
                { $match: { user: userId } },
                {
                    $facet: {
                        total: [{ $count: "count" }],
                        pending: [{ $match: { completed: false } }, { $count: "count" }],
                        completed: [{ $match: { completed: true } }, { $count: "count" }],
                        completedWeek: [{ $match: { completed: true, updatedAt: { $gte: startOfWeek } } }, { $count: "count" }],
                        completedToday: [{ $match: { completed: true, updatedAt: { $gte: startOfToday } } }, { $count: "count" }]
                    }
                }
            ]),
            Activity.countDocuments({ user: userId, createdAt: { $gte: startOfToday } })
        ]);

        const pick = (arr) => arr?.[0]?.count ?? 0;
        const n = noteStats[0];
        const t = taskStats[0];

        // Simple streak calculation based on activity dates
        const activityDates = await Activity.aggregate([
            { $match: { user: userId } },
            { $project: { date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } } } },
            { $group: { _id: "$date" } },
            { $sort: { _id: -1 } }
        ]);

        let currentStreak = 0;
        let longestStreak = 0;
        let tempStreak = 0;
        let lastDate = null;
        let isStreakActive = false;
        const todayStr = startOfToday.toISOString().split('T')[0];
        const yesterdayDate = new Date(startOfToday);
        yesterdayDate.setDate(startOfToday.getDate() - 1);
        const yesterdayStr = yesterdayDate.toISOString().split('T')[0];

        if (activityDates.length > 0) {
            // Check if streak is active (activity today or yesterday)
            if (activityDates[0]._id === todayStr || activityDates[0]._id === yesterdayStr) {
                isStreakActive = true;
            }
        }

        // Calculate streaks by iterating backwards
        for (let i = 0; i < activityDates.length; i++) {
            const currDateStr = activityDates[i]._id;
            const currDate = new Date(currDateStr);

            if (!lastDate) {
                tempStreak = 1;
            } else {
                const diffTime = Math.abs(lastDate - currDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays === 1) {
                    tempStreak++;
                } else {
                    tempStreak = 1; // broken streak
                }
            }

            if (tempStreak > longestStreak) {
                longestStreak = tempStreak;
            }

            // The first continuous streak from today/yesterday is the current streak
            if (isStreakActive && currentStreak === 0 && (tempStreak > 1 || i === activityDates.length - 1)) {
                // Wait we need to correctly assign current streak by checking if it breaks
                // Since we sort descending, if diffDays > 1, the streak broke.
            }

            lastDate = currDate;
        }

        // Simpler current streak logic: count consecutively backwards from today/yesterday
        let currentTemp = 0;
        let expectedDate = new Date(startOfToday);
        
        // If no activity today, check yesterday
        if (activityDates.length > 0 && activityDates[0]._id !== todayStr) {
             expectedDate.setDate(expectedDate.getDate() - 1);
        }

        for (const act of activityDates) {
            if (act._id === expectedDate.toISOString().split('T')[0]) {
                currentTemp++;
                expectedDate.setDate(expectedDate.getDate() - 1);
            } else if (act._id < expectedDate.toISOString().split('T')[0]) {
                break; // Gap found
            }
        }
        currentStreak = currentTemp;

        res.status(200).json({
            success: true,
            data: {
                notes: {
                    total: pick(n.total),
                    createdWeek: pick(n.createdWeek),
                    createdToday: pick(n.createdToday)
                },
                tasks: {
                    total: pick(t.total),
                    pending: pick(t.pending),
                    completed: pick(t.completed),
                    completedWeek: pick(t.completedWeek),
                    completedToday: pick(t.completedToday)
                },
                activity: {
                    eventsToday: todayActivity,
                    currentStreak,
                    longestStreak
                }
            }
        });

    } catch (error) {
        console.error("Dashboard Overview Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// ============================================================
// GET /analytics/activity
// ============================================================
export const getActivityTimeline = async (req, res) => {
    try {
        const userId = req.user._id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const activities = await Activity.find({ user: userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            success: true,
            data: activities
        });
    } catch (error) {
        console.error("Activity Timeline Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// ============================================================
// GET /analytics/productivity
// ============================================================
export const getProductivityChart = async (req, res) => {
    try {
        const userId = req.user._id;
        const days = parseInt(req.query.days) || 7;
        const now = new Date();
        const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        startDate.setDate(startDate.getDate() - days + 1);

        const dailyActivity = await Activity.aggregate([
            { $match: { user: userId, createdAt: { $gte: startDate } } },
            { $project: { 
                date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                isNote: { $cond: [{ $in: ["$type", ["NOTE_CREATED", "NOTE_UPDATED"]] }, 1, 0] },
                isTask: { $cond: [{ $in: ["$type", ["TASK_COMPLETED", "TASK_CREATED"]] }, 1, 0] }
            }},
            { $group: {
                _id: "$date",
                totalEvents: { $sum: 1 },
                notesActivity: { $sum: "$isNote" },
                tasksActivity: { $sum: "$isTask" }
            }},
            { $sort: { _id: 1 } }
        ]);

        // Fill in missing days
        const chartData = [];
        for (let i = 0; i < days; i++) {
            const d = new Date(startDate);
            d.setDate(d.getDate() + i);
            const dateStr = d.toISOString().split('T')[0];
            
            const found = dailyActivity.find(a => a._id === dateStr);
            chartData.push(found || { _id: dateStr, totalEvents: 0, notesActivity: 0, tasksActivity: 0 });
        }

        res.status(200).json({
            success: true,
            data: chartData
        });
    } catch (error) {
        console.error("Productivity Chart Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// ============================================================
// GET /analytics/calendar
// ============================================================
export const getCalendarData = async (req, res) => {
    try {
        const userId = req.user._id;
        // Typically passed as year and month
        const year = parseInt(req.query.year) || new Date().getFullYear();
        const month = parseInt(req.query.month) || new Date().getMonth();

        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0, 23, 59, 59);

        // Fetch tasks with due dates in this month
        const tasks = await Task.find({
            user: userId,
            dueDate: { $gte: startDate, $lte: endDate }
        }).select("title dueDate completed priority");

        res.status(200).json({
            success: true,
            data: { tasks }
        });

    } catch (error) {
        console.error("Calendar Data Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
