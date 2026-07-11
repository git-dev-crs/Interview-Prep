import express from "express";
import {
    getDocuments,
    updateCompletedQuestions,
    removeCompletedQuestions,
} from "../controllers/resourceController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// All resource routes require authentication
router.post("/documents", authMiddleware, getDocuments);
router.post("/update-completed-questions", authMiddleware, updateCompletedQuestions);
router.post("/remove-completed-questions", authMiddleware, removeCompletedQuestions);

export default router;
