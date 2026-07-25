import mongoose from "mongoose";

const questionEntrySchema = mongoose.Schema({
    question: String,
    answer: { type: String, default: "" },
    scores: {
        technicalAccuracy: { type: Number, default: 0 },
        communication: { type: Number, default: 0 },
        depth: { type: Number, default: 0 },
        overall: { type: Number, default: 0 },
    },
    feedback: { type: String, default: "" },
    idealAnswer: { type: String, default: "" }, // model answer shown after evaluation
    timeSpent: { type: Number, default: 0 }, // seconds spent on this question
}, { _id: false });

const interviewSessionSchema = mongoose.Schema({
    userEmail: { type: String, required: true, index: true },
    role: { type: String, required: true },           // e.g., "Frontend Developer"
    experience: { type: String, required: true },      // e.g., "Fresher", "1-3 yrs"
    interviewType: { type: String, required: true },   // "Technical", "HR", "Mixed"
    difficulty: { type: String, default: "Medium" },    // "Easy", "Medium", "Hard"
    questionCount: { type: Number, default: 8 },        // target number of questions
    duration: { type: Number, default: 30 },           // total interview duration in minutes
    questions: [questionEntrySchema],
    overallScore: {
        technicalAccuracy: { type: Number, default: 0 },
        communication: { type: Number, default: 0 },
        depth: { type: Number, default: 0 },
        overall: { type: Number, default: 0 },
    },
    status: { type: String, default: "in-progress" }, // "in-progress", "completed"
    totalQuestions: { type: Number, default: 0 },
    strengths: [String],
    weaknesses: [String],
    recommendations: [String],
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: null, index: true },
});

// Compound index — covers dashboard queries: find by user + filter by status
interviewSessionSchema.index({ userEmail: 1, status: 1 });

const InterviewSession = mongoose.model("InterviewSession", interviewSessionSchema);

export default InterviewSession;
