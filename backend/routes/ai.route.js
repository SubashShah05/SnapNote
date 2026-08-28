import express from 'express';
import rateLimit from 'express-rate-limit';
import { protect } from '../middleware/auth.middleware.js';
import {
  summarizeText,
  extractKeyPoints,
  generateTitle,
  generateTags,
  rewriteText,
  improveGrammar,
  shortenText,
  expandText,
  extractTasks,
  assistantQuery
} from '../controllers/ai.controller.js';

const router = express.Router();

// Strict rate limit for AI endpoints
const aiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 AI requests per windowMs
  message: { success: false, message: "Too many AI requests from this IP, please try again after 15 minutes" },
  standardHeaders: true,
  legacyHeaders: false,
});

// All AI routes are protected and rate-limited
router.use(protect);
router.use(aiRateLimiter);

router.post('/summarize', summarizeText);
router.post('/key-points', extractKeyPoints);
router.post('/title', generateTitle);
router.post('/tags', generateTags);
router.post('/rewrite', rewriteText);
router.post('/grammar', improveGrammar);
router.post('/shorten', shortenText);
router.post('/expand', expandText);
router.post('/tasks', extractTasks);
router.post('/assistant', assistantQuery);

export default router;
