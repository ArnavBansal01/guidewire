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
