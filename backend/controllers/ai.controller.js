import { aiService } from '../services/ai/ai.service.js';
import Note from '../models/note.model.js';

/**
 * Helper to fetch a note and verify ownership
 */
const getNoteContext = async (noteId, userId) => {
  if (!noteId) return null;
  const note = await Note.findOne({ _id: noteId, user: userId });
  if (!note) {
    throw new Error("Note not found or unauthorized.");
  }
  return note.content;
};

export const summarizeText = async (req, res) => {
  try {
    const { text, length = 'medium' } = req.body;
    if (!text || text.length > 50000) {
      return res.status(400).json({ success: false, message: "Invalid or too long text provided." });
    }
    const result = await aiService.summarize(text, length);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: "AI response could not be processed. Please try again." });
  }
};

export const extractKeyPoints = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || text.length > 50000) {
      return res.status(400).json({ success: false, message: "Invalid or too long text provided." });
    }
    const result = await aiService.extractKeyPoints(text);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: "AI response could not be processed. Please try again." });
  }
};

export const generateTitle = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || text.length > 50000) {
      return res.status(400).json({ success: false, message: "Invalid or too long text provided." });
    }
    const result = await aiService.generateTitle(text);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: "AI response could not be processed. Please try again." });
  }
};

export const generateTags = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || text.length > 50000) {
      return res.status(400).json({ success: false, message: "Invalid or too long text provided." });
    }
    const result = await aiService.generateTags(text);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: "AI response could not be processed. Please try again." });
  }
};

export const rewriteText = async (req, res) => {
  try {
    const { text, style } = req.body;
    if (!text || text.length > 50000) {
      return res.status(400).json({ success: false, message: "Invalid or too long text provided." });
    }
    const result = await aiService.rewrite(text, style);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: "AI response could not be processed. Please try again." });
  }
};

export const improveGrammar = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || text.length > 50000) {
      return res.status(400).json({ success: false, message: "Invalid or too long text provided." });
    }
    const result = await aiService.improveGrammar(text);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: "AI response could not be processed. Please try again." });
  }
};

export const shortenText = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || text.length > 50000) {
      return res.status(400).json({ success: false, message: "Invalid or too long text provided." });
    }
    const result = await aiService.shorten(text);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: "AI response could not be processed. Please try again." });
  }
};

export const expandText = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || text.length > 50000) {
      return res.status(400).json({ success: false, message: "Invalid or too long text provided." });
    }
    const result = await aiService.expand(text);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: "AI response could not be processed. Please try again." });
  }
};

export const extractTasks = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || text.length > 50000) {
      return res.status(400).json({ success: false, message: "Invalid or too long text provided." });
    }
    const result = await aiService.extractTasks(text);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: "AI response could not be processed. Please try again." });
  }
};

export const assistantQuery = async (req, res) => {
  try {
    const { prompt, noteId } = req.body;
    if (!prompt) {
      return res.status(400).json({ success: false, message: "Prompt is required." });
    }

    let noteContent = "No specific note context provided.";
    if (noteId) {
      try {
        noteContent = await getNoteContext(noteId, req.user._id);
        // Truncate note content if extremely long to save tokens
        if (noteContent.length > 50000) {
          noteContent = noteContent.substring(0, 50000) + "... (truncated)";
        }
      } catch (err) {
        return res.status(403).json({ success: false, message: err.message });
      }
    }

    const result = await aiService.assistantQuery(noteContent, prompt);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: "AI response could not be processed. Please try again." });
  }
};
