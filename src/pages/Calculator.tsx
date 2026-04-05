import { useState, useEffect, useRef } from "react";
import {
  Calculator as CalcIcon,
  TrendingUp,
  Shield,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Info,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cities } from "../mockData";
import { plans } from "../data/plans";
import { useUserProfile } from "../hooks/useUserProfile";
import LocationSearchSelect from "../components/LocationSearchSelect";
import { calculateFinalPrice } from "../utils/PremiumLogic";
import type { EnvironmentalConditions, SurchargeBreakdownItem } from "../utils/PremiumLogic";

type CalculatorResult = {
  liveRiskScore: number;
  liveSurcharge: number;
  liveData: EnvironmentalConditions;
  breakdown: SurchargeBreakdownItem[];
};

const normalizeResult = (payload: unknown): CalculatorResult => {
  const data = (payload as Partial<{
    liveRiskScore: number;
    liveSurcharge: number;
    liveData: Partial<EnvironmentalConditions>;
    breakdown: Array<{ factor: string; impact: string }>;
  }>) || {};

  const liveData = data.liveData || {};
  const breakdownRaw = Array.isArray(data.breakdown) ? data.breakdown : [];

  const parseImpactAmount = (impact: string): number => {
    const match = impact.replace(/[^\d.-]/g, "");
    const num = Number(match);
    return Number.isFinite(num) ? num : 0;
  };

  const breakdown: SurchargeBreakdownItem[] = breakdownRaw.map((item) => {
    const safeItem =
      typeof item === "object" && item !== null
        ? (item as Partial<{ factor: string; impact: string }>)
        : {};

    const impact = typeof safeItem.impact === "string" ? safeItem.impact : "+₹0";
    return {
      factor: typeof safeItem.factor === "string" ? safeItem.factor : "Unknown",
      impact,
      amount: parseImpactAmount(impact),
    };
  });

  return {
    liveRiskScore:
      typeof data.liveRiskScore === "number" &&
      Number.isFinite(data.liveRiskScore)
        ? data.liveRiskScore
        : 0,
    liveSurcharge:
      typeof data.liveSurcharge === "number" &&
      Number.isFinite(data.liveSurcharge)
        ? data.liveSurcharge
        : 0,
    liveData: {
      temp:
        typeof liveData.temp === "number" && Number.isFinite(liveData.temp)
          ? liveData.temp
          : 0,
      rainProb:
        typeof liveData.rainProb === "number" && Number.isFinite(liveData.rainProb)
          ? liveData.rainProb
          : 0,
      aqi:
        typeof liveData.aqi === "number" && Number.isFinite(liveData.aqi)
          ? liveData.aqi
          : 0,
    },
    breakdown,
  };
};

