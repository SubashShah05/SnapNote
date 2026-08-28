import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    tokenHash: {
        type: String,
        required: true
    },
    deviceInfo: {
        type: String,
        default: "Unknown Device"
    },
    ipAddress: {
        type: String,
        default: "Unknown IP"
    },
    lastActive: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const Session = mongoose.model("Session", sessionSchema);
export default Session;
