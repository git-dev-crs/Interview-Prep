import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Generate a JWT token for the given email.
 * Token expires in 7 days.
 */
const generateToken = (email) => {
    return jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// ─── Input validation helpers ───
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateSignupInput = ({ name, email, password }) => {
    if (!name || typeof name !== "string" || name.trim().length < 2 || name.trim().length > 60) {
        return "Please provide a valid name (2-60 characters).";
    }
    if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
        return "Please provide a valid email address.";
    }
    if (!password || typeof password !== "string" || password.length < 8) {
        return "Password must be at least 8 characters long.";
    }
    if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
        return "Password must contain at least one letter and one number.";
    }
    return null;
};

export const signup = async (req, res) => {
    const { name, password } = req.body;
    const email = req.body.email?.trim().toLowerCase();

    try {
        // Validate input before touching the database
        const validationError = validateSignupInput({ name, email, password });
        if (validationError) {
            return res.status(400).send({ message: validationError });
        }

        // Check if the user already exists
        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            res.status(400).send({ message: "User already registered" });
            return;
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            name: name.trim(),
            email,
            password: hashedPassword,
            currentRating: null,
            completedQuestionNames: [],
        });

        await newUser.save();

        // Generate JWT token on successful signup
        const token = generateToken(email);

        res.status(201).send({
            message: "Successfully Registered, Please login now.",
            email: email,
            token,
        });
    } catch (error) {
        console.error("Signup Error:", error);
        // SECURITY: never leak internal error objects to the client
        res.status(500).send({ message: "Internal Server Error" });
    }
};

export const login = async (req, res) => {
    const { password } = req.body;
    const email = req.body.email?.trim().toLowerCase();
    try {
        if (!email || !password) {
            return res.status(400).send({ message: "Email and password are required" });
        }

        const user = await User.findOne({ email: email });
        if (!user) {
            res.status(400).send({ message: "User not registered" });
            return;
        }

        // SECURITY: accounts created via Google Sign-In have no password hash.
        // Block password login for them instead of comparing against an empty hash.
        if (!user.password) {
            return res.status(400).send({
                message: "This account uses Google Sign-In. Please log in with Google.",
            });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            // Generate JWT token on successful login
            const token = generateToken(email);

            res.send({
                message: "Login Successful",
                email: user.email,
                rating: user.currentRating,
                token,
            });
        } else {
            res.status(400).send({ message: "Email/Password didn't match" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const googleLogin = async (req, res) => {
    const { idToken } = req.body;
    try {
        if (!idToken) {
            return res.status(400).json({ message: "Missing Google ID token" });
        }

        // Verify Google token
        const ticket = await client.verifyIdToken({
            idToken: idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { email, name } = payload;

        // Find or create user
        let user = await User.findOne({ email: email });
        if (!user) {
            user = new User({
                name,
                email,
                password: "", // Google accounts don't use standard password hashes
                currentRating: null,
                completedQuestionNames: [],
            });
            await user.save();
        }

        // Generate JWT session token
        const token = generateToken(email);

        res.send({
            message: "Google Authentication Successful",
            email: user.email,
            rating: user.currentRating,
            token,
        });
    } catch (error) {
        console.error("Google Auth Error:", error);
        res.status(400).json({ message: "Invalid or expired Google ID token" });
    }
};

// ─── Password reset flow ───

const validateNewPassword = (password) => {
    if (!password || typeof password !== "string" || password.length < 8) {
        return "Password must be at least 8 characters long.";
    }
    if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
        return "Password must contain at least one letter and one number.";
    }
    return null;
};

/**
 * Tries to send the reset email via SMTP (nodemailer).
 * Returns true if an email was actually sent, false otherwise
 * (e.g., SMTP not configured or nodemailer not installed).
 */
const trySendResetEmail = async (toEmail, resetUrl) => {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return false;

    try {
        const { default: nodemailer } = await import("nodemailer");
        const transporter = nodemailer.createTransport({
            host: SMTP_HOST,
            port: Number(SMTP_PORT) || 587,
            secure: Number(SMTP_PORT) === 465,
            auth: { user: SMTP_USER, pass: SMTP_PASS },
        });

        await transporter.sendMail({
            from: process.env.MAIL_FROM || `"InterviewPrep" <${SMTP_USER}>`,
            to: toEmail,
            subject: "Reset your InterviewPrep password",
            html: `
                <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;">
                    <h2 style="color:#7c3aed;">Reset your password</h2>
                    <p>We received a request to reset your InterviewPrep password. Click the button below to choose a new one. This link expires in <b>15 minutes</b>.</p>
                    <p style="text-align:center;margin:32px 0;">
                        <a href="${resetUrl}" style="background:#7c3aed;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;">Reset Password</a>
                    </p>
                    <p style="color:#666;font-size:13px;">If you didn't request this, you can safely ignore this email — your password will not change.</p>
                </div>
            `,
        });
        return true;
    } catch (err) {
        console.error("Reset email send failed (falling back to dev link):", err.message || err);
        return false;
    }
};

// POST /forgot-password — request a reset link
export const forgotPassword = async (req, res) => {
    const email = req.body.email?.trim().toLowerCase();
    try {
        if (!email || !EMAIL_REGEX.test(email)) {
            return res.status(400).json({ message: "Please provide a valid email address." });
        }

        // SECURITY: always return the same generic message whether or not the
        // account exists, so attackers can't probe which emails are registered.
        const genericResponse = {
            message: "If an account exists for this email, a password reset link has been sent.",
        };

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(200).json(genericResponse);
        }

        if (!user.password) {
            // Google Sign-In account — no password to reset
            return res.status(400).json({
                message: "This account uses Google Sign-In. Please log in with Google instead.",
            });
        }

        // Generate a cryptographically secure token; store only its hash
        const resetToken = crypto.randomBytes(32).toString("hex");
        user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
        user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        await user.save();

        const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
        const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

        const emailSent = await trySendResetEmail(user.email, resetUrl);
        if (emailSent) {
            return res.status(200).json(genericResponse);
        }

        // DEV FALLBACK: no SMTP configured — log the link and hand it to the
        // frontend so the flow still works end-to-end during development.
        console.log(`🔑 Password reset link for ${user.email}: ${resetUrl}`);
        if (process.env.NODE_ENV === "production") {
            return res.status(200).json(genericResponse);
        }
        return res.status(200).json({ ...genericResponse, devResetUrl: resetUrl });
    } catch (error) {
        console.error("Forgot Password Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// POST /reset-password — set a new password using a valid token
export const resetPassword = async (req, res) => {
    const { token, password } = req.body;
    try {
        if (!token || typeof token !== "string") {
            return res.status(400).json({ message: "Invalid reset link." });
        }

        const passwordError = validateNewPassword(password);
        if (passwordError) {
            return res.status(400).json({ message: passwordError });
        }

        // Look up by the HASH of the token, and require it to be unexpired
        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: new Date() },
        });

        if (!user) {
            return res.status(400).json({
                message: "This reset link is invalid or has expired. Please request a new one.",
            });
        }

        // Update the password and invalidate the token (single use)
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();

        return res.status(200).json({
            message: "Password reset successful! You can now log in with your new password.",
        });
    } catch (error) {
        console.error("Reset Password Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

