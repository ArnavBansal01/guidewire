import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Check,
  Award,
  Zap,
  ChevronRight,
  MapPin,
  Shield,
  Info,
  Lock,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserProfile } from "../hooks/useUserProfile";
import { calculateFinalPrice, getStateFromCity } from "../utils/PremiumLogic";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";

type PlanId = "basic" | "standard" | "premium";

type PlanData = {
  id: PlanId;
  name: string;
  basePrice: number;
  features: string[];
  order: number;
};

type RiskContext = {
  breakdown: Array<{ factor: string; impact: string }>;
  liveData: {
    temp: number;
    rainProb: number;
    aqi: number;
  };
};

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const PLAN_DATA: PlanData[] = [
  {
    id: "basic",
    name: "GigAssure Basic",
    basePrice: 35,
    features: [
      "Maximum payout: Rs 350/week",
      "Capped at Rs 150/day",
      "Covers Rain, Heat, AQI, Curfews",
      "Zero manual paperwork",
      "Dynamic premium adjustments",
    ],
    order: 1,
  },
  {
    id: "standard",
    name: "GigAssure Standard",
    basePrice: 50,
    features: [
      "Maximum payout: Rs 600/week",
      "Capped at Rs 250/day",
      "Covers Rain, Heat, AQI, Curfews",
      "Instant payout via Razorpay",
      "Adaptive friction protection",
    ],
    order: 2,
  },
  {
    id: "premium",
    name: "GigAssure Premium",
    basePrice: 90,
    features: [
      "Maximum payout: Rs 1000/week",
      "Capped at Rs 400/day",
      "Covers Rain, Heat, AQI, Curfews",
      "Priority instant payout",
      "Multi-dimensional verification",
    ],
    order: 3,
  },
];

const PLAN_ID_SET = new Set<PlanId>(["basic", "standard", "premium"]);

const normalizePlanId = (value: string | undefined | null): PlanId | null => {
  if (!value) {
    return null;
  }

  const normalized = value.toLowerCase().trim();
  if (PLAN_ID_SET.has(normalized as PlanId)) {
    return normalized as PlanId;
  }

  if (normalized.includes("premium")) {
    return "premium";
  }

  if (normalized.includes("standard")) {
    return "standard";
  }

  if (normalized.includes("basic")) {
    return "basic";
  }

  return null;
};

const getPlanHierarchy = (planId: PlanId | null): number => {
  if (!planId) {
    return 0;
  }

  return PLAN_DATA.find((plan) => plan.id === planId)?.order ?? 0;
};

