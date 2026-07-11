import express from "express";
import { login, signup, googleLogin } from "../controllers/authController.js";

const router = express.Router();

router.post("/login", login);
router.post("/signup", signup);
router.post("/google-login", googleLogin);

export default router;