const Calculator = () => {
  const navigate = useNavigate();
  const { profile, loadingProfile } = useUserProfile();
  const plansRef = useRef<HTMLDivElement>(null);
  const riskRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({
    dailyDeliveries: 25,
    dailyIncome: 1000,
    zone: "",
    platform: "Zomato",
  });

  const [loading, setLoading] = useState(false);
  const [fetchingUser, setFetchingUser] = useState(true);
  const [result, setResult] = useState<CalculatorResult | null>(null);
  const [error, setError] = useState("");
  const rainTriggered = (result?.liveData.rainProb ?? 0) > 60;
  const heatTriggered = (result?.liveData.temp ?? 0) > 40;
  const aqiTriggered = (result?.liveData.aqi ?? 0) > 150;
  const activeTriggerCount = [
    rainTriggered,
    heatTriggered,
    aqiTriggered,
  ].filter(Boolean).length;
  const riskLevel =
    activeTriggerCount >= 2
      ? "High"
      : activeTriggerCount === 1
        ? "Medium"
        : "Low";
  const activeTriggerLabels = [
    rainTriggered ? "Heavy Rain" : null,
    heatTriggered ? "Heatwave" : null,
    aqiTriggered ? "Poor AQI" : null,
  ].filter(Boolean) as string[];
  const riskReasonItems = (result?.breakdown || []).filter((item) => {
    const factor = item.factor.toLowerCase();
    return (
      !factor.includes("live disruption score") &&
      !factor.includes("compound disruption signal")
    );
  });

  // 1. AUTO-FETCH USER DATA FROM CENTRALIZED PROFILE SOURCE
  useEffect(() => {
    if (loadingProfile) return;

    if (profile) {
      setFormData((prev) => ({
        ...prev,
        zone: (profile.city as string) || "",
        platform: (profile.platform as string) || "Zomato",
      }));
    }

    setFetchingUser(false);
  }, [profile, loadingProfile]);

  // Scroll to appropriate section when result updates
  useEffect(() => {
    if (!result) return;

    const timer = window.setTimeout(() => {
      const isMobile = window.innerWidth < 992;
      const targetElement = isMobile ? riskRef.current : plansRef.current;
      if (!targetElement) return;

      const topOffset = isMobile ? 88 : 24;
      const targetTop =
        targetElement.getBoundingClientRect().top + window.scrollY - topOffset;

      window.scrollTo({ top: Math.max(0, targetTop), behavior: "smooth" });
    }, 300);

    return () => window.clearTimeout(timer);
  }, [result]);

  // 2. FETCH AI PRICING FROM BACKEND
  const handleCalculate = async () => {
    if (!formData.zone) {
      setError("Please ensure your city is set in your profile.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

      const response = await fetch(`${apiUrl}/api/calculate-premium`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city: formData.zone,
          platform: formData.platform,
          deliveries: Number(formData.dailyDeliveries),
        }),
      });

      if (!response.ok) throw new Error("Failed to connect to AI Risk Engine.");

      const data = await response.json();
      setResult(normalizeResult(data));
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleBuyPremium = () => {
    navigate("/premium");
  };

  // Show a loading state while we fetch their city from Firebase
  if (fetchingUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
        <p className="text-slate-500 animate-pulse">
          Syncing Hyper-local Data...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 border border-cyan-500/20 dark:border-cyan-500/30 mb-4">
            <CalcIcon className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span className="text-sm font-medium text-cyan-700 dark:text-cyan-300">
              AI Risk Calculator
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Calculate Your{" "}
            <span className="bg-gradient-to-r from-cyan-600 to-emerald-600 bg-clip-text text-transparent">
              AI Risk Premium
            </span>
          </h1>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Inputs Section */}
          <div className="bg-white dark:bg-slate-900/50 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-xl">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold">Your Details</h2>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Daily Deliveries
                  </label>
                  <input
                    type="number"
                    value={formData.dailyDeliveries}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dailyDeliveries: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Platform
                  </label>
                  <select
                    value={formData.platform}
                    onChange={(e) =>
                      setFormData({ ...formData, platform: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                  >
                    <option value="Zomato">Zomato</option>
                    <option value="Swiggy">Swiggy</option>
                    <option value="Blinkit">Blinkit</option>
                    <option value="Zepto">Zepto</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Primary Zone (State / UT)
                </label>
                <LocationSearchSelect
                  value={formData.zone}
                  onChange={(zone) => setFormData({ ...formData, zone })}
                  options={cities}
                  placeholder="Search and select your state/UT"
                  className="w-full"
                />
              </div>

              <button
                onClick={handleCalculate}
                disabled={!formData.zone || loading}
                className="w-full px-6 py-4 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {loading
                  ? "Consulting AI Risk Engine..."
                  : "Generate AI Risk Profile"}
                {!loading && <ArrowRight className="w-5 h-5" />}
              </button>

              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" /> {error}
                </div>
              )}
            </div>
          </div>

          {/* AI Factor Breakdown Section */}
          <div
            ref={riskRef}
            className="scroll-mt-24 bg-white dark:bg-slate-900/50 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-xl">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold">Risk Assessment</h2>
            </div>

            {!result ? (
              <div className="space-y-4 opacity-50">
                <p className="text-slate-500 italic">
                  Complete the form to see hyper-local risk factors...
                </p>
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4 animate-pulse"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2 animate-pulse"></div>
              </div>
            ) : (
              <div className="animate-in fade-in duration-500">
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-center">
                    <p className="text-xs text-slate-500">Temp</p>
                    <p className="font-bold">{result.liveData.temp}°C</p>
                  </div>
                  <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-center">
                    <p className="text-xs text-slate-500">Rain Prob</p>
                    <p className="font-bold">{result.liveData.rainProb}%</p>
                  </div>
                  <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-center">
                    <p className="text-xs text-slate-500">AQI</p>
                    <p className="font-bold">{result.liveData.aqi}</p>
                  </div>
                </div>

                <div className="mb-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/40 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Current Risk Level
                    </p>
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded-full ${
                        riskLevel === "High"
                          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                          : riskLevel === "Medium"
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                            : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                      }`}
                    >
                      {riskLevel}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {activeTriggerLabels.length > 0 ? (
                      activeTriggerLabels.map((label) => (
                        <span
                          key={label}
                          className="text-xs px-2.5 py-1 rounded-full border border-amber-300/80 dark:border-amber-700/60 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300"
                        >
                          {label} trigger active
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        No extreme triggers active right now.
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase text-slate-500">
                    Pricing And Risk Factors
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Premium is driven entirely by live rain, heat, and AQI
                    disruption signals.
                  </p>
                  <div className="flex justify-between items-center text-sm p-2 rounded-lg bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-700/50">
                    <span className="flex items-center gap-2 font-medium text-cyan-800 dark:text-cyan-200">
                      <CheckCircle className="w-4 h-4 text-cyan-600 dark:text-cyan-300" />
                      Live Risk Score
                    </span>
                    <span className="font-mono font-bold text-cyan-700 dark:text-cyan-300">
                      {result.liveRiskScore}/100
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                    <span className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      Live disruption surcharge
                    </span>
                    <span className="font-mono font-bold text-amber-500">
                      +₹{result.liveSurcharge}/week
                    </span>
                  </div>
                  {riskReasonItems.length > 0 ? (
                    riskReasonItems.map((item, idx: number) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center text-sm p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40"
                      >
                        <span className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-500" />{" "}
                          {item.factor}
                        </span>
                        <span
                          className={`font-mono font-bold ${item.impact.startsWith("-") ? "text-emerald-500" : item.impact === "₹0" || item.impact === "+₹0" ? "text-slate-500" : "text-amber-500"}`}
                        >
                          {item.impact}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="flex justify-between items-center text-sm p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                      <span className="text-slate-500 dark:text-slate-400">
                        No additional live surcharge currently.
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Pricing Cards Section */}
        {result && (
          <div
            ref={plansRef}
            className="scroll-mt-10 animate-in fade-in slide-in-from-bottom-4 duration-700"
          >
            <div className="mb-6 rounded-2xl border border-cyan-200 bg-cyan-50 p-4 sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-700">
                    Next step
                  </p>
                  <p className="mt-1 text-sm text-cyan-900">
                    Your premium is calculated. Continue to the Premium Plans
                    page to buy or upgrade.
                  </p>
                </div>
                <button
                  onClick={handleBuyPremium}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
                >
                  Buy Premium
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-center mb-8">
              Personalized Protection Plans
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {plans.map((plan) => {
                const finalPriceResult = calculateFinalPrice({
                  basePrice: plan.basePrice,
                  liveData: result.liveData,
                  duration: 1,
                });

                return (
                  <div
                    key={plan.name}
                    className={`relative bg-white dark:bg-slate-900/50 backdrop-blur-sm rounded-2xl shadow-xl border-2 p-8 transition-all hover:scale-105 ${
                      plan.popular
                        ? "border-cyan-500"
                        : "border-slate-200 dark:border-slate-800"
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white text-sm font-bold rounded-full">
                        MOST POPULAR
                      </div>
                    )}
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-4xl font-bold text-cyan-600 dark:text-cyan-400">
                          ₹{finalPriceResult.weeklyPremium}
                        </span>
                        <span className="text-slate-600 dark:text-slate-400">
                          {plan.period}
                        </span>
                      </div>

                      {/* ── "Why this price?" micro-breakdown ── */}
                      <div className="mt-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-3">
                        <div className="flex items-center justify-center gap-1 mb-2">
                          <Info className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                          <p className="text-[10px] font-bold uppercase tracking-wide text-cyan-700 dark:text-cyan-300">
                            Why this price?
                          </p>
                        </div>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between text-slate-600 dark:text-slate-300">
                            <span>Base ({plan.name.split(" ").pop()})</span>
                            <span className="font-mono font-semibold">₹{plan.basePrice}</span>
                          </div>
                          <div className="flex justify-between text-amber-600 dark:text-amber-400">
                            <span>Env. Surcharge</span>
                            <span className="font-mono font-semibold">+₹{finalPriceResult.liveSurcharge}</span>
                          </div>
                          <div className="border-t border-dashed border-slate-300 dark:border-slate-600 pt-1 flex justify-between font-bold text-slate-900 dark:text-white">
                            <span>Total</span>
                            <span className="font-mono">₹{finalPriceResult.weeklyPremium}/wk</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3 mb-8">
                      {plan.features.map((f, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5" />{" "}
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={handleBuyPremium}
                      className={`w-full px-6 py-3 rounded-xl font-bold transition-all ${
                        plan.popular
                          ? "bg-gradient-to-r from-cyan-500 to-emerald-500 text-white hover:shadow-lg"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700"
                      }`}
                    >
                      Buy Premium
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Calculator;
