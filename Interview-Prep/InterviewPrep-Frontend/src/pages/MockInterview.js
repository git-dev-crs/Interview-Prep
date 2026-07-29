import React, { useState, useRef, useEffect, useCallback } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import Nav from "../components/Nav";
import InterviewTimer from "../components/MockInterview/InterviewTimer";
import ScoreCard from "../components/MockInterview/ScoreCard";
import { FaPaperPlane, FaStopCircle, FaArrowRight, FaUserTie, FaClock, FaLayerGroup, FaMicrophone, FaMicrophoneSlash, FaVolumeUp, FaVolumeMute, FaRedo, FaDownload } from "react-icons/fa";
import { API_URL, authHeaders, requestJson } from "../config/api";
import { downloadInterviewReport } from "../utils/generateReport";
import useSpeech from "../hooks/useSpeech";

const MockInterview = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const state = location.state;

    // If no session state, redirect to setup
    useEffect(() => {
        if (!state?.sessionId) {
            navigate("/mock-interview/setup");
        }
    }, [state, navigate]);

    const [sessionId] = useState(state?.sessionId || null);
    const [currentQuestion, setCurrentQuestion] = useState(state?.question || "");
    const [questionNumber, setQuestionNumber] = useState(state?.questionNumber || 1);
    const [totalQuestions] = useState(state?.totalQuestions || 8);
    const [answer, setAnswer] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isEnding, setIsEnding] = useState(false);
    const [previousScore, setPreviousScore] = useState(null);
    const [showScore, setShowScore] = useState(false);
    const [pendingFinish, setPendingFinish] = useState(false); // last answer evaluated, report next
    const [interviewCompleted, setInterviewCompleted] = useState(false);
    const [finalReport, setFinalReport] = useState(null);
    const [error, setError] = useState(null);

    // Voice input (Web Speech API — Chrome/Edge; gracefully hidden elsewhere)
    const [isListening, setIsListening] = useState(false);
    const [interimText, setInterimText] = useState(""); // live, not-yet-final dictation
    const recognitionRef = useRef(null);
    const speechSupported = typeof window !== "undefined" &&
        (window.SpeechRecognition || window.webkitSpeechRecognition);

    // Voice output — AI reads the question aloud (toggleable, persisted)
    const { supported: ttsSupported, enabled: voiceEnabled, toggleEnabled: toggleVoice, speaking, speak, cancel: cancelSpeech } = useSpeech();

    // Timer state
    const [questionStartTime, setQuestionStartTime] = useState(Date.now());
    const totalDurationSeconds = (state?.duration || 30) * 60;
    const perQuestionSeconds = Math.min(totalDurationSeconds / 6, 300); // ~5 min max per question

    const answerRef = useRef(null);

    // Focus textarea when new question arrives
    useEffect(() => {
        if (answerRef.current && !showScore) {
            answerRef.current.focus();
        }
    }, [currentQuestion, showScore]);

    // AI reads each new question aloud (when voice is enabled and a question is on screen)
    useEffect(() => {
        if (currentQuestion && !showScore && !interviewCompleted) {
            speak(currentQuestion);
        }
    }, [currentQuestion, showScore, interviewCompleted, speak]);

    // Calculate time spent on current question
    const getTimeSpent = useCallback(() => {
        return Math.floor((Date.now() - questionStartTime) / 1000);
    }, [questionStartTime]);

    // ─── Voice input: toggle speech-to-text dictation ───
    const toggleListening = () => {
        if (!speechSupported) return;

        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
            setInterimText("");
            return;
        }

        // Don't let the AI keep reading the question while the candidate is answering.
        cancelSpeech();

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true; // live feedback as the user speaks
        recognition.lang = "en-IN";

        recognition.onresult = (event) => {
            let finalTranscript = "";
            let interim = "";
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const chunk = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += chunk + " ";
                } else {
                    interim += chunk;
                }
            }
            if (finalTranscript) {
                setAnswer(prev => (prev ? prev.trimEnd() + " " : "") + finalTranscript.trim());
            }
            setInterimText(interim);
        };
        recognition.onerror = () => { setIsListening(false); setInterimText(""); };
        recognition.onend = () => { setIsListening(false); setInterimText(""); };

        recognitionRef.current = recognition;
        recognition.start();
        setIsListening(true);
    };

    // Stop dictation when the component unmounts
    useEffect(() => {
        return () => recognitionRef.current?.stop();
    }, []);

    // Handle submitting answer and getting next question
    const handleSubmitAnswer = async () => {
        if (!answer.trim() || isSubmitting) return;
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        }
        setIsSubmitting(true);
        setError(null);

        try {
            const data = await requestJson(`${API_URL}/api/mock-interview/next`, {
                method: "POST",
                headers: authHeaders(),
                body: JSON.stringify({
                    sessionId,
                    answer: answer.trim(),
                    timeSpent: getTimeSpent(),
                }),
            });

            // Show score for previous answer
            if (data.previousEvaluation) {
                setPreviousScore(data.previousEvaluation);
                setShowScore(true);
            }

            if (data.finished) {
                // That was the last question — next step is the final report
                setPendingFinish(true);
                setAnswer("");
            } else {
                // Prepare next question (shown after user clicks "Next")
                setCurrentQuestion(data.question);
                setQuestionNumber(data.questionNumber);
                setAnswer("");
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Move to next question after viewing score (or fetch final report if finished)
    const handleNextQuestion = () => {
        if (pendingFinish) {
            handleEndInterview();
            return;
        }
        setShowScore(false);
        setPreviousScore(null);
        setQuestionStartTime(Date.now());
    };

    // End the interview
    const handleEndInterview = async () => {
        setIsEnding(true);
        setError(null);
        cancelSpeech();

        try {
            const data = await requestJson(`${API_URL}/api/mock-interview/end`, {
                method: "POST",
                headers: authHeaders(),
                body: JSON.stringify({
                    sessionId,
                    answer: answer.trim() || undefined,
                    timeSpent: getTimeSpent(),
                }),
            });

            setFinalReport(data.session);
            setInterviewCompleted(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsEnding(false);
        }
    };

    // Auto-submit when per-question timer runs out
    const handleQuestionTimeUp = useCallback(() => {
        if (answer.trim()) {
            handleSubmitAnswer();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [answer]);

    if (!state?.sessionId) return null;

    // ─── Final Report View ───
    if (interviewCompleted && finalReport) {
        return (
            <>
                <Nav />
                <div className="min-h-screen bg-background pt-24 pb-12 px-4">
                    <div className="max-w-3xl mx-auto">
                        {/* Congratulations Header */}
                        <div className="text-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="text-6xl mb-4">🎉</div>
                            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Interview Complete!</h1>
                            <p className="text-muted-foreground">
                                {finalReport.role} • {finalReport.experience} • {finalReport.interviewType} Mode
                            </p>
                        </div>

                        {/* Overall Score Card */}
                        <div className="mb-8">
                            <ScoreCard
                                scores={finalReport.overallScore}
                                feedback={null}
                            />
                        </div>

                        {/* Strengths & Weaknesses */}
                        <div className="grid md:grid-cols-2 gap-6 mb-8">
                            <div className="p-6 rounded-2xl bg-green-500/10 border border-green-500/20">
                                <h3 className="text-lg font-bold text-green-400 mb-3">💪 Strengths</h3>
                                <ul className="space-y-2">
                                    {finalReport.strengths?.map((s, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                                            <span className="text-green-400 mt-0.5">✓</span> {s}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="p-6 rounded-2xl bg-yellow-500/10 border border-yellow-500/20">
                                <h3 className="text-lg font-bold text-yellow-400 mb-3">🔧 Areas to Improve</h3>
                                <ul className="space-y-2">
                                    {finalReport.weaknesses?.map((w, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                                            <span className="text-yellow-400 mt-0.5">•</span> {w}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Recommendations */}
                        {finalReport.recommendations?.length > 0 && (
                            <div className="p-6 rounded-2xl bg-primary/10 border border-primary/20 mb-8">
                                <h3 className="text-lg font-bold text-primary mb-3">📋 Recommendations</h3>
                                <ul className="space-y-2">
                                    {finalReport.recommendations.map((r, i) => (
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
                                {finalReport.questions?.filter(q => q.answer).map((q, i) => (
                                    <div key={i} className="p-5 rounded-xl bg-card border border-border/50">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-sm font-semibold text-primary">Question {i + 1}</span>
                                            <span className={`text-sm font-bold ${q.scores.overall >= 7 ? "text-green-400" : q.scores.overall >= 4 ? "text-yellow-400" : "text-red-400"}`}>
                                                {q.scores.overall}/10
                                            </span>
                                        </div>
                                        <p className="text-sm font-medium text-foreground mb-2">{q.question}</p>
                                        <p className="text-sm text-muted-foreground bg-secondary/20 p-3 rounded-lg mb-2">{q.answer}</p>
                                        {q.feedback && (
                                            <p className="text-xs text-muted-foreground italic border-l-2 border-primary/30 pl-3">
                                                💡 {q.feedback}
                                            </p>
                                        )}
                                        {q.idealAnswer && (
                                            <details className="mt-2">
                                                <summary className="text-xs font-semibold text-primary cursor-pointer select-none hover:underline">
                                                    ✨ See a 10/10 model answer
                                                </summary>
                                                <p className="mt-1 text-xs text-muted-foreground bg-secondary/20 p-3 rounded-lg border-l-2 border-green-500/50 leading-relaxed">
                                                    {q.idealAnswer}
                                                </p>
                                            </details>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                to="/mock-interview/setup"
                                className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-orange-600 text-primary-foreground font-semibold shadow-lg hover:scale-[1.02] transition-all"
                            >
                                Start New Interview <FaArrowRight className="ml-2" />
                            </Link>
                            <button
                                onClick={() => downloadInterviewReport(finalReport)}
                                className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-primary/10 text-primary border border-primary/20 font-semibold hover:bg-primary/20 transition-all"
                            >
                                <FaDownload className="mr-2" /> Download PDF Report
                            </button>
                            <Link
                                to="/dashboard"
                                className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-secondary text-secondary-foreground font-semibold hover:bg-secondary/80 transition-all"
                            >
                                View Dashboard
                            </Link>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    // ─── Active Interview View ───
    return (
        <>
            <Nav />
            <div className="min-h-screen bg-background pt-24 pb-12 px-4">
                <div className="max-w-3xl mx-auto">
                    {/* Interview Header */}
                    <div className="flex flex-col md:flex-row items-center justify-between mb-8 p-4 rounded-xl bg-card border border-border/50">
                        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mb-4 md:mb-0">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <FaUserTie className="text-primary" />
                                <span className="font-medium">{state?.role}</span>
                            </div>
                            <div className="w-px h-4 bg-border" />
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <FaLayerGroup className="text-primary" />
                                <span>{state?.interviewType}</span>
                            </div>
                            <div className="w-px h-4 bg-border" />
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <FaClock className="text-primary" />
                                <span>{state?.experience}</span>
                            </div>
                            {state?.difficulty && (
                                <>
                                    <div className="w-px h-4 bg-border" />
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${state.difficulty === "Hard"
                                        ? "bg-red-500/10 text-red-400"
                                        : state.difficulty === "Easy"
                                            ? "bg-green-500/10 text-green-400"
                                            : "bg-yellow-500/10 text-yellow-400"
                                        }`}>
                                        {state.difficulty}
                                    </span>
                                </>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {ttsSupported && (
                                <>
                                    <button
                                        type="button"
                                        onClick={toggleVoice}
                                        title={voiceEnabled ? "Mute AI voice" : "Let the AI read questions aloud"}
                                        aria-pressed={voiceEnabled}
                                        className={`inline-flex items-center justify-center w-9 h-9 rounded-lg border transition-all ${voiceEnabled
                                            ? "bg-primary/10 text-primary border-primary/30"
                                            : "bg-secondary/30 text-muted-foreground border-border/50 hover:text-primary"
                                            } ${speaking ? "animate-pulse" : ""}`}
                                    >
                                        {voiceEnabled ? <FaVolumeUp /> : <FaVolumeMute />}
                                    </button>
                                    {voiceEnabled && !showScore && (
                                        <button
                                            type="button"
                                            onClick={() => speak(currentQuestion)}
                                            title="Replay the question"
                                            className="inline-flex items-center justify-center w-9 h-9 rounded-lg border bg-secondary/30 text-muted-foreground border-border/50 hover:text-primary transition-all"
                                        >
                                            <FaRedo className={speaking ? "animate-spin" : ""} />
                                        </button>
                                    )}
                                </>
                            )}
                            <InterviewTimer
                                totalSeconds={perQuestionSeconds}
                                onTimeUp={handleQuestionTimeUp}
                                warningThreshold={60}
                                key={questionNumber} // Reset timer on new question
                            />
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-8">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                            <span className="font-medium">Question {questionNumber} of {totalQuestions}</span>
                            <span>{Math.round((questionNumber / totalQuestions) * 100)}% complete</span>
                        </div>
                        <div className="h-2 rounded-full bg-secondary/50 overflow-hidden">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-primary to-orange-500 transition-all duration-700 ease-out"
                                style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
                            />
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                            {error}
                        </div>
                    )}

                    {/* Score from previous answer */}
                    {showScore && previousScore && (
                        <div className="mb-6">
                            <ScoreCard
                                scores={previousScore.scores}
                                feedback={previousScore.feedback}
                                idealAnswer={previousScore.idealAnswer}
                                isCompact={true}
                            />
                            <div className="text-center mt-4">
                                <button
                                    onClick={handleNextQuestion}
                                    disabled={isEnding}
                                    className="inline-flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-orange-600 text-primary-foreground font-semibold shadow-lg hover:scale-[1.02] transition-all"
                                >
                                    {pendingFinish
                                        ? (isEnding ? "Generating Report..." : <>View Final Report <FaArrowRight className="ml-2" /></>)
                                        : <>Next Question <FaArrowRight className="ml-2" /></>}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Question & Answer Area */}
                    {!showScore && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Question Card */}
                            <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-lg mb-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                                        Q{questionNumber}
                                    </div>
                                    <span className="text-sm text-muted-foreground">Question {questionNumber}</span>
                                </div>
                                <p className="text-lg font-medium text-foreground leading-relaxed">
                                    {currentQuestion}
                                </p>
                            </div>

                            {/* Answer Input */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-medium text-foreground">Your Answer</label>
                                    {speechSupported && (
                                        <button
                                            type="button"
                                            onClick={toggleListening}
                                            disabled={isSubmitting}
                                            title={isListening ? "Stop dictation" : "Answer with your voice"}
                                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${isListening
                                                ? "bg-red-500/10 text-red-400 border-red-500/30 animate-pulse"
                                                : "bg-secondary/30 text-muted-foreground border-border/50 hover:text-primary hover:border-primary/50"
                                                }`}
                                        >
                                            {isListening
                                                ? <><FaMicrophoneSlash /> Stop Recording</>
                                                : <><FaMicrophone /> Speak Answer</>}
                                        </button>
                                    )}
                                </div>
                                <textarea
                                    ref={answerRef}
                                    value={answer}
                                    onChange={(e) => setAnswer(e.target.value)}
                                    placeholder="Type your answer here... Be thorough and structured in your response."
                                    className="w-full min-h-[180px] p-4 rounded-xl border border-input bg-background/50 text-foreground text-sm leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ring-offset-background placeholder:text-muted-foreground transition-all"
                                    disabled={isSubmitting}
                                />
                                {isListening && (
                                    <div className="mt-2 flex items-start gap-2 text-sm text-primary/80 italic">
                                        <span className="mt-0.5 flex h-2 w-2 flex-shrink-0 rounded-full bg-red-500 animate-pulse" />
                                        <span>{interimText || "Listening… start speaking your answer"}</span>
                                    </div>
                                )}
                                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                                    <span>💡 Tip: Structure your answer with key points for better scores</span>
                                    <span>{answer.length} chars</span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    onClick={handleSubmitAnswer}
                                    disabled={!answer.trim() || isSubmitting}
                                    className={`flex-1 inline-flex items-center justify-center px-6 py-3.5 rounded-xl text-base font-semibold transition-all duration-300 ${answer.trim() && !isSubmitting
                                        ? "bg-gradient-to-r from-primary to-orange-600 text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.01]"
                                        : "bg-muted text-muted-foreground cursor-not-allowed"
                                        }`}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Evaluating...
                                        </>
                                    ) : (
                                        <>
                                            <FaPaperPlane className="mr-2" /> Submit & Next
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={handleEndInterview}
                                    disabled={isEnding || isSubmitting}
                                    className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 font-semibold hover:bg-destructive/20 transition-all"
                                >
                                    {isEnding ? "Ending..." : <><FaStopCircle className="mr-2" /> End Interview</>}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default MockInterview;
