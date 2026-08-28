import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            // Get token from header
            token = req.headers.authorization.split(" ")[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Verify session is still active
            const crypto = await import("crypto");
            const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
            const Session = (await import("../models/session.model.js")).default;
            
            const session = await Session.findOne({ tokenHash, userId: decoded.id });
            if (!session) {
                return res.status(401).json({ message: "Session expired or revoked" });
            }

            // Update lastActive timestamp
            session.lastActive = Date.now();
            await session.save().catch(() => {}); // non-blocking

            // Get user from the token
            req.user = await User.findById(decoded.id).select("-password");

            if (!req.user) {
                return res.status(401).json({ message: "Not authorized, user not found" });
            }

            next();
        } catch (error) {
            console.error("Auth Middleware Error:", error);
            res.status(401).json({ message: "Not authorized, token failed" });
        }
    } else {
        res.status(401).json({ message: "Not authorized, no token" });
    }
};
