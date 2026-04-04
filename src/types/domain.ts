export type AdminStats = {
  totalUsers: number;
  activePolicies: number;
  totalPayouts: number;
  fraudAlerts: number;
};

export type UserProfile = {
  id: string;
  fullName?: string;
  email?: string;
  phone?: string;
  platform?: string;
  city?: string;
  trustScore?: number;
  activePlan?: string;
};

export type AdminSystemIntelligence = {
  health: {
    activeUsers: number;
    activePolicies: number;
    uptime: number;
    apiResponseTime: number;
  };
  financial: {
    totalPayouts: number;
    premiumCollected: number;
    lossRatio: number;
  };
  fraud: {
    suspiciousClaims: number;
    flaggedWorkers: number;
    highRiskCount: number;
  };
  activity: {
    recentClaimsCount: number;
    eventsLog: Array<{
      id: string;
      worker: string;
      city: string;
      status: string;
      timestamp: number;
      amount: number;
    }>;
  };
  environment: {
    highRiskCities: number;
    avgAqi: number;
    activeDisruptions: string[];
    riskScoreIndex: number;
  };
};
