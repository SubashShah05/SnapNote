import mongoose from "mongoose";

const folderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: [50, "Folder name cannot exceed 50 characters"]
    },
    color: {
        type: String,
        default: "#4f6ef7"
    }
}, {
    timestamps: true
});

// Ensure unique folder names per user
folderSchema.index({ user: 1, name: 1 }, { unique: true });

const Folder = mongoose.model("Folder", folderSchema);
export default Folder;
