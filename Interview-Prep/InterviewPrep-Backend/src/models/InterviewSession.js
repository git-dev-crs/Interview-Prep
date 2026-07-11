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
    timeSpent: { type: Number, default: 0 }, // seconds spent on this question
}, { _id: false });

const interviewSessionSchema = mongoose.Schema({
    userEmail: { type: String, required: true },
    role: { type: String, required: true },           // e.g., "Frontend Developer"
    experience: { type: String, required: true },      // e.g., "Fresher", "1-3 yrs"
    interviewType: { type: String, required: true },   // "Technical", "HR", "Mixed"
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
    completedAt: { type: Date, default: null },
});

const InterviewSession = mongoose.model("InterviewSession", interviewSessionSchema);

export default InterviewSession;
