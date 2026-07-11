import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoutes from "./src/routes/authRoutes.js";
import resourceRoutes from "./src/routes/resourceRoutes.js";
import aiAssistantRoutes from "./src/routes/aiAssistantRoutes.js";
import mockInterviewRoutes from "./src/routes/mockInterviewRoutes.js";
import dashboardRoutes from "./src/routes/dashboardRoutes.js";

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Database Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Failed to connect to MongoDB", err));

// Routes
app.use("/", authRoutes);
app.use("/", resourceRoutes);
app.use("/", aiAssistantRoutes);
app.use("/", mockInterviewRoutes);
app.use("/", dashboardRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

