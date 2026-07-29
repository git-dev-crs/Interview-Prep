import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import ScoreCard from "../components/MockInterview/ScoreCard";
import ConfirmModal from "../components/ConfirmModal";
import { FaArrowLeft, FaDownload, FaCalendarAlt, FaClock, FaUserTie, FaArrowRight, FaTrashAlt } from "react-icons/fa";
import { API_URL, authHeaders, requestJson } from "../config/api";
import { downloadInterviewReport } from "../utils/generateReport";

const getScoreColor = (score) => {
    if (score >= 7) return "text-green-400";
    if (score >= 4) return "text-yellow-400";
    return "text-red-400";
};

const InterviewDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [session, setSession] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const fetchSession = async () => {
            try {
                const data = await requestJson(`${API_URL}/api/dashboard/session/${id}`, {
                    headers: authHeaders(),
                });
                setSession(data.session);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSession();
    }, [id]);

    const handleDownloadPDF = () => downloadInterviewReport(session);

    // Delete this report, then return to the dashboard.
    const handleDelete = async () => {
        setIsDeleting(true);
        setError(null);
        try {
            await requestJson(`${API_URL}/api/dashboard/session/${id}`, {
                method: "DELETE",
                headers: authHeaders(),
            });
            navigate("/dashboard");
        } catch (err) {
            setError(err.message);
            setIsDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <Nav />
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
            </div>
        );
    }

    if (error || !session) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <Nav />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-destructive mb-4">{error || "Session not found"}</p>
                        <Link to="/dashboard" className="text-primary hover:underline">Back to Dashboard</Link>
                    </div>
                </div>
            </div>
        );
    }

    const answeredQuestions = session.questions?.filter(q => q.answer) || [];

    return (
        <div className="min-h-screen bg-background flex flex-col font-sans">
            <Nav />
            <div className="flex-1 py-24 px-4" id="interview-report">
                <div className="max-w-3xl mx-auto">
                    {/* Back + Actions */}
                    <div className="flex items-center justify-between mb-8">
                        <Link
                            to="/dashboard"
                            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                        >
                            <FaArrowLeft /> Back to Dashboard
                        </Link>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleDownloadPDF}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary border border-primary/20 font-medium text-sm hover:bg-primary/20 transition-all"
                            >
                                <FaDownload /> Download PDF Report
                            </button>
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 font-medium text-sm hover:bg-red-500/20 transition-all"
                            >
                                <FaTrashAlt /> Delete
                            </button>
                        </div>
                    </div>

                    {/* Header */}
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-bold text-foreground mb-3">Interview Report</h1>
                        <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1"><FaUserTie className="text-primary" /> {session.role}</span>
                            <span>•</span>
                            <span>{session.interviewType} Mode</span>
                            <span>•</span>
                            <span>{session.experience}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                                <FaCalendarAlt className="text-primary" />
                                {new Date(session.completedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                            </span>
                        </div>
                    </div>

                    {/* Overall Score */}
                    <div className="mb-8">
                        <ScoreCard scores={session.overallScore} />
                    </div>

                    {/* Strengths & Weaknesses */}
                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                        {session.strengths?.length > 0 && (
                            <div className="p-6 rounded-2xl bg-green-500/10 border border-green-500/20">
                                <h3 className="text-lg font-bold text-green-400 mb-3">💪 Strengths</h3>
                                <ul className="space-y-2">
                                    {session.strengths.map((s, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                                            <span className="text-green-400 mt-0.5">✓</span> {s}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {session.weaknesses?.length > 0 && (
                            <div className="p-6 rounded-2xl bg-yellow-500/10 border border-yellow-500/20">
                                <h3 className="text-lg font-bold text-yellow-400 mb-3">🔧 Areas to Improve</h3>
                                <ul className="space-y-2">
                                    {session.weaknesses.map((w, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                                            <span className="text-yellow-400 mt-0.5">•</span> {w}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Recommendations */}
                    {session.recommendations?.length > 0 && (
                        <div className="p-6 rounded-2xl bg-primary/10 border border-primary/20 mb-8">
                            <h3 className="text-lg font-bold text-primary mb-3">📋 Recommendations</h3>
                            <ul className="space-y-2">
                                {session.recommendations.map((r, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                                        <span className="text-primary mt-0.5">{i + 1}.</span> {r}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Q&A Review */}
                    <div className="mb-8">
                        <h3 className="text-xl font-bold text-foreground mb-4">📝 Question-by-Question Review</h3>
                        <div className="space-y-4">
                            {answeredQuestions.map((q, i) => (
                                <div key={i} className="p-5 rounded-xl bg-card border border-border/50">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm font-semibold text-primary">Question {i + 1}</span>
                                        <div className="flex items-center gap-3">
                                            {q.timeSpent > 0 && (
                                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                                    <FaClock className="w-3 h-3" />
                                                    {Math.floor(q.timeSpent / 60)}m {q.timeSpent % 60}s
                                                </span>
                                            )}
                                            <span className={`text-sm font-bold ${getScoreColor(q.scores.overall)}`}>
                                                {q.scores.overall}/10
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-sm font-medium text-foreground mb-2">{q.question}</p>
                                    <p className="text-sm text-muted-foreground bg-secondary/20 p-3 rounded-lg mb-2">{q.answer}</p>
                                    {/* Mini score bars */}
                                    <div className="grid grid-cols-3 gap-2 mb-2">
                                        {[
                                            { label: "Technical", val: q.scores.technicalAccuracy },
                                            { label: "Communication", val: q.scores.communication },
                                            { label: "Depth", val: q.scores.depth },
                                        ].map((s) => (
                                            <div key={s.label} className="text-center p-1.5 rounded bg-background/50">
                                                <div className="text-[10px] text-muted-foreground">{s.label}</div>
                                                <div className={`text-sm font-bold ${getScoreColor(s.val)}`}>{s.val}/10</div>
                                            </div>
                                        ))}
                                    </div>
                                    {q.feedback && (
                                        <p className="text-xs text-muted-foreground italic border-l-2 border-primary/30 pl-3">
                                            💡 {q.feedback}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/mock-interview/setup"
                            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-orange-600 text-primary-foreground font-semibold shadow-lg hover:scale-[1.02] transition-all"
                        >
                            Start New Interview <FaArrowRight className="ml-2" />
                        </Link>
                        <button
                            onClick={handleDownloadPDF}
                            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-secondary text-secondary-foreground font-semibold hover:bg-secondary/80 transition-all"
                        >
                            <FaDownload className="mr-2" /> Download Report
                        </button>
                    </div>
                </div>
            </div>

            <ConfirmModal
                open={showDeleteConfirm}
                isLoading={isDeleting}
                title="Delete this report?"
                message={`This permanently deletes your ${session.role} interview report. This cannot be undone.`}
                confirmLabel="Delete"
                onConfirm={handleDelete}
                onCancel={() => !isDeleting && setShowDeleteConfirm(false)}
            />

            <Footer />
        </div>
    );
};

export default InterviewDetail;
