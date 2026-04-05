import {
  collection,
  getDocs,
  onSnapshot,
  type DocumentData,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import type {
  AdminStats,
  UserProfile,
  AdminSystemIntelligence,
} from "../types/domain";
import type { ClaimRecord } from "./claimsService";

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

const toMillis = (value: unknown): number => {
  if (!value) return 0;
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  if (
    typeof value === "object" &&
    value !== null &&
    "toMillis" in value &&
    typeof (value as { toMillis: unknown }).toMillis === "function"
  ) {
    return (value as { toMillis: () => number }).toMillis();
  }
  if (
    typeof value === "object" &&
    value !== null &&
    "seconds" in value &&
    typeof (value as { seconds: unknown }).seconds === "number"
  ) {
    return (value as { seconds: number }).seconds * 1000;
  }
  return 0;
};

const normalizeStatus = (
  status?: string,
): "PENDING" | "APPROVED" | "REJECTED" | "PAID" => {
  const upper = (status || "PENDING").toUpperCase();
  if (upper === "APPROVED") return "APPROVED";
  if (upper === "REJECTED") return "REJECTED";
  if (upper === "PAID") return "PAID";
  return "PENDING";
};

const getClaimTimestamp = (claim: ClaimRecord) => {
  return Math.max(
    toMillis(claim.updatedAt),
    toMillis(claim.timestamp),
    toMillis(claim.createdAt),
  );
};

const inferDisruptionFromClaim = (claim: ClaimRecord) => {
  return claim.triggerSource || claim.triggerType || "Unknown disruption";
};

export const buildAdminStatsFromData = (
  users: UserProfile[],
  claims: ClaimRecord[],
): AdminStats => {
  const activePolicies = users.filter((user) =>
    Boolean(user.activePlan),
  ).length;

  let totalPayouts = 0;
  let fraudAlerts = 0;

  claims.forEach((claim) => {
    const status = normalizeStatus(claim.status);
    const amount = Number(claim.amount) || 0;
    const fraudRisk = (claim.fraudRisk || "").toString().toLowerCase();

    if (status === "APPROVED" || status === "PAID") {
      totalPayouts += amount;
    }
    if (status === "PENDING" || fraudRisk === "high") {
      fraudAlerts += 1;
    }
  });

  return {
    totalUsers: users.length,
    activePolicies,
    totalPayouts,
    fraudAlerts,
  };
};

export const buildSystemIntelligenceFromData = (
  users: UserProfile[],
  claims: ClaimRecord[],
): AdminSystemIntelligence => {
  const now = Date.now();
  const oneHourAgo = now - 60 * 60 * 1000;

  const recentClaims = claims
    .filter((claim) => getClaimTimestamp(claim) >= oneHourAgo)
    .sort((a, b) => getClaimTimestamp(b) - getClaimTimestamp(a));

  const totalPayouts = claims.reduce((sum, claim) => {
    const status = normalizeStatus(claim.status);
    if (status === "APPROVED" || status === "PAID") {
      return sum + (Number(claim.amount) || 0);
    }
    return sum;
  }, 0);

  const highRiskClaims = claims.filter(
    (claim) => (claim.fraudRisk || "").toString().toLowerCase() === "high",
  );

  const suspiciousClaims = claims.filter(
    (claim) =>
      normalizeStatus(claim.status) === "PENDING" ||
      (claim.fraudRisk || "").toString().toLowerCase() !== "low",
  );

  const disruptionCounts = claims.reduce<Record<string, number>>(
    (acc, claim) => {
      const key = inferDisruptionFromClaim(claim);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    },
    {},
  );

  const activeDisruptions = Object.entries(disruptionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([name, count]) => `${name} (${count})`);

  const claimsByCity = claims.reduce<Record<string, number>>((acc, claim) => {
    const key = claim.city || claim.location || "Unknown";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const highRiskCities = Object.values(claimsByCity).filter(
    (count) => count >= 2,
  ).length;

  const eventsLog = recentClaims.slice(0, 6).map((claim) => ({
    id: claim.id,
    worker: claim.workerName || "Unknown worker",
    city: claim.city || claim.location || "Unknown city",
    status: normalizeStatus(claim.status),
    timestamp: getClaimTimestamp(claim) || now,
    amount: Number(claim.amount) || 0,
  }));

  const approvedOrPaidCount = claims.filter((claim) => {
    const status = normalizeStatus(claim.status);
    return status === "APPROVED" || status === "PAID";
  }).length;
  const lossRatio = approvedOrPaidCount
    ? Number(
        (
          (totalPayouts / Math.max(approvedOrPaidCount * 1200, 1)) *
          100
        ).toFixed(1),
      )
    : 0;

  return {
    health: {
      activeUsers: users.length,
      activePolicies: users.filter((user) => Boolean(user.activePlan)).length,
      uptime: Math.floor((performance.now?.() || 0) / 1000),
      apiResponseTime: 0,
    },
    financial: {
      totalPayouts,
      premiumCollected:
        users.filter((user) => Boolean(user.activePlan)).length * 480,
      lossRatio,
    },
    fraud: {
      suspiciousClaims: suspiciousClaims.length,
      flaggedWorkers: highRiskClaims.length,
      highRiskCount: highRiskClaims.length,
    },
    activity: {
      recentClaimsCount: recentClaims.length,
      eventsLog,
    },
    environment: {
      highRiskCities,
      avgAqi: 0,
      activeDisruptions:
        activeDisruptions.length > 0
          ? activeDisruptions
          : ["No active disruptions reported"],
      riskScoreIndex: Math.min(
        100,
        Math.round(
          (suspiciousClaims.length / Math.max(claims.length, 1)) * 100,
        ),
      ),
    },
  };
};

export const subscribeUsersRealtime = (
  onData: (users: UserProfile[]) => void,
  onError?: (error: unknown) => void,
) => {
  return onSnapshot(
    collection(db, "users"),
    (snapshot) => {
      const users = snapshot.docs.map((docSnap) => {
        const data = docSnap.data() as DocumentData;
        return {
          id: docSnap.id,
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          platform: data.platform,
          city: data.city,
          trustScore: data.trustScore,
          activePlan: data.activePlan,
        } as UserProfile;
      });
      onData(users);
    },
    (error) => {
      if (onError) {
        onError(error);
      }
    },
  );
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
