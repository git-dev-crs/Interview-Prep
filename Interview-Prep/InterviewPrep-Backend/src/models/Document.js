import mongoose from "mongoose";

const documentSchema = mongoose.Schema({
    name: String,
    link: String,
    rating: { type: Number, index: true },
    // ─── Structured roadmap fields ───
    topic: { type: String, default: "General" },       // e.g. "Arrays & Hashing"
    difficulty: { type: String, default: "Medium" },   // "Easy" | "Medium" | "Hard"
    order: { type: Number, default: 0 },               // global learning order
});

// Compound index for roadmap queries that sort by topic then order
documentSchema.index({ topic: 1, order: 1 });

const Document = mongoose.model("Document", documentSchema);

export default Document;
