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
