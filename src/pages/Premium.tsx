import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Award,
  Zap,
  ChevronRight,
  MapPin,
  Shield,
  Lock,
} from "lucide-react";
import { useUserProfile } from "../hooks/useUserProfile";
import { useState, useMemo } from "react";

// City price multipliers based on operational costs and urban density
const CITY_MULTIPLIERS: { [key: string]: number } = {
  Delhi: 1.15,
  Mumbai: 1.2,
  Bangalore: 1.18,
  Hyderabad: 1.1,
  Chennai: 1.08,
  Kolkata: 1.05,
  Pune: 1.12,
  Ahmedabad: 1.06,
};

// Base prices (in INR) - extracted from the original plans data
const BASE_PRICES = {
  basic: 35,
  standard: 50,
  premium: 90,
};

// Extended plan data with IDs and hierarchy
const PLAN_DATA = [
  {
    id: "basic",
    name: "GigShield Basic",
    basePrice: 35,
    features: [
      "Maximum payout: ₹350/week",
      "Capped at ₹150/day",
      "Covers: Rain, Heat, AQI & Curfews",
      "Zero manual paperwork",
      "Dynamic premium adjustments",
    ],
    order: 1,
  },
  {
    id: "standard",
    name: "GigShield Standard",
    basePrice: 50,
    features: [
      "Maximum payout: ₹600/week",
      "Capped at ₹250/day",
      "Covers: Rain, Heat, AQI & Curfews",
      "Instant payout via Razorpay",
      "Adaptive friction protection",
    ],
    order: 2,
  },
  {
    id: "premium",
    name: "GigShield Premium",
    basePrice: 90,
    features: [
      "Maximum payout: ₹1000/week",
      "Capped at ₹400/day",
      "Covers: Rain, Heat, AQI & Curfews",
      "Priority instant payout",
      "Multi-dimensional presence verification",
    ],
    order: 3,
  },
];

const getPlanHierarchy = (planId: string): number => {
  const plan = PLAN_DATA.find((p) => p.id === planId);
  return plan?.order ?? 0;
};

