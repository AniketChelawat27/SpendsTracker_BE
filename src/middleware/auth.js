const admin = require("firebase-admin");

/**
 * Verifies Firebase ID token from Authorization: Bearer <token>
 * Sets req.uid and req.userEmail for use in routes.
 */
async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: missing or invalid Authorization header" });
  }
  const idToken = authHeader.slice(7);
  if (!admin.apps.length) {
    return res.status(503).json({
      error: "Auth not configured",
      hint: "Set GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_SERVICE_ACCOUNT. See README.",
    });
  }
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    req.uid = decoded.uid;
    req.userEmail = decoded.email || null;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

module.exports = { requireAuth };
