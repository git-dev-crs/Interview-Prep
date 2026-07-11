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

export const signup = async (req, res) => {
    const { name, email, password } = req.body;

    try {
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
            name,
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
        console.error(error);
        res.status(500).send(error);
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email: email });
        if (!user) {
            res.status(400).send({ message: "User not registered" });
            return;
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

