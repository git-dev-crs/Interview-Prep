import express from "express";
import { getDashboardStats, getSessionDetail } from "../controllers/dashboardController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// All dashboard routes require authentication
router.get("/api/dashboard/stats", authMiddleware, getDashboardStats);
router.get("/api/dashboard/session/:id", authMiddleware, getSessionDetail);

export default router;
