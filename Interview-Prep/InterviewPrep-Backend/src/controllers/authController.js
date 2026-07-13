import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
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

