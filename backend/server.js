const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

app.use(cors());
app.use(express.json());

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

app.get('/', (req, res) => {
  res.send('GigShield AI Risk Engine is running! 🚀');
});

app.post('/api/calculate-premium', async (req, res) => {
  const { city, platform = "Zomato", deliveries = 20 } = req.body;

  if (!city) {
    return res.status(400).json({ error: "City name is required for risk analysis." });
  }

  try {
    // 1. Geocoding API: Convert City to Lat/Lon
    const geoRes = await axios.get(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
    );
    
    if (!geoRes.data.results || geoRes.data.results.length === 0) {
      return res.status(400).json({ error: `City '${city}' not found in global database.` });
    }

    const lat = geoRes.data.results[0].latitude;
    const lon = geoRes.data.results[0].longitude;

    // 2. Weather & AQI APIs 
    // FIXED: Now fetching raw pm2_5 instead of us_aqi
    const [weatherRes, aqiRes] = await Promise.all([
      axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,precipitation&hourly=precipitation_probability`),
      axios.get(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm2_5`)
    ]);

    const rainProb = weatherRes.data.hourly.precipitation_probability[0] || 0;
    const temp = weatherRes.data.current.temperature_2m || 30;
    
    // Calculate the localized Indian AQI based on raw PM2.5 data
    const rawPM25 = aqiRes.data.current.pm2_5 || 15;
    const indianAQI = calculateIndianAQI(rawPM25);

    // 3. AI Pricing Engine Math
    let premium = 45; // Base weekly price
    let breakdown = [];
    const cityLower = city.toLowerCase();

    // Factor A: Historical Flood/Safe Zone Matrix
    if (FLOOD_PRONE_CITIES.includes(cityLower)) {
      premium += 8;
      breakdown.push({ factor: "High-Risk Flood Zone", impact: "+₹8" });
    } else if (SAFE_CITIES.includes(cityLower)) {
      premium -= 4;
      breakdown.push({ factor: "Safe Zone (Low Waterlogging)", impact: "-₹4" });
    } else {
      breakdown.push({ factor: "Standard Zone Risk", impact: "₹0" });
    }

    // Factor B: Live Predictive Weather Adjustments
    if (rainProb > 60) {
      premium += 10;
      breakdown.push({ factor: "High Rain Probability (>60%)", impact: "+₹10" });
    } else if (temp > 40) {
      premium += 6;
      breakdown.push({ factor: "Extreme Heat Alert", impact: "+₹6" });
    }

    // Factor C: Live Air Quality Analysis (Using Indian Scale)
    if (indianAQI > 150) {
      premium += 5;
      breakdown.push({ factor: "Severe NAQI detected (>150)", impact: "+₹5" });
    }

    // Factor D: Platform Operational Stability
    const plat = platform ? platform.toLowerCase() : "";
    if (plat === 'zomato' || plat === 'swiggy') {
      premium -= 3;
      breakdown.push({ factor: "Tier-1 Platform Stability", impact: "-₹3" });
    }

    // Factor E: Exposure Volume
    if (deliveries > 25) {
      premium += 4;
      breakdown.push({ factor: "High Volume Exposure (>25/day)", impact: "+₹4" });
    }

    const finalPremium = Math.max(premium, 30); // Absolute floor price

    // 4. Send back to React
    res.json({
      success: true,
      city: city,
      liveData: { temp, rainProb, aqi: indianAQI }, // Sending the Indian AQI back
      finalPremium: finalPremium,
      breakdown: breakdown
    });

  } catch (error) {
    console.error("Pricing Engine Error:", error.message);
    res.status(500).json({ error: "Failed to fetch live risk data." });
  }
});

// Local development server
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
  });
}

// Export for Vercel
module.exports = app;