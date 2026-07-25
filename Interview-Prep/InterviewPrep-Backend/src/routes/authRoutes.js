import express from "express";
import { login, signup, googleLogin, forgotPassword, resetPassword } from "../controllers/authController.js";

const router = express.Router();

router.post("/login", login);
router.post("/signup", signup);
router.post("/google-login", googleLogin);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
