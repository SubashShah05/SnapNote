import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import Session from "../models/session.model.js";
import AuditLog from "../models/auditLog.model.js";
import crypto from "crypto";

// Generate JWT and Session
const generateTokenAndSession = async (user, req) => {
    const tokenId = crypto.randomBytes(16).toString("hex");
    const token = jwt.sign({ id: user._id, tokenId }, process.env.JWT_SECRET, {
        expiresIn: "30d",
    });

    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const deviceInfo = req.headers['user-agent'] || 'Unknown Device';

    await Session.create({
        userId: user._id,
        tokenHash: crypto.createHash("sha256").update(token).digest("hex"),
        deviceInfo,
        ipAddress
    });

    return token;
};

// @desc    Register new user
// @route   POST /api/v1/auth/register
// @access  Public
export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "Please add all fields" });
        }

        if (typeof name !== "string" || typeof email !== "string" || typeof password !== "string") {
            return res.status(400).json({ message: "Invalid input types" });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "Registration failed or user already exists" });
        }

        // Determine if first user (make them admin)
        const isFirstUser = (await User.countDocuments({})) === 0;

        const user = await User.create({
            name,
            email,
            password,
            role: isFirstUser ? 'admin' : 'user'
        });

        if (user) {
            const token = await generateTokenAndSession(user, req);

            await AuditLog.create({
                userId: user._id,
                action: 'LOGIN',
                resource: 'Account Registration',
                ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress
            });

            res.status(201).json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                token,
            });
        } else {
            res.status(400).json({ message: "Invalid user data" });
        }
    } catch (error) {
        console.error("Register Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// @desc    Authenticate a user
// @route   POST /api/v1/auth/login
// @access  Public
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Please provide email and password" });
        }

        if (typeof email !== "string" || typeof password !== "string") {
            return res.status(400).json({ message: "Invalid input types" });
        }

        const user = await User.findOne({ email });
        const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

        if (user && (await user.comparePassword(password))) {
            const token = await generateTokenAndSession(user, req);

            await AuditLog.create({
                userId: user._id,
                action: 'LOGIN',
                resource: 'System',
                ipAddress
            });

            res.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                token,
            });
        } else {
            if (user) {
                await AuditLog.create({
                    userId: user._id,
                    action: 'LOGIN',
                    resource: 'System',
                    status: 'FAILURE',
                    ipAddress
                });
            }
            res.status(401).json({ message: "Invalid credentials" });
        }
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
