import express from "express";
import { startInterview, nextQuestion, endInterview } from "../controllers/mockInterviewController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// All mock interview routes require authentication
router.post("/api/mock-interview/start", authMiddleware, startInterview);
router.post("/api/mock-interview/next", authMiddleware, nextQuestion);
router.post("/api/mock-interview/end", authMiddleware, endInterview);

export default router;
