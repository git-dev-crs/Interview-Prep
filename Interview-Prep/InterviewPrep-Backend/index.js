import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoutes from "./src/routes/authRoutes.js";
import resourceRoutes from "./src/routes/resourceRoutes.js";
import aiAssistantRoutes from "./src/routes/aiAssistantRoutes.js";
import mockInterviewRoutes from "./src/routes/mockInterviewRoutes.js";
import dashboardRoutes from "./src/routes/dashboardRoutes.js";
import { securityHeaders, generalLimiter, authLimiter, aiLimiter } from "./src/middleware/security.js";

// Load environment variables
dotenv.config();

const app = express();

// ─── Security middleware ───
app.disable("x-powered-by");
app.use(securityHeaders);

// SECURITY: restrict CORS to the frontend origin (configurable via CLIENT_URL env)
const allowedOrigin = process.env.CLIENT_URL || "http://localhost:3000";
app.use(cors({ origin: allowedOrigin }));

// Body parsing with a sane size limit
app.use(express.json({ limit: "100kb" }));

// Rate limiting: general limit on everything, stricter on auth & AI routes
app.use(generalLimiter);
app.use(["/login", "/signup", "/google-login"], authLimiter);
app.use(["/api/mock-interview", "/api/ai-assistant"], aiLimiter);

// ─── Database Connection ───
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Failed to connect to MongoDB", err));

// ─── Routes ───
app.use("/", authRoutes);
app.use("/", resourceRoutes);
app.use("/", aiAssistantRoutes);
app.use("/", mockInterviewRoutes);
app.use("/", dashboardRoutes);

// ─── Central error handler (catches anything routes didn't) ───
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.message || err);
  res.status(err.status || 500).json({ error: "Internal Server Error" });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
