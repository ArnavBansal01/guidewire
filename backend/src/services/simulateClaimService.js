const admin = require("firebase-admin");
const db = admin.firestore();

const simulateClaim = async ({ type, amount }) => {
  try {
    await db.collection("claims").add({
      type,
      amount,
      status: "approved",
      source: "AUTO_TRIGGER",
      createdAt: new Date()
    });

    console.log(`✅ Auto Claim Created: ${type}`);
  } catch (error) {
    console.error("❌ Claim Error:", error.message);
  }
};

module.exports = { simulateClaim };