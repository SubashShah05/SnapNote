import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import NoteShare from "../models/noteshare.model.js";
import Note from "../models/note.model.js";

let io;

export const initSocket = (server, allowedOrigins) => {
  io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      credentials: true
    }
  });

  // Authentication Middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error("Authentication error"));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded; // { id }
      next();
    } catch (err) {
      return next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`User connected to socket: ${socket.user.id}`);

    // Join a specific note room
    socket.on("joinNote", async (noteId, callback) => {
      try {
        const userId = socket.user.id;

        // Verify permissions
        const note = await Note.findOne({ _id: noteId, isDeleted: false });
        if (!note) return callback({ error: "Note not found" });

        const isOwner = note.user.toString() === userId;
        let isShared = false;

        if (!isOwner) {
          const share = await NoteShare.findOne({ note: noteId, user: userId, status: 'accepted' });
          if (!share) {
            return callback({ error: "Unauthorized" });
          }
          isShared = true;
          socket.role = share.role;
        } else {
          socket.role = 'owner';
        }

        const roomName = `note:${noteId}`;
        socket.join(roomName);
        
        // Broadcast presence
        socket.to(roomName).emit("userJoined", { userId, role: socket.role });
        
        // Return success
        callback({ success: true, role: socket.role });
      } catch (err) {
        callback({ error: "Failed to join room" });
      }
    });

    // Leave note room
    socket.on("leaveNote", (noteId) => {
      const roomName = `note:${noteId}`;
      socket.leave(roomName);
      socket.to(roomName).emit("userLeft", { userId: socket.user.id });
    });

    // Broadcast note changes
    socket.on("noteChange", (data) => {
      // data format: { noteId, content, title, tags, etc. }
      if (socket.role === 'viewer') return; // Enforce permissions

      const roomName = `note:${data.noteId}`;
      // Broadcast to everyone else in the room
      socket.to(roomName).emit("noteUpdated", {
        userId: socket.user.id,
        ...data
      });
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.user.id}`);
      // The socket automatically leaves all rooms
    });
  });

  return io;
};

export const getIo = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};
