import InterviewSession from "../models/InterviewSession.js";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GET /api/dashboard/stats?email=...
// Returns aggregate stats for the logged-in user
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const getDashboardStats = async (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({ error: "Email is required." });
        }

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

        return res.status(200).json({
            totalInterviews: sessions.length,
            avgScore: Number(avgScore.toFixed(1)),
            bestScore,
            totalTimeSpent,
            recentSessions,
            scoreTrend,
            topicBreakdown,
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

        return res.status(200).json({ session });
    } catch (error) {
        console.error("Session Detail Error:", error.message || error);
        return res.status(500).json({ error: "Failed to fetch session details." });
    }
};
