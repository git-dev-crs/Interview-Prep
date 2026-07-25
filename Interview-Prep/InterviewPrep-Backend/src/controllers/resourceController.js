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
    const { questionId } = req.body;
    // SECURITY: identity comes from the verified JWT, never the request body,
    // so a user can only modify their own solved-questions list.
    const email = req.userEmail;
    try {
        const result = await User.updateOne(
            { email: email },
            { $addToSet: { completedQuestionNames: questionId } } // no duplicates
        );

        if (!result) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        const user = await User.findOne({ email });
        res.status(200).json(user?.completedQuestionNames || []);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const removeCompletedQuestions = async (req, res) => {
    const { questionId } = req.body;
    // SECURITY: identity comes from the verified JWT, never the request body.
    const email = req.userEmail;
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
        res.status(200).json(user?.completedQuestionNames || []);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// ─── Structured DSA roadmap ───

// GET /dsa/problems — public: the full roadmap (topic/difficulty/order)
export const getProblems = async (req, res) => {
    try {
        const problems = await Document.find({})
            .sort({ order: 1 })
            .select("name link rating topic difficulty order");
        res.status(200).json({ problems });
    } catch (error) {
        console.error("Get Problems Error:", error.message || error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// GET /dsa/progress — auth: the logged-in user's solved + revision lists
export const getProgress = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.userEmail });
        res.status(200).json({
            solved: user?.completedQuestionNames || [],
            revision: user?.revisionQuestionNames || [],
        });
    } catch (error) {
        console.error("Get Progress Error:", error.message || error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// POST /toggle-revision — auth: flag/unflag a problem for revision
export const toggleRevision = async (req, res) => {
    const { questionId } = req.body;
    const email = req.userEmail; // SECURITY: identity from JWT, never the body
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        const list = user.revisionQuestionNames || [];
        user.revisionQuestionNames = list.includes(questionId)
            ? list.filter((id) => id !== questionId)
            : [...list, questionId];

        await user.save();
        res.status(200).json(user.revisionQuestionNames);
    } catch (error) {
        console.error("Toggle Revision Error:", error.message || error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
