import React, { useState } from "react";
import Nav from "../Nav";
import { Link, useParams, useNavigate } from "react-router-dom";
import { FaExclamationCircle, FaCheckCircle } from "react-icons/fa";
import { API_URL, requestJson } from "../../config/api";
import PasswordInput from "../PasswordInput";

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [pwResetSignal, setPwResetSignal] = useState(0);

    // Live password rule hints
    const rules = [
        { ok: password.length >= 8, label: "At least 8 characters" },
        { ok: /[a-zA-Z]/.test(password) && /[0-9]/.test(password), label: "Contains a letter and a number" },
        { ok: password.length > 0 && password === confirmPassword, label: "Passwords match" },
    ];
    const allValid = rules.every(r => r.ok);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!allValid || isLoading) return;

        setIsLoading(true);
        setError(null);

        try {
            await requestJson(`${API_URL}/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password }),
            });

            setPwResetSignal((s) => s + 1); // hide fields on success
            setSuccess(true);
            // Send the user to login after a short pause
            setTimeout(() => navigate("/login"), 2500);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Nav />
            <div className="flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-card border border-border/50 rounded-xl shadow-2xl p-8 animate-in fade-in zoom-in duration-500">
                    {!success ? (
                        <>
                            <div className="text-center mb-8">
                                <div className="text-5xl mb-4">🔐</div>
                                <h1 className="text-3xl font-bold text-foreground">Set New Password</h1>
                                <p className="text-muted-foreground mt-2">
                                    Choose a strong new password for your account.
                                </p>
                            </div>

                            {error && (
                                <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-3 text-destructive text-sm">
                                    <FaExclamationCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <div>{error}</div>
                                        {/expired|invalid/i.test(error) && (
                                            <Link to="/forgot-password" className="underline font-medium mt-1 inline-block">
                                                Request a new reset link →
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground ml-1">New Password</label>
                                    <PasswordInput
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        autoComplete="new-password"
                                        resetSignal={pwResetSignal}
                                        autoFocus
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground ml-1">Confirm Password</label>
                                    <PasswordInput
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        autoComplete="new-password"
                                        resetSignal={pwResetSignal}
                                    />
                                </div>

                                {/* Live rule checklist */}
                                <ul className="space-y-1.5">
                                    {rules.map((rule, i) => (
                                        <li key={i} className={`flex items-center gap-2 text-xs transition-colors ${rule.ok ? "text-green-400" : "text-muted-foreground"}`}>
                                            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] border ${rule.ok ? "bg-green-500/20 border-green-500/40" : "border-border"}`}>
                                                {rule.ok ? "✓" : ""}
                                            </span>
                                            {rule.label}
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    type="submit"
                                    disabled={!allValid || isLoading}
                                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full shadow-lg shadow-primary/20"
                                >
                                    {isLoading ? "Resetting..." : "Reset Password"}
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="text-center animate-in fade-in zoom-in duration-500">
                            <FaCheckCircle className="w-14 h-14 text-green-400 mx-auto mb-4" />
                            <h1 className="text-2xl font-bold text-foreground mb-2">Password Reset! 🎉</h1>
                            <p className="text-muted-foreground text-sm mb-6">
                                Your password has been changed successfully. Redirecting you to login...
                            </p>
                            <Link
                                to="/login"
                                className="inline-flex items-center justify-center px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors"
                            >
                                Log in now
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
