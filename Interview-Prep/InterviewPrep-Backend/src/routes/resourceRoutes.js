import express from "express";
import {
    getDocuments,
    updateCompletedQuestions,
    removeCompletedQuestions,
    getProblems,
    getProgress,
    toggleRevision,
} from "../controllers/resourceController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Public: the DSA question list is browsable without logging in
// (progress tracking is layered on only when a logged-in user is present).
router.post("/documents", getDocuments);

// Structured roadmap
router.get("/dsa/problems", getProblems);                       // public — full roadmap
router.get("/dsa/progress", authMiddleware, getProgress);       // auth — solved + revision
router.post("/toggle-revision", authMiddleware, toggleRevision); // auth — flag for revision

// Protected: mutating a user's solved-questions list requires a valid token.
router.post("/update-completed-questions", authMiddleware, updateCompletedQuestions);
router.post("/remove-completed-questions", authMiddleware, removeCompletedQuestions);

export default router;
