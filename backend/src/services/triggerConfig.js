const axios = require("axios");

// 📍 Get coordinates from city
const getCoordinates = async (city) => {
  const geoRes = await axios.get(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
  );

  if (!geoRes.data.results || geoRes.data.results.length === 0) {
    throw new Error(`City '${city}' not found`);
  }

  return {
    lat: geoRes.data.results[0].latitude,
    lon: geoRes.data.results[0].longitude
  };
};

// 🌦️ Get weather + AQI data
const getEnvironmentalData = async (city) => {
  const { lat, lon } = await getCoordinates(city);

  const [weatherRes, aqiRes] = await Promise.all([
    axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,precipitation&hourly=precipitation_probability`),
    axios.get(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm2_5`)
  ]);

  const temp = weatherRes.data.current.temperature_2m || 30;
  const rain = weatherRes.data.hourly.precipitation_probability[0] || 0;
  const pm25 = aqiRes.data.current.pm2_5 || 10;

  return { temp, rain, pm25 };
};

// 🇮🇳 Convert PM2.5 → Indian AQI
function calculateIndianAQI(pm25) {
  if (pm25 <= 30) return Math.round(pm25 * (50 / 30));
  if (pm25 <= 60) return Math.round(50 + (pm25 - 30) * (50 / 30));
  if (pm25 <= 90) return Math.round(100 + (pm25 - 60) * (100 / 30));
  if (pm25 <= 120) return Math.round(200 + (pm25 - 90) * (100 / 30));
  if (pm25 <= 250) return Math.round(300 + (pm25 - 120) * (100 / 130));
  return Math.round(400 + (pm25 - 250) * (100 / 130));
}

// 🚨 MAIN TRIGGER FUNCTION
const checkTriggers = async (city = "Delhi") => {
  try {
    const { temp, rain, pm25 } = await getEnvironmentalData(city);
    const aqi = calculateIndianAQI(pm25);

    const triggers = {
      extremeHeat: temp > 45,        // 🔥 > 45°C
      heavyRain: rain > 70,          // 🌧️ > 70%
      pollution: aqi > 300,          // ☠️ AQI > 300
      normal: true                  // fallback
    };

    return {
      city,
      data: { temp, rain, aqi },
      triggers
    };

  } catch (error) {
    console.error("Trigger Error:", error.message);
    return null;
  }
};

module.exports = { checkTriggers };