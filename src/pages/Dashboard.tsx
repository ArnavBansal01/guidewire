import { useState, useEffect } from "react";
import {
  Shield,
  TrendingUp,
  Droplets,
  Thermometer,
  Wind,
  AlertTriangle,
  CheckCircle,
  Zap,
} from "lucide-react";

import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";

import {
  mockPolicy, // Keeping mockPolicy for now until we build the checkout flow
} from "../mockData";
import { plans } from "../data/plans";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

type ParametricWindowData = {
  temp: number;
  rainProb: number;
  aqi: number;
  finalPremium: number;
  breakdown: Array<{ factor: string; impact: string }>;
  fetchedAt: number;
};

const Dashboard = () => {
  const [showClaimToast, setShowClaimToast] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [dbUser, setDbUser] = useState<any>(null);
  const [planDetails, setPlanDetails] = useState<any>(null);
  const [parametricWindow, setParametricWindow] =
    useState<ParametricWindowData | null>(null);
  const [loadingParametric, setLoadingParametric] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        const unsubscribeUser = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            setDbUser(docSnap.data());
          }
        });

        return () => unsubscribeUser();
      }

      setDbUser(null);
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (dbUser?.activePlan) {
      const matchingPlan = plans.find((p) => p.name === dbUser.activePlan);
      setPlanDetails(matchingPlan || null);
      return;
    }
    setPlanDetails(null);
  }, [dbUser?.activePlan]);

  useEffect(() => {
    if (!dbUser?.city) {
      setParametricWindow(null);
      setLoadingParametric(false);
      return;
    }

    let isMounted = true;

    const fetchParametricWindow = async () => {
      setLoadingParametric(true);
      try {
        const response = await fetch(`${BACKEND_URL}/api/calculate-premium`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            city: dbUser.city,
            platform: dbUser.platform || "Porter",
            deliveries: dbUser.avgDailyDeliveries || 20,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch parametric data");
        }

        const data = await response.json();
        if (!isMounted) {
          return;
        }

        setParametricWindow({
          temp: Number(data?.liveData?.temp ?? 0),
          rainProb: Number(data?.liveData?.rainProb ?? 0),
          aqi: Number(data?.liveData?.aqi ?? 0),
          finalPremium: Number(data?.finalPremium ?? 0),
          breakdown: Array.isArray(data?.breakdown) ? data.breakdown : [],
          fetchedAt: Date.now(),
        });
      } catch (error) {
        console.error("Error fetching parametric window:", error);
        if (isMounted) {
          setParametricWindow(null);
        }
      } finally {
        if (isMounted) {
          setLoadingParametric(false);
        }
      }
    };

    setParametricWindow(null);
    fetchParametricWindow();
    const intervalId = setInterval(fetchParametricWindow, 60000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [dbUser?.city, dbUser?.platform, dbUser?.avgDailyDeliveries]);

  const handleSimulateDisruption = () => {
    setShowClaimToast(true);
    setTimeout(() => setShowClaimToast(false), 5000);
  };

  const daysUntilLock = Math.ceil(
    (new Date(mockPolicy.nextLockDate).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24),
  );

  const hasActivePlan = Boolean(dbUser?.activePlan || dbUser?.hasActivePolicy);
  const activePlanLabel = hasActivePlan
    ? dbUser?.activePlan ||
      dbUser?.activePlanName ||
      mockPolicy.type.charAt(0).toUpperCase() + mockPolicy.type.slice(1)
    : "No active plan";

  const riskValue = parametricWindow?.rainProb ?? 0;
  const riskProgress = Math.min((riskValue / 60) * 100, 100);
  const aqiValue = parametricWindow?.aqi ?? 0;
  const aqiProgress = Math.min((aqiValue / 200) * 100, 100);
  const tempValue = parametricWindow?.temp ?? 0;
  const tempProgress = Math.min((tempValue / 45) * 100, 100);

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">
              Welcome back, {dbUser?.fullName || user?.displayName || "Rider"}
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              {dbUser?.city || "Your City"} • {dbUser?.platform || "Delivery"}{" "}
              Rider
            </p>
          </div>

          <div className="h-10 w-auto px-3 rounded-lg bg-slate-900/80 border border-slate-700 flex items-center gap-2 shadow-sm">
            <Shield className="w-4 h-4 text-cyan-400" />
            <p className="text-xs text-slate-300">Trust Score</p>
            <p className="text-sm font-bold text-white">
              {dbUser?.trustScore || 100}%
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white dark:bg-slate-900/50 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Policy Management</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Active Plan: {activePlanLabel}
                  </p>
                </div>
              </div>

              {hasActivePlan ? (
                <div className="px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                  <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                    Active
                  </p>
                </div>
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  No active plan
                </p>
              )}
            </div>

            {hasActivePlan && (
              <>
                <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded-lg mb-6">
                  <div className="flex gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-amber-900 dark:text-amber-300 mb-1">
                        Coverage Window Lock
                      </h3>
                      <p className="text-sm text-amber-800 dark:text-amber-400">
                        Next cycle locks in{" "}
                        <span className="font-bold">{daysUntilLock} days</span>{" "}
                        to prevent weather-gaming. Adjust your plan before{" "}
                        {new Date(mockPolicy.nextLockDate).toLocaleDateString()}
                        .
                      </p>
                    </div>
                  </div>
                </div>

                {planDetails && (
                  <div className="bg-gradient-to-r from-cyan-50 to-emerald-50 dark:from-cyan-900/20 dark:to-emerald-900/20 border-l-4 border-emerald-500 p-4 rounded-lg mb-6">
                    <div className="flex gap-3">
                      <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-emerald-900 dark:text-emerald-300 mb-2">
                          {planDetails.name} Details
                        </h3>
                        <ul className="text-sm text-emerald-800 dark:text-emerald-400 space-y-1">
                          {planDetails.features
                            .slice(0, 3)
                            .map((feature: string, idx: number) => (
                              <li key={idx}>• {feature}</li>
                            ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 sm:gap-4">
                  <div className="min-w-0 p-3 sm:p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-1">
                      Weekly Premium
                    </p>
                    <p className="text-lg sm:text-2xl font-bold">
                      ₹{mockPolicy.weeklyPremium}
                    </p>
                  </div>
                  <div className="min-w-0 p-3 sm:p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-1">
                      Coverage Amount
                    </p>
                    <p className="text-lg sm:text-2xl font-bold">
                      ₹{mockPolicy.coverageAmount}
                    </p>
                  </div>
                  <div className="min-w-0 p-3 sm:p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-1">
                      Avg Daily Income
                    </p>
                    <p className="text-lg sm:text-2xl font-bold">
                      ₹{dbUser?.avgDailyIncome || 1200}
                    </p>
                  </div>
                  <div className="min-w-0 p-3 sm:p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-1">
                      Avg Deliveries/Day
                    </p>
                    <p className="text-lg sm:text-2xl font-bold">
                      {dbUser?.avgDailyDeliveries || 25}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="bg-white dark:bg-slate-900/50 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-xl">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Zero-Touch Claim</h2>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Automatic payouts
                </p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                  Real-time monitoring
                </p>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <p className="text-sm font-medium">
                    Device location verified
                  </p>
                </div>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                  Platform integration
                </p>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <p className="text-sm font-medium">
                    {dbUser?.platform || "API"} API active
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleSimulateDisruption}
              className="w-full px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all"
            >
              Simulate Disruption
            </button>
          </div>
        </div>

        <div className="relative overflow-hidden bg-white dark:bg-slate-900/60 backdrop-blur-sm rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 md:p-8">
          <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-cyan-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-emerald-500/20 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-7">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-400 font-semibold mb-2">
                Live Intelligence Layer
              </p>
              <h2 className="text-3xl font-bold mb-2">Parametric Monitor</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
                Real-time city risk engine for{" "}
                {dbUser?.city || "your selected city"}. Metrics auto-refresh on
                city change and every 60 seconds.
              </p>
            </div>

            {!loadingParametric && parametricWindow && (
              <div className="flex items-center gap-2 self-start md:self-auto px-3 py-1.5 rounded-full border border-slate-300 dark:border-slate-700 bg-slate-100/80 dark:bg-slate-800/80">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Updated{" "}
                  {new Date(parametricWindow.fetchedAt).toLocaleTimeString()}
                </span>
              </div>
            )}
          </div>

          {loadingParametric && (
            <div className="relative z-10 mb-8 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/60">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-3 w-3 rounded-full bg-cyan-500 animate-pulse" />
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Fetching latest parametric data for{" "}
                  {dbUser?.city || "selected city"}...
                </p>
              </div>
              <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div className="h-full w-1/2 bg-gradient-to-r from-cyan-500 to-emerald-500 animate-pulse" />
              </div>
            </div>
          )}

          {!loadingParametric && parametricWindow && (
            <>
              <div className="relative z-10 grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-5 mb-7">
                <div className="group min-w-0 p-3.5 md:p-5 rounded-2xl border border-cyan-200/80 dark:border-cyan-700/50 bg-gradient-to-b from-white to-cyan-50/60 dark:from-slate-800/70 dark:to-slate-900/70 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-cyan-500/10 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 md:p-2.5 rounded-xl bg-cyan-100 dark:bg-cyan-900/30">
                        <Droplets className="w-5 h-5 md:w-6 md:h-6 text-cyan-600 dark:text-cyan-400" />
                      </div>
                      <div>
                        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
                          Risk
                        </p>
                        <p className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                          {riskValue}
                          <span className="text-lg md:text-xl">%</span>
                        </p>
                      </div>
                    </div>
                    {riskValue > 60 && (
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-500 dark:text-slate-400">
                        Rain Risk Trigger
                      </span>
                      <span className="text-slate-700 dark:text-slate-200">
                        {riskProgress.toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          riskValue > 60
                            ? "bg-gradient-to-r from-amber-500 to-red-500"
                            : "bg-gradient-to-r from-cyan-500 to-emerald-500"
                        } transition-all`}
                        style={{ width: `${riskProgress}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Trigger threshold: 60%
                    </p>
                  </div>
                </div>

                <div className="group min-w-0 p-3.5 md:p-5 rounded-2xl border border-violet-200/80 dark:border-violet-700/50 bg-gradient-to-b from-white to-violet-50/60 dark:from-slate-800/70 dark:to-slate-900/70 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-violet-500/10 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 md:p-2.5 rounded-xl bg-violet-100 dark:bg-violet-900/30">
                        <Wind className="w-5 h-5 md:w-6 md:h-6 text-violet-600 dark:text-violet-400" />
                      </div>
                      <div>
                        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
                          AQI
                        </p>
                        <p className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                          {aqiValue}
                        </p>
                      </div>
                    </div>
                    {aqiValue > 200 && (
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-500 dark:text-slate-400">
                        AQI Trigger
                      </span>
                      <span className="text-slate-700 dark:text-slate-200">
                        {aqiProgress.toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          aqiValue > 200
                            ? "bg-gradient-to-r from-amber-500 to-red-500"
                            : "bg-gradient-to-r from-violet-500 to-fuchsia-500"
                        } transition-all`}
                        style={{ width: `${aqiProgress}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Trigger threshold: 200
                    </p>
                  </div>
                </div>

                <div className="group min-w-0 p-3.5 md:p-5 rounded-2xl border border-rose-200/80 dark:border-rose-700/50 bg-gradient-to-b from-white to-rose-50/60 dark:from-slate-800/70 dark:to-slate-900/70 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-rose-500/10 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 md:p-2.5 rounded-xl bg-rose-100 dark:bg-rose-900/30">
                        <Thermometer className="w-5 h-5 md:w-6 md:h-6 text-rose-500" />
                      </div>
                      <div>
                        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
                          Temperature
                        </p>
                        <p className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                          {tempValue}
                          <span className="text-lg md:text-xl">°C</span>
                        </p>
                      </div>
                    </div>
                    {tempValue > 45 && (
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-500 dark:text-slate-400">
                        Heat Trigger
                      </span>
                      <span className="text-slate-700 dark:text-slate-200">
                        {tempProgress.toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          tempValue > 45
                            ? "bg-gradient-to-r from-amber-500 to-red-500"
                            : "bg-gradient-to-r from-rose-500 to-orange-500"
                        } transition-all`}
                        style={{ width: `${tempProgress}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Trigger threshold: 45°C
                    </p>
                  </div>
                </div>
              </div>

              {parametricWindow.breakdown.length > 0 && (
                <div className="relative z-10 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/90 dark:bg-slate-800/50">
                  <p className="text-sm font-semibold mb-2 text-slate-800 dark:text-slate-200">
                    Premium Breakdown
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {parametricWindow.breakdown.map(
                      (item: any, idx: number) => (
                        <span
                          key={idx}
                          className="text-xs px-3 py-1 rounded-full border border-slate-300 dark:border-slate-600 bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300"
                        >
                          {item.factor}: {item.impact}
                        </span>
                      ),
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {!loadingParametric && !parametricWindow && (
            <div className="relative z-10 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/90 dark:bg-slate-800/50 text-center">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Live monitor data is unavailable for the selected city right
                now.
              </p>
            </div>
          )}
        </div>
      </div>

      {showClaimToast && (
        <div className="fixed bottom-8 right-8 max-w-md bg-emerald-500 text-white p-6 rounded-xl shadow-2xl animate-slide-up">
          <div className="flex items-start gap-3">
            <Zap className="w-6 h-6 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-lg mb-1">
                Severe Weather Detected
              </h3>
              <p className="text-sm text-emerald-50">
                Proof-of-Presence verified. ₹250 payout initiated instantly.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
