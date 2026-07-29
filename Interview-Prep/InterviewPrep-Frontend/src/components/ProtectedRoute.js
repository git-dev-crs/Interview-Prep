import React from "react";
import { Navigate, useLocation } from "react-router-dom";

/**
 * ProtectedRoute — gates routes that require a logged-in user.
 *
 * If there's no auth token/email in localStorage, redirect to /login and
 * remember where the user was headed (via location state) so Login can send
 * them back after a successful sign-in.
 *
 * Usage:
 *   <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
 */
const ProtectedRoute = ({ children }) => {
    const location = useLocation();
    const isAuthed =
        Boolean(localStorage.getItem("token")) && Boolean(localStorage.getItem("email"));

    if (!isAuthed) {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }
    return children;
};

export default ProtectedRoute;
