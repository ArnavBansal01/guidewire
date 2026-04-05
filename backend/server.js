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

// Representative coordinates for Indian states/UTs used when geocoding does not
// return a direct hit (common for state-level inputs).
const STATE_COORDINATE_FALLBACKS = {
  "Andaman and Nicobar Islands": { lat: 11.7401, lon: 92.6586 },
  "Andhra Pradesh": { lat: 15.9129, lon: 79.74 },
  "Arunachal Pradesh": { lat: 28.218, lon: 94.7278 },
  Assam: { lat: 26.2006, lon: 92.9376 },
  Bihar: { lat: 25.0961, lon: 85.3131 },
  Chandigarh: { lat: 30.7333, lon: 76.7794 },
  Chhattisgarh: { lat: 21.2787, lon: 81.8661 },
  "Dadra and Nagar Haveli and Daman and Diu": { lat: 20.3974, lon: 72.8328 },
  Delhi: { lat: 28.6139, lon: 77.209 },
  Goa: { lat: 15.2993, lon: 74.124 },
  Gujarat: { lat: 22.2587, lon: 71.1924 },
  Haryana: { lat: 29.0588, lon: 76.0856 },
  "Himachal Pradesh": { lat: 31.1048, lon: 77.1734 },
  "Jammu and Kashmir": { lat: 33.7782, lon: 76.5762 },
  Jharkhand: { lat: 23.6102, lon: 85.2799 },
  Karnataka: { lat: 15.3173, lon: 75.7139 },
  Kerala: { lat: 10.8505, lon: 76.2711 },
  Ladakh: { lat: 34.1526, lon: 77.5771 },
  Lakshadweep: { lat: 10.5667, lon: 72.6417 },
  "Madhya Pradesh": { lat: 22.9734, lon: 78.6569 },
  Maharashtra: { lat: 19.7515, lon: 75.7139 },
  Manipur: { lat: 24.6637, lon: 93.9063 },
  Meghalaya: { lat: 25.467, lon: 91.3662 },
  Mizoram: { lat: 23.1645, lon: 92.9376 },
  Nagaland: { lat: 26.1584, lon: 94.5624 },
  Odisha: { lat: 20.9517, lon: 85.0985 },
  Puducherry: { lat: 11.9416, lon: 79.8083 },
  Punjab: { lat: 31.1471, lon: 75.3412 },
  Rajasthan: { lat: 27.0238, lon: 74.2179 },
  Sikkim: { lat: 27.533, lon: 88.5122 },
  "Tamil Nadu": { lat: 11.1271, lon: 78.6569 },
  Telangana: { lat: 18.1124, lon: 79.0193 },
  Tripura: { lat: 23.9408, lon: 91.9882 },
  "Uttar Pradesh": { lat: 26.8467, lon: 80.9462 },
  Uttarakhand: { lat: 30.0668, lon: 79.0193 },
  "West Bengal": { lat: 22.9868, lon: 87.855 },
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
    // 1. Geocoding API: Convert location input to Lat/Lon.
    // Use "<query>, India" first, then raw query, then state fallback coordinates.
    const query = String(city).trim();
    const lookupCandidates = [`${query}, India`, query];

    let lat;
    let lon;

    for (const candidate of lookupCandidates) {
      const geoRes = await axios.get(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(candidate)}&count=1&language=en&format=json`,
      );

      if (geoRes.data.results && geoRes.data.results.length > 0) {
        lat = geoRes.data.results[0].latitude;
        lon = geoRes.data.results[0].longitude;
        break;
      }
    }

    if (typeof lat !== "number" || typeof lon !== "number") {
      const fallback = STATE_COORDINATE_FALLBACKS[query];
      if (fallback) {
        lat = fallback.lat;
        lon = fallback.lon;
      }
    }

    if (typeof lat !== "number" || typeof lon !== "number") {
      return res
        .status(400)
        .json({
          error: `Location '${city}' not found for live risk analysis.`,
        });
    }

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
