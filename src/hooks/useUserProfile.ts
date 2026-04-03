import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";

export type AppUserProfile = {
  uid?: string;
  email?: string;
  fullName?: string;
  phone?: string;
  city?: string;
  platform?: string;
  trustScore?: number;
  avgDailyIncome?: number;
  avgDailyDeliveries?: number;
  activePlan?: string;
  activePlanName?: string;
  hasActivePolicy?: boolean;
  weeklyPremium?: number;
  policyStatus?: string;
  policyStartDate?: string;
  role?: string;
};

export const useUserProfile = () => {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<AppUserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user?.uid) {
      setProfile(null);
      setLoadingProfile(false);
      return;
    }

    const cached = localStorage.getItem("dbUser");
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as AppUserProfile;
        setProfile(parsed.uid === user.uid ? parsed : null);
      } catch {
        setProfile(null);
      }
    } else {
      setProfile(null);
    }

    setLoadingProfile(true);
    const unsubscribe = onSnapshot(
      doc(db, "users", user.uid),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as AppUserProfile;
          setProfile(data);
          localStorage.setItem("dbUser", JSON.stringify(data));
        }
        setLoadingProfile(false);
      },
      (error) => {
        console.error("Error syncing user profile:", error);
        setLoadingProfile(false);
      },
    );

    return () => unsubscribe();
  }, [authLoading, user?.uid]);

  return {
    profile,
    loadingProfile,
  };
};
