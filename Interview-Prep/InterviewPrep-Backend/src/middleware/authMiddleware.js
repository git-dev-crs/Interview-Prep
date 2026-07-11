import jwt from "jsonwebtoken";

/**
 * Auth Middleware — verifies the JWT token from the Authorization header.
 * 
 * Usage: Add `authMiddleware` to any route that should be protected.
 * The decoded user email is attached to `req.userEmail` for downstream use.
 * 
 * Expected header format:  Authorization: Bearer <token>
 */
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userEmail = decoded.email;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token." });
    }
};

export default authMiddleware;
