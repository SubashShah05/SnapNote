import express from "express";
import { registerUser, loginUser } from "../controllers/auth.controller.js";
import rateLimit from "express-rate-limit";

const router = express.Router();

// Strict rate limit for auth endpoints to prevent brute force attacks
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 requests per `window` (here, per 15 minutes)
    message: { message: "Too many login attempts from this IP, please try again after 15 minutes" },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

router.post("/register", authLimiter, registerUser);
router.post("/login", authLimiter, loginUser);

export default router;
