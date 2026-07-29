import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import ConfirmModal from "../components/ConfirmModal";
import { FaTrophy, FaChartLine, FaClock, FaListOl, FaArrowRight, FaCalendarAlt, FaTrashAlt } from "react-icons/fa";
import { API_URL, authHeaders, requestJson } from "../config/api";

const StatCard = ({ icon, label, value, color }) => (
    <div className="p-5 rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-all group">
        <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
            {icon}
        </div>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        <div className="text-sm text-muted-foreground">{label}</div>
    </div>
);

const getScoreColor = (score) => {
    if (score >= 7) return "text-green-400";
    if (score >= 4) return "text-yellow-400";
    return "text-red-400";
};

const getScoreBg = (score) => {
    if (score >= 7) return "bg-green-500/10 border-green-500/20";
    if (score >= 4) return "bg-yellow-500/10 border-yellow-500/20";
    return "bg-red-500/10 border-red-500/20";
};

// ─── Dependency-free SVG line chart for the score trend ───
const TrendChart = ({ data }) => {
    const W = 600, H = 180, PAD_X = 28, PAD_Y = 20;
    const n = data.length;
    const x = (i) => PAD_X + (i * (W - 2 * PAD_X)) / Math.max(n - 1, 1);
    const y = (score) => H - PAD_Y - (score / 10) * (H - 2 * PAD_Y);

    const points = data.map((d, i) => ({ cx: x(i), cy: y(d.score), ...d }));
    const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.cx},${p.cy}`).join(" ");
    const areaPath = `${linePath} L${points[n - 1].cx},${H - PAD_Y} L${points[0].cx},${H - PAD_Y} Z`;

    const pointColor = (score) => (score >= 7 ? "#4ade80" : score >= 4 ? "#facc15" : "#f87171");

    return (
        <div className="w-full overflow-x-auto">
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[480px]" role="img" aria-label="Score trend chart">
                <defs>
                    <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(24, 94%, 50%)" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="hsl(24, 94%, 50%)" stopOpacity="0.02" />
                    </linearGradient>
                    <linearGradient id="trendLine" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="hsl(24, 94%, 50%)" />
                        <stop offset="100%" stopColor="#ea580c" />
                    </linearGradient>
                </defs>

                {/* Grid lines at 0, 5, 10 */}
                {[0, 5, 10].map((v) => (
                    <g key={v}>
                        <line x1={PAD_X} y1={y(v)} x2={W - PAD_X} y2={y(v)} stroke="currentColor" strokeOpacity="0.08" strokeDasharray="4 4" />
                        <text x={PAD_X - 8} y={y(v) + 4} textAnchor="end" fontSize="10" fill="currentColor" opacity="0.4">{v}</text>
                    </g>
                ))}

                {/* Area + line */}
                {n > 1 && <path d={areaPath} fill="url(#trendFill)" />}
                {n > 1 && <path d={linePath} fill="none" stroke="url(#trendLine)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />}

                {/* Data points */}
                {points.map((p, i) => (
                    <g key={i}>
                        <circle cx={p.cx} cy={p.cy} r="5" fill={pointColor(p.score)} stroke="#0a0a0f" strokeWidth="1.5">
                            <title>{`${p.role}: ${p.score}/10 — ${new Date(p.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}</title>
                        </circle>
                        <text x={p.cx} y={p.cy - 10} textAnchor="middle" fontSize="10" fontWeight="700" fill={pointColor(p.score)}>{p.score}</text>
                        <text x={p.cx} y={H - 4} textAnchor="middle" fontSize="9" fill="currentColor" opacity="0.45">
                            {new Date(p.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </text>
                    </g>
                ))}
            </svg>
        </div>
    );
};

