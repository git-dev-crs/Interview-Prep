import React, { useState, useEffect, useRef } from "react";

const InterviewTimer = ({ totalSeconds, onTimeUp, warningThreshold = 60 }) => {
    const [timeLeft, setTimeLeft] = useState(totalSeconds);
    const intervalRef = useRef(null);

    useEffect(() => {
        setTimeLeft(totalSeconds);
    }, [totalSeconds]);

    useEffect(() => {
        intervalRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(intervalRef.current);
                    if (onTimeUp) onTimeUp();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(intervalRef.current);
    }, [totalSeconds, onTimeUp]);

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const progress = timeLeft / totalSeconds;

    // Visual state
    let colorClass = "text-green-400";
    let ringColor = "#4ade80";
    let bgGlow = "";

    if (timeLeft <= warningThreshold / 3) {
        colorClass = "text-red-400";
        ringColor = "#f87171";
        bgGlow = "animate-pulse";
    } else if (timeLeft <= warningThreshold) {
        colorClass = "text-yellow-400";
        ringColor = "#facc15";
    }

    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const dashOffset = circumference * (1 - progress);

    return (
        <div className={`flex flex-col items-center gap-2 ${bgGlow}`}>
            <div className="relative w-24 h-24">
                {/* Background ring */}
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                        cx="50" cy="50" r={radius}
                        fill="none"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="6"
                    />
                    {/* Progress ring */}
                    <circle
                        cx="50" cy="50" r={radius}
                        fill="none"
                        stroke={ringColor}
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={dashOffset}
                        style={{ transition: "stroke-dashoffset 1s linear, stroke 0.5s ease" }}
                    />
                </svg>
                {/* Time display */}
                <div className={`absolute inset-0 flex items-center justify-center font-mono text-lg font-bold ${colorClass}`}>
                    {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
                </div>
            </div>
            <span className={`text-xs font-medium ${colorClass}`}>
                {timeLeft <= warningThreshold / 3 ? "⚠️ Hurry!" : timeLeft <= warningThreshold ? "Time running low" : "Time remaining"}
            </span>
        </div>
    );
};

export default InterviewTimer;
