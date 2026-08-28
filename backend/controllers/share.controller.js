import NoteShare from '../models/noteshare.model.js';
import Notification from '../models/notification.model.js';
import Note from '../models/note.model.js';
import User from '../models/user.model.js';

export const inviteCollaborator = async (req, res) => {
  try {
    const { noteId, email, role } = req.body;
    
    // Check if note exists and is owned by the requester
    const note = await Note.findOne({ _id: noteId, user: req.user._id, isDeleted: false });
    if (!note) {
      return res.status(404).json({ success: false, message: "Note not found or unauthorized" });
    }

    // Find user to invite
    const invitee = await User.findOne({ email: email.toLowerCase() });
    if (!invitee) {
      return res.status(404).json({ success: false, message: "User not found with this email" });
    }
    
    if (invitee._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: "You cannot invite yourself" });
    }

    // Check if share already exists
    const existingShare = await NoteShare.findOne({ note: noteId, user: invitee._id });
    if (existingShare) {
      return res.status(400).json({ success: false, message: "User is already invited or a collaborator" });
    }

    // Create share record
    const share = await NoteShare.create({
      note: noteId,
      owner: req.user._id,
      user: invitee._id,
      role: role || 'viewer',
      status: 'pending'
    });

    // Create notification for the invitee
    await Notification.create({
      user: invitee._id,
      type: 'invite',
      message: `${req.user.name} invited you to collaborate on "${note.title}".`,
      metadata: { shareId: share._id, noteId: note._id, role: share.role }
    });

    res.json({ success: true, message: "Invitation sent successfully", data: share });
  } catch (error) {
    console.error("Invite Error:", error);
    res.status(500).json({ success: false, message: "Failed to invite collaborator" });
  }
};

export const respondToInvite = async (req, res) => {
  try {
    const { shareId, accept } = req.body;
    
    const share = await NoteShare.findOne({ _id: shareId, user: req.user._id, status: 'pending' });
    if (!share) {
      return res.status(404).json({ success: false, message: "Invitation not found or already processed" });
    }

    if (accept) {
      share.status = 'accepted';
      await share.save();
      res.json({ success: true, message: "Invitation accepted", data: share });
    } else {
      await share.deleteOne();
      res.json({ success: true, message: "Invitation declined" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to respond to invitation" });
  }
};

export const getNoteCollaborators = async (req, res) => {
  try {
    const { noteId } = req.params;
    
    // Verify ownership
    const note = await Note.findOne({ _id: noteId, user: req.user._id });
    if (!note) {
      return res.status(404).json({ success: false, message: "Note not found or unauthorized" });
    }

    const collaborators = await NoteShare.find({ note: noteId }).populate('user', 'name email');
    res.json({ success: true, data: collaborators });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch collaborators" });
  }
};

export const changeRole = async (req, res) => {
  try {
    const { shareId, role } = req.body;
    
    const share = await NoteShare.findById(shareId);
    if (!share) {
      return res.status(404).json({ success: false, message: "Share record not found" });
    }

    // Verify ownership
    if (share.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Only the owner can change roles" });
    }

    share.role = role;
    await share.save();
    
    // TODO: Disconnect the socket or emit a role-change event to the connected client
    // if we had global socket access here.

    res.json({ success: true, message: "Role updated", data: share });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to change role" });
  }
};

export const revokeAccess = async (req, res) => {
  try {
    const { shareId } = req.params;
    
    const share = await NoteShare.findById(shareId).populate('note');
    if (!share) {
      return res.status(404).json({ success: false, message: "Share record not found" });
    }

    // Verify ownership
    if (share.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Only the owner can revoke access" });
    }

    await share.deleteOne();

    // Create notification
    await Notification.create({
      user: share.user,
      type: 'access_revoked',
      message: `Your access to "${share.note.title}" has been revoked.`,
      metadata: { noteId: share.note._id }
    });
    
    // TODO: We should disconnect the user from the room if they are currently connected via Socket.IO.
    // This requires access to the io instance.

    res.json({ success: true, message: "Access revoked" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to revoke access" });
  }
};

export const getSharedNotes = async (req, res) => {
  try {
    const shares = await NoteShare.find({ user: req.user._id, status: 'accepted' })
                                  .populate('note')
                                  .populate('owner', 'name email');
    
    // Filter out deleted notes
    const validShares = shares.filter(s => s.note && !s.note.isDeleted);
    
    res.json({ success: true, data: validShares });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch shared notes" });
  }
};

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch notifications" });
  }
};

export const markNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
    res.json({ success: true, message: "Notifications marked as read" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update notifications" });
  }
};
