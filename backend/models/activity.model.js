import mongoose from "mongoose";

const ACTIVITY_TYPES = [
    "NOTE_CREATED",
    "NOTE_UPDATED",
    "NOTE_DELETED",
    "NOTE_RESTORED",
    "NOTE_FAVORITED",
    "NOTE_UNFAVORITED",
    "NOTE_ARCHIVED",
    "NOTE_UNARCHIVED",
    "NOTE_PINNED",
    "NOTE_UNPINNED",
    "FOLDER_CREATED",
    "FOLDER_DELETED",
    "TASK_CREATED",
    "TASK_COMPLETED",
    "TASK_UNCOMPLETED",
    "TASK_DELETED"
];

const activitySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    type: {
        type: String,
        enum: ACTIVITY_TYPES,
        required: true
    },
    entityId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    },
    entityType: {
        type: String,
        enum: ["NOTE", "FOLDER", "TASK"],
        required: true
    },
    // Safe metadata — no sensitive content, just titles/names
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: false // only createdAt, managed manually above
});

// Index for fast recent-activity queries
activitySchema.index({ user: 1, createdAt: -1 });

// TTL — auto-expire activity logs after 90 days
activitySchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });

const Activity = mongoose.model("Activity", activitySchema);
export { ACTIVITY_TYPES };
export default Activity;