const Premium = () => {
  const { profile, loadingProfile } = useUserProfile();
  const navigate = useNavigate();
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  // Extract user data with fallbacks
  const city = profile?.city || "Unknown City";
  const trustScore = profile?.trustScore ?? 85;
  const activePlanId = profile?.activePlan?.toLowerCase() || null;
  const activePlanName = profile?.activePlanName || "No Active Plan";
  const isDemoUser = profile?.uid?.startsWith("demo_");

  // Calculate city multiplier
  const cityMultiplier =
    city && CITY_MULTIPLIERS[city] ? CITY_MULTIPLIERS[city] : 1.0;

  // Calculate dynamic prices based on city
  const dynamicPrices = useMemo(() => {
    return {
      basic: Math.round(BASE_PRICES.basic * cityMultiplier),
      standard: Math.round(BASE_PRICES.standard * cityMultiplier),
      premium: Math.round(BASE_PRICES.premium * cityMultiplier),
    };
  }, [cityMultiplier]);

  // Get pricing summary for display
  const pricingSummary = useMemo(() => {
    const avgPrice = Math.round(
      (dynamicPrices.basic + dynamicPrices.standard + dynamicPrices.premium) /
        3,
    );
    const maxPrice = Math.max(
      dynamicPrices.basic,
      dynamicPrices.standard,
      dynamicPrices.premium,
    );
    return { avgPrice, maxPrice };
  }, [dynamicPrices]);

  // Determine plan action button text and state
  const getPlanButtonState = (planId: string) => {
    if (!activePlanId) {
      return { text: "Get Plan", enabled: true, type: "purchase" as const };
    }

    const activePlanHierarchy = getPlanHierarchy(activePlanId);
    const currentPlanHierarchy = getPlanHierarchy(planId);

    if (planId === activePlanId) {
      return { text: "Manage Premium", enabled: true, type: "manage" as const };
    }

    if (currentPlanHierarchy < activePlanHierarchy) {
      return {
        text: `${activePlanName} is already active`,
        enabled: false,
        type: "downgrade" as const,
      };
    }

    return { text: "Upgrade Now", enabled: true, type: "upgrade" as const };
  };

  const fadeUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4 },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-cyan-50 via-slate-50 to-emerald-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAwMDAiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDE2em0wLTEwdjJIMjR2LTJoMTZ6bTAtMTB2MkgyNHYtMmgxNnoiLz48L2c+PC9nPjwvc3ZnPg==')] dark:opacity-20 -z-10" />

      {/* Decorative Gradient Blobs */}
      <div className="absolute top-40 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-20 left-1/3 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] -z-10" />

      <div className="relative">
        {/* Header Section with City Pricing Summary */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="pt-8 sm:pt-12 px-4 sm:px-6 lg:px-8"
        >
          <div className="max-w-7xl mx-auto">
            {/* Top Nav - Back Button */}
            <motion.div {...fadeUp} className="mb-8 sm:mb-12">
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium transition-all duration-300 hover:shadow-md text-sm sm:text-base"
              >
                ← Back to Home
              </Link>
            </motion.div>

            {/* Main Header Layout */}
            <div className="grid lg:grid-cols-2 gap-8 items-start mb-12 sm:mb-16">
              {/* Left: Main Heading */}
              <motion.div {...fadeUp} className="order-1">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white leading-[1.1] tracking-tight mb-6">
                  Choose Your
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-sky-500 to-emerald-500">
                    Protection Plan
                  </span>
                </h1>
                <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed font-medium max-w-lg">
                  Flexible coverage tailored to your city and risk profile. No
                  upfront costs—pay only when protection activates.
                </p>
              </motion.div>

              {/* Right: Pricing Summary Card */}
              <motion.div {...fadeUp} className="order-2 lg:order-2">
                <div className="relative overflow-hidden rounded-[28px] border border-white/60 dark:border-slate-700/60 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl p-6 sm:p-8 shadow-xl hover:shadow-2xl transition-all duration-300">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl -z-10" />

                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 bg-cyan-500/10 rounded-xl">
                      <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Pricing for {city}
                    </h3>
                  </div>

                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-end justify-between">
                      <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
                        Base Coverage Start
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
                          ₹{dynamicPrices.basic}
                        </span>
                        <span className="text-xs text-slate-500">/week</span>
                      </div>
                    </div>

                    <div className="h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-600 to-transparent" />

                    <div className="flex items-end justify-between">
                      <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
                        Premium Option
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl sm:text-3xl font-black text-cyan-600 dark:text-cyan-400">
                          ₹{dynamicPrices.premium}
                        </span>
                        <span className="text-xs text-slate-500">/week</span>
                      </div>
                    </div>
                  </div>

                  <p className="mt-4 sm:mt-6 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Prices automatically adjust based on {city}'s operational
                    costs and risk factors. {isDemoUser && "(Demo Mode)"}
                  </p>
                </div>
              </motion.div>
            </div>

            {/* User Stats Sub-Header */}
            <motion.div
              {...fadeUp}
              className="mb-12 sm:mb-16 rounded-[20px] border border-slate-200/60 dark:border-slate-700/60 bg-white/40 dark:bg-slate-900/40 backdrop-blur-lg p-5 sm:p-6"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 sm:gap-8">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-500/10 rounded-xl">
                    <MapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wide">
                      Operating City
                    </p>
                    <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                      {city}
                      <Lock className="inline-block w-4 h-4 ml-2 text-slate-500" />
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-500/10 rounded-xl">
                    <Award className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wide">
                      Trust Score
                    </p>
                    <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                      {trustScore}/100
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div
                    className={`p-2.5 rounded-xl ${activePlanId ? "bg-cyan-500/10" : "bg-slate-200 dark:bg-slate-700"}`}
                  >
                    <Shield
                      className={`w-5 h-5 ${activePlanId ? "text-cyan-600 dark:text-cyan-400" : "text-slate-400"}`}
                    />
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wide">
                      Plan Status
                    </p>
                    <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                      {activePlanId ? activePlanName : "No Plan"}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Plan Cards Section */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="px-4 sm:px-6 lg:px-8 pb-20"
        >
          <div className="max-w-7xl mx-auto">
            {/* Section Label */}
            <motion.div {...fadeUp} className="mb-8 sm:mb-12">
              <span className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-xs sm:text-sm font-bold uppercase tracking-[0.1em] text-cyan-700 dark:text-cyan-300">
                <Zap className="w-4 h-4" />
                Flexible Plans
              </span>
            </motion.div>

            {/* Plans Grid */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid md:grid-cols-3 gap-5 sm:gap-6 lg:gap-7"
            >
              {PLAN_DATA.map((plan) => {
                const buttonState = getPlanButtonState(plan.id);
                const calculatedPrice =
                  dynamicPrices[plan.id as keyof typeof dynamicPrices];
                const isActive = plan.id === activePlanId;

                return (
                  <motion.div
                    key={plan.id}
                    {...fadeUp}
                    whileHover={isActive ? {} : { y: -4 }}
                    className="relative group h-full"
                  >
                    {/* Card Background */}
                    <div
                      className={`relative h-full rounded-[32px] border transition-all duration-300 overflow-hidden ${
                        isActive
                          ? "border-cyan-500/60 bg-white dark:bg-slate-950 shadow-2xl ring-2 ring-cyan-500/30"
                          : "border-slate-200/60 dark:border-slate-700/60 bg-white/60 dark:bg-slate-900/50 shadow-lg hover:shadow-2xl hover:border-cyan-300/40 dark:hover:border-cyan-600/30"
                      }`}
                    >
                      {/* Top Border Gradient */}
                      <div
                        className={`absolute top-0 inset-x-0 h-1.5 transition-transform duration-500 ${
                          isActive
                            ? "bg-gradient-to-r from-cyan-400 via-emerald-400 to-cyan-400"
                            : "bg-gradient-to-r from-slate-300 to-slate-200 dark:from-slate-600 dark:to-slate-500 group-hover:from-cyan-400 group-hover:to-emerald-400"
                        }`}
                      />

                      {/* Active Indicator */}
                      {isActive && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-cyan-500 text-white text-[10px] font-black uppercase rounded-full shadow-lg tracking-wider">
                          Current Plan
                        </div>
                      )}

                      {/* Popular Badge */}
                      {plan.id === "standard" && !isActive && (
                        <div className="absolute -top-3 right-6 px-3 py-1 bg-amber-400 text-slate-900 text-[10px] font-black uppercase rounded-full shadow-md tracking-wider">
                          Most Popular
                        </div>
                      )}

                      {/* Card Content */}
                      <div className="relative z-10 h-full flex flex-col p-6 sm:p-8">
                        {/* Plan Name */}
                        <div className="mb-4 sm:mb-6">
                          <h3
                            className={`text-xl sm:text-2xl font-black tracking-tight transition-colors duration-300 ${
                              isActive
                                ? "text-slate-900 dark:text-white"
                                : "text-slate-900 dark:text-white"
                            }`}
                          >
                            {plan.name}
                          </h3>
                        </div>

                        {/* Features List - Left Side */}
                        <div className="flex-1 mb-6 sm:mb-8">
                          <div className="space-y-2.5 sm:space-y-3">
                            {plan.features.map((feature) => (
                              <div
                                key={feature}
                                className="flex gap-2.5 items-start"
                              >
                                <Check
                                  className={`w-5 h-5 flex-shrink-0 mt-0.5 transition-colors duration-300 ${
                                    isActive
                                      ? "text-emerald-600 dark:text-emerald-400"
                                      : "text-emerald-500/70 dark:text-emerald-500/60"
                                  }`}
                                />
                                <span
                                  className={`text-xs sm:text-sm leading-snug transition-colors duration-300 ${
                                    isActive
                                      ? "text-slate-700 dark:text-slate-200"
                                      : "text-slate-600 dark:text-slate-300"
                                  }`}
                                >
                                  {feature}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Right Section: Price & CTA */}
                        <div className="space-y-4 sm:space-y-5">
                          {/* Price Box */}
                          <div
                            className={`rounded-[16px] p-4 sm:p-5 transition-all duration-300 ${
                              isActive
                                ? "bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-100 dark:border-cyan-500/30"
                                : "bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-700"
                            }`}
                          >
                            <div className="flex items-end justify-between mb-2">
                              <span className="text-xs text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wide">
                                City-Adjusted
                              </span>
                              {calculatedPrice !==
                                BASE_PRICES[
                                  plan.id as keyof typeof BASE_PRICES
                                ] && (
                                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                                  +{Math.round((cityMultiplier - 1) * 100)}%
                                </span>
                              )}
                            </div>

                            <div className="flex items-baseline gap-2 mb-2">
                              {calculatedPrice !==
                                BASE_PRICES[
                                  plan.id as keyof typeof BASE_PRICES
                                ] && (
                                <span className="text-sm font-semibold text-slate-400 line-through">
                                  ₹
                                  {
                                    BASE_PRICES[
                                      plan.id as keyof typeof BASE_PRICES
                                    ]
                                  }
                                </span>
                              )}
                              <span
                                className={`text-3xl sm:text-4xl font-black transition-colors duration-300 ${
                                  isActive
                                    ? "text-cyan-600 dark:text-cyan-400"
                                    : "text-slate-900 dark:text-white"
                                }`}
                              >
                                ₹{calculatedPrice}
                              </span>
                            </div>
                            <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400">
                              per week
                            </p>
                          </div>

                          {/* CTA Button */}
                          <motion.button
                            whileTap={
                              buttonState.enabled ? { scale: 0.95 } : {}
                            }
                            onClick={() => {
                              if (
                                buttonState.enabled &&
                                buttonState.type === "purchase"
                              ) {
                                setSelectedPlanId(plan.id);
                              }
                            }}
                            disabled={!buttonState.enabled}
                            className={`w-full py-3 sm:py-4 px-4 rounded-[14px] font-bold text-sm sm:text-base transition-all duration-300 flex items-center justify-center gap-2 ${
                              buttonState.enabled
                                ? isActive
                                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:shadow-lg hover:-translate-y-0.5"
                                  : "bg-gradient-to-r from-cyan-500 to-emerald-500 text-white hover:shadow-xl hover:-translate-y-0.5"
                                : "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                            }`}
                          >
                            {buttonState.text}
                            {buttonState.enabled && (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Info Box */}
            <motion.div
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.4 }}
              className="mt-12 sm:mt-16 rounded-[24px] border border-slate-200/60 dark:border-slate-700/60 bg-white/50 dark:bg-slate-900/30 backdrop-blur-lg p-6 sm:p-8"
            >
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="p-2.5 bg-blue-500/10 rounded-xl flex-shrink-0">
                  <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-2 text-sm sm:text-base">
                    How Pricing Works
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    Your base premiums are automatically adjusted for {city}{" "}
                    based on operational costs and local risk factors. This
                    ensures you pay fairly for protection tailored to your exact
                    location. Prices update in real-time based on changing
                    conditions.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>
      </div>

      {/* Loading State */}
      {loadingProfile && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-slate-900 rounded-xl px-6 py-8 shadow-xl">
            <div className="w-8 h-8 border-2 border-slate-300 dark:border-slate-600 border-t-cyan-500 rounded-full animate-spin" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Premium;
