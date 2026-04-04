import { collection, getDocs } from "firebase/firestore";
import { auth, db } from "../firebase";
import type {
  AdminStats,
  UserProfile,
  AdminSystemIntelligence,
} from "../types/domain";

const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");
const API_BASES = [API_URL, "http://localhost:5000"].filter(Boolean);

// 🔐 Wait for Firebase Auth to restore session
const getAuthHeader = async (): Promise<Record<string, string>> => {
  const user = await new Promise<any>((resolve) => {
    if (auth.currentUser) {
      resolve(auth.currentUser);
      return;
    }
    const timeout = setTimeout(() => resolve(null), 5000);
    const unsubscribe = auth.onAuthStateChanged((u) => {
      clearTimeout(timeout);
      unsubscribe();
      resolve(u);
    });
  });

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (!user) {
    return headers;
  }

  const token = await user.getIdToken(true);
  headers.Authorization = `Bearer ${token}`;
  return headers;
};

const fetchFromApi = async (path: string, headers: Record<string, string>) => {
  let lastError: unknown = null;

  for (const base of API_BASES) {
    try {
      const response = await fetch(`${base}${path}`, { headers });
      const json = await response.json();

      if (!response.ok) {
        throw new Error(json?.error || `Request failed: ${response.status}`);
      }

      return json;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("All admin API endpoints failed");
};

// 📊 FETCH DASHBOARD STATS + USERS
export const fetchAdminDashboardData = async (): Promise<{
  stats: AdminStats;
  users: UserProfile[];
}> => {
  try {
    const headers = await getAuthHeader();
    const data = await fetchFromApi("/api/admin/stats", headers);

    return {
      stats: {
        totalUsers: data.totalUsers ?? 0,
        activePolicies: data.totalPolicies ?? 0,
        totalPayouts: data.totalPayout ?? 0,
        fraudAlerts: data.pendingClaims ?? 0,
      },
      users: [],
    };
  } catch (apiError) {
    console.warn(
      "Admin stats API unavailable, using Firestore fallback:",
      apiError,
    );

    try {
      const [usersSnap, claimsSnap] = await Promise.all([
        getDocs(collection(db, "users")),
        getDocs(collection(db, "claims")),
      ]);

      const users: UserProfile[] = [];
      let activePolicies = 0;
      let totalPayouts = 0;
      let fraudAlerts = 0;

      usersSnap.forEach((docSnap) => {
        const data = docSnap.data() as Omit<UserProfile, "id">;
        users.push({ id: docSnap.id, ...data });
        if (data.activePlan) {
          activePolicies += 1;
        }
      });

      claimsSnap.forEach((docSnap) => {
        const claim = docSnap.data() as {
          amount?: number;
          status?: string;
          fraudRisk?: string;
        };
        const normalizedStatus = (claim.status || "").toUpperCase();

        if (normalizedStatus === "APPROVED" || normalizedStatus === "PAID") {
          totalPayouts += Number(claim.amount) || 0;
        }

        if (
          normalizedStatus === "PENDING" ||
          (claim.fraudRisk || "").toLowerCase() === "high"
        ) {
          fraudAlerts += 1;
        }
      });

      return {
        stats: {
          totalUsers: users.length,
          activePolicies,
          totalPayouts,
          fraudAlerts,
        },
        users,
      };
    } catch (fallbackError) {
      console.error("fetchAdminDashboardData fallback error:", fallbackError);
    }

    return {
      stats: {
        totalUsers: 0,
        activePolicies: 0,
        totalPayouts: 0,
        fraudAlerts: 0,
      },
      users: [],
    };
  }
};

// 📊 FETCH SYSTEM INTELLIGENCE (Real-time telemetry)
export const fetchSystemIntelligence =
  async (): Promise<AdminSystemIntelligence | null> => {
    try {
      const headers = await getAuthHeader();
      const json = await fetchFromApi("/api/admin/stats/intelligence", headers);

      if (!json.success || !json.data) {
        throw new Error(json.error || "Failed to fetch system intelligence");
      }

      return json.data as AdminSystemIntelligence;
    } catch (apiError) {
      console.warn(
        "System intelligence API unavailable, using local fallback:",
        apiError,
      );

      const fallback = await fetchAdminDashboardData();

      return {
        health: {
          activeUsers: fallback.stats.totalUsers,
          activePolicies: fallback.stats.activePolicies,
          uptime: 0,
          apiResponseTime: 0,
        },
        financial: {
          totalPayouts: fallback.stats.totalPayouts,
          premiumCollected: 0,
          lossRatio: 0,
        },
        fraud: {
          suspiciousClaims: fallback.stats.fraudAlerts,
          flaggedWorkers: 0,
          highRiskCount: 0,
        },
        activity: {
          recentClaimsCount: 0,
          eventsLog: [],
        },
        environment: {
          highRiskCities: 0,
          avgAqi: 0,
          activeDisruptions: ["API offline: running on fallback data"],
          riskScoreIndex: 0,
        },
      };
    }
  };
