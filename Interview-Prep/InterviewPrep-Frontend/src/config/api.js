/**
 * Centralized API configuration.
 *
 * In development: defaults to http://localhost:3001
 * In production:  reads from the REACT_APP_API_URL environment variable
 *
 * Usage:
 *   import { API_URL, authHeaders } from "../config/api";
 *   fetch(`${API_URL}/login`, { headers: authHeaders() })
 */

export const API_URL =
    process.env.REACT_APP_API_URL || "http://localhost:3001";

/**
 * Returns headers object with the JWT token from localStorage.
 * Use this for all authenticated API calls.
 */
export const authHeaders = () => {
    const token = localStorage.getItem("token");
    return {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
};

/**
 * fetch + safe JSON parsing.
 *
 * Reads the body as text first, then tries JSON.parse. If the server returns
 * non-JSON (e.g. Express's default HTML 404 page "<!DOCTYPE html>..." when a
 * route is missing because the backend is stale/not restarted, or an HTML error
 * page from a proxy), we throw a clear, actionable message instead of the
 * cryptic "Unexpected token '<', "<!DOCTYPE "... is not valid JSON".
 *
 * On a non-OK response with valid JSON, throws Error(message/error from body).
 * On success, returns the parsed object.
 */
export const requestJson = async (url, options = {}) => {
    let response;
    try {
        response = await fetch(url, options);
    } catch (networkErr) {
        // fetch itself failed → server unreachable / CORS / offline
        throw new Error("Couldn't reach the server. Please make sure the backend is running and try again.");
    }

    const raw = await response.text();
    let data;
    try {
        data = raw ? JSON.parse(raw) : {};
    } catch {
        // Body wasn't JSON — almost always an HTML error page.
        if (response.status === 404) {
            throw new Error("This feature isn't available on the server yet. Please restart the backend, then try again.");
        }
        throw new Error("The server returned an unexpected response. Please restart the backend and try again.");
    }

    if (!response.ok) {
        throw new Error(data.message || data.error || "Something went wrong. Please try again.");
    }
    return data;
};
