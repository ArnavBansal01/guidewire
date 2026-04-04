const { db } = require("../config/firebase");

// ── GET ALL WORKERS ──
const fetchAllWorkers = async () => {
  const snapshot = await db.collection("users").get();
  const workers = [];

  snapshot.forEach((doc) => {
    const data = doc.data();
    workers.push({
      id: doc.id,
      fullName: data.fullName || "Unknown Worker",
      email: data.email || "",
      phone: data.phone || "",
      city: data.city || "Unknown City",
      platform: data.platform || "Unknown Platform",
      activePlan: data.activePlanName || data.activePlan || null,
      hasActivePolicy: data.hasActivePolicy || false,
      policyStartDate: data.policyStartDate || null,
      avgDailyDeliveries: data.avgDailyDeliveries || 0,
      avgDailyIncome: data.avgDailyIncome || null,
      trustScore: data.trustScore || 100,
      isFlagged: data.isFlagged || false,
      flagReason: data.flagReason || null,
      createdAt: data.createdAt || null,
    });
  });

  return workers;
};

// ── FLAG WORKER ──
const flagWorkerService = async (id) => {
  if (!id) throw new Error("Worker ID is required");

  const ref = db.collection("users").doc(id);
  const doc = await ref.get();

  if (!doc.exists) throw new Error(`Worker not found: ${id}`);

  await ref.update({
    isFlagged: true,
    flaggedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  console.log(`[WORKER] Flagged: ${id}`);
  return { id, isFlagged: true };
};

// ── UNFLAG WORKER ──
const unflagWorkerService = async (id) => {
  if (!id) throw new Error("Worker ID is required");

  const ref = db.collection("users").doc(id);
  const doc = await ref.get();

  if (!doc.exists) throw new Error(`Worker not found: ${id}`);

  await ref.update({
    isFlagged: false,
    flagReason: null,
    flaggedAt: null,
    updatedAt: new Date().toISOString(),
  });

  console.log(`[WORKER] Unflagged: ${id}`);
  return { id, isFlagged: false };
};

module.exports = { fetchAllWorkers, flagWorkerService, unflagWorkerService };
