export interface User {
  id: string;
  name: string;
  phone: string;
  city: string;
  platform: string;
  trustScore: number;
  avgDailyIncome: number;
  avgDailyDeliveries: number;
  joinedDate: string;
}

export interface Policy {
  id: string;
  type: "basic" | "standard" | "premium";
  weeklyPremium: number;
  coverageAmount: number;
  status: "active" | "pending" | "expired";
  startDate: string;
  endDate: string;
  nextLockDate: string;
}

export interface EnvironmentalData {
  timestamp: string;
  rainfall: number;
  temperature: number;
  aqi: number;
  windSpeed: number;
}

export interface ClaimRecord {
  id: string;
  date: string;
  amount: number;
  status: "approved" | "processing" | "paid";
  trigger: string;
  verification: string;
  platformActivity: string;
  payoutTime: string;
}

export interface RiskPrediction {
  date: string;
  predictedRainfall: number;
  predictedAQI: number;
  expectedIncomeLoss: number;
  riskLevel: "low" | "medium" | "high";
}

export interface AdminStats {
  totalActivePolicies: number;
  claimRatio: number;
  fraudAlerts: number;
  totalPayouts: number;
  avgPayoutTime: string;
}

export const mockUser: User = {
  id: "user-001",
  name: "Rahul",
  phone: "+91 98765 43210",
  city: "Delhi",
  platform: "Zomato",
  trustScore: 98,
  avgDailyIncome: 1000,
  avgDailyDeliveries: 25,
  joinedDate: "2024-01-15",
};

export const mockPolicy: Policy = {
  id: "policy-001",
  type: "standard",
  weeklyPremium: 40,
  coverageAmount: 2000,
  status: "active",
  startDate: "2024-03-22",
  endDate: "2024-04-22",
  nextLockDate: "2024-03-31",
};

export const currentEnvironmentalData: EnvironmentalData = {
  timestamp: new Date().toISOString(),
  rainfall: 42,
  temperature: 28,
  aqi: 165,
  windSpeed: 12,
};

export const rainfallTriggerThreshold = 50;
export const aqiTriggerThreshold = 200;
export const temperatureLowThreshold = 5;
export const temperatureHighThreshold = 45;

export const mockClaimHistory: ClaimRecord[] = [
  {
    id: "claim-001",
    date: "2024-03-25",
    amount: 250,
    status: "paid",
    trigger: "Heavy Rain (52mm/24h)",
    verification:
      "Device geo-location matched disruption zone (Connaught Place, Delhi)",
    platformActivity:
      "Verified active on Swiggy for 4 hours during disruption window",
    payoutTime: "58 seconds",
  },
  {
    id: "claim-002",
    date: "2024-03-18",
    amount: 300,
    status: "paid",
    trigger: "Severe AQI (AQI 385 - Hazardous)",
    verification: "Government advisory matched with rider location",
    platformActivity:
      "Active orders confirmed during high-AQI window (12-6 PM)",
    payoutTime: "62 seconds",
  },
  {
    id: "claim-003",
    date: "2024-03-10",
    amount: 200,
    status: "paid",
    trigger: "Extreme Heat (46°C)",
    verification: "IMD heat wave alert for Delhi NCR confirmed",
    platformActivity:
      "Reduced delivery capacity logged (15 deliveries vs avg 25)",
    payoutTime: "55 seconds",
  },
  {
    id: "claim-004",
    date: "2024-02-28",
    amount: 250,
    status: "paid",
    trigger: "Heavy Rain (68mm/24h) + Waterlogging",
    verification: "Traffic advisory zones matched rider hotspots",
    platformActivity: "Delivery time increased by 45% on average",
    payoutTime: "60 seconds",
  },
];

