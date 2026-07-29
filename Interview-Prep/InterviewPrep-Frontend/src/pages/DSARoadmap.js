import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { FaChevronDown, FaExternalLinkAlt, FaRegStar, FaStar, FaCheck, FaSearch } from "react-icons/fa";
import { API_URL, authHeaders, requestJson } from "../config/api";

// ─── Difficulty tag ───
const DIFF_STYLES = {
    Easy: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20",
    Medium: "text-amber-600 bg-amber-500/10 border-amber-500/20",
    Hard: "text-red-600 bg-red-500/10 border-red-500/20",
};
const DifficultyTag = ({ difficulty }) => (
    <span className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full border ${DIFF_STYLES[difficulty] || DIFF_STYLES.Medium}`}>
        {difficulty}
    </span>
);

// ─── Thin progress bar ───
const ProgressBar = ({ value, total, className = "" }) => {
    const pct = total ? Math.round((value / total) * 100) : 0;
    return (
        <div className={`h-2 rounded-full bg-secondary overflow-hidden ${className}`}>
            <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
    );
};

const DSARoadmap = () => {
    const navigate = useNavigate();
    const isLoggedIn = Boolean(localStorage.getItem("token"));

    const [problems, setProblems] = useState([]);
    const [solved, setSolved] = useState([]);
    const [revision, setRevision] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Toolbar state
    const [search, setSearch] = useState("");
    const [diffFilter, setDiffFilter] = useState("All");
    const [statusFilter, setStatusFilter] = useState("All");
    const [collapsed, setCollapsed] = useState(() => new Set());
    const [busyId, setBusyId] = useState(null);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await requestJson(`${API_URL}/dsa/problems`, { headers: { "Content-Type": "application/json" } });
                setProblems(data.problems || []);
                if (isLoggedIn) {
                    try {
                        const prog = await requestJson(`${API_URL}/dsa/progress`, { headers: authHeaders() });
                        setSolved(prog.solved || []);
                        setRevision(prog.revision || []);
                    } catch {
                        /* progress is non-critical for viewing the roadmap */
                    }
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, [isLoggedIn]);

    // Group problems by topic, preserving roadmap order.
    const topics = useMemo(() => {
        const map = new Map();
        for (const p of problems) {
            if (!map.has(p.topic)) map.set(p.topic, []);
            map.get(p.topic).push(p);
        }
        return Array.from(map, ([topic, items]) => ({ topic, items }));
    }, [problems]);

    // Overall + per-difficulty progress
    const stats = useMemo(() => {
        const solvedSet = new Set(solved);
        const acc = {
            total: problems.length,
            solved: 0,
            byDiff: { Easy: { t: 0, s: 0 }, Medium: { t: 0, s: 0 }, Hard: { t: 0, s: 0 } },
        };
        for (const p of problems) {
            const isSolved = solvedSet.has(p._id);
            if (isSolved) acc.solved++;
            const d = acc.byDiff[p.difficulty];
            if (d) { d.t++; if (isSolved) d.s++; }
        }
        return acc;
    }, [problems, solved]);

    const matchesFilters = (p) => {
        if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
        if (diffFilter !== "All" && p.difficulty !== diffFilter) return false;
        if (statusFilter === "Solved" && !solved.includes(p._id)) return false;
        if (statusFilter === "Unsolved" && solved.includes(p._id)) return false;
        if (statusFilter === "Revision" && !revision.includes(p._id)) return false;
        return true;
    };

    const toggleCollapse = (topic) => {
        setCollapsed((prev) => {
            const next = new Set(prev);
            next.has(topic) ? next.delete(topic) : next.add(topic);
            return next;
        });
    };

    const requireLogin = () => {
        navigate("/login", { state: { from: "/dsa" } });
    };

    const toggleSolved = async (p) => {
        if (!isLoggedIn) return requireLogin();
        if (busyId) return;
        setBusyId(p._id);
        const isSolved = solved.includes(p._id);
        // optimistic
        setSolved((prev) => (isSolved ? prev.filter((id) => id !== p._id) : [...prev, p._id]));
        try {
            const url = `${API_URL}/${isSolved ? "remove-completed-questions" : "update-completed-questions"}`;
            const updated = await requestJson(url, {
                method: "POST",
                headers: authHeaders(),
                body: JSON.stringify({ questionId: p._id }),
            });
            if (Array.isArray(updated)) setSolved(updated);
        } catch (err) {
            // rollback
            setSolved((prev) => (isSolved ? [...prev, p._id] : prev.filter((id) => id !== p._id)));
            setError(err.message);
        } finally {
            setBusyId(null);
        }
    };

    const toggleRevision = async (p) => {
        if (!isLoggedIn) return requireLogin();
        const isRev = revision.includes(p._id);
        setRevision((prev) => (isRev ? prev.filter((id) => id !== p._id) : [...prev, p._id])); // optimistic
        try {
            const updated = await requestJson(`${API_URL}/toggle-revision`, {
                method: "POST",
                headers: authHeaders(),
                body: JSON.stringify({ questionId: p._id }),
            });
            if (Array.isArray(updated)) setRevision(updated);
        } catch (err) {
            setRevision((prev) => (isRev ? [...prev, p._id] : prev.filter((id) => id !== p._id)));
            setError(err.message);
        }
    };

    const FilterChip = ({ active, onClick, children }) => (
        <button
            onClick={onClick}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${active
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-muted-foreground border-border hover:text-foreground"}`}
        >
            {children}
        </button>
    );

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <Nav />
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col font-sans">
            <Nav />
            <div className="flex-1 pt-24 pb-16 px-4">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
                            DSA <span className="text-primary">Roadmap</span>
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            A structured, topic-by-topic path — {stats.total} hand-picked problems from fundamentals to advanced. Solve in order and check them off.
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">{error}</div>
                    )}

                    {/* Overall progress */}
                    <div className="mb-6 p-5 rounded-2xl bg-card border border-border shadow-card">
                        <div className="flex items-center justify-between mb-3">
                            <span className="font-semibold text-foreground">Your Progress</span>
                            <span className="text-sm font-bold text-primary">
                                {stats.solved} / {stats.total} solved ({stats.total ? Math.round((stats.solved / stats.total) * 100) : 0}%)
                            </span>
                        </div>
                        <ProgressBar value={stats.solved} total={stats.total} />
                        <div className="grid grid-cols-3 gap-3 mt-4">
                            {["Easy", "Medium", "Hard"].map((d) => (
                                <div key={d} className="text-center p-2 rounded-lg bg-secondary/50">
                                    <div className={`text-xs font-semibold ${d === "Easy" ? "text-emerald-600" : d === "Medium" ? "text-amber-600" : "text-red-600"}`}>{d}</div>
                                    <div className="text-sm font-bold text-foreground">{stats.byDiff[d].s} / {stats.byDiff[d].t}</div>
                                </div>
                            ))}
                        </div>
                        {!isLoggedIn && (
                            <p className="mt-4 text-xs text-muted-foreground">
                                <button onClick={requireLogin} className="text-primary font-semibold hover:underline">Log in</button> to track your progress and mark problems for revision.
                            </p>
                        )}
                    </div>

                    {/* Toolbar */}
                    <div className="mb-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                        <div className="relative flex-1 max-w-xs">
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-3.5 h-3.5" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search problems..."
                                className="w-full h-9 pl-9 pr-3 rounded-lg border border-input bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {["All", "Easy", "Medium", "Hard"].map((d) => (
                                <FilterChip key={d} active={diffFilter === d} onClick={() => setDiffFilter(d)}>{d}</FilterChip>
                            ))}
                            <span className="w-px bg-border mx-1" />
                            {["All", "Unsolved", "Solved", "Revision"].map((s) => (
                                <FilterChip key={s} active={statusFilter === s} onClick={() => setStatusFilter(s)}>{s}</FilterChip>
                            ))}
                        </div>
                    </div>

                    {/* Topic sections */}
                    <div className="space-y-4">
                        {topics.map(({ topic, items }) => {
                            const visible = items.filter(matchesFilters);
                            if (visible.length === 0) return null;
                            const topicSolved = items.filter((p) => solved.includes(p._id)).length;
                            const isCollapsed = collapsed.has(topic);
                            return (
                                <div key={topic} className="rounded-2xl bg-card border border-border shadow-card overflow-hidden">
                                    {/* Topic header */}
                                    <button
                                        onClick={() => toggleCollapse(topic)}
                                        className="w-full flex items-center justify-between gap-4 p-4 hover:bg-secondary/40 transition-colors text-left"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <FaChevronDown className={`w-3.5 h-3.5 text-muted-foreground flex-shrink-0 transition-transform ${isCollapsed ? "-rotate-90" : ""}`} />
                                            <span className="font-semibold text-foreground truncate">{topic}</span>
                                        </div>
                                        <div className="flex items-center gap-3 flex-shrink-0">
                                            <span className="text-xs text-muted-foreground w-16 text-right">{topicSolved}/{items.length}</span>
                                            <div className="w-24 hidden sm:block"><ProgressBar value={topicSolved} total={items.length} /></div>
                                        </div>
                                    </button>

                                    {/* Rows */}
                                    {!isCollapsed && (
                                        <div className="divide-y divide-border">
                                            {visible.map((p) => {
                                                const isSolved = solved.includes(p._id);
                                                const isRev = revision.includes(p._id);
                                                return (
                                                    <div key={p._id} className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/30 transition-colors">
                                                        {/* Check-off */}
                                                        <button
                                                            onClick={() => toggleSolved(p)}
                                                            disabled={busyId === p._id}
                                                            aria-label={isSolved ? "Mark unsolved" : "Mark solved"}
                                                            className={`w-5 h-5 flex-shrink-0 rounded-md border flex items-center justify-center transition-all ${isSolved
                                                                ? "bg-primary border-primary text-primary-foreground"
                                                                : "border-border hover:border-primary"}`}
                                                        >
                                                            {isSolved && <FaCheck className="w-3 h-3" />}
                                                        </button>

                                                        {/* Name */}
                                                        <a
                                                            href={p.link}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className={`flex-1 min-w-0 text-sm font-medium truncate hover:text-primary transition-colors ${isSolved ? "text-muted-foreground line-through" : "text-foreground"}`}
                                                        >
                                                            {p.name}
                                                        </a>

                                                        <DifficultyTag difficulty={p.difficulty} />

                                                        {/* Solve link */}
                                                        <a
                                                            href={p.link}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            title="Open on LeetCode"
                                                            className="text-muted-foreground hover:text-primary transition-colors p-1"
                                                        >
                                                            <FaExternalLinkAlt className="w-3.5 h-3.5" />
                                                        </a>

                                                        {/* Revision star */}
                                                        <button
                                                            onClick={() => toggleRevision(p)}
                                                            aria-label={isRev ? "Remove from revision" : "Mark for revision"}
                                                            title={isRev ? "Remove from revision" : "Mark for revision"}
                                                            className={`p-1 transition-colors ${isRev ? "text-amber-500" : "text-muted-foreground hover:text-amber-500"}`}
                                                        >
                                                            {isRev ? <FaStar className="w-3.5 h-3.5" /> : <FaRegStar className="w-3.5 h-3.5" />}
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default DSARoadmap;
