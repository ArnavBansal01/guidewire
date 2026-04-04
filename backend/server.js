const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(cors());
app.use(express.json());

const CITY_TO_STATE = {
  delhi: "Delhi",
  mumbai: "Maharashtra",
  bangalore: "Karnataka",
  bengaluru: "Karnataka",
  hyderabad: "Telangana",
  chennai: "Tamil Nadu",
  kolkata: "West Bengal",
  pune: "Maharashtra",
  ahmedabad: "Gujarat",
};

const STATE_COMPENSATION = {
  Delhi: 12,
  Maharashtra: 10,
  Karnataka: 11,
  Telangana: 9,
  "Tamil Nadu": 9,
  "West Bengal": 8,
  Gujarat: 7,
};

const FLOOD_PRONE_CITIES = ["mumbai", "chennai", "bengaluru", "kolkata"];
const SAFE_CITIES = ["chandigarh", "jaipur", "pune", "indore"];

// Helper Function: Official Indian NAQI Calculation for PM2.5
// This makes your numbers match Indian sensors/Google rather than US standards
function calculateIndianAQI(pm25) {
  if (pm25 <= 30) return Math.round(pm25 * (50 / 30));
  if (pm25 <= 60) return Math.round(50 + (pm25 - 30) * (50 / 30));
  if (pm25 <= 90) return Math.round(100 + (pm25 - 60) * (100 / 30));
  if (pm25 <= 120) return Math.round(200 + (pm25 - 90) * (100 / 30));
  if (pm25 <= 250) return Math.round(300 + (pm25 - 120) * (100 / 130));
  return Math.round(400 + (pm25 - 250) * (100 / 130)); // Severe
}

app.get("/", (req, res) => {
  res.send("GigAssure AI Risk Engine is running! 🚀");
});

app.post("/api/calculate-premium", async (req, res) => {
  const { city, platform = "Zomato", deliveries = 20 } = req.body;

  if (!city) {
    return res
      .status(400)
      .json({ error: "City name is required for risk analysis." });
  }

  try {
    // 1. Geocoding API: Convert City to Lat/Lon
    const geoRes = await axios.get(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`,
    );

    if (!geoRes.data.results || geoRes.data.results.length === 0) {
      return res
        .status(400)
        .json({ error: `City '${city}' not found in global database.` });
    }

    const lat = geoRes.data.results[0].latitude;
    const lon = geoRes.data.results[0].longitude;

    // 2. Weather & AQI APIs
    // FIXED: Now fetching raw pm2_5 instead of us_aqi
    const [weatherRes, aqiRes] = await Promise.all([
      axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,precipitation&hourly=precipitation_probability`,
      ),
      axios.get(
        `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm2_5`,
      ),
    ]);

    const rainProb = weatherRes.data.hourly.precipitation_probability[0] || 0;
    const temp = weatherRes.data.current.temperature_2m || 30;

    // Calculate the localized Indian AQI based on raw PM2.5 data
    const rawPM25 = aqiRes.data.current.pm2_5 || 15;
    const indianAQI = calculateIndianAQI(rawPM25);

    const cityKey = city.toLowerCase();
    const state = CITY_TO_STATE[cityKey] || city;
    const stateCompensation = STATE_COMPENSATION[state] || 8;

    // 3. AI Pricing Engine Math
    const premium = 45 + stateCompensation;
    let breakdown = [];

    breakdown.push({
      factor: `State Compensation (${state})`,
      impact: `+₹${stateCompensation}`,
    });

    const liveRiskSignals = [];
    if (rainProb > 60) {
      liveRiskSignals.push({
        factor: "High Rain Probability (>60%)",
        impact: "+₹0",
      });
    }

    if (temp > 40) {
      liveRiskSignals.push({ factor: "Extreme Heat Alert", impact: "+₹0" });
    }

    if (indianAQI > 150) {
      liveRiskSignals.push({
        factor: "Severe NAQI detected (>150)",
        impact: "+₹0",
      });
    }

    const finalPremium = Math.max(premium, 30); // Absolute floor price

    // 4. Send back to React
    res.json({
      success: true,
      city: city,
      state,
      stateCompensation,
      liveData: { temp, rainProb, aqi: indianAQI }, // Sending the Indian AQI back
      finalPremium: finalPremium,
      breakdown: [...breakdown, ...liveRiskSignals],
    });
  } catch (error) {
    console.error("Pricing Engine Error:", error.message);
    res.status(500).json({ error: "Failed to fetch live risk data." });
  }
});

// Local development server
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
  });
}

// Export for Vercel
module.exports = app;
