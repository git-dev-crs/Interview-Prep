import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import ScoreCard from "../components/MockInterview/ScoreCard";
import { FaArrowLeft, FaDownload, FaCalendarAlt, FaClock, FaUserTie, FaArrowRight } from "react-icons/fa";
import { API_URL, authHeaders } from "../config/api";

const getScoreColor = (score) => {
    if (score >= 7) return "text-green-400";
    if (score >= 4) return "text-yellow-400";
    return "text-red-400";
};

const InterviewDetail = () => {
    const { id } = useParams();
    const [session, setSession] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSession = async () => {
            try {
                const response = await fetch(`${API_URL}/api/dashboard/session/${id}`, {
                    headers: authHeaders(),
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.error);
                setSession(data.session);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSession();
    }, [id]);

    const handleDownloadPDF = () => {
        // Use browser print as a simple PDF export approach
        const printContent = document.getElementById("interview-report");
        if (!printContent) return;

        const printWindow = window.open("", "_blank");
        printWindow.document.write(`
            <html>
                <head>
                    <title>Interview Report - ${session.role}</title>
                    <style>
                        * { margin: 0; padding: 0; box-sizing: border-box; }
                        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1a1a2e; line-height: 1.6; }
                        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #6366f1; padding-bottom: 20px; }
                        .header h1 { font-size: 28px; color: #6366f1; margin-bottom: 8px; }
                        .header p { color: #666; font-size: 14px; }
                        .meta { display: flex; gap: 20px; justify-content: center; margin: 15px 0; flex-wrap: wrap; }
                        .meta span { background: #f0f0ff; padding: 4px 12px; border-radius: 6px; font-size: 13px; }
                        .section { margin-bottom: 25px; }
                        .section h2 { font-size: 18px; color: #6366f1; margin-bottom: 12px; border-left: 3px solid #6366f1; padding-left: 12px; }
                        .scores { display: flex; gap: 20px; justify-content: center; margin: 20px 0; }
                        .score-item { text-align: center; padding: 15px 20px; border-radius: 10px; background: #f8f8ff; border: 1px solid #e0e0ff; }
                        .score-item .value { font-size: 28px; font-weight: 700; color: #6366f1; }
                        .score-item .label { font-size: 12px; color: #666; margin-top: 4px; }
                        .qa-item { padding: 15px; margin-bottom: 12px; border-radius: 8px; border: 1px solid #e0e0e0; }
                        .qa-item .q-header { display: flex; justify-content: space-between; margin-bottom: 8px; }
                        .qa-item .question { font-weight: 600; color: #1a1a2e; margin-bottom: 8px; }
                        .qa-item .answer { color: #555; font-size: 14px; background: #f9f9f9; padding: 10px; border-radius: 6px; }
                        .qa-item .feedback { font-size: 13px; color: #6366f1; margin-top: 8px; font-style: italic; }
                        .tags { display: flex; gap: 10px; flex-wrap: wrap; }
                        .tag { padding: 6px 14px; border-radius: 6px; font-size: 13px; }
                        .tag-green { background: #e8f5e9; color: #2e7d32; }
                        .tag-yellow { background: #fff8e1; color: #f57f17; }
                        .tag-blue { background: #e3f2fd; color: #1565c0; }
                        @media print { body { padding: 20px; } }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>🎯 Interview Performance Report</h1>
                        <p>InterviewPrep - AI Mock Interview Platform</p>
                        <div class="meta">
                            <span>📋 ${session.role}</span>
                            <span>📊 ${session.interviewType} Mode</span>
                            <span>🎓 ${session.experience}</span>
                            <span>📅 ${new Date(session.completedAt).toLocaleDateString()}</span>
                        </div>
                    </div>

                    <div class="section">
                        <h2>Overall Performance</h2>
                        <div class="scores">
                            <div class="score-item">
                                <div class="value">${session.overallScore?.overall || 0}</div>
                                <div class="label">Overall</div>
                            </div>
                            <div class="score-item">
                                <div class="value">${session.overallScore?.technicalAccuracy || 0}</div>
                                <div class="label">Technical</div>
                            </div>
                            <div class="score-item">
                                <div class="value">${session.overallScore?.communication || 0}</div>
                                <div class="label">Communication</div>
                            </div>
                            <div class="score-item">
                                <div class="value">${session.overallScore?.depth || 0}</div>
                                <div class="label">Depth</div>
                            </div>
                        </div>
                    </div>

                    ${session.strengths?.length ? `
                    <div class="section">
                        <h2>💪 Strengths</h2>
                        <div class="tags">${session.strengths.map(s => `<span class="tag tag-green">✓ ${s}</span>`).join("")}</div>
                    </div>` : ""}

                    ${session.weaknesses?.length ? `
                    <div class="section">
                        <h2>🔧 Areas to Improve</h2>
                        <div class="tags">${session.weaknesses.map(w => `<span class="tag tag-yellow">• ${w}</span>`).join("")}</div>
                    </div>` : ""}

                    ${session.recommendations?.length ? `
                    <div class="section">
                        <h2>📋 Recommendations</h2>
                        <div class="tags">${session.recommendations.map((r, i) => `<span class="tag tag-blue">${i + 1}. ${r}</span>`).join("")}</div>
                    </div>` : ""}

                    <div class="section">
                        <h2>📝 Question-by-Question Review</h2>
                        ${session.questions?.filter(q => q.answer).map((q, i) => `
                        <div class="qa-item">
                            <div class="q-header">
                                <strong>Question ${i + 1}</strong>
                                <span style="color: ${q.scores.overall >= 7 ? '#2e7d32' : q.scores.overall >= 4 ? '#f57f17' : '#c62828'}; font-weight: 700;">
                                    ${q.scores.overall}/10
                                </span>
                            </div>
                            <div class="question">${q.question}</div>
                            <div class="answer">${q.answer}</div>
                            ${q.feedback ? `<div class="feedback">💡 ${q.feedback}</div>` : ""}
                        </div>`).join("") || "<p>No answered questions.</p>"}
                    </div>

                    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #999; font-size: 12px;">
                        Generated by InterviewPrep • ${new Date().toLocaleDateString()}
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => printWindow.print(), 500);
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
                        <button
                            onClick={handleDownloadPDF}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary border border-primary/20 font-medium text-sm hover:bg-primary/20 transition-all"
                        >
                            <FaDownload /> Download PDF Report
                        </button>
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
                            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-purple-600 text-primary-foreground font-semibold shadow-lg hover:scale-[1.02] transition-all"
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
            <Footer />
        </div>
    );
};

export default InterviewDetail;
