import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    action: {
        type: String,
        required: true,
        enum: [
            'LOGIN', 'LOGOUT', 'PASSWORD_CHANGED', 
            'NOTE_SHARED', 'COLLABORATOR_ADDED', 'COLLABORATOR_REMOVED', 
            'NOTE_DELETED', 'ACCOUNT_SETTINGS_CHANGED', 'ACCOUNT_DELETED'
        ]
    },
    resource: {
        type: String,
        default: "System"
    },
    status: {
        type: String,
        enum: ['SUCCESS', 'FAILURE'],
        default: 'SUCCESS'
    },
    ipAddress: {
        type: String
    }
}, {
    timestamps: true
});

const AuditLog = mongoose.model("AuditLog", auditLogSchema);
export default AuditLog;