const Premium = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, loadingProfile } = useUserProfile();
  const [showPriceBreakdown, setShowPriceBreakdown] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<PlanId | null>(null);
  const [updatingPlan, setUpdatingPlan] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState<string>("");
  const [riskContext, setRiskContext] = useState<RiskContext | null>(null);

  const city = profile?.city || "Unknown City";
  const state = getStateFromCity(city);
  const trustScore = profile?.trustScore ?? 85;
  const activePlanId =
    normalizePlanId(profile?.activePlan) ||
    normalizePlanId(profile?.activePlanName);
  const activePlanName = profile?.activePlanName || "No Active Plan";

  useEffect(() => {
    if (!city || city === "Unknown City") {
      setRiskContext(null);
      return;
    }

    let isMounted = true;

    const fetchRiskContext = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/calculate-premium`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            city,
            platform: profile?.platform || "Zomato",
            deliveries: profile?.avgDailyDeliveries || 20,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch risk context");
        }

        const data = await response.json();
        if (!isMounted) {
          return;
        }

        setRiskContext({
          breakdown: Array.isArray(data?.breakdown) ? data.breakdown : [],
          liveData: {
            temp: Number(data?.liveData?.temp ?? 0),
            rainProb: Number(data?.liveData?.rainProb ?? 0),
            aqi: Number(data?.liveData?.aqi ?? 0),
          },
        });
      } catch {
        if (isMounted) {
          setRiskContext(null);
        }
      }
    };

    fetchRiskContext();
    return () => {
      isMounted = false;
    };
  }, [city, profile?.platform, profile?.avgDailyDeliveries]);

  const pricingByPlan = useMemo(() => {
    return PLAN_DATA.reduce(
      (acc, plan) => {
        acc[plan.id] = calculateFinalPrice({
          basePrice: plan.basePrice,
          city,
          duration: 1,
        });
        return acc;
      },
      {} as Record<PlanId, ReturnType<typeof calculateFinalPrice>>,
    );
  }, [city]);

  const premiumBreakdown = pricingByPlan.premium.breakdown;
  const riskReasonItems = (riskContext?.breakdown || []).filter((item) => {
    const factor = item.factor.toLowerCase();
    return (
      !factor.includes("state compensation") &&
      !factor.includes("standard zone risk") &&
      !factor.includes("safe zone") &&
      !factor.includes("flood zone")
    );
  });

  const getPlanButtonState = (planId: PlanId) => {
    if (!activePlanId) {
      return {
        text: "Activate Plan",
        enabled: true,
        type: "purchase" as const,
      };
    }

    const activePlanHierarchy = getPlanHierarchy(activePlanId);
    const targetPlanHierarchy = getPlanHierarchy(planId);

    if (targetPlanHierarchy === activePlanHierarchy) {
      return { text: "Manage Plan", enabled: true, type: "manage" as const };
    }

    if (targetPlanHierarchy > activePlanHierarchy) {
      return { text: "Upgrade", enabled: true, type: "upgrade" as const };
    }

    return {
      text: "Downgrade Locked",
      enabled: false,
      type: "downgrade" as const,
    };
  };

  const onPlanAction = async (planId: PlanId) => {
    const state = getPlanButtonState(planId);
    if (!state.enabled) {
      return;
    }

    setSelectedPlanId(planId);
    setUpgradeMessage("");

    if (state.type === "manage") {
      navigate("/profile");
      return;
    }

    if (!user?.uid) {
      setUpgradeMessage("Login required to upgrade plan.");
      return;
    }

    const selectedPlan = PLAN_DATA.find((plan) => plan.id === planId);
    if (!selectedPlan) {
      setUpgradeMessage("Unable to identify selected plan.");
      return;
    }

    try {
      setUpdatingPlan(true);
      const pricing = pricingByPlan[planId];

      await updateDoc(doc(db, "users", user.uid), {
        activePlan: planId,
        activePlanName: selectedPlan.name,
        hasActivePolicy: true,
        weeklyPremium: pricing.total,
        policyStatus: "ACTIVE",
        policyStartDate: new Date().toISOString(),
      });

      setUpgradeMessage(`${selectedPlan.name} is now active.`);
    } catch (error) {
      console.error("Failed to upgrade plan:", error);
      setUpgradeMessage("Plan update failed. Please try again.");
    } finally {
      setUpdatingPlan(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-cyan-50 via-slate-50 to-emerald-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAwMDAiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDE2em0wLTEwdjJIMjR2LTJoMTZ6bTAtMTB2MkgyNHYtMmgxNnoiLz48L2c+PC9nPjwvc3ZnPg==')] dark:opacity-20 -z-10" />
      <div className="absolute top-40 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-20 left-1/3 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] -z-10" />

      <div className="relative">
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="pt-8 sm:pt-12 px-4 sm:px-6 lg:px-8"
        >
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-6 items-start mb-10 sm:mb-12">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white leading-[1.1] tracking-tight mb-6">
                  Choose Your
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-sky-500 to-emerald-500">
                    Protection Plan
                  </span>
                </h1>
                <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed font-medium max-w-lg">
                  Flexible coverage tailored to your city and risk profile. Pick
                  a plan, compare clearly, and continue only when you are ready.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05 }}
                className="relative overflow-visible rounded-[24px] border border-white/60 dark:border-slate-700/60 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl p-5 sm:p-6 shadow-xl"
              >
                <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl -z-10" />
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-cyan-500/10 rounded-lg">
                      <Zap className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white uppercase tracking-wide">
                      Pricing for {state}
                    </h2>
                  </div>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowPriceBreakdown((prev) => !prev)}
                      onMouseEnter={() => setShowPriceBreakdown(true)}
                      onMouseLeave={() => setShowPriceBreakdown(false)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-700 dark:text-cyan-300 hover:underline"
                    >
                      <Info className="h-4 w-4" />
                      How calculated
                    </button>
                    <AnimatePresence>
                      {showPriceBreakdown && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          className="absolute right-0 z-20 mt-2 w-72 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 p-3 text-xs text-slate-700 dark:text-slate-200 shadow-2xl"
                        >
                          <p className="font-semibold text-slate-900 dark:text-slate-100">
                            Price breakdown
                          </p>
                          <p className="mt-1">
                            Base: Rs {premiumBreakdown.basePrice}
                          </p>
                          <p>
                            State Compensation: Rs{" "}
                            {premiumBreakdown.stateCompensation >= 0 ? "+" : ""}
                            {premiumBreakdown.stateCompensation}
                          </p>
                          <p className="mt-1 text-slate-600 dark:text-slate-300">
                            Equation: Rs {premiumBreakdown.basePrice} + Rs
                            {premiumBreakdown.stateCompensation >= 0 ? "+" : ""}
                            {premiumBreakdown.stateCompensation} = Rs{" "}
                            {premiumBreakdown.weeklyPrice}
                          </p>
                          <p className="mt-1 border-t border-slate-200 dark:border-slate-700 pt-1 font-semibold text-cyan-700 dark:text-cyan-200">
                            Total: Rs {premiumBreakdown.weeklyPrice}/week
                          </p>
                          <p className="mt-2 text-slate-500 dark:text-slate-400">
                            Why adjusted: base + state baseline compensation.
                            Live weather and AQI explain risk context and can be
                            +₹0 when no trigger surcharge is active.
                          </p>
                          <p className="mt-1 text-slate-500 dark:text-slate-400">
                            State Baseline Compensation ({state}): +Rs
                            {premiumBreakdown.stateCompensation}
                          </p>
                          {riskReasonItems.length > 0 ? (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {riskReasonItems.map((item, idx) => (
                                <span
                                  key={idx}
                                  className="rounded-full border border-amber-300/70 dark:border-amber-700/60 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 text-[11px] text-amber-700 dark:text-amber-300"
                                >
                                  {item.factor} ({item.impact})
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="mt-1 text-slate-500 dark:text-slate-400">
                              No extreme heat/rain/AQI trigger right now.
                            </p>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="mt-4 space-y-2.5">
                  {PLAN_DATA.map((plan) => {
                    const breakdown = pricingByPlan[plan.id].breakdown;
                    return (
                      <div
                        key={plan.id}
                        className="rounded-xl border border-slate-200/70 dark:border-slate-700/70 bg-white/70 dark:bg-slate-900/70 px-3 py-2"
                      >
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          {plan.name}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                          Rs {breakdown.basePrice} + Rs
                          {breakdown.stateCompensation >= 0 ? "+" : ""}
                          {breakdown.stateCompensation} =
                          <span className="font-extrabold text-slate-900 dark:text-white">
                            {" "}
                            Rs {breakdown.weeklyPrice}/week
                          </span>
                        </p>
                      </div>
                    );
                  })}
                </div>

                <p className="mt-4 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 leading-relaxed"></p>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="mb-10 sm:mb-12 grid gap-3 rounded-[22px] border border-white/70 dark:border-slate-700/60 bg-white/60 dark:bg-slate-900/45 backdrop-blur-xl p-3 sm:p-4 sm:grid-cols-3 shadow-[0_18px_45px_-32px_rgba(6,182,212,0.38)]"
            >
              <div className="group rounded-2xl border border-emerald-200/70 dark:border-emerald-500/20 bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-900/20 dark:to-slate-900/40 px-4 py-3 transition-all hover:-translate-y-0.5 hover:shadow-lg">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-emerald-500/15 p-2.5 mt-0.5">
                    <MapPin className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700/80 dark:text-emerald-300/80">
                      Operating City
                    </p>
                    <p className="mt-1 text-lg font-black text-slate-900 dark:text-slate-100 leading-tight">
                      {city}
                      <Lock className="inline-block w-3.5 h-3.5 ml-1.5 text-slate-500" />
                    </p>
                  </div>
                </div>
              </div>

              <div className="group rounded-2xl border border-amber-200/70 dark:border-amber-500/20 bg-gradient-to-br from-amber-50 to-white dark:from-amber-900/20 dark:to-slate-900/40 px-4 py-3 transition-all hover:-translate-y-0.5 hover:shadow-lg">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-amber-500/15 p-2.5 mt-0.5">
                    <Award className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-700/80 dark:text-amber-300/80">
                      Trust Score
                    </p>
                    <p className="mt-1 text-lg font-black text-slate-900 dark:text-slate-100 leading-tight">
                      {trustScore}/100
                    </p>
                  </div>
                </div>
              </div>

              <div className="group rounded-2xl border border-cyan-200/70 dark:border-cyan-500/20 bg-gradient-to-br from-cyan-50 to-white dark:from-cyan-900/20 dark:to-slate-900/40 px-4 py-3 transition-all hover:-translate-y-0.5 hover:shadow-lg">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-cyan-500/15 p-2.5 mt-0.5">
                    <Shield className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-700/80 dark:text-cyan-300/80">
                      Current Plan
                    </p>
                    <p className="mt-1 text-lg font-black text-slate-900 dark:text-slate-100 leading-tight">
                      {activePlanId ? activePlanName : "No Plan"}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="px-4 sm:px-6 lg:px-8 pb-20"
        >
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-xs sm:text-sm font-bold uppercase tracking-[0.1em] text-cyan-700 dark:text-cyan-300">
                <Zap className="w-4 h-4" />
                Flexible Plans
              </span>
            </div>

            <div className="grid md:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
              {PLAN_DATA.map((plan, index) => {
                const state = getPlanButtonState(plan.id);
                const activeHierarchy = getPlanHierarchy(activePlanId);
                const planHierarchy = getPlanHierarchy(plan.id);
                const isCurrent = state.type === "manage";
                const isDowngrade =
                  !!activePlanId && planHierarchy < activeHierarchy;
                const priceResult = pricingByPlan[plan.id];
                const isSelected = selectedPlanId === plan.id;

                return (
                  <motion.article
                    key={plan.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: index * 0.06 }}
                    whileHover={isDowngrade ? {} : { y: -3 }}
                    className="relative group h-full"
                  >
                    <div
                      onClick={() => {
                        if (!state.enabled) {
                          return;
                        }
                        setSelectedPlanId(plan.id);
                      }}
                      className={`relative h-full rounded-[28px] border transition-all duration-300 overflow-hidden p-4 sm:p-5 ${
                        isCurrent
                          ? "border-cyan-500/60 bg-white dark:bg-slate-950 shadow-2xl"
                          : "border-white/50 dark:border-slate-700/70 bg-white/70 dark:bg-slate-900/55 shadow-lg"
                      } ${isSelected ? "ring-2 ring-emerald-400/60" : ""} ${
                        isDowngrade ? "opacity-60" : "opacity-100"
                      } ${state.enabled ? "cursor-pointer" : "cursor-not-allowed"}`}
                    >
                      {plan.id === "standard" && !isCurrent && (
                        <div className="absolute top-3 right-3 px-3 py-1 bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-300 text-slate-900 text-[10px] font-black uppercase rounded-full shadow-md tracking-wider">
                          Best Seller
                        </div>
                      )}

                      {isSelected && (
                        <div className="absolute top-3 left-3 px-3 py-1 bg-emerald-500 text-white text-[10px] font-black uppercase rounded-full shadow-md tracking-wider">
                          Selected
                        </div>
                      )}

                      <div className="mt-5 space-y-3">
                        <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white pr-24">
                          {plan.name}
                        </h3>

                        <div className="rounded-[14px] p-3 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60">
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                            Base + state compensation
                          </p>
                          <div className="mt-1 flex items-end justify-between gap-2">
                            <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                              Rs {priceResult.total}
                            </p>
                            <p className="text-[11px] text-slate-500">/week</p>
                          </div>
                          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                            Rs {priceResult.breakdown.basePrice} + Rs
                            {priceResult.breakdown.stateCompensation >= 0
                              ? "+"
                              : ""}
                            {priceResult.breakdown.stateCompensation}
                          </p>
                        </div>

                        <div className="space-y-1.5 min-h-[145px]">
                          {plan.features.map((feature) => (
                            <div
                              key={feature}
                              className="flex items-start gap-2 text-[12px] sm:text-[13px] text-slate-600 dark:text-slate-300"
                            >
                              <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                              <span className="font-medium leading-snug">
                                {feature}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="space-y-2">
                          {isSelected && (
                            <p className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 className="w-4 h-4" />
                              Plan selected
                            </p>
                          )}

                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              onPlanAction(plan.id);
                            }}
                            disabled={!state.enabled}
                            className={`w-full py-2.5 px-3 rounded-[12px] font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                              state.type === "manage"
                                ? "border border-slate-300 dark:border-slate-600 bg-transparent text-slate-700 dark:text-slate-100 hover:border-slate-400"
                                : state.enabled
                                  ? "bg-gradient-to-r from-cyan-500 to-emerald-500 text-white hover:shadow-lg"
                                  : "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                            } ${updatingPlan ? "opacity-75" : ""}`}
                          >
                            {updatingPlan && isSelected
                              ? "Updating..."
                              : state.text}
                            {state.enabled && (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>

            {upgradeMessage && (
              <div className="mt-4 rounded-xl border border-cyan-200/70 dark:border-cyan-700/60 bg-cyan-50/80 dark:bg-cyan-900/20 px-4 py-3 text-sm font-medium text-cyan-800 dark:text-cyan-200">
                {upgradeMessage}
              </div>
            )}
          </div>
        </motion.section>

        {loadingProfile && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white dark:bg-slate-900 rounded-xl px-6 py-8 shadow-xl">
              <div className="w-8 h-8 border-2 border-slate-300 dark:border-slate-600 border-t-cyan-500 rounded-full animate-spin" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Premium;
