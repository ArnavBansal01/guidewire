const cron = require("node-cron");
const { checkTriggers } = require("./triggerConfig");
const { simulateClaim } = require("./simulateClaimService");

// Run every 1 minute
cron.schedule("* * * * *", async () => {
  console.log("⏱️ Running automated trigger check...");

  const result = await checkTriggers("Delhi");

  if (!result) return;

  const { triggers } = result;

  if (triggers.extremeHeat) {
    await simulateClaim({ type: "Extreme Heat", amount: 1000 });
  }

  if (triggers.heavyRain) {
    await simulateClaim({ type: "Heavy Rain", amount: 800 });
  }

  if (triggers.pollution) {
    await simulateClaim({ type: "Pollution", amount: 700 });
  }
});