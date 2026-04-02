import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import type { AdminStats, UserProfile } from "../types/domain";

export const fetchAdminDashboardData = async (): Promise<{ stats: AdminStats; users: UserProfile[] }> => {
  const usersSnap = await getDocs(collection(db, "users"));
  const usersData: UserProfile[] = [];
  let policyCount = 0;

  usersSnap.forEach((doc) => {
    const data = doc.data();
    usersData.push({ id: doc.id, ...data } as UserProfile);
    if (data.activePlan) {
      policyCount++;
    }
  });

  const claimsSnap = await getDocs(collection(db, "claims"));
  let totalMoneyPaid = 0;
  let flaggedClaims = 0;

  claimsSnap.forEach((doc) => {
    const data = doc.data();
    if (data.status === "PAID") {
      totalMoneyPaid += Number(data.amount || 0);
    }
    if (data.status === "FLAGGED" || data.status === "REJECTED") {
      flaggedClaims++;
    }
  });

  return {
    users: usersData,
    stats: {
      totalUsers: usersData.length,
      activePolicies: policyCount,
      totalPayouts: totalMoneyPaid,
      fraudAlerts: flaggedClaims,
    },
  };
};
