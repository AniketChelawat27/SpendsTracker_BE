const admin = require("firebase-admin");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "change-me-in-production";

/**
 * Verifies Authorization: Bearer <token>
 * Supports: (1) Firebase ID token when Firebase is configured
 *           (2) JWT from MongoDB auth (login/signup) when Firebase is not configured
 * Sets req.uid and req.userEmail for use in routes.
 */
async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: missing or invalid Authorization header" });
  }
  const token = authHeader.slice(7);

  // Try Firebase first if configured
  if (admin.apps.length) {
    try {
      const decoded = await admin.auth().verifyIdToken(token);
      req.uid = decoded.uid;
      req.userEmail = decoded.email || null;
      return next();
    } catch (err) {
      // Fall through to try JWT
    }
  }

  // Try JWT (MongoDB auth)
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.uid = decoded.id;
    req.userEmail = decoded.email || null;
    return next();
  } catch (err) {
    if (admin.apps.length) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
    return res.status(401).json({
      error: "Invalid or expired token",
      hint: "Auth uses JWT from /auth/login or /auth/signup. Ensure JWT_SECRET is set.",
    });
  }
}

module.exports = { requireAuth };
