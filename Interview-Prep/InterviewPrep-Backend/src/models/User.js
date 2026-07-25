import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    name: String,
    email: { type: String, required: true, unique: true, index: true },
    password: String,
    currentRating: { type: Number, default: null },
    completedQuestionNames: [String],
    revisionQuestionNames: [String], // problems the user flagged to revise
    // Password reset flow — stores a SHA-256 hash of the reset token, never the raw token
    resetPasswordToken: { type: String, default: null, index: true },
    resetPasswordExpires: { type: Date, default: null },
});

const User = mongoose.model("users", userSchema);

export default User;
