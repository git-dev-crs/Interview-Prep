import InterviewSession from "../models/InterviewSession.js";
import { generateContent } from "../utils/geminiClient.js";

// ─── Helper: Build the system prompt for the interview ───
const buildInterviewSystemPrompt = (role, experience, interviewType, difficulty = "Medium") => {
    const typeInstructions = {
        Technical: "Focus exclusively on technical questions: coding, system design, data structures, algorithms, and domain-specific knowledge.",
        HR: "Focus on behavioral questions: teamwork, leadership, conflict resolution, motivation, strengths/weaknesses, and situational judgment.",
        Mixed: "Alternate between technical and behavioral questions for a well-rounded interview simulation.",
    };

    const difficultyInstructions = {
        Easy: "Start with fundamentals and warm-up level questions. Keep questions approachable — definitions, basic concepts, simple scenarios.",
        Medium: "Ask standard interview-level questions comparable to mid-tier tech company screens.",
        Hard: "Ask challenging questions comparable to top-tier tech company onsites — deep tradeoffs, edge cases, system design at scale, tricky scenarios.",
    };

    return `You are a professional interview conductor for a ${role} position.
The candidate has ${experience} of experience.
Interview type: ${interviewType}.
Base difficulty level: ${difficulty}. ${difficultyInstructions[difficulty] || difficultyInstructions.Medium}

${typeInstructions[interviewType] || typeInstructions.Mixed}

Rules:
- Ask ONE question at a time.
- Make questions progressively harder based on the candidate's answers.
- If the candidate gives a great answer, ask a harder follow-up. If weak, stay at the same level or go slightly easier.
- Keep questions realistic and similar to what top tech companies ask.
- Be professional and encouraging.

IMPORTANT: Respond ONLY with the interview question. No preamble, no numbering, no "Question:" prefix. Just the question itself.`;
};

// ─── Helper: Build the evaluation prompt ───
const buildEvaluationPrompt = (role, experience, question, answer) => {
    return `You are an expert interview evaluator for a ${role} position (${experience} experience level).

Evaluate the following interview answer:

**Question:** ${question}
**Candidate's Answer:** ${answer}

Respond in STRICT JSON format only (no markdown, no code fences, no extra text):
{
    "scores": {
        "technicalAccuracy": <0-10>,
        "communication": <0-10>,
        "depth": <0-10>,
        "overall": <0-10>
    },
    "feedback": "<2-3 sentence constructive feedback>",
    "idealAnswer": "<a concise model answer (3-5 sentences) that would score 10/10 for this question>",
    "nextQuestionContext": "<brief note about what to ask next based on this answer>"
}`;
};

// ─── Helper: Build the final summary prompt ───
const buildSummaryPrompt = (role, experience, questions) => {
    const qaList = questions.map((q, i) =>
        `Q${i + 1}: ${q.question}\nA${i + 1}: ${q.answer}\nScore: ${q.scores.overall}/10`
    ).join("\n\n");

    return `You are an expert interview evaluator. Summarize this ${role} interview for a candidate with ${experience} experience.

Interview Q&A:
${qaList}

Respond in STRICT JSON format only (no markdown, no code fences, no extra text):
{
    "overallScore": {
        "technicalAccuracy": <0-10>,
        "communication": <0-10>,
        "depth": <0-10>,
        "overall": <0-10>
    },
    "strengths": ["<strength1>", "<strength2>", "<strength3>"],
    "weaknesses": ["<weakness1>", "<weakness2>"],
    "recommendations": ["<recommendation1>", "<recommendation2>", "<recommendation3>"]
}`;
};

