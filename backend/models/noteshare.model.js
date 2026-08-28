import mongoose from "mongoose";

const noteShareSchema = new mongoose.Schema({
    note: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Note",
        required: true,
        index: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    role: {
        type: String,
        enum: ["editor", "viewer"],
        default: "viewer"
    },
    status: {
        type: String,
        enum: ["pending", "accepted"],
        default: "pending"
    }
}, {
    timestamps: true
});

// Ensure a user can only have one share record per note
noteShareSchema.index({ note: 1, user: 1 }, { unique: true });

const NoteShare = mongoose.model("NoteShare", noteShareSchema);
export default NoteShare;
