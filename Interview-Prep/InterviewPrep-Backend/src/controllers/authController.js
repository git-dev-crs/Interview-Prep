import User from "../models/User.js";
import bcrypt from "bcryptjs";

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
        res.status(201).send({
            message: "Successfully Registered, Please login now.",
            email: email,
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
            res.send({
                message: "Login Successful",
                email: user.email,
                rating: user.currentRating,
            });
        } else {
            res.status(400).send({ message: "Email/Password didn't match" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