// ─── Helper: Safely parse JSON from Gemini response ───
const safeParseJSON = (text) => {
    try {
        // Remove markdown code fences if present
        const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        return JSON.parse(cleaned);
    } catch (e) {
        console.error("Failed to parse Gemini JSON response:", text);
        return null;
    }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// POST /api/mock-interview/start
// Starts a new interview session and generates the first question
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const startInterview = async (req, res) => {
    try {
        const { role, experience, interviewType, duration, difficulty, questionCount } = req.body;
        // SECURITY: identity always comes from the verified JWT, never the request body
        const email = req.userEmail;

        if (!role || !experience || !interviewType) {
            return res.status(400).json({ error: "Missing required fields: role, experience, interviewType" });
        }

        // Validate optional settings
        const safeDifficulty = ["Easy", "Medium", "Hard"].includes(difficulty) ? difficulty : "Medium";
        const safeQuestionCount = Number.isInteger(questionCount) && questionCount >= 3 && questionCount <= 15
            ? questionCount
            : 8;

        // Generate the first question (resilient client picks a working model)
        const { text: firstQuestionText } = await generateContent({
            systemInstruction: buildInterviewSystemPrompt(role, experience, interviewType, safeDifficulty),
            prompt: `Start the interview. Ask the first ${interviewType === "HR" ? "behavioral" : "technical"} question for a ${role} with ${experience} experience.`,
        });
        const firstQuestion = firstQuestionText.trim();

        // Create the session in DB
        const session = new InterviewSession({
            userEmail: email,
            role,
            experience,
            interviewType,
            difficulty: safeDifficulty,
            questionCount: safeQuestionCount,
            duration: duration || 30,
            questions: [{ question: firstQuestion }],
            status: "in-progress",
        });

        await session.save();

        return res.status(201).json({
            sessionId: session._id,
            questionNumber: 1,
            totalQuestions: safeQuestionCount,
            difficulty: safeDifficulty,
            question: firstQuestion,
            message: "Interview started successfully!",
        });
    } catch (error) {
        console.error("Start Interview Error:", error.message || error);
        return res.status(error.httpStatus || 500).json({
            error: error.userMessage || "Failed to start interview. Please try again.",
        });
    }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// POST /api/mock-interview/next
// Evaluates the current answer and generates the next question
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const nextQuestion = async (req, res) => {
    try {
        const { sessionId, answer, timeSpent } = req.body;

        if (!sessionId || !answer) {
            return res.status(400).json({ error: "Missing required fields: sessionId, answer" });
        }

        const session = await InterviewSession.findById(sessionId);
        if (!session) {
            return res.status(404).json({ error: "Interview session not found." });
        }
        // SECURITY: only the owner of the session can interact with it
        if (session.userEmail !== req.userEmail) {
            return res.status(403).json({ error: "You are not authorized to access this interview session." });
        }
        if (session.status === "completed") {
            return res.status(400).json({ error: "This interview session is already completed." });
        }

        const currentQIndex = session.questions.length - 1;
        const currentQuestion = session.questions[currentQIndex].question;

        // Step 1: Evaluate the answer
        const { text: evalText } = await generateContent({
            prompt: buildEvaluationPrompt(session.role, session.experience, currentQuestion, answer),
        });
        const evaluation = safeParseJSON(evalText);

        // Update the current question with the answer and scores
        session.questions[currentQIndex].answer = answer;
        session.questions[currentQIndex].timeSpent = timeSpent || 0;

        if (evaluation) {
            session.questions[currentQIndex].scores = evaluation.scores;
            session.questions[currentQIndex].feedback = evaluation.feedback;
            session.questions[currentQIndex].idealAnswer = evaluation.idealAnswer || "";
        }

        // If this was the final question, don't generate another — signal the frontend to end
        const targetCount = session.questionCount || 8;
        if (session.questions.length >= targetCount) {
            await session.save();
            return res.status(200).json({
                finished: true,
                questionNumber: session.questions.length,
                totalQuestions: targetCount,
                previousEvaluation: evaluation ? {
                    scores: evaluation.scores,
                    feedback: evaluation.feedback,
                    idealAnswer: evaluation.idealAnswer || "",
                } : null,
            });
        }

        // Step 2: Generate next question
        const context = session.questions.map((q, i) =>
            `Q${i + 1}: ${q.question}\nA${i + 1}: ${q.answer || "(not answered yet)"}`
        ).join("\n\n");

        const { text: nextText } = await generateContent({
            systemInstruction: buildInterviewSystemPrompt(session.role, session.experience, session.interviewType, session.difficulty),
            prompt: `Here is the interview so far:\n\n${context}\n\n${evaluation?.nextQuestionContext ? `Context for next question: ${evaluation.nextQuestionContext}\n\n` : ""}Ask the next interview question. Make it progressively appropriate based on the candidate's performance so far.`,
        });
        const nextQ = nextText.trim();

        // Add the new question
        session.questions.push({ question: nextQ });
        await session.save();

        return res.status(200).json({
            questionNumber: session.questions.length,
            totalQuestions: targetCount,
            question: nextQ,
            previousEvaluation: evaluation ? {
                scores: evaluation.scores,
                feedback: evaluation.feedback,
                idealAnswer: evaluation.idealAnswer || "",
            } : null,
        });
    } catch (error) {
        console.error("Next Question Error:", error.message || error);
        return res.status(error.httpStatus || 500).json({
            error: error.userMessage || "Failed to generate next question. Please try again.",
        });
    }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GET /api/mock-interview/active
// Returns the user's most recent in-progress session (for resume support)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const getActiveSession = async (req, res) => {
    try {
        const session = await InterviewSession.findOne({
            userEmail: req.userEmail,
            status: "in-progress",
        }).sort({ startedAt: -1 });

        if (!session) {
            return res.status(200).json({ active: false });
        }

        const lastQuestion = session.questions[session.questions.length - 1];
        return res.status(200).json({
            active: true,
            sessionId: session._id,
            role: session.role,
            experience: session.experience,
            interviewType: session.interviewType,
            difficulty: session.difficulty,
            duration: session.duration,
            questionNumber: session.questions.length,
            totalQuestions: session.questionCount || 8,
            question: lastQuestion?.question || "",
            startedAt: session.startedAt,
        });
    } catch (error) {
        console.error("Active Session Error:", error.message || error);
        return res.status(500).json({ error: "Failed to fetch active session." });
    }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// POST /api/mock-interview/end
// Ends the interview, evaluates the last answer, and generates final summary
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const endInterview = async (req, res) => {
    try {
        const { sessionId, answer, timeSpent } = req.body;

        if (!sessionId) {
            return res.status(400).json({ error: "Missing sessionId." });
        }

        const session = await InterviewSession.findById(sessionId);
        if (!session) {
            return res.status(404).json({ error: "Interview session not found." });
        }
        // SECURITY: only the owner of the session can end it
        if (session.userEmail !== req.userEmail) {
            return res.status(403).json({ error: "You are not authorized to access this interview session." });
        }

        // If there's a final answer to evaluate
        if (answer) {
            const currentQIndex = session.questions.length - 1;
            const currentQuestion = session.questions[currentQIndex].question;

            const { text: evalText } = await generateContent({
                prompt: buildEvaluationPrompt(session.role, session.experience, currentQuestion, answer),
            });
            const evaluation = safeParseJSON(evalText);

            session.questions[currentQIndex].answer = answer;
            session.questions[currentQIndex].timeSpent = timeSpent || 0;

            if (evaluation) {
                session.questions[currentQIndex].scores = evaluation.scores;
                session.questions[currentQIndex].feedback = evaluation.feedback;
                session.questions[currentQIndex].idealAnswer = evaluation.idealAnswer || "";
            }
        }

        // Generate final summary
        const answeredQuestions = session.questions.filter(q => q.answer && q.answer.trim() !== "");
        const { text: summaryText } = await generateContent({
            prompt: buildSummaryPrompt(session.role, session.experience, answeredQuestions),
        });
        const summary = safeParseJSON(summaryText);

        // Update session
        session.status = "completed";
        session.completedAt = new Date();
        session.totalQuestions = answeredQuestions.length;

        if (summary) {
            session.overallScore = summary.overallScore;
            session.strengths = summary.strengths;
            session.weaknesses = summary.weaknesses;
            session.recommendations = summary.recommendations;
        }

        await session.save();

        return res.status(200).json({
            message: "Interview completed successfully!",
            session: {
                _id: session._id,
                role: session.role,
                experience: session.experience,
                interviewType: session.interviewType,
                totalQuestions: session.totalQuestions,
                overallScore: session.overallScore,
                strengths: session.strengths,
                weaknesses: session.weaknesses,
                recommendations: session.recommendations,
                questions: session.questions,
                startedAt: session.startedAt,
                completedAt: session.completedAt,
            },
        });
    } catch (error) {
        console.error("End Interview Error:", error.message || error);
        return res.status(error.httpStatus || 500).json({
            error: error.userMessage || "Failed to end interview. Please try again.",
        });
    }
};
