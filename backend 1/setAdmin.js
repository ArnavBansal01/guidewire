const admin = require("firebase-admin");
require("dotenv").config();

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// ⚡ PUT YOUR FIREBASE USER UID HERE
const YOUR_UID = "PASTE_YOUR_UID_HERE";

admin.auth().setCustomUserClaims(YOUR_UID, { role: "admin" })
  .then(() => {
    console.log(`✅ Successfully set admin role for user: ${YOUR_UID}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });