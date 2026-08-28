import mongoose from "mongoose";

const noteSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        default: ""
    },
    // Organization
    folder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Folder",
        default: null
    },
    tags: {
        type: [String],
        default: [],
        validate: {
            validator: (arr) => arr.length <= 10,
            message: "A note can have at most 10 tags"
        }
    },
    // Status flags
    isFavorite: {
        type: Boolean,
        default: false
    },
    isPinned: {
        type: Boolean,
        default: false
    },
    isArchived: {
        type: Boolean,
        default: false
    },
    // Soft delete
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Compound indexes for common query patterns
noteSchema.index({ user: 1, isDeleted: 1, updatedAt: -1 });
noteSchema.index({ user: 1, isFavorite: 1, isDeleted: 1 });
noteSchema.index({ user: 1, isPinned: 1, isDeleted: 1 });
noteSchema.index({ user: 1, isArchived: 1, isDeleted: 1 });
noteSchema.index({ user: 1, folder: 1, isDeleted: 1 });
noteSchema.index({ user: 1, tags: 1, isDeleted: 1 });
noteSchema.index({ user: 1, createdAt: -1 });

// Text index for full-text search on title and content
// Title gets higher weight so title matches rank above content matches
noteSchema.index(
    { title: "text", content: "text" },
    { weights: { title: 10, content: 1 }, name: "note_text_search" }
);

const Note = mongoose.model("Note", noteSchema);
export default Note;