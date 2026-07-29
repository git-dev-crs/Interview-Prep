import React from "react";
import { Link } from "react-router-dom";
import Nav from "../components/Nav";
import { FaArrowLeft, FaHome } from "react-icons/fa";

/**
 * Catch-all 404 page. Rendered for any route not matched in App.js.
 * Without this, an unknown path (e.g. a stale link) silently renders a blank
 * page, which looks like "nothing happened" when a user clicks a link.
 */
const NotFound = () => {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Nav />
            <div className="flex-1 flex items-center justify-center p-4">
                <div className="text-center max-w-md animate-in fade-in zoom-in duration-500">
                    <div className="text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-500 mb-2">
                        404
                    </div>
                    <h1 className="text-2xl font-bold text-foreground mb-2">Page not found</h1>
                    <p className="text-muted-foreground mb-8">
                        The page you're looking for doesn't exist or may have moved.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link
                            to="/"
                            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-orange-600 text-primary-foreground font-semibold shadow-lg hover:scale-[1.02] transition-all"
                        >
                            <FaHome className="mr-2" /> Go Home
                        </Link>
                        <Link
                            to="/login"
                            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-secondary text-secondary-foreground font-semibold hover:bg-secondary/80 transition-all"
                        >
                            <FaArrowLeft className="mr-2" /> Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
