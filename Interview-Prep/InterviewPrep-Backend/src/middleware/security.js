/**
 * Security middleware — dependency-free implementations of
 * security headers (helmet-style) and per-IP rate limiting.
 */

// ─── Security headers (helmet-style) ───
export const securityHeaders = (req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");   // block MIME-type sniffing
    res.setHeader("X-Frame-Options", "DENY");             // block clickjacking via iframes
    res.setHeader("Referrer-Policy", "no-referrer");      // don't leak URLs to third parties
    res.setHeader("X-DNS-Prefetch-Control", "off");
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    res.removeHeader("X-Powered-By");
    next();
};

// ─── In-memory per-IP rate limiter ───
// For a single-instance deployment this is equivalent to express-rate-limit's default store.
const buckets = new Map(); // key -> { count, resetAt }

// Clean up expired entries every 10 minutes so memory doesn't grow unbounded
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of buckets) {
        if (entry.resetAt <= now) buckets.delete(key);
    }
}, 10 * 60 * 1000).unref();

/**
 * Creates a rate-limiting middleware.
 * @param {Object} options
 * @param {number} options.windowMs  - time window in milliseconds
 * @param {number} options.max       - max requests per window per IP
 * @param {string} options.name      - unique name so different limiters don't share counters
 * @param {string} [options.message] - error message returned on 429
 */
export const rateLimit = ({ windowMs, max, name, message }) => {
    return (req, res, next) => {
        const ip = req.ip || req.socket?.remoteAddress || "unknown";
        const key = `${name}:${ip}`;
        const now = Date.now();

        let entry = buckets.get(key);
        if (!entry || entry.resetAt <= now) {
            entry = { count: 0, resetAt: now + windowMs };
            buckets.set(key, entry);
        }

        entry.count += 1;

        res.setHeader("RateLimit-Limit", max);
        res.setHeader("RateLimit-Remaining", Math.max(0, max - entry.count));
        res.setHeader("RateLimit-Reset", Math.ceil((entry.resetAt - now) / 1000));

        if (entry.count > max) {
            return res.status(429).json({
                error: message || "Too many requests. Please try again later.",
            });
        }

        next();
    };
};

// ─── Preconfigured limiters ───

// General API traffic: 300 requests / 15 min per IP
export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    name: "general",
});

// Auth endpoints (login/signup): 20 attempts / 15 min per IP — slows brute force
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    name: "auth",
    message: "Too many login attempts. Please wait 15 minutes and try again.",
});

// AI endpoints (Gemini-backed): 40 requests / 15 min per IP — protects API quota
export const aiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 40,
    name: "ai",
    message: "You've reached the AI usage limit. Please wait a few minutes and try again.",
});
