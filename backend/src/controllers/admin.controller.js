// controllers/admin.controller.js
const { db } = require("../config/firebase");

exports.getDashboardSummary = async (req, res) => {
  try {
    const usersSnap = await db.collection("users").get();
    const claimsSnap = await db.collection("claims").get();
    const policiesSnap = await db.collection("policies").get();

    const totalUsers = usersSnap.size;
    const totalClaims = claimsSnap.size;
    const totalPolicies = policiesSnap.size;

    let pendingClaims = 0;
    let totalPayout = 0;

    claimsSnap.forEach(doc => {
      const data = doc.data();

      if (data.status === "pending") pendingClaims++;
      if (data.status === "approved") {
        totalPayout += data.amount || 0;
      }
    });

    res.json({
      totalUsers,
      totalPolicies,
      totalClaims,
      pendingClaims,
      totalPayout
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};