// ─── Dependency-free SVG radar chart for skill averages ───
const SkillRadarChart = ({ skills }) => {
    const axes = [
        { key: "technicalAccuracy", label: "Technical" },
        { key: "communication", label: "Communication" },
        { key: "depth", label: "Depth" },
    ];
    const size = 260;
    const cx = size / 2;
    const cy = size / 2;
    const radius = 90;
    const n = axes.length;

    // Angle for each axis, starting at the top (−90°) and going clockwise.
    const angleFor = (i) => (Math.PI * 2 * i) / n - Math.PI / 2;
    const pointAt = (i, value) => {
        const r = (Math.max(0, Math.min(10, value)) / 10) * radius;
        return [cx + r * Math.cos(angleFor(i)), cy + r * Math.sin(angleFor(i))];
    };

    const dataPoints = axes.map((a, i) => pointAt(i, skills[a.key] || 0));
    const dataPath = dataPoints.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ") + " Z";

    // Concentric grid rings at 2/4/6/8/10.
    const rings = [2, 4, 6, 8, 10].map((level) =>
        axes.map((a, i) => pointAt(i, level)).map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ") + " Z"
    );

    return (
        <div className="flex flex-col items-center">
            <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[280px]" role="img" aria-label="Skill breakdown radar chart">
                {/* Grid rings */}
                {rings.map((d, i) => (
                    <path key={i} d={d} fill="none" stroke="currentColor" strokeOpacity="0.1" />
                ))}
                {/* Axis spokes */}
                {axes.map((a, i) => {
                    const [x, y] = pointAt(i, 10);
                    return <line key={a.key} x1={cx} y1={cy} x2={x} y2={y} stroke="currentColor" strokeOpacity="0.12" />;
                })}
                {/* Data polygon */}
                <path d={dataPath} fill="hsl(24, 94%, 50%)" fillOpacity="0.25" stroke="hsl(24, 94%, 50%)" strokeWidth="2" strokeLinejoin="round" />
                {/* Data vertices + value labels */}
                {dataPoints.map((p, i) => (
                    <g key={i}>
                        <circle cx={p[0]} cy={p[1]} r="4" fill="#ea580c" stroke="#0a0a0f" strokeWidth="1.5" />
                    </g>
                ))}
                {/* Axis labels — anchored by position so they never overflow the box */}
                {axes.map((a, i) => {
                    const [lx, ly] = pointAt(i, 11.3);
                    const anchor = Math.abs(lx - cx) < 4 ? "middle" : lx > cx ? "start" : "end";
                    return (
                        <text
                            key={a.key}
                            x={lx}
                            y={ly}
                            textAnchor={anchor}
                            dominantBaseline="middle"
                            fontSize="11"
                            fontWeight="600"
                            fill="currentColor"
                            opacity="0.75"
                        >
                            {a.label}
                        </text>
                    );
                })}
            </svg>
            {/* Numeric legend */}
            <div className="flex flex-wrap justify-center gap-x-5 gap-y-1 mt-2">
                {axes.map((a) => (
                    <span key={a.key} className="text-xs text-muted-foreground">
                        {a.label}: <span className={`font-bold ${getScoreColor(skills[a.key] || 0)}`}>{skills[a.key] || 0}/10</span>
                    </span>
                ))}
            </div>
        </div>
    );
};

