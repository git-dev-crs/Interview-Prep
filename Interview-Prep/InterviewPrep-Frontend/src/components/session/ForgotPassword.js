import React, { useState } from "react";
import Nav from "../Nav";
import { Link } from "react-router-dom";
import { FaEnvelope, FaExclamationCircle, FaPaperPlane, FaArrowLeft, FaCheckCircle, FaFlask } from "react-icons/fa";
import { API_URL, requestJson } from "../../config/api";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [devResetUrl, setDevResetUrl] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email.trim() || isLoading) return;

        setIsLoading(true);
        setError(null);

        try {
            const data = await requestJson(`${API_URL}/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.trim() }),
            });

            setSubmitted(true);
            // In development (no email server configured) the backend hands us
            // the reset link directly so the flow still works end-to-end.
            if (data.devResetUrl) setDevResetUrl(data.devResetUrl);
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
                    {!submitted ? (
                        <>
                            <div className="text-center mb-8">
                                <div className="text-5xl mb-4">🔑</div>
                                <h1 className="text-3xl font-bold text-foreground">Forgot Password?</h1>
                                <p className="text-muted-foreground mt-2">
                                    No worries — enter your email and we'll send you a link to reset it.
                                </p>
                            </div>

                            {error && (
                                <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-3 text-destructive text-sm">
                                    <FaExclamationCircle className="w-5 h-5 flex-shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground ml-1">Email</label>
                                    <div className="relative">
                                        <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                        <input
                                            type="email"
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                            placeholder="name@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={!email.trim() || isLoading}
                                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full shadow-lg shadow-primary/20"
                                >
                                    {isLoading ? "Sending..." : <><FaPaperPlane className="mr-2" /> Send Reset Link</>}
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="text-center animate-in fade-in zoom-in duration-500">
                            <FaCheckCircle className="w-14 h-14 text-green-400 mx-auto mb-4" />
                            <h1 className="text-2xl font-bold text-foreground mb-2">Check Your Email</h1>
                            <p className="text-muted-foreground text-sm mb-6">
                                If an account exists for <span className="text-foreground font-medium">{email}</span>,
                                we've sent a password reset link. It expires in <b>15 minutes</b>.
                            </p>

                            {devResetUrl && (
                                <div className="mb-6 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-left">
                                    <div className="flex items-center gap-2 text-yellow-400 text-sm font-semibold mb-2">
                                        <FaFlask /> Development Mode
                                    </div>
                                    <p className="text-xs text-muted-foreground mb-3">
                                        Email sending isn't configured yet, so here's your reset link directly:
                                    </p>
                                    <a
                                        href={devResetUrl}
                                        className="inline-flex items-center justify-center w-full px-4 py-2.5 rounded-lg bg-yellow-500/20 text-yellow-300 text-sm font-semibold hover:bg-yellow-500/30 transition-colors"
                                    >
                                        Open Reset Link →
                                    </a>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="mt-6 text-center text-sm">
                        <Link to="/login" className="inline-flex items-center font-medium text-primary hover:underline">
                            <FaArrowLeft className="mr-2 w-3 h-3" /> Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
