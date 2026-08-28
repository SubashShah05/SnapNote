import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: [200, "Task title cannot exceed 200 characters"]
    },
    completed: {
        type: Boolean,
        default: false
    },
    priority: {
        type: String,
        enum: ["low", "medium", "high"],
        default: "medium"
    },
    dueDate: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Indexes for common query patterns
taskSchema.index({ user: 1, completed: 1, createdAt: -1 });
taskSchema.index({ user: 1, dueDate: 1 });
taskSchema.index({ user: 1, priority: 1, completed: 1 });

const Task = mongoose.model("Task", taskSchema);
export default Task;