const Dashboard = () => {
    const navigate = useNavigate();
    const email = localStorage.getItem("email");

    const [stats, setStats] = useState(null);
    const [activeSession, setActiveSession] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deletingId, setDeletingId] = useState(null); // session currently being deleted
    // Confirmation modal target: null | { type: "one", id, role } | { type: "all" }
    const [confirmTarget, setConfirmTarget] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Reusable so it can run on mount AND re-run after a delete to refresh aggregates.
    const fetchStats = useCallback(async () => {
        try {
            const data = await requestJson(`${API_URL}/api/dashboard/stats`, {
                headers: authHeaders(),
            });
            setStats(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!email) {
            navigate("/login");
            return;
        }

        // Check for an unfinished interview so the user can resume it
        const fetchActiveSession = async () => {
            try {
                const data = await requestJson(`${API_URL}/api/mock-interview/active`, {
                    headers: authHeaders(),
                });
                if (data.active) setActiveSession(data);
            } catch {
                // Non-critical — silently ignore
            }
        };

        fetchStats();
        fetchActiveSession();
    }, [email, navigate, fetchStats]);

    // Run the delete once the user confirms in the modal (single or clear-all).
    const handleConfirm = async () => {
        if (!confirmTarget) return;
        setIsProcessing(true);
        setError(null);

        try {
            if (confirmTarget.type === "all") {
                await requestJson(`${API_URL}/api/dashboard/sessions`, {
                    method: "DELETE",
                    headers: authHeaders(),
                });
            } else {
                setDeletingId(confirmTarget.id);
                await requestJson(`${API_URL}/api/dashboard/session/${confirmTarget.id}`, {
                    method: "DELETE",
                    headers: authHeaders(),
                });
            }
            // Re-sync all aggregates (totals, avg, best, radar, charts) with the server.
            await fetchStats();
            setConfirmTarget(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsProcessing(false);
            setDeletingId(null);
        }
    };

    const handleResume = () => {
        navigate("/mock-interview/session", {
            state: {
                sessionId: activeSession.sessionId,
                question: activeSession.question,
                questionNumber: activeSession.questionNumber,
                totalQuestions: activeSession.totalQuestions,
                role: activeSession.role,
                experience: activeSession.experience,
                interviewType: activeSession.interviewType,
                difficulty: activeSession.difficulty,
                duration: activeSession.duration,
            },
        });
    };

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    };

    const formatTime = (seconds) => {
        if (seconds < 60) return `${seconds}s`;
        const m = Math.floor(seconds / 60);
        if (m < 60) return `${m} min`;
        const h = Math.floor(m / 60);
        return `${h}h ${m % 60}m`;
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <Nav />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Loading your dashboard...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col font-sans">
            <Nav />
            <div className="flex-1 py-24 px-4">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                                Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-500">Dashboard</span>
                            </h1>
                            <p className="text-muted-foreground">Track your interview preparation progress</p>
                        </div>
                        <Link
                            to="/mock-interview/setup"
                            className="mt-4 md:mt-0 inline-flex items-center px-5 py-2.5 rounded-lg bg-gradient-to-r from-primary to-orange-600 text-primary-foreground font-semibold shadow-lg hover:scale-[1.02] transition-all text-sm"
                        >
                            New Interview <FaArrowRight className="ml-2" />
                        </Link>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                            {error}
                        </div>
                    )}

                    {/* Resume unfinished interview */}
                    {activeSession && (
                        <div className="mb-8 p-5 rounded-2xl bg-primary/10 border border-primary/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-500">
                            <div className="flex items-center gap-4">
                                <div className="text-3xl">⏸️</div>
                                <div>
                                    <div className="font-bold text-foreground">You have an unfinished interview</div>
                                    <div className="text-sm text-muted-foreground">
                                        {activeSession.role} • {activeSession.interviewType} • Question {activeSession.questionNumber} of {activeSession.totalQuestions}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={handleResume}
                                className="inline-flex items-center px-5 py-2.5 rounded-lg bg-gradient-to-r from-primary to-orange-600 text-primary-foreground font-semibold text-sm shadow-lg hover:scale-[1.02] transition-all"
                            >
                                Resume Interview <FaArrowRight className="ml-2" />
                            </button>
                        </div>
                    )}

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                        <StatCard
                            icon={<FaListOl className="text-blue-400" />}
                            label="Total Interviews"
                            value={stats?.totalInterviews || 0}
                            color="bg-blue-500/10"
                        />
                        <StatCard
                            icon={<FaChartLine className="text-green-400" />}
                            label="Average Score"
                            value={`${stats?.avgScore || 0}/10`}
                            color="bg-green-500/10"
                        />
                        <StatCard
                            icon={<FaTrophy className="text-yellow-400" />}
                            label="Best Score"
                            value={`${stats?.bestScore || 0}/10`}
                            color="bg-yellow-500/10"
                        />
                        <StatCard
                            icon={<FaClock className="text-orange-400" />}
                            label="Time Practiced"
                            value={formatTime(stats?.totalTimeSpent || 0)}
                            color="bg-orange-500/10"
                        />
                    </div>

                    {/* Score Trend */}
                    {stats?.scoreTrend?.length > 1 && (
                        <div className="mb-10 p-6 rounded-2xl bg-card border border-border/50 text-foreground">
                            <h2 className="text-lg font-bold text-foreground mb-4">📈 Score Trend</h2>
                            <TrendChart data={stats.scoreTrend} />
                        </div>
                    )}

                    {/* Skill Radar + Interview Type Breakdown */}
                    {stats?.totalInterviews > 0 && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
                            {/* Skill radar */}
                            {stats?.skillAverages && (
                                <div className="p-6 rounded-2xl bg-card border border-border/50 text-foreground">
                                    <h2 className="text-lg font-bold text-foreground mb-2">🧭 Skill Breakdown</h2>
                                    <p className="text-xs text-muted-foreground mb-2">Your average across every completed interview</p>
                                    <SkillRadarChart skills={stats.skillAverages} />
                                </div>
                            )}

                            {/* Interview type breakdown */}
                            {stats?.typeBreakdown && Object.keys(stats.typeBreakdown).length > 0 && (
                                <div className="p-6 rounded-2xl bg-card border border-border/50">
                                    <h2 className="text-lg font-bold text-foreground mb-4">🗂️ By Interview Type</h2>
                                    <div className="space-y-4">
                                        {Object.entries(stats.typeBreakdown).map(([type, data]) => (
                                            <div key={type}>
                                                <div className="flex justify-between text-sm mb-1.5">
                                                    <span className="text-foreground font-medium">
                                                        {type} <span className="text-muted-foreground font-normal">· {data.count} interview{data.count > 1 ? "s" : ""}</span>
                                                    </span>
                                                    <span className={`font-bold ${getScoreColor(data.avgScore)}`}>{data.avgScore}/10</span>
                                                </div>
                                                <div className="h-2.5 rounded-full bg-secondary/50 overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full transition-all duration-1000 ease-out"
                                                        style={{
                                                            width: `${(data.avgScore / 10) * 100}%`,
                                                            background: data.avgScore >= 7
                                                                ? "linear-gradient(90deg, #22c55e, #4ade80)"
                                                                : data.avgScore >= 4
                                                                    ? "linear-gradient(90deg, #eab308, #facc15)"
                                                                    : "linear-gradient(90deg, #ef4444, #f87171)",
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Topic Breakdown */}
                    {stats?.topicBreakdown && Object.keys(stats.topicBreakdown).length > 0 && (
                        <div className="mb-10 p-6 rounded-2xl bg-card border border-border/50">
                            <h2 className="text-lg font-bold text-foreground mb-4">🎯 Topic Breakdown</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {Object.entries(stats.topicBreakdown).map(([topic, data]) => (
                                    <div key={topic} className={`p-4 rounded-xl border ${getScoreBg(Number(data.avgScore))}`}>
                                        <div className="font-semibold text-foreground text-sm">{topic}</div>
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-xs text-muted-foreground">{data.count} interview{data.count > 1 ? "s" : ""}</span>
                                            <span className={`text-lg font-bold ${getScoreColor(Number(data.avgScore))}`}>{data.avgScore}/10</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Session History */}
                    <div className="p-6 rounded-2xl bg-card border border-border/50">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-foreground">📋 Interview History</h2>
                            {stats?.recentSessions?.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => setConfirmTarget({ type: "all" })}
                                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-400 border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 transition-all"
                                >
                                    <FaTrashAlt className="w-3 h-3" /> Clear All History
                                </button>
                            )}
                        </div>
                        {stats?.recentSessions?.length > 0 ? (
                            <div className="space-y-3">
                                {stats.recentSessions.map((session) => (
                                    <div
                                        key={session._id}
                                        className={`flex flex-col md:flex-row items-start md:items-center justify-between p-4 rounded-xl bg-secondary/20 border border-border/50 hover:border-primary/50 hover:bg-secondary/30 transition-all group ${deletingId === session._id ? "opacity-50 pointer-events-none" : ""}`}
                                    >
                                        <Link
                                            to={`/dashboard/session/${session._id}`}
                                            className="flex items-center gap-4 mb-2 md:mb-0 flex-1 min-w-0"
                                        >
                                            <div className={`w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center font-bold text-sm ${getScoreBg(session.overallScore)} border`}>
                                                <span className={getScoreColor(session.overallScore)}>{session.overallScore}</span>
                                            </div>
                                            <div className="min-w-0">
                                                <div className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors">
                                                    {session.role}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {session.interviewType} • {session.experience} • {session.totalQuestions} questions
                                                </div>
                                            </div>
                                        </Link>
                                        <div className="flex items-center gap-3 self-end md:self-auto">
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <FaCalendarAlt className="w-3 h-3" />
                                                {formatDate(session.completedAt)}
                                            </div>
                                            <Link
                                                to={`/dashboard/session/${session._id}`}
                                                aria-label="View report"
                                                className="p-1.5 rounded-lg text-muted-foreground hover:text-primary transition-colors"
                                            >
                                                <FaArrowRight className="w-3 h-3" />
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={() => setConfirmTarget({ type: "one", id: session._id, role: session.role })}
                                                disabled={deletingId === session._id}
                                                aria-label="Delete this interview report"
                                                title="Delete this interview report"
                                                className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all"
                                            >
                                                <FaTrashAlt className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="text-4xl mb-4">🎯</div>
                                <p className="text-muted-foreground mb-4">No interviews yet. Start your first mock interview!</p>
                                <Link
                                    to="/mock-interview/setup"
                                    className="inline-flex items-center px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors"
                                >
                                    Start Interview <FaArrowRight className="ml-2" />
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Delete / Clear-all confirmation */}
            <ConfirmModal
                open={!!confirmTarget}
                isLoading={isProcessing}
                title={confirmTarget?.type === "all" ? "Clear all interview history?" : "Delete this report?"}
                message={
                    confirmTarget?.type === "all"
                        ? "This permanently deletes every completed interview and resets all your stats. This cannot be undone."
                        : `This permanently deletes your ${confirmTarget?.role || ""} interview report. This cannot be undone.`
                }
                confirmLabel={confirmTarget?.type === "all" ? "Clear Everything" : "Delete"}
                onConfirm={handleConfirm}
                onCancel={() => !isProcessing && setConfirmTarget(null)}
            />

            <Footer />
        </div>
    );
};

export default Dashboard;
