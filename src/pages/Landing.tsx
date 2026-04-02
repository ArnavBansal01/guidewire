import { Link, useLocation } from "react-router-dom";
import {
  Shield,
  Zap,
  Plug,
  Activity,
  Check,
  Star,
  CloudRain,
  AlertTriangle,
  Thermometer,
  Wind,
  X,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { plans } from "../data/plans";
import { partners } from "../data/partners";
import { useAuth } from "../contexts/AuthContext";

const defaultFadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: false, margin: "-20px" },
  transition: { duration: 0.4, ease: "easeOut" },
} as const;

type AnimatedStatValueProps = {
  target: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
  useThousandsSeparator?: boolean;
  isActive: boolean;
};

const AnimatedStatValue = ({
  target,
  prefix = "",
  suffix = "",
  decimals = 0,
  duration = 2200,
  useThousandsSeparator = false,
  isActive,
}: AnimatedStatValueProps) => {
  const [currentValue, setCurrentValue] = useState(0);

  useEffect(() => {
    if (!isActive) {
      setCurrentValue(0);
      return;
    }

    let frameId = 0;
    const startTime = performance.now();

    const animate = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      setCurrentValue(target * easedProgress);

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      }
    };

    frameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frameId);
  }, [isActive, target, duration]);

  const formattedValue = useThousandsSeparator
    ? currentValue.toLocaleString("en-IN", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })
    : currentValue.toFixed(decimals);

  return (
    <>
      {prefix}
      {formattedValue}
      {suffix}
    </>
  );
};

