import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { FaTrophy, FaChartLine, FaClock, FaListOl, FaArrowRight, FaCalendarAlt } from "react-icons/fa";
import { API_URL, authHeaders } from "../config/api";

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

const Dashboard = () => {
    const navigate = useNavigate();
    const email = localStorage.getItem("email");

    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!email) {
            navigate("/login");
            return;
        }

        const fetchStats = async () => {
            try {
                const response = await fetch(`${API_URL}/api/dashboard/stats?email=${encodeURIComponent(email)}`, {
                    headers: authHeaders(),
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.error);
                setStats(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, [email, navigate]);

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
                                Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">Dashboard</span>
                            </h1>
                            <p className="text-muted-foreground">Track your interview preparation progress</p>
                        </div>
                        <Link
                            to="/mock-interview/setup"
                            className="mt-4 md:mt-0 inline-flex items-center px-5 py-2.5 rounded-lg bg-gradient-to-r from-primary to-purple-600 text-primary-foreground font-semibold shadow-lg hover:scale-[1.02] transition-all text-sm"
                        >
                            New Interview <FaArrowRight className="ml-2" />
                        </Link>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                            {error}
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
                            icon={<FaClock className="text-purple-400" />}
                            label="Time Practiced"
                            value={formatTime(stats?.totalTimeSpent || 0)}
                            color="bg-purple-500/10"
                        />
                    </div>

                    {/* Score Trend */}
                    {stats?.scoreTrend?.length > 1 && (
                        <div className="mb-10 p-6 rounded-2xl bg-card border border-border/50">
                            <h2 className="text-lg font-bold text-foreground mb-4">📈 Score Trend</h2>
                            <div className="flex items-end gap-2 h-40">
                                {stats.scoreTrend.map((point, i) => {
                                    const height = (point.score / 10) * 100;
                                    return (
                                        <div key={i} className="flex-1 flex flex-col items-center gap-1" title={`${point.role}: ${point.score}/10`}>
                                            <span className={`text-xs font-bold ${getScoreColor(point.score)}`}>{point.score}</span>
                                            <div
                                                className="w-full rounded-t-md transition-all duration-500 hover:opacity-80"
                                                style={{
                                                    height: `${height}%`,
                                                    background: point.score >= 7
                                                        ? "linear-gradient(180deg, #4ade80, #22c55e)"
                                                        : point.score >= 4
                                                            ? "linear-gradient(180deg, #facc15, #eab308)"
                                                            : "linear-gradient(180deg, #f87171, #ef4444)",
                                                    minHeight: "8px",
                                                }}
                                            />
                                            <span className="text-[10px] text-muted-foreground truncate w-full text-center">
                                                {new Date(point.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
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
                        <h2 className="text-lg font-bold text-foreground mb-4">📋 Interview History</h2>
                        {stats?.recentSessions?.length > 0 ? (
                            <div className="space-y-3">
                                {stats.recentSessions.map((session) => (
                                    <Link
                                        key={session._id}
                                        to={`/dashboard/session/${session._id}`}
                                        className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 rounded-xl bg-secondary/20 border border-border/50 hover:border-primary/50 hover:bg-secondary/30 transition-all group"
                                    >
                                        <div className="flex items-center gap-4 mb-2 md:mb-0">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${getScoreBg(session.overallScore)} border`}>
                                                <span className={getScoreColor(session.overallScore)}>{session.overallScore}</span>
                                            </div>
                                            <div>
                                                <div className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors">
                                                    {session.role}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {session.interviewType} • {session.experience} • {session.totalQuestions} questions
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <FaCalendarAlt className="w-3 h-3" />
                                                {formatDate(session.completedAt)}
                                            </div>
                                            <FaArrowRight className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors" />
                                        </div>
                                    </Link>
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
            <Footer />
        </div>
    );
};

export default Dashboard;
