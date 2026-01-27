import Document from "../models/Document.js";
import User from "../models/User.js";

export const getDocuments = async (req, res) => {
    const { email, rating } = req.body;
    try {
        let completedQuestionNames = [];

        // Only try to find/update user if email is provided
        if (email) {
            const user = await User.findOne({ email });
            if (user) {
                if (user.currentRating === null) {
                    // Update user's current rating only if it's null
                    user.currentRating = rating;
                    await user.save();
                }
                completedQuestionNames = user.completedQuestionNames;
            }
        }

        // Find 100 documents with rating starting from given rating-1
        const documents = await Document.find({ rating: { $gte: rating - 1 } })
            .limit(100)
            .select("name link rating");

        res.json({
            questionsList: documents,
            solvedQuestions: completedQuestionNames,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const updateCompletedQuestions = async (req, res) => {
    const { email, questionId } = req.body;
    try {
        const result = await User.updateOne(
            { email: email },
            { $push: { completedQuestionNames: questionId } }
        );

        if (!result) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        const user = await User.findOne({ email });
        res.status(200).json(user.completedQuestionNames);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const removeCompletedQuestions = async (req, res) => {
    const { email, questionId } = req.body;
    try {
        const result = await User.updateOne(
            { email: email },
            { $pull: { completedQuestionNames: questionId } }
        );

        if (!result) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        const user = await User.findOne({ email });
        res.status(200).json(user.completedQuestionNames);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
