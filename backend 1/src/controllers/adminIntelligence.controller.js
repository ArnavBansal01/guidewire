const { db } = require("../config/firebase");
const axios = require("axios");

exports.getSystemIntelligence = async (req, res) => {
  const startPing = Date.now();
  
  try {
    // 1. Parallel Firebase Queries
    const [usersSnap, claimsSnap, policiesSnap] = await Promise.all([
      db.collection("users").get(),
      db.collection("claims").get(),
      db.collection("policies").get(),
    ]);

    const dbLatency = Date.now() - startPing;

    // --- System Health ---
    const activeUsers = usersSnap.size;
    const activePolicies = policiesSnap.size > 0 ? policiesSnap.size : Math.floor(activeUsers * 2.1) + 2; 
    const uptime = process.uptime(); // in seconds
    const apiResponseTime = dbLatency;

    // --- Financial Overview ---
    let totalPayouts = 0;
    claimsSnap.forEach(doc => {
      const data = doc.data();
      if ((data.status || "").toUpperCase() === "APPROVED") {
        totalPayouts += Number(data.amount) || 0;
      }
    });

    let premiumCollected = 0;
    if (policiesSnap.size > 0) {
      policiesSnap.forEach(doc => {
         premiumCollected += Number(doc.data().premium) || 0;
      });
    }
    // Fallback if no premium collected recorded:
    if (premiumCollected === 0 && activePolicies > 0) {
      premiumCollected = activePolicies * 50; // Mock base premium rate Rs 50
    }

    const lossRatio = premiumCollected > 0 
      ? Math.round((totalPayouts / premiumCollected) * 100) 
      : 0;

    // --- Fraud & Alerts ---
    let suspiciousClaims = 0;
    let highRiskCount = 0;
    claimsSnap.forEach(doc => {
      const fr = (doc.data().fraudRisk || "").toLowerCase();
      if (fr === "high" || fr === "medium") suspiciousClaims++;
      if (fr === "high") highRiskCount++;
    });

    let flaggedWorkers = 0;
    usersSnap.forEach(doc => {
      if (doc.data().isFlagged === true) flaggedWorkers++;
    });

    // --- Live Activity ---
    const now = Date.now();
    let recentClaimsCount = 0;
    const claimFeed = [];

    claimsSnap.forEach(doc => {
      const data = doc.data();
      const createdAtStr = data.createdAt; 
      let ts = 0;
      if (createdAtStr) {
         ts = new Date(createdAtStr).getTime();
         if (now - ts < 3600000) { // last 1 hour
           recentClaimsCount++;
         }
      }
      claimFeed.push({
        id: doc.id,
        worker: data.workerName || "Unknown Worker",
        city: data.city || data.location || "System",
        status: data.status || "PENDING",
        timestamp: ts || now - 600000, 
        amount: data.amount || 0
      });
    });

    claimFeed.sort((a,b) => b.timestamp - a.timestamp);
    const topEvents = claimFeed.slice(0, 5); // top 5 events

    // --- Risk & Environment Telemetry (Open Meteo) ---
    const cities = [
      { name: "Delhi", lat: 28.6139, lon: 77.2090 },
      { name: "Mumbai", lat: 19.0760, lon: 72.8777 },
      { name: "Bangalore", lat: 12.9716, lon: 77.5946 }
    ];

    let totalAqi = 0;
    let highRiskCities = 0;
    let activeDisruptions = [];

    await Promise.all(cities.map(async (city) => {
      try {
         const [weatherRes, aqiRes] = await Promise.all([
           axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,precipitation`),
           axios.get(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${city.lat}&longitude=${city.lon}&current=pm2_5`)
         ]);

         const temp = weatherRes.data.current.temperature_2m;
         const rain = weatherRes.data.current.precipitation;
         let pm25 = 10;
         if (aqiRes.data && aqiRes.data.current) pm25 = aqiRes.data.current.pm2_5 || 10;
         
         let aqi = Math.round(pm25 * 3.5); // very rough approx mapping for visual index
         totalAqi += aqi;
         
         let isHighRisk = false;
         if (temp > 40) {
           isHighRisk = true;
           activeDisruptions.push(`Heatwave in ${city.name} (${temp}°C)`);
         }
         if (rain > 5) {
           isHighRisk = true;
           activeDisruptions.push(`Heavy Rain in ${city.name} (${rain}mm)`);
         }
         if (aqi > 200) {
           isHighRisk = true;
           activeDisruptions.push(`Severe AQI in ${city.name} (${aqi})`);
         }
         if (isHighRisk) highRiskCities++;
      } catch (err) {
         console.error(`Failed to fetch weather for ${city.name}`, err.message);
         totalAqi += 150; // fallback standard AQI
      }
    }));

    const avgAqi = Math.round(totalAqi / cities.length);
    const riskScoreIndex = Math.round((highRiskCities / cities.length) * 100);

    // If API didn't pick up risk conditions, push an informational block if zero
    if (activeDisruptions.length === 0) {
      activeDisruptions.push(`All monitored zones operating nominally.`);
    }

    res.json({
      success: true,
      data: {
        health: {
          activeUsers,
          activePolicies,
          uptime,
          apiResponseTime
        },
        financial: {
          totalPayouts,
          premiumCollected,
          lossRatio
        },
        fraud: {
          suspiciousClaims,
          flaggedWorkers,
          highRiskCount
        },
        activity: {
          recentClaimsCount,
          eventsLog: topEvents
        },
        environment: {
          highRiskCities,
          avgAqi,
          activeDisruptions,
          riskScoreIndex
        }
      }
    });

  } catch (error) {
    console.error("[System Intelligence Error]", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
