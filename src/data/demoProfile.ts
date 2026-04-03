import { partners } from "./partners";
import { cities } from "../mockData";

export const DEMO_WORKER_UID = "demo_worker";

export const DEMO_WORKER_DEFAULT_PROFILE = {
  uid: DEMO_WORKER_UID,
  email: "demo@worker.com",
  fullName: "Demo Worker",
  phone: "9999999999",
  city: cities.includes("Delhi") ? "Delhi" : cities[0] || "",
  platform: partners.includes("Swiggy") ? "Swiggy" : partners[0] || "",
  trustScore: 100,
  avgDailyIncome: 1200,
  avgDailyDeliveries: 25,
  role: "user",
  policyStatus: "Active",
  activePlan: "Standard",
  weeklyPremium: 40,
};
