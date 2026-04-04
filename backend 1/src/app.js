require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const { db } = require("./config/firebase");

// ✅ Routes
const claimsRouter = require("./routes/claims");
const statsRouter = require("./routes/stats");
const workersRouter = require("./routes/workers");

const app = express();

// ───────────────────── MIDDLEWARE ─────────────────────
app.use(cors({
  origin: ["*"],
  methods: ["GET", "POST", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

// ───────────────────── TEST ROUTES ─────────────────────
app.get("/", (req, res) => {
  res.send("GigShield Backend Running 🚀");
});

app.get("/test-db", async (req, res) => {
  try {
    const snapshot = await db.collection("users").get();
    res.json({ count: snapshot.size });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const { checkTriggers } = require("./services/triggerConfig");

app.get("/api/test-triggers", async (req, res) => {
  const result = await checkTriggers("Delhi");
  res.json(result);
});
// ───────────────────── ADMIN ROUTES ─────────────────────
app.use("/api/admin/claims", claimsRouter);
app.use("/api/admin/stats", statsRouter);
app.use("/api/admin/workers", workersRouter);

// ───────────────────── PREMIUM LOGIC (MOVED FROM server.js) ─────────────────────

const FLOOD_PRONE_CITIES = ["mumbai", "chennai", "bengaluru", "kolkata"];
const SAFE_CITIES = ["chandigarh", "jaipur", "pune", "indore"];

function calculateIndianAQI(pm25) {
  if (pm25 <= 30) return Math.round(pm25 * (50 / 30));
  if (pm25 <= 60) return Math.round(50 + (pm25 - 30) * (50 / 30));
  if (pm25 <= 90) return Math.round(100 + (pm25 - 60) * (100 / 30));
  if (pm25 <= 120) return Math.round(200 + (pm25 - 90) * (100 / 30));
  if (pm25 <= 250) return Math.round(300 + (pm25 - 120) * (100 / 130));
  return Math.round(400 + (pm25 - 250) * (100 / 130));
}

// ✅ FINAL WORKING API
app.post('/api/calculate-premium', async (req, res) => {
  const { city, platform = "Zomato", deliveries = 20 } = req.body;

  if (!city) {
    return res.status(400).json({ error: "City name is required" });
  }

  try {
    const geoRes = await axios.get(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
    );

    if (!geoRes.data.results || geoRes.data.results.length === 0) {
      return res.status(400).json({ error: `City '${city}' not found` });
    }

    const lat = geoRes.data.results[0].latitude;
    const lon = geoRes.data.results[0].longitude;

    const [weatherRes, aqiRes] = await Promise.all([
      axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,precipitation&hourly=precipitation_probability`),
      axios.get(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm2_5`)
    ]);

    const rainProb = weatherRes.data.hourly.precipitation_probability[0] || 0;
    const temp = weatherRes.data.current.temperature_2m || 30;

    const rawPM25 = aqiRes.data.current.pm2_5 || 15;
    const indianAQI = calculateIndianAQI(rawPM25);

    let premium = 45;
    const cityLower = city.toLowerCase();

    if (FLOOD_PRONE_CITIES.includes(cityLower)) premium += 8;
    else if (SAFE_CITIES.includes(cityLower)) premium -= 4;

    if (rainProb > 60) premium += 10;
    else if (temp > 40) premium += 6;

    if (indianAQI > 150) premium += 5;

    if (["zomato", "swiggy"].includes(platform.toLowerCase())) premium -= 3;

    if (deliveries > 25) premium += 4;

    const finalPremium = Math.max(premium, 30);

    res.json({
      success: true,
      city,
      liveData: { temp, rainProb, aqi: indianAQI },
      finalPremium
    });

  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

// ───────────────────── 404 HANDLER ─────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.url} not found`,
  });
});

// ───────────────────── ERROR HANDLER ─────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: err.message || "Internal server error",
  });
});

// ───────────────────── START SERVER ─────────────────────
const PORT = process.env.PORT || 5000;
require("./services/cronService");
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});