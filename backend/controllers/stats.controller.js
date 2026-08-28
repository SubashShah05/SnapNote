import Note from "../models/note.model.js";
import Folder from "../models/folder.model.js";
import Task from "../models/task.model.js";

// ============================================================
// GET /stats
// Returns aggregated productivity statistics for the current user
// ============================================================
export const getStats = async (req, res) => {
    try {
        const userId = req.user._id;

        const now   = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekStart  = new Date(today); weekStart.setDate(today.getDate() - 6);
        const monthStart = new Date(today); monthStart.setDate(today.getDate() - 29);

        // Run all aggregations in parallel for performance
        const [noteStats, taskStats, recentNotes, folderCount] = await Promise.all([
            // Note statistics via a single aggregation pipeline
            Note.aggregate([
                { $match: { user: userId } },
                {
                    $facet: {
                        total:        [{ $match: { isDeleted: false } },                                          { $count: "count" }],
                        active:       [{ $match: { isDeleted: false, isArchived: false } },                       { $count: "count" }],
                        favorites:    [{ $match: { isDeleted: false, isFavorite: true } },                        { $count: "count" }],
                        pinned:       [{ $match: { isDeleted: false, isPinned: true } },                          { $count: "count" }],
                        archived:     [{ $match: { isDeleted: false, isArchived: true } },                        { $count: "count" }],
                        deleted:      [{ $match: { isDeleted: true } },                                           { $count: "count" }],
                        createdToday: [{ $match: { isDeleted: false, createdAt: { $gte: today } } },              { $count: "count" }],
                        createdWeek:  [{ $match: { isDeleted: false, createdAt: { $gte: weekStart } } },          { $count: "count" }],
                        createdMonth: [{ $match: { isDeleted: false, createdAt: { $gte: monthStart } } },         { $count: "count" }],
                        // Word/character count via sample to avoid expensive full-scan
                        writingStats: [
                            { $match: { isDeleted: false } },
                            { $project: {
                                wordCount: {
                                    $size: { $split: [{ $ifNull: ["$content", ""] }, " "] }
                                },
                                charCount: { $strLenCP: { $ifNull: ["$content", ""] } }
                            }},
                            { $group: {
                                _id: null,
                                totalWords: { $sum: "$wordCount" },
                                totalChars: { $sum: "$charCount" }
                            }}
                        ],
                        // Collect all tags for distinct count
                        allTags: [
                            { $match: { isDeleted: false } },
                            { $unwind: { path: "$tags", preserveNullAndEmptyArrays: false } },
                            { $group: { _id: "$tags" } },
                            { $count: "count" }
                        ]
                    }
                }
            ]),

            // Task statistics
            Task.aggregate([
                { $match: { user: userId } },
                {
                    $facet: {
                        total:     [{ $count: "count" }],
                        completed: [{ $match: { completed: true } },  { $count: "count" }],
                        overdue:   [{ $match: { completed: false, dueDate: { $lt: now, $ne: null } } }, { $count: "count" }]
                    }
                }
            ]),

            // 6 most recently updated notes for the "Recent Notes" section
            Note.find({ user: userId, isDeleted: false })
                .populate("folder", "name color")
                .sort({ updatedAt: -1 })
                .limit(6)
                .select("title content updatedAt createdAt folder tags isFavorite isPinned"),

            // Folder count
            Folder.countDocuments({ user: userId })
        ]);

        // Unpack facet results (each is an array of 0 or 1 elements)
        const n = noteStats[0];
        const t = taskStats[0];

        const pick = (arr) => arr?.[0]?.count ?? 0;
        const ws   = n.writingStats?.[0];

        res.status(200).json({
            notes: {
                total:        pick(n.total),
                active:       pick(n.active),
                favorites:    pick(n.favorites),
                pinned:       pick(n.pinned),
                archived:     pick(n.archived),
                deleted:      pick(n.deleted),
                createdToday: pick(n.createdToday),
                createdWeek:  pick(n.createdWeek),
                createdMonth: pick(n.createdMonth),
            },
            writing: {
                totalWords: ws?.totalWords ?? 0,
                totalChars: ws?.totalChars ?? 0,
                avgWords:   pick(n.total) > 0
                    ? Math.round((ws?.totalWords ?? 0) / pick(n.total))
                    : 0,
            },
            tasks: {
                total:     pick(t.total),
                completed: pick(t.completed),
                active:    pick(t.total) - pick(t.completed),
                overdue:   pick(t.overdue),
            },
            folders: folderCount,
            tags:    pick(n.allTags),
            recentNotes
        });
    } catch (error) {
        console.error("Get Stats Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
