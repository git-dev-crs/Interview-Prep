import React from "react";
import { Link } from "react-router-dom";
import { FaGithub, FaTwitter, FaLinkedinIn, FaHeart } from "react-icons/fa";

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="relative bg-mesh-section border-t border-border/30 overflow-hidden">
            {/* Background grid */}
            <div className="absolute inset-0 bg-grid-pattern opacity-10" />

            <div className="container mx-auto px-4 relative z-10">
                {/* Main Footer Content */}
                <div className="py-16 grid grid-cols-1 md:grid-cols-4 gap-12">
                    {/* Brand */}
                    <div className="md:col-span-1 space-y-4">
                        <Link to="/" className="flex items-center gap-3 font-bold text-xl group">
                            <div className="size-9 rounded-lg flex items-center justify-center text-white shadow-lg shadow-primary/20"
                                style={{ background: 'linear-gradient(135deg, hsl(24, 94%, 50%), #ea580c)' }}
                            >
                                <span className="font-black text-xs">IP</span>
                            </div>
                            <span className="text-foreground">Interview<span className="text-shimmer font-extrabold"> Prep</span></span>
                        </Link>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Your complete platform for cracking coding interviews at top tech companies.
                        </p>
                        <div className="flex gap-3 pt-2">
                            {[
                                { icon: <FaGithub />, href: "#" },
                                { icon: <FaTwitter />, href: "#" },
                                { icon: <FaLinkedinIn />, href: "#" },
                            ].map((social, i) => (
                                <a key={i} href={social.href}
                                    className="w-9 h-9 rounded-xl glass flex items-center justify-center text-muted-foreground hover:text-primary hover:glow-primary transition-all duration-300 hover:scale-110"
                                >
                                    {social.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold text-foreground uppercase tracking-wider">Learn</h4>
                        <div className="flex flex-col gap-3">
                            {[
                                { to: "/core-subject", label: "CS Core Subjects" },
                                { to: "/generate-list-parameter", label: "DSA Sheets" },
                                { to: "/resource", label: "Resources" },
                            ].map(({ to, label }) => (
                                <Link key={to} to={to} className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium">
                                    {label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Practice */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold text-foreground uppercase tracking-wider">Practice</h4>
                        <div className="flex flex-col gap-3">
                            {[
                                { to: "/mock-interview/setup", label: "AI Mock Interview" },
                                { to: "/dashboard", label: "Dashboard" },
                                { to: "/top-interview-questions/dsa", label: "DSA Questions" },
                            ].map(({ to, label }) => (
                                <Link key={to} to={to} className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium">
                                    {label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Subjects */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold text-foreground uppercase tracking-wider">Subjects</h4>
                        <div className="flex flex-col gap-3">
                            {[
                                { to: "/top-interview-questions/os", label: "Operating System" },
                                { to: "/top-interview-questions/dbms", label: "DBMS" },
                                { to: "/top-interview-questions/cn", label: "Computer Networks" },
                                { to: "/top-interview-questions/oops", label: "OOP" },
                                { to: "/top-interview-questions/sql", label: "SQL" },
                            ].map(({ to, label }) => (
                                <Link key={to} to={to} className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium">
                                    {label}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="py-6 border-t border-border/20 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-muted-foreground">
                        © {currentYear} Interview Prep. All rights reserved.
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                        Made with <FaHeart className="w-3 h-3 text-red-400 animate-pulse" /> for developers
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
