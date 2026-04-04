const { admin } = require("../config/firebase");

const requireAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // ── No token sent → skip auth (dev mode) ──
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.warn("[AUTH] No token provided — passing request through");
      return next();
    }

    const token = authHeader.split(" ")[1];
    const decodedToken = await admin.auth().verifyIdToken(token);

    // ── Check admin claim on token ──
    if (!decodedToken.admin && decodedToken.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Access denied: Admin only",
      });
    }

    req.admin = decodedToken;
    next();
  } catch (error) {
    console.error("[AUTH] Token verification failed:", error.message);
    return res.status(401).json({
      success: false,
      error: "Invalid or expired token",
    });
  }
};

module.exports = requireAdmin;
