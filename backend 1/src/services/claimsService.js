const { db } = require("../config/firebase");

// ── GET ALL CLAIMS ──
const fetchAllClaims = async () => {
  const snapshot = await db
    .collection("claims")
    .get();

  const claims = [];

  snapshot.forEach((doc) => {
    const data = doc.data();
    claims.push({
      id: doc.id,
      workerName: data.workerName || "Unknown Worker",
      location: data.location || data.city || "Unknown City",
      city: data.location || data.city || "Unknown City",
      amount: data.amount || 0,
      status: data.status || "PENDING",
      triggerSource: data.triggerSource || data.triggerType || "Manual",
      fraudRisk: data.fraudRisk || "low",
      confidenceScore: data.confidenceScore || 75,
      platform: data.platform || "",
      autoTriggered: data.autoTriggered || false,
      createdAt: data.createdAt || null,
      timeToPay: data.timeToPay || null,
    });
  });

  return claims;
};

// ── APPROVE CLAIM ──
const approveClaimService = async (id) => {
  if (!id) throw new Error("Claim ID is required");

  const ref = db.collection("claims").doc(id);
  const doc = await ref.get();

  if (!doc.exists) {
    throw new Error(`Claim not found: ${id}`);
  }

  await ref.update({
    status: "APPROVED",
    resolvedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  console.log(`[CLAIM] Approved: ${id}`);
  return { id, status: "APPROVED" };
};

// ── REJECT CLAIM ──
const rejectClaimService = async (id) => {
  if (!id) throw new Error("Claim ID is required");

  const ref = db.collection("claims").doc(id);
  const doc = await ref.get();

  if (!doc.exists) {
    throw new Error(`Claim not found: ${id}`);
  }

  await ref.update({
    status: "REJECTED",
    resolvedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  console.log(`[CLAIM] Rejected: ${id}`);
  return { id, status: "REJECTED" };
};

// ── SIMULATE CLAIM ──
const simulateClaimService = async (claimData) => {
  if (!claimData.city || !claimData.triggerSource) {
    throw new Error("city and triggerSource are required");
  }

  const newClaim = {
    workerName: "Simulated Deployment",
    location: claimData.city,
    city: claimData.city,
    triggerSource: claimData.triggerSource,
    triggerType: claimData.triggerSource,
    amount: claimData.amount || 250,
    status: "PENDING",
    autoTriggered: true,
    fraudRisk: "low",
    confidenceScore: 85,
    platform: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const ref = await db.collection("claims").add(newClaim);
  console.log(`[CLAIM] Simulated claim created: ${ref.id}`);

  return { id: ref.id, ...newClaim };
};

module.exports = {
  fetchAllClaims,
  approveClaimService,
  rejectClaimService,
  simulateClaimService,
};
