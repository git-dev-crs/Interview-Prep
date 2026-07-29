import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { API_URL, authHeaders, requestJson } from "../config/api";
import {
    FaLaptopCode, FaServer, FaLayerGroup, FaDatabase, FaCloud, FaBrain,
    FaPaintBrush, FaMobileAlt, FaArrowRight, FaClock, FaUserTie, FaCogs, FaRandom
} from "react-icons/fa";

const ROLES = [
    { id: "frontend", label: "Frontend Developer", icon: <FaPaintBrush /> },
    { id: "backend", label: "Backend Developer", icon: <FaServer /> },
    { id: "fullstack", label: "Full-Stack Developer", icon: <FaLayerGroup /> },
    { id: "data-science", label: "Data Scientist", icon: <FaBrain /> },
    { id: "devops", label: "DevOps Engineer", icon: <FaCloud /> },
    { id: "mobile", label: "Mobile Developer", icon: <FaMobileAlt /> },
    { id: "database", label: "Database Engineer", icon: <FaDatabase /> },
    { id: "sde", label: "SDE (General)", icon: <FaLaptopCode /> },
];

const EXPERIENCE_LEVELS = [
    { id: "Fresher", label: "Fresher", desc: "0 years" },
    { id: "1-3 yrs", label: "Junior", desc: "1-3 years" },
    { id: "3-5 yrs", label: "Mid-Level", desc: "3-5 years" },
    { id: "5+ yrs", label: "Senior", desc: "5+ years" },
];

const INTERVIEW_TYPES = [
    { id: "Technical", label: "Technical", icon: <FaCogs />, desc: "DSA, System Design, domain knowledge" },
    { id: "HR", label: "HR / Behavioral", icon: <FaUserTie />, desc: "Teamwork, leadership, situational" },
    { id: "Mixed", label: "Mixed", icon: <FaRandom />, desc: "Balanced technical + behavioral" },
];

const DURATIONS = [
    { value: 15, label: "15 min", desc: "Quick session" },
    { value: 30, label: "30 min", desc: "Standard" },
    { value: 45, label: "45 min", desc: "Extended" },
    { value: 60, label: "60 min", desc: "Full length" },
];

const DIFFICULTIES = [
    { id: "Easy", label: "Easy", emoji: "🌱", desc: "Fundamentals & warm-ups" },
    { id: "Medium", label: "Medium", emoji: "⚡", desc: "Standard interview level" },
    { id: "Hard", label: "Hard", emoji: "🔥", desc: "Top-tier company level" },
];

const QUESTION_COUNTS = [
    { value: 5, label: "5", desc: "Short" },
    { value: 8, label: "8", desc: "Standard" },
    { value: 10, label: "10", desc: "Thorough" },
    { value: 12, label: "12", desc: "Marathon" },
];