export const mockRiskPredictions: RiskPrediction[] = [
  {
    date: "2024-03-29",
    predictedRainfall: 15,
    predictedAQI: 145,
    expectedIncomeLoss: 50,
    riskLevel: "low",
  },
  {
    date: "2024-03-30",
    predictedRainfall: 35,
    predictedAQI: 178,
    expectedIncomeLoss: 150,
    riskLevel: "medium",
  },
  {
    date: "2024-03-31",
    predictedRainfall: 58,
    predictedAQI: 220,
    expectedIncomeLoss: 400,
    riskLevel: "high",
  },
  {
    date: "2024-04-01",
    predictedRainfall: 62,
    predictedAQI: 245,
    expectedIncomeLoss: 500,
    riskLevel: "high",
  },
  {
    date: "2024-04-02",
    predictedRainfall: 20,
    predictedAQI: 155,
    expectedIncomeLoss: 80,
    riskLevel: "low",
  },
  {
    date: "2024-04-03",
    predictedRainfall: 8,
    predictedAQI: 132,
    expectedIncomeLoss: 30,
    riskLevel: "low",
  },
  {
    date: "2024-04-04",
    predictedRainfall: 42,
    predictedAQI: 188,
    expectedIncomeLoss: 220,
    riskLevel: "medium",
  },
];

export const mockHistoricalDisruptions = [
  { month: "Jan", disruptionDays: 3, avgLoss: 180 },
  { month: "Feb", disruptionDays: 2, avgLoss: 140 },
  { month: "Mar", disruptionDays: 5, avgLoss: 280 },
  { month: "Apr", disruptionDays: 4, avgLoss: 220 },
  { month: "May", disruptionDays: 8, avgLoss: 420 },
  { month: "Jun", disruptionDays: 6, avgLoss: 340 },
];

export const mockAdminStats: AdminStats = {
  totalActivePolicies: 87543,
  claimRatio: 0.12,
  fraudAlerts: 23,
  totalPayouts: 2847650,
  avgPayoutTime: "60s",
};

export const mockFraudAlerts = [
  {
    id: "fraud-001",
    type: "Zone Boundary Manipulation",
    userId: "user-4523",
    description: "Suspicious location pattern detected near zone boundaries",
    severity: "high",
    timestamp: "2024-03-28 14:32",
  },
  {
    id: "fraud-002",
    type: "Duplicate Claim Attempt",
    userId: "user-7821",
    description: "Multiple claim submissions for same disruption event",
    severity: "medium",
    timestamp: "2024-03-28 11:15",
  },
  {
    id: "fraud-003",
    type: "Platform Activity Mismatch",
    userId: "user-2145",
    description: "Claimed active hours do not match platform API data",
    severity: "high",
    timestamp: "2024-03-27 18:45",
  },
];

// Backward-compatible export name used across forms; contains all India states and UTs.
export const cities = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

export const platforms = ["Swiggy", "Zomato", "Uber Eats", "Dunzo", "Zepto"];

export const pricingTiers = [
  {
    type: "basic",
    name: "Basic",
    weeklyPremium: 25,
    coverageAmount: 1000,
    features: [
      "Rain disruption coverage (>50mm)",
      "Basic AI risk pricing",
      "Standard payout speed",
      "Email support",
    ],
  },
  {
    type: "standard",
    name: "Standard",
    weeklyPremium: 40,
    coverageAmount: 2000,
    features: [
      "Rain + AQI coverage",
      "Advanced AI risk pricing",
      "Priority payout (60s avg)",
      "Phone support",
      "Heat wave protection",
    ],
    popular: true,
  },
  {
    type: "premium",
    name: "Premium",
    weeklyPremium: 60,
    coverageAmount: 3500,
    features: [
      "Full parametric coverage",
      "Real-time AI optimization",
      "Instant payout (30s avg)",
      "24/7 dedicated support",
      "Curfew & emergency protection",
      "Income loss guarantee",
    ],
  },
];

export const disruptionTypes = [
  "Heavy Rain",
  "Severe AQI",
  "Extreme Heat",
  "Curfew",
  "Flooding",
];
