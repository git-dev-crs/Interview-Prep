// Load environment variables BEFORE any other import so that modules reading
// process.env at import time (e.g. the Gemini client) see the real values.
// ES module imports are hoisted, so this side-effect import must come first.
import "dotenv/config";
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

// ─── CORS allowlist ───
// In production, only the configured client origin(s) may call the API.
// In development we still allow any localhost port (CRA may jump to 3001/3002).
// CLIENT_URL may be a comma-separated list of allowed origins.
const configuredOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const isAllowedOrigin = (origin) => {
  if (!origin) return true; // non-browser clients / same-origin / curl (no Origin header)
  if (configuredOrigins.includes(origin)) return true;
  if (/^https?:\/\/localhost(:\d+)?$/.test(origin)) return true; // any localhost port in dev
  if (/^https?:\/\/127\.0\.0\.1(:\d+)?$/.test(origin)) return true;
  return false;
};

app.use(
  cors({
    origin: (origin, callback) => {
      // Pass false (not an Error) for disallowed origins: the browser blocks the
      // response, and we avoid noisy 500s in the server logs.
      callback(null, isAllowedOrigin(origin));
    },
    credentials: true,
  })
);

// Body parsing with a sane size limit
app.use(express.json({ limit: "100kb" }));

// Rate limiting: general limit on everything, stricter on auth & AI routes
app.use(generalLimiter);
app.use(["/login", "/signup", "/google-login", "/forgot-password", "/reset-password"], authLimiter);
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
