import mongoose from "mongoose";

const reminderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    task: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task",
        default: null
    },
    note: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Note",
        default: null
    },
    title: {
        type: String,
        required: true
    },
    remindAt: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "fired", "dismissed"],
        default: "pending"
    }
}, {
    timestamps: true
});

// Index for fast query of pending reminders
reminderSchema.index({ status: 1, remindAt: 1 });

const Reminder = mongoose.model("Reminder", reminderSchema);
export default Reminder;
