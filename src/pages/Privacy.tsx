import { Lock, X } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Privacy = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClose = () => {
    const returnTo = (location.state as { returnTo?: string } | null)?.returnTo;
    if (returnTo) {
      navigate(returnTo);
      return;
    }

    navigate(-1);
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 relative">
      <button
        onClick={handleClose}
        className="fixed top-8 right-8 z-50 p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 hover:scale-110 active:scale-95 transition-all group"
      >
        <X className="w-6 h-6 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white" />
      </button>

      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-[48px] shadow-sm border border-slate-200 dark:border-slate-800 p-8 sm:p-12 sm:p-20"
      >
        <div className="flex items-center gap-4 mb-12">
          <div className="p-4 bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 rounded-2xl">
            <Lock className="w-10 h-10 text-cyan-600 dark:text-cyan-400" />
          </div>
          <h1 className="text-5xl font-black bg-gradient-to-r from-cyan-600 to-emerald-600 bg-clip-text text-transparent tracking-tight">
            Privacy Policy
          </h1>
        </div>

        <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 space-y-6">
          <p className="text-sm">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-10">
            1. Introduction
          </h2>
          <p>
            At GigShield, we are committed to protecting the privacy of gig
            economy workers. This policy outlines how we collect, use, and
            safeguard your data to provide our parametric income insurance
            services. Our core philosophy is data minimization: we only collect
            what is strictly necessary to verify coverage and prevent fraud.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8">
            2. Information We Collect
          </h2>
          <p>
            To automate payouts and protect the liquidity pool without manual
            paperwork, we collect specific data points:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Account & Platform Data:</strong> Name, contact details,
              and verified affiliations with gig platforms (e.g., Swiggy,
              Zomato) and historical activity baselines.
            </li>
            <li>
              <strong>Device & Telemetry Data:</strong> To verify your physical
              presence in a disruption zone without continuous GPS tracking, we
              utilize Sensor Fusion. This includes intermittent polling of
              device accelerometers/gyroscopes, IP-to-Geo correlations, and
              OS-level developer flags (e.g., mock location status).
            </li>
            <li>
              <strong>Verification Media (Adaptive Friction):</strong> In cases
              of anomaly detection, we may request a live photo or short video.
              We extract EXIF metadata (hardware timestamps and camera-sensor
              location tags) from these files solely for instant verification.
            </li>
            <li>
              <strong>Financial Information:</strong> Payment and bank account
              details required for premium deductions and automated payouts,
              processed securely via our payment partners (e.g., Razorpay).
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8">
            3. How We Use Your Data
          </h2>
          <p>
            Your data is never sold. It is used exclusively to operate the
            GigShield platform:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>AI Risk Profiling:</strong> To calculate dynamic weekly
              premiums based on localized historical weather and disruption
              data.
            </li>
            <li>
              <strong>Claim Automation:</strong> To cross-reference your
              verified operating zone against external weather, AQI, and traffic
              APIs to trigger instant payouts.
            </li>
            <li>
              <strong>Fraud Prevention:</strong> To run Multi-Dimensional Proof
              of Presence checks, ensuring claims are legitimate and protecting
              the platform from Sybil attacks, GPS spoofing, and click-farms.
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8">
            4. Data Sharing and Third Parties
          </h2>
          <p>
            We share minimal data with trusted third-party APIs strictly for
            operational purposes:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>External Data Oracles:</strong> We query weather, AQI, and
              municipal APIs to verify environmental triggers in your registered
              zone.
            </li>
            <li>
              <strong>Payment Processors:</strong> We use secure, compliant
              payment gateways to handle your subscription processing and
              automated claim deposits.
            </li>
            <li>
              <strong>Legal Compliance:</strong> We may disclose information if
              required by law or to protect our legal rights.
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8">
            5. Data Security
          </h2>
          <p>
            We implement industry-standard security measures, including
            encryption in transit and at rest, to protect your data.
            Verification media (photos/videos) collected during Adaptive
            Friction checks are processed for EXIF data and temporarily cached;
            they are not used for facial recognition or long-term profiling.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8">
            6. Your Rights
          </h2>
          <p>
            You have the right to access, correct, or delete your personal data.
            You may withdraw consent at any time by canceling your GigShield
            subscription, though this will immediately terminate your active
            coverage.
          </p>

          <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 text-sm">
            <p>
              If you have any questions or concerns about this Privacy Policy or
              our data practices, please contact our privacy team at
              privacy@gigshield.com.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Privacy;