const Landing = () => {
  const { user } = useAuth();
  const stats = [
    {
      label: "Average Payout Time",
      target: 60,
      prefix: "< ",
      suffix: " Seconds",
      decimals: 0,
      useThousandsSeparator: false,
    },
    {
      label: "Workers Covered",
      target: 12810,
      suffix: "+",
      decimals: 0,
      useThousandsSeparator: true,
    },
    {
      label: "Claim Approval Rate",
      target: 99.6,
      suffix: "%",
      decimals: 1,
      useThousandsSeparator: false,
    },
  ];

  const steps = [
    {
      icon: Plug,
      title: "Sync Data Sources",
      desc: "Securely link your active gig economy accounts in under 60 seconds.",
    },
    {
      icon: Activity,
      title: "Autonomous Monitoring",
      desc: "Our systems track environmental and infrastructure variables in real-time.",
    },
    {
      icon: Zap,
      title: "Rapid Settlement",
      desc: "Disruptions trigger direct-to-bank settlements without any manual claim filing.",
    },
  ];

  const sanitizeLogoName = (n: string) =>
    n
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/[^a-z0-9]/g, "");

  const platforms = partners
    .filter((p) => p && p.toLowerCase() !== "other")
    .map((name) => ({ name, logo: `/logos/${sanitizeLogoName(name)}.png` }));

  const triggers = [
    {
      icon: CloudRain,
      label: "Intense Rainfall",
      color: "text-blue-500",
      bg: "bg-white/80 dark:bg-slate-900/80",
      border: "border-blue-100 dark:border-blue-900/40",
      desc: "Rainfall exceeding 15mm/hr in your delivery zone.",
    },
    {
      icon: AlertTriangle,
      label: "Emergency Curfews",
      color: "text-red-500",
      bg: "bg-white/80 dark:bg-slate-900/80",
      border: "border-red-100 dark:border-red-900/40",
      desc: "Government-mandated movement restrictions.",
    },
    {
      icon: Thermometer,
      label: "Severe Heatwave",
      color: "text-amber-500",
      bg: "bg-white/80 dark:bg-slate-900/80",
      border: "border-amber-100 dark:border-amber-900/40",
      desc: "Temperature peaks crossing 42°C for safety.",
    },
    {
      icon: Wind,
      label: "Critical Air Quality",
      color: "text-purple-500",
      bg: "bg-white/80 dark:bg-slate-900/80",
      border: "border-purple-100 dark:border-purple-900/40",
      desc: "AQI levels crossing the hazardous 400+ mark.",
    },
  ];
  const testimonials = [
    {
      name: "Sunita Rao",
      role: "Partner · Swiggy",
      image: "/indian_gig_worker_2.png",
      quote:
        "Intense rainfall exceeding 15mm/hr flooded my route. I was worried about my earnings, but GigShield detected the weather data and paid me ₹380 instantly.",
      amount: "₹380 received",
      reason: "Intense Rainfall",
    },
    {
      name: "Vikram Singh",
      role: "Partner · Uber",
      image: "/indian_gig_worker_1.png",
      quote:
        "An emergency curfew was declared at 6 PM. I couldn't finish my evening shift, but ₹400 was credited to my wallet before midnight.",
      amount: "₹400 received",
      reason: "Emergency Curfew",
    },
    {
      name: "Karan Mehra",
      role: "Partner · Zomato",
      image: "/indian_gig_worker_3.png",
      quote:
        "The severe heatwave crossed 42°C, and it wasn't safe to ride. GigShield's live monitoring confirmed the temperature and sent ₹320 right away.",
      amount: "₹320 received",
      reason: "Severe Heatwave",
    },
  ];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const statsSectionRef = useRef<HTMLDivElement | null>(null);
  const statsInView = useInView(statsSectionRef, { once: true, amount: 0.35 });
  const location = useLocation();

  useEffect(() => {
    const storedScroll = sessionStorage.getItem("landingScrollY");
    if (storedScroll) {
      window.scrollTo({ top: Number(storedScroll), behavior: "auto" });
      sessionStorage.removeItem("landingScrollY");
    }
  }, []);

  useEffect(() => {
    if (location.hash === "#plans") {
      setIsModalOpen(true);
      document.body.style.overflow = "hidden";
    } else {
      setIsModalOpen(false);
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [location.hash]);

  const closeModal = () => {
    window.location.hash = "";
    setIsModalOpen(false);
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Global Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 via-emerald-50 to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 -z-10" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAwMDAiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDE2em0wLTEwdjJIMjR2LTJoMTZ6bTAtMTB2MkgyNHYtMmgxNnoiLz48L2c+PC9nPjwvc3ZnPg==')] dark:opacity-20 -z-10" />

      {/* Hero Section */}
      <section className="relative pt-2 pb-12 lg:pt-4 lg:pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Left Side: Text & CTA */}
            <div className="text-left order-2 lg:order-1 flex flex-col items-center lg:items-start">
              <div className="w-full flex justify-center lg:justify-start">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 border border-cyan-500/20 dark:border-cyan-500/30 mb-8">
                  <Shield className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  <span className="text-sm font-medium text-cyan-700 dark:text-cyan-300">
                    Autonomous Income Protection
                  </span>
                </div>
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-6xl xl:text-7xl font-black mb-6 leading-[1.05] tracking-tighter text-slate-900 dark:text-white text-center lg:text-left">
                Shield your earnings. <br />
                Smart. Simple. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-emerald-500">
                  Instant.
                </span>
              </h1>

              <p className="text-lg sm:text-xl lg:text-base xl:text-lg text-slate-600 dark:text-slate-300 mb-8 max-w-xl leading-relaxed font-medium text-center lg:text-left">
                Platforms pause. Weather turns. GigShield settles instantly.{" "}
                <br className="hidden sm:block" />
                Real-world triggers activate payouts automatically, no forms, no
                follow-ups. Activate protection in under 60 seconds.
              </p>

              <div className="space-y-4 mb-12 w-full max-w-md lg:max-w-none px-4 lg:px-0">
                {[
                  "Compatible with India's leading delivery and mobility apps",
                  "Always-on trigger monitoring with instant payout automation",
                  "Flexible plans with transparent weekly pricing",
                ].map((benefit, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center">
                      <Zap className="w-4 h-4 text-emerald-500" />
                    </div>
                    <span className="text-slate-600 dark:text-slate-300 font-medium">
                      {benefit}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-4 items-center justify-center lg:justify-start w-full">
                {!user ? (
                  <Link
                    to="/register"
                    className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all text-lg text-center"
                  >
                    Get Protected Now
                  </Link>
                ) : (
                  <Link
                    to="/dashboard"
                    className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all text-lg text-center"
                  >
                    Go to Dashboard
                  </Link>
                )}
                <button
                  onClick={() =>
                    document
                      .getElementById("how-it-works")
                      ?.scrollIntoView({ behavior: "smooth", block: "center" })
                  }
                  className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold rounded-lg shadow hover:shadow-lg transition-all border border-slate-200 dark:border-slate-700 flex items-center justify-center text-lg"
                >
                  See How It Works
                </button>
              </div>
            </div>

            {/* Right Side: Delivery Boy Image (Hidden on Mobile) */}
            <div className="hidden lg:flex order-1 lg:order-2 justify-center lg:translate-x-12 lg:translate-y-12">
              <motion.div
                initial={{ opacity: 0, scale: 0.8, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative"
              >
                <div className="absolute -inset-10 bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 rounded-full blur-[80px] -z-10" />
                <img
                  src="/delivery_boy.png"
                  alt="Delivery Professional"
                  className="w-full max-w-[400px] h-auto rounded-xl object-contain drop-shadow-lg"
                />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 px-4">
        <div ref={statsSectionRef} className="max-w-7xl mx-auto">
          <motion.div
            {...defaultFadeUp}
            className="flex flex-row justify-between sm:grid sm:grid-cols-3 gap-2 sm:gap-8 text-center"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="flex-1 p-2 sm:p-6 min-w-0 rounded-2xl border border-transparent bg-transparent transition-all duration-300 hover:shadow-lg hover:bg-white/60 dark:hover:bg-slate-900/50 hover:border-cyan-300/40 dark:hover:border-cyan-600/30 cursor-pointer"
              >
                <div className="text-xl sm:text-5xl font-black bg-gradient-to-r from-cyan-600 to-emerald-600 bg-clip-text text-transparent mb-1 sm:mb-2 whitespace-nowrap">
                  <AnimatedStatValue
                    target={stat.target}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                    decimals={stat.decimals}
                    useThousandsSeparator={stat.useThousandsSeparator}
                    isActive={statsInView}
                  />
                </div>
                <div className="text-[8px] sm:text-base text-slate-600 dark:text-slate-400 font-bold uppercase tracking-tight">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        id="how-it-works"
        className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            {...defaultFadeUp}
            className="relative text-center mb-14 sm:mb-20"
          >
            <div className="absolute inset-0 -z-10">
              <div className="absolute left-1/2 top-8 h-44 w-44 -translate-x-[130%] rounded-full bg-cyan-400/20 blur-3xl" />
              <div className="absolute right-1/2 top-6 h-44 w-44 translate-x-[130%] rounded-full bg-emerald-400/20 blur-3xl" />
            </div>

            <div className="mx-auto max-w-4xl rounded-[28px] border border-white/50 dark:border-slate-700/50 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl px-6 py-8 sm:px-10 sm:py-12 shadow-[0_24px_80px_-28px_rgba(15,23,42,0.35)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_30px_90px_-30px_rgba(14,116,144,0.45)] hover:border-cyan-300/40 dark:hover:border-cyan-500/30">
              <span className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-cyan-700 dark:text-cyan-300">
                How It Works
              </span>

              <h2 className="mt-5 text-4xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.05]">
                Our Protection{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-sky-500 to-emerald-500">
                  Architecture
                </span>
              </h2>

              <p className="mt-5 text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed font-medium">
                Connect once, and GigShield does the rest, monitoring risk in
                real time, validating triggers instantly, and sending payouts
                automatically.
              </p>

              <div className="mt-7 flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300">
                <span className="rounded-full border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/70 px-3.5 py-1.5">
                  Always-On Monitoring
                </span>
                <span className="rounded-full border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/70 px-3.5 py-1.5">
                  Real-Time Triggers
                </span>
                <span className="rounded-full border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/70 px-3.5 py-1.5">
                  Instant Settlements
                </span>
              </div>
            </div>
          </motion.div>

          {/* Desktop: Horizontal Layout, Mobile: Vertical Layout */}
          <motion.div
            {...defaultFadeUp}
            transition={{ ...defaultFadeUp.transition, delay: 0.2 }}
            className="relative flex flex-col md:flex-row gap-8 lg:gap-12"
          >
            {steps.map((step, index) => (
              <div key={index} className="flex-1 relative group">
                <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/50 p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 h-full z-10 relative group-hover:-translate-y-1 group-hover:border-cyan-300/50 dark:group-hover:border-cyan-600/40">
                  <div className="w-14 h-14 bg-gradient-to-br from-cyan-500/10 to-emerald-500/10 dark:from-cyan-500/20 dark:to-emerald-500/20 rounded-xl flex items-center justify-center mb-6 text-cyan-600 dark:text-cyan-400 group-hover:scale-110 transition-transform">
                    <step.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 italic tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                    {step.desc}
                  </p>
                </div>
                {/* Connectors (hidden on small screens, shown between cards on large screens) */}
                {index < steps.length - 1 && (
                  <div
                    className="hidden md:block absolute top-1/2 -right-6 lg:-right-8 w-12 lg:w-16 h-0.5 border-t-2 border-dashed border-cyan-400 dark:border-cyan-600 animate-pulse z-0"
                    style={{ transform: "translateY(-50%)" }}
                  />
                )}
                {/* Mobile Connector (visible only on small screens) */}
                {index < steps.length - 1 && (
                  <div className="md:hidden w-0.5 h-8 border-l-2 border-dashed border-cyan-400 dark:border-cyan-600 animate-pulse mx-auto mt-4" />
                )}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Supported Platforms Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white/30 via-cyan-50/40 to-emerald-50/40 dark:from-slate-950/10 dark:via-slate-900/20 dark:to-slate-900/10" />
        <div className="absolute left-1/2 top-1/2 -z-10 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/10 blur-[120px]" />

        <motion.div {...defaultFadeUp} className="max-w-6xl mx-auto">
          <div className="rounded-[34px] border border-white/60 dark:border-slate-700/50 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl px-6 py-10 sm:px-10 sm:py-14 shadow-[0_28px_90px_-34px_rgba(14,116,144,0.45)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_34px_96px_-34px_rgba(14,116,144,0.55)] hover:border-cyan-300/40 dark:hover:border-cyan-500/30">
            <div className="text-center mb-10 sm:mb-12">
              <span className="inline-flex items-center rounded-full border border-emerald-500/25 bg-emerald-500/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-700 dark:text-emerald-300">
                Platform Integrations
              </span>
              <h3 className="mt-5 text-4xl sm:text-5xl font-black tracking-tight leading-[1.08] text-slate-900 dark:text-white">
                Our Supported{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-emerald-500">
                  Ecosystems
                </span>
              </h3>
              <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed font-medium">
                Get reliable protection across India's most active delivery and
                mobility platforms, with one integration and unified risk
                monitoring.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
              {platforms.map((platform, index) => (
                <motion.div
                  key={platform.name}
                  {...defaultFadeUp}
                  transition={{
                    ...defaultFadeUp.transition,
                    delay: index * 0.05,
                  }}
                  className="group relative"
                >
                  <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 opacity-0 blur transition duration-300 group-hover:opacity-100" />
                  <div className="relative flex items-center justify-center gap-3 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 bg-white/90 dark:bg-slate-900/80 px-4 py-4 sm:px-6 sm:py-5 text-slate-800 dark:text-slate-100 font-bold tracking-tight shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:border-cyan-400/60 group-hover:shadow-lg">
                    <img
                      src={platform.logo}
                      alt={`${platform.name} logo`}
                      className="h-7 sm:h-8 w-auto object-contain bg-white/95 rounded-md p-1"
                      loading="lazy"
                      onError={(e) => {
                        const img = e.currentTarget as HTMLImageElement;
                        // Prevent infinite loop when fallback is missing
                        if ((img.dataset as any).fallback) return;
                        (img.dataset as any).fallback = "1";
                        img.src = "/logos/default.svg";
                      }}
                    />
                    <span className="text-sm sm:text-base">
                      {platform.name}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Triggers Section */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[120px] -z-10" />

        <div className="max-w-7xl mx-auto">
          <motion.div {...defaultFadeUp} className="text-center mb-12 sm:mb-20">
            <h2 className="text-4xl sm:text-6xl font-black mb-4 sm:mb-6 tracking-tight relative inline-block">
              <span className="text-slate-900 dark:text-white">
                Auto-Detection
              </span>
              <span className="block text-emerald-500 dark:text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                Protocols
              </span>
            </h2>
            <p className="text-sm sm:text-xl text-slate-500 max-w-2xl mx-auto mt-4 sm:mt-6 px-4">
              When conditions disrupt your workday, GigShield responds in real
              time. Our engine continuously tracks these signals to protect your
              earnings.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            {triggers.map((trigger, i) => (
              <motion.div
                key={i}
                {...defaultFadeUp}
                transition={{ ...defaultFadeUp.transition, delay: i * 0.1 }}
                className="relative group h-full"
              >
                <div className="absolute -inset-1 bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 rounded-[32px] blur opacity-25 group-hover:opacity-100 transition duration-500" />
                <div className="relative h-full bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/20 dark:border-slate-800/50 p-6 sm:p-10 rounded-[32px] sm:rounded-[32px] flex flex-col items-center text-center gap-4 sm:gap-6 shadow-xl hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-1 group-hover:border-cyan-300/40 dark:group-hover:border-cyan-600/30">
                  <div
                    className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl ${trigger.bg} border ${trigger.border} group-hover:scale-110 transition-transform shadow-inner`}
                  >
                    <trigger.icon
                      className={`w-8 h-8 sm:w-10 sm:h-10 ${trigger.color}`}
                    />
                  </div>
                  <div>
                    <h4 className="text-base sm:text-2xl font-bold text-slate-900 dark:text-white mb-2 sm:mb-3 leading-tight">
                      {trigger.label}
                    </h4>
                    <p className="text-[10px] sm:text-sm text-slate-500 leading-relaxed font-medium">
                      {(trigger as any).desc}
                    </p>
                  </div>
                  <div className="mt-auto pt-2 sm:pt-4 flex items-center gap-2 text-[8px] sm:text-[10px] font-black uppercase tracking-tighter text-emerald-500/60">
                    <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                    Live Monitoring Active
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 bg-slate-50/50 dark:bg-slate-950/20">
        <div className="max-w-7xl mx-auto">
          <motion.div {...defaultFadeUp} className="text-center mb-14 sm:mb-16">
            <span className="text-[10px] sm:text-xs font-bold text-emerald-500 uppercase tracking-[0.3em] mb-4 block">
              Proven Resilience
            </span>
            <h2 className="text-3xl sm:text-5xl font-black mb-6">
              Real Payouts, Real Stories
            </h2>
            <div className="w-16 sm:w-24 h-1 sm:h-1.5 bg-gradient-to-r from-cyan-500 to-emerald-500 mx-auto rounded-full" />
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 sm:gap-8 items-start">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                {...defaultFadeUp}
                transition={{ ...defaultFadeUp.transition, delay: i * 0.1 }}
                className={`p-6 sm:p-7 bg-white dark:bg-slate-900 rounded-[28px] sm:rounded-[32px] border border-slate-200 dark:border-slate-800 text-left flex flex-col relative shadow-lg hover:shadow-2xl hover:-translate-y-1 hover:border-emerald-300/50 dark:hover:border-emerald-600/40 transition-all duration-300`}
              >
                <div className="absolute -top-4 sm:-top-5 left-6 sm:left-7 p-2.5 sm:p-3 bg-slate-900 dark:bg-white rounded-xl sm:rounded-2xl shadow-xl">
                  <Star className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 fill-current" />
                </div>

                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed italic mb-7 sm:mb-8 mt-3 sm:mt-4 font-medium">
                  "{t.quote}"
                </p>

                <div className="flex items-center gap-3 border-t border-slate-100 dark:border-slate-800 pt-5 mt-auto">
                  {(t as any).image ? (
                    <img
                      src={(t as any).image}
                      alt={t.name}
                      className="w-11 h-11 rounded-full object-cover border-2 border-emerald-500/20 shadow-sm"
                    />
                  ) : (
                    <div className="w-11 h-11 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 rounded-full flex-shrink-0" />
                  )}
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white leading-none mb-1">
                      {t.name}
                    </div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-widest font-black">
                      {t.role}
                    </div>
                  </div>
                </div>

                <div className="mt-5 py-2.5 px-4 bg-emerald-500/10 rounded-xl flex items-center justify-between">
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
                    {t.reason} Trigger
                  </span>
                  <span className="text-emerald-500 font-bold">{t.amount}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section - Revamped */}
      <section
        id="about"
        className="py-24 sm:py-40 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] bg-cyan-500/10 rounded-full blur-[150px] translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] bg-emerald-500/10 rounded-full blur-[150px] -translate-x-1/2 translate-y-1/2" />

        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 sm:gap-20 items-center">
            <motion.div {...defaultFadeUp}>
              <h2 className="text-4xl sm:text-7xl font-black mb-6 sm:mb-8 leading-tight">
                Insurance that <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-emerald-500">
                  Doesn't Argue.
                </span>
              </h2>
              <div className="space-y-6 sm:space-y-8 text-lg sm:text-xl text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                <p>
                  Old-school coverage is broken. Why should you file a claim for
                  a storm everyone can see on the radar? Why wait weeks for a
                  human to "verify" what data already knows?
                </p>
                <p className="p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-3xl sm:rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-xl relative transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-cyan-300/50 dark:hover:border-cyan-600/40">
                  <span className="absolute -top-3 -left-3 sm:-top-4 sm:-left-4 text-4xl sm:text-6xl text-cyan-500/20 font-black italic">
                    "
                  </span>
                  GigShield is built on the principle of{" "}
                  <span className="text-slate-900 dark:text-white font-black">
                    Parametric Truth
                  </span>
                  . Our data ecosystem connects directly to your platform's
                  pulse, ensuring you get paid for the hours you intended to
                  work — guaranteed.
                </p>
              </div>
            </motion.div>

            <motion.div
              {...defaultFadeUp}
              transition={{ ...defaultFadeUp.transition, delay: 0.2 }}
              className="grid sm:grid-cols-2 gap-6"
            >
              {[
                {
                  title: "Zero Arguments",
                  desc: "If trigger data confirms disruption in your zone, payouts are processed automatically.",
                },
                {
                  title: "Privacy First",
                  desc: "We verify disruption signals and platform status, not your personal movement history.",
                },
                {
                  title: "Pure Automation",
                  desc: "From trigger detection to settlement initiation, the payout pipeline runs automatically.",
                },
                {
                  title: "Liquidity Pools",
                  desc: "Dedicated reserve pools are designed to support payouts even during large-scale disruptions.",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-cyan-300/50 dark:hover:border-cyan-600/40 transition-all duration-300"
                >
                  <h4 className="text-lg font-black text-slate-900 dark:text-white mb-3 uppercase tracking-tight">
                    {item.title}
                  </h4>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section - Premium Redesign */}
      <section
        id="faq"
        className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-slate-50/30 dark:bg-slate-900/10"
      >
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2" />

        <motion.div {...defaultFadeUp} className="max-w-4xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <span className="text-[10px] sm:text-xs font-black text-cyan-500 uppercase tracking-[0.2em] mb-4 block">
              Knowledge Base
            </span>
            <h2 className="text-3xl sm:text-5xl font-black mb-4 sm:mb-6 tracking-tight">
              Got Questions? <br />
              <span className="text-slate-400">
                Clear Answers, No Fine Print.
              </span>
            </h2>
          </div>

          <div className="grid gap-2.5 sm:gap-3">
            {[
              {
                q: "How does the payout process work?",
                a: "It runs automatically. We monitor weather and platform signals, verify trigger thresholds in your active zone, and initiate payouts without requiring manual claim forms.",
              },
              {
                q: "Is there any upfront cost?",
                a: "No upfront deposit is required. Your selected weekly premium keeps coverage active and is charged through your linked account.",
              },
              {
                q: "What is the average settlement time?",
                a: "Most settlements are initiated to your registered account in under 5 minutes after a verified disruption event.",
              },
              {
                q: "Can I cancel my coverage?",
                a: "Yes. You can cancel anytime. Future deductions stop immediately, while your current active cycle remains covered until it ends.",
              },
            ].map((faq, index) => {
              const isOpen = openFaqIndex === index;

              return (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.01 }}
                  className="group bg-white dark:bg-slate-900 rounded-[18px] sm:rounded-[22px] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-cyan-500/30 transition-all duration-300"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full text-left p-4 sm:p-5"
                    aria-expanded={isOpen}
                  >
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 group-hover:bg-cyan-500/10 transition-colors">
                        <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 group-hover:text-cyan-500 transition-colors" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
                          {faq.q}
                        </h4>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 sm:w-5 sm:h-5 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180 text-cyan-500" : "rotate-0"}`}
                      />
                    </div>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                          className="overflow-hidden"
                        >
                          <p className="pt-3 pl-12 sm:pl-14 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                            {faq.a}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
          <h3 className="text-lg sm:text-2xl font-black mb-8 italic text-slate-400 dark:text-slate-600 text-center max-w-2xl px-4">
            "Ride. Deliver. Earn. GigShield guards every rupee in the
            background."
          </h3>
          <div className="flex flex-row items-center justify-center flex-wrap gap-4 sm:gap-6 mt-4">
            <Link
              to="/terms"
              onClick={() =>
                sessionStorage.setItem("landingScrollY", String(window.scrollY))
              }
              className="text-[10px] sm:text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Terms & Conditions
            </Link>
            <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
            <Link
              to="/privacy"
              onClick={() =>
                sessionStorage.setItem("landingScrollY", String(window.scrollY))
              }
              className="text-[10px] sm:text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>
            <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
            <a
              href="#"
              className="text-[10px] sm:text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Contact Support
            </a>
          </div>
          <p className="text-xs text-slate-400 mt-12">
            © {new Date().getFullYear()} Gigshield Inc. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Plans Modal Overlay */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-slate-900/40 dark:bg-slate-900/60 backdrop-blur-sm"
              onClick={closeModal}
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-5xl bg-white dark:bg-slate-950 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6"
            >
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors z-10"
              >
                <X className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              </button>

              <div className="text-center mb-6 mt-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">
                  Flexible Coverage
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                  Choose your protection
                </h2>
                <p className="text-sm text-slate-500 max-w-xl mx-auto">
                  No upfront payment. Premium deducted only when disruptions
                  trigger your coverage.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-4 lg:gap-5">
                {plans.map((plan, i) => (
                  <div
                    key={i}
                    className={`relative p-5 rounded-[24px] border ${plan.popular ? "bg-slate-900 dark:bg-white border-slate-900 dark:border-white shadow-xl scale-100 md:scale-105 z-10" : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"} flex flex-col items-start text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl`}
                  >
                    {plan.popular && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-amber-400 text-slate-900 text-[10px] font-black uppercase rounded-full">
                        Most Popular
                      </span>
                    )}
                    <span
                      className={`text-[10px] font-bold ${plan.popular ? "text-cyan-400 dark:text-cyan-600" : "text-slate-400"} uppercase mb-1`}
                    >
                      {plan.name}
                    </span>
                    <div className="flex items-baseline gap-1 mb-4">
                      <span
                        className={`text-3xl font-black ${plan.popular ? "text-white dark:text-slate-900" : "text-slate-900 dark:text-white"}`}
                      >
                        {plan.price}
                      </span>
                      <span
                        className={`text-xs ${plan.popular ? "text-slate-400" : "text-slate-500"}`}
                      >
                        /week
                      </span>
                    </div>

                    <div className="space-y-2 mb-6 flex-1 w-full">
                      {plan.features.map((feature, j) => (
                        <div key={j} className="flex gap-2.5">
                          <Check
                            className={`w-4 h-4 flex-shrink-0 ${plan.popular ? "text-emerald-400" : "text-emerald-500"}`}
                          />
                          <span
                            className={`text-[11px] ${plan.popular ? "text-slate-300 dark:text-slate-600" : "text-slate-600 dark:text-slate-400 font-medium"}`}
                          >
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>

                    <button
                      className={`w-full py-3 rounded-xl text-sm font-black transition-all ${plan.popular ? "bg-amber-400 text-slate-900 hover:bg-amber-300 shadow-md" : "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100"}`}
                    >
                      {plan.cta} &rarr;
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Landing;
