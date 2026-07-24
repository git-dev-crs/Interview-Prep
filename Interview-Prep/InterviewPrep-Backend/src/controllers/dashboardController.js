import InterviewSession from "../models/InterviewSession.js";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GET /api/dashboard/stats
// Returns aggregate stats for the logged-in user
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const getDashboardStats = async (req, res) => {
    try {
        // SECURITY: identity always comes from the verified JWT, never a query param
        const email = req.userEmail;

        const sessions = await InterviewSession.find({
            userEmail: email,
            status: "completed",
        }).sort({ completedAt: -1 });

        if (sessions.length === 0) {
            return res.status(200).json({
                totalInterviews: 0,
                avgScore: 0,
                bestScore: 0,
                totalTimeSpent: 0,
                recentSessions: [],
                topicBreakdown: {},
            });
        }

        const scores = sessions.map(s => s.overallScore.overall);
        const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
        const bestScore = Math.max(...scores);

        // Calculate total time spent (sum of all question timeSpent values)
        const totalTimeSpent = sessions.reduce((total, session) => {
            return total + session.questions.reduce((qTotal, q) => qTotal + (q.timeSpent || 0), 0);
        }, 0);

        // Topic/role breakdown
        const topicBreakdown = {};
        sessions.forEach(s => {
            const key = s.role;
            if (!topicBreakdown[key]) {
                topicBreakdown[key] = { count: 0, totalScore: 0 };
            }
            topicBreakdown[key].count++;
            topicBreakdown[key].totalScore += s.overallScore.overall;
        });
        Object.keys(topicBreakdown).forEach(key => {
            topicBreakdown[key].avgScore = (topicBreakdown[key].totalScore / topicBreakdown[key].count).toFixed(1);
        });

        // Recent sessions (last 10) for the history list
        const recentSessions = sessions.slice(0, 10).map(s => ({
            _id: s._id,
            role: s.role,
            experience: s.experience,
            interviewType: s.interviewType,
            overallScore: s.overallScore.overall,
            totalQuestions: s.totalQuestions,
            completedAt: s.completedAt,
        }));

        // Score trend (last 10 sessions in chronological order)
        const scoreTrend = sessions.slice(0, 10).reverse().map(s => ({
            date: s.completedAt,
            score: s.overallScore.overall,
            role: s.role,
        }));

        // Skill averages across all sessions — powers the radar chart
        const skillTotals = { technicalAccuracy: 0, communication: 0, depth: 0 };
        sessions.forEach(s => {
            skillTotals.technicalAccuracy += s.overallScore.technicalAccuracy || 0;
            skillTotals.communication += s.overallScore.communication || 0;
            skillTotals.depth += s.overallScore.depth || 0;
        });
        const skillAverages = {
            technicalAccuracy: Number((skillTotals.technicalAccuracy / sessions.length).toFixed(1)),
            communication: Number((skillTotals.communication / sessions.length).toFixed(1)),
            depth: Number((skillTotals.depth / sessions.length).toFixed(1)),
        };

        // Interview-type breakdown (Technical / HR / Mixed) — count + avg score
        const typeBreakdown = {};
        sessions.forEach(s => {
            const key = s.interviewType || "Other";
            if (!typeBreakdown[key]) {
                typeBreakdown[key] = { count: 0, totalScore: 0 };
            }
            typeBreakdown[key].count++;
            typeBreakdown[key].totalScore += s.overallScore.overall || 0;
        });
        Object.keys(typeBreakdown).forEach(key => {
            typeBreakdown[key].avgScore = Number((typeBreakdown[key].totalScore / typeBreakdown[key].count).toFixed(1));
        });

        return res.status(200).json({
            totalInterviews: sessions.length,
            avgScore: Number(avgScore.toFixed(1)),
            bestScore,
            totalTimeSpent,
            recentSessions,
            scoreTrend,
            topicBreakdown,
            skillAverages,
            typeBreakdown,
        });
    } catch (error) {
        console.error("Dashboard Stats Error:", error.message || error);
        return res.status(500).json({ error: "Failed to fetch dashboard stats." });
    }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GET /api/dashboard/session/:id
// Returns detailed data for a single interview session
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const getSessionDetail = async (req, res) => {
    try {
        const { id } = req.params;

        const session = await InterviewSession.findById(id);
        if (!session) {
            return res.status(404).json({ error: "Session not found." });
        }
        // SECURITY: only the owner of the session can view its details
        if (session.userEmail !== req.userEmail) {
            return res.status(403).json({ error: "You are not authorized to view this session." });
        }

        return res.status(200).json({ session });
    } catch (error) {
        console.error("Session Detail Error:", error.message || error);
        return res.status(500).json({ error: "Failed to fetch session details." });
    }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DELETE /api/dashboard/session/:id
// Permanently deletes a single interview session (owner only)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const deleteSession = async (req, res) => {
    try {
        const { id } = req.params;

        const session = await InterviewSession.findById(id);
        if (!session) {
            return res.status(404).json({ error: "Session not found." });
        }
        // SECURITY: only the owner of the session can delete it
        if (session.userEmail !== req.userEmail) {
            return res.status(403).json({ error: "You are not authorized to delete this session." });
        }

        await session.deleteOne();

        return res.status(200).json({ message: "Session deleted successfully.", id });
    } catch (error) {
        console.error("Delete Session Error:", error.message || error);
        return res.status(500).json({ error: "Failed to delete session." });
    }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DELETE /api/dashboard/sessions
// Deletes ALL of the logged-in user's interview sessions (clear history)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const deleteAllSessions = async (req, res) => {
    try {
        // SECURITY: scoped to the authenticated user only — never touches others' data
        const result = await InterviewSession.deleteMany({ userEmail: req.userEmail });

        return res.status(200).json({
            message: "Interview history cleared successfully.",
            deletedCount: result.deletedCount || 0,
        });
    } catch (error) {
        console.error("Clear History Error:", error.message || error);
        return res.status(500).json({ error: "Failed to clear interview history." });
    }
};
