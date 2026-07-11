import express from "express";
import { askAIAssistant } from "../controllers/aiAssistantController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /api/ai-assistant — protected route
router.post("/api/ai-assistant", authMiddleware, askAIAssistant);

export default router;
