import express from "express";
import { getDashboardStats, getSessionDetail, deleteSession, deleteAllSessions } from "../controllers/dashboardController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// All dashboard routes require authentication
router.get("/api/dashboard/stats", authMiddleware, getDashboardStats);
router.get("/api/dashboard/session/:id", authMiddleware, getSessionDetail);
router.delete("/api/dashboard/sessions", authMiddleware, deleteAllSessions); // clear all (plural)
router.delete("/api/dashboard/session/:id", authMiddleware, deleteSession);  // single (singular)

export default router;
