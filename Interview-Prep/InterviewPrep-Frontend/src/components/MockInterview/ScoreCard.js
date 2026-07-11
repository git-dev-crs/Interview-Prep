import React from "react";

const ScoreBar = ({ label, score, color }) => (
    <div className="space-y-1.5">
        <div className="flex justify-between text-sm">
            <span className="text-muted-foreground font-medium">{label}</span>
            <span className={`font-bold ${color}`}>{score}/10</span>
        </div>
        <div className="h-2.5 rounded-full bg-secondary/50 overflow-hidden">
            <div
                className={`h-full rounded-full transition-all duration-1000 ease-out`}
                style={{
                    width: `${(score / 10) * 100}%`,
                    background: score >= 7
                        ? "linear-gradient(90deg, #22c55e, #4ade80)"
                        : score >= 4
                            ? "linear-gradient(90deg, #eab308, #facc15)"
                            : "linear-gradient(90deg, #ef4444, #f87171)",
                }}
            />
        </div>
    </div>
);

const getScoreColor = (score) => {
    if (score >= 7) return "text-green-400";
    if (score >= 4) return "text-yellow-400";
    return "text-red-400";
};

const getScoreEmoji = (score) => {
    if (score >= 9) return "🌟";
    if (score >= 7) return "✅";
    if (score >= 5) return "📝";
    if (score >= 3) return "⚠️";
    return "❌";
};

const ScoreCard = ({ scores, feedback, isCompact = false }) => {
    if (!scores) return null;

    if (isCompact) {
        return (
            <div className="mt-4 p-4 rounded-xl bg-secondary/30 border border-border/50 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-foreground">Answer Score</span>
                    <span className={`text-2xl font-bold ${getScoreColor(scores.overall)}`}>
                        {getScoreEmoji(scores.overall)} {scores.overall}/10
                    </span>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-3">
                    <div className="text-center p-2 rounded-lg bg-background/50">
                        <div className="text-xs text-muted-foreground">Technical</div>
                        <div className={`text-lg font-bold ${getScoreColor(scores.technicalAccuracy)}`}>{scores.technicalAccuracy}</div>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-background/50">
                        <div className="text-xs text-muted-foreground">Communication</div>
                        <div className={`text-lg font-bold ${getScoreColor(scores.communication)}`}>{scores.communication}</div>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-background/50">
                        <div className="text-xs text-muted-foreground">Depth</div>
                        <div className={`text-lg font-bold ${getScoreColor(scores.depth)}`}>{scores.depth}</div>
                    </div>
                </div>
                {feedback && (
                    <p className="text-sm text-muted-foreground bg-background/50 p-3 rounded-lg border-l-2 border-primary/50 italic">
                        💡 {feedback}
                    </p>
                )}
            </div>
        );
    }

    return (
        <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header with overall score */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-foreground">Performance Breakdown</h3>
                <div className="flex items-center gap-2">
                    <span className="text-3xl">{getScoreEmoji(scores.overall)}</span>
                    <div className="text-right">
                        <div className={`text-3xl font-bold ${getScoreColor(scores.overall)}`}>{scores.overall}</div>
                        <div className="text-xs text-muted-foreground">/10 overall</div>
                    </div>
                </div>
            </div>

            {/* Score bars */}
            <div className="space-y-4 mb-6">
                <ScoreBar label="Technical Accuracy" score={scores.technicalAccuracy} color={getScoreColor(scores.technicalAccuracy)} />
                <ScoreBar label="Communication" score={scores.communication} color={getScoreColor(scores.communication)} />
                <ScoreBar label="Depth & Detail" score={scores.depth} color={getScoreColor(scores.depth)} />
            </div>

            {/* Feedback */}
            {feedback && (
                <div className="p-4 rounded-xl bg-secondary/20 border border-border/50">
                    <div className="text-sm font-semibold text-foreground mb-1">💡 AI Feedback</div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feedback}</p>
                </div>
            )}
        </div>
    );
};

export default ScoreCard;