const InterviewSetup = () => {
    const navigate = useNavigate();
    const [selectedRole, setSelectedRole] = useState(null);
    const [selectedExperience, setSelectedExperience] = useState(null);
    const [selectedType, setSelectedType] = useState(null);
    const [selectedDuration, setSelectedDuration] = useState(30);
    const [selectedDifficulty, setSelectedDifficulty] = useState("Medium");
    const [selectedQuestionCount, setSelectedQuestionCount] = useState(8);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const email = localStorage.getItem("email");

    const canStart = selectedRole && selectedExperience && selectedType;

    const handleStart = async () => {
        if (!canStart) return;

        if (!email) {
            setError("Please log in first to start a mock interview.");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const roleLabel = ROLES.find(r => r.id === selectedRole)?.label || selectedRole;
            const data = await requestJson(`${API_URL}/api/mock-interview/start`, {
                method: "POST",
                headers: authHeaders(),
                body: JSON.stringify({
                    role: roleLabel,
                    experience: selectedExperience,
                    interviewType: selectedType,
                    duration: selectedDuration,
                    difficulty: selectedDifficulty,
                    questionCount: selectedQuestionCount,
                }),
            });

            // Navigate to the interview session with session data
            navigate("/mock-interview/session", {
                state: {
                    sessionId: data.sessionId,
                    question: data.question,
                    questionNumber: data.questionNumber,
                    totalQuestions: data.totalQuestions || selectedQuestionCount,
                    role: roleLabel,
                    experience: selectedExperience,
                    interviewType: selectedType,
                    difficulty: selectedDifficulty,
                    duration: selectedDuration,
                },
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col font-sans">
            <Nav />
            <div className="flex-1 py-28 px-4">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center px-3 py-1 rounded-full border border-primary/20 bg-primary/10 text-primary text-sm font-medium mb-4">
                            🎯 AI Powered Mock Interview
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                            Practice Interviews with{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-500">
                                AI Intelligence
                            </span>
                        </h1>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Role-based mock interviews with smart follow-ups, adaptive difficulty, and real-time performance evaluation.
                        </p>
                    </div>

                    {/* Step 1: Role Selection */}
                    <div className="mb-10">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold">1</div>
                            <h2 className="text-xl font-bold text-foreground">Select Your Target Role</h2>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {ROLES.map(role => (
                                <button
                                    key={role.id}
                                    onClick={() => setSelectedRole(role.id)}
                                    className={`p-4 rounded-xl border text-left transition-all duration-200 group hover:scale-[1.02] ${selectedRole === role.id
                                        ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                                        : "border-border/50 bg-card hover:border-primary/50"
                                        }`}
                                >
                                    <div className={`text-xl mb-2 transition-transform group-hover:scale-110 ${selectedRole === role.id ? "text-primary" : "text-muted-foreground"}`}>
                                        {role.icon}
                                    </div>
                                    <div className={`text-sm font-semibold ${selectedRole === role.id ? "text-primary" : "text-foreground"}`}>
                                        {role.label}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Step 2: Experience Level */}
                    <div className="mb-10">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold">2</div>
                            <h2 className="text-xl font-bold text-foreground">Experience Level</h2>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {EXPERIENCE_LEVELS.map(exp => (
                                <button
                                    key={exp.id}
                                    onClick={() => setSelectedExperience(exp.id)}
                                    className={`p-4 rounded-xl border text-center transition-all duration-200 hover:scale-[1.02] ${selectedExperience === exp.id
                                        ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                                        : "border-border/50 bg-card hover:border-primary/50"
                                        }`}
                                >
                                    <div className={`text-lg font-bold ${selectedExperience === exp.id ? "text-primary" : "text-foreground"}`}>
                                        {exp.label}
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1">{exp.desc}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Step 3: Interview Type */}
                    <div className="mb-10">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold">3</div>
                            <h2 className="text-xl font-bold text-foreground">Interview Type</h2>
                        </div>
                        <div className="grid md:grid-cols-3 gap-4">
                            {INTERVIEW_TYPES.map(type => (
                                <button
                                    key={type.id}
                                    onClick={() => setSelectedType(type.id)}
                                    className={`p-5 rounded-xl border text-left transition-all duration-200 hover:scale-[1.02] ${selectedType === type.id
                                        ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                                        : "border-border/50 bg-card hover:border-primary/50"
                                        }`}
                                >
                                    <div className={`text-2xl mb-3 ${selectedType === type.id ? "text-primary" : "text-muted-foreground"}`}>
                                        {type.icon}
                                    </div>
                                    <div className={`font-bold ${selectedType === type.id ? "text-primary" : "text-foreground"}`}>
                                        {type.label}
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1">{type.desc}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Step 4: Duration */}
                    <div className="mb-12">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold">4</div>
                            <h2 className="text-xl font-bold text-foreground">Interview Duration</h2>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {DURATIONS.map(dur => (
                                <button
                                    key={dur.value}
                                    onClick={() => setSelectedDuration(dur.value)}
                                    className={`p-4 rounded-xl border text-center transition-all duration-200 hover:scale-[1.02] ${selectedDuration === dur.value
                                        ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                                        : "border-border/50 bg-card hover:border-primary/50"
                                        }`}
                                >
                                    <FaClock className={`mx-auto text-lg mb-2 ${selectedDuration === dur.value ? "text-primary" : "text-muted-foreground"}`} />
                                    <div className={`font-bold ${selectedDuration === dur.value ? "text-primary" : "text-foreground"}`}>
                                        {dur.label}
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1">{dur.desc}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Step 5: Difficulty */}
                    <div className="mb-10">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold">5</div>
                            <h2 className="text-xl font-bold text-foreground">Difficulty Level</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {DIFFICULTIES.map(diff => (
                                <button
                                    key={diff.id}
                                    onClick={() => setSelectedDifficulty(diff.id)}
                                    className={`p-5 rounded-xl border text-left transition-all duration-200 hover:scale-[1.02] ${selectedDifficulty === diff.id
                                        ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                                        : "border-border/50 bg-card hover:border-primary/50"
                                        }`}
                                >
                                    <div className="text-2xl mb-3">{diff.emoji}</div>
                                    <div className={`font-bold ${selectedDifficulty === diff.id ? "text-primary" : "text-foreground"}`}>
                                        {diff.label}
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1">{diff.desc}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Step 6: Number of Questions */}
                    <div className="mb-12">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold">6</div>
                            <h2 className="text-xl font-bold text-foreground">Number of Questions</h2>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {QUESTION_COUNTS.map(qc => (
                                <button
                                    key={qc.value}
                                    onClick={() => setSelectedQuestionCount(qc.value)}
                                    className={`p-4 rounded-xl border text-center transition-all duration-200 hover:scale-[1.02] ${selectedQuestionCount === qc.value
                                        ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                                        : "border-border/50 bg-card hover:border-primary/50"
                                        }`}
                                >
                                    <div className={`text-lg font-bold ${selectedQuestionCount === qc.value ? "text-primary" : "text-foreground"}`}>
                                        {qc.label} questions
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1">{qc.desc}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center">
                            {error}
                        </div>
                    )}

                    {/* Start Button */}
                    <div className="text-center">
                        <button
                            onClick={handleStart}
                            disabled={!canStart || isLoading}
                            className={`inline-flex items-center justify-center px-10 py-4 rounded-xl text-lg font-bold shadow-lg transition-all duration-300 transform ${canStart && !isLoading
                                ? "bg-gradient-to-r from-primary to-orange-600 text-primary-foreground shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] hover:-translate-y-0.5"
                                : "bg-muted text-muted-foreground cursor-not-allowed"
                                }`}
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Starting Interview...
                                </>
                            ) : (
                                <>
                                    Start Interview <FaArrowRight className="ml-3" />
                                </>
                            )}
                        </button>
                        {!canStart && (
                            <p className="text-sm text-muted-foreground mt-3">
                                Please select role, experience, and interview type to continue
                            </p>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default InterviewSetup;
