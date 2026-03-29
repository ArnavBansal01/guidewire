import { Shield, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Terms = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 relative">
      <button 
        onClick={() => navigate('/')}
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
            <Shield className="w-10 h-10 text-cyan-600 dark:text-cyan-400" />
          </div>
          <h1 className="text-5xl font-black bg-gradient-to-r from-cyan-600 to-emerald-600 bg-clip-text text-transparent tracking-tight">
            Terms of Service
          </h1>
        </div>

        <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 space-y-6">
          <p className="text-sm">Last updated: {new Date().toLocaleDateString()}</p>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-10">1. Agreement to Terms</h2>
          <p>
            By accessing or using GigShield ("the Service"), you agree to be bound by these Terms and Conditions. GigShield is exclusively a parametric income insurance platform for gig economy workers. <strong>We strictly exclude coverage for health, personal accidents, or vehicle damage.</strong>
          </p>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8">2. Parametric Coverage and Triggers</h2>
          <p>
            Payouts are triggered automatically based on specific, predefined environmental events verified by measurable, external APIs. Payouts require both the parametric threshold to be crossed and a verified income drop. Covered triggers include:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Heavy Rain:</strong> Precipitation exceeding 50 mm in a 24-hour period.</li>
            <li><strong>Extreme Heat:</strong> Temperatures exceeding 45°C.</li>
            <li><strong>Severe Pollution:</strong> Air Quality Index (AQI) exceeding 400.</li>
            <li><strong>Curfew:</strong> Verified zone lockdown notifications via Traffic or Government APIs.</li>
          </ul>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8">3. Weekly Cycle & Enrollment Blackout</h2>
          <p>
            GigShield operates on a Universal Fixed Weekly Cycle (Monday 12:00 AM to Sunday 11:59 PM). 
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>To be covered for the upcoming Monday–Sunday cycle, you must subscribe by <strong>Friday at 11:59 PM</strong>.</li>
            <li><strong>48-Hour Blackout:</strong> Any policy purchased during the Saturday or Sunday blackout window is locked out of the immediate week and will automatically roll over to activate for the following week's cycle. This prevents adverse selection based on short-term weather forecasts.</li>
          </ul>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8">4. Anti-Fraud & Verification</h2>
          <p>
            To protect the liquidity pool for honest workers, we utilize a Multi-Dimensional Proof of Presence model. Claims will be instantly voided, and accounts permanently banned, under the following conditions:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Location Spoofing:</strong> Detection of native OS-level developer flags (e.g., isMockLocation) or mismatches between simulated GPS and physical sensor fusion (accelerometer/gyroscope variance).</li>
            <li><strong>Velocity Violations:</strong> Impossible time-space travel between API pings (The "Superman" Rule).</li>
            <li><strong>Lack of Historical Baseline:</strong> Accounts spun up identically at the time of an event without a history of prior completed deliveries leading up to the disruption.</li>
            <li>In cases of anomaly detection, "Adaptive Friction" may be applied, requiring a secondary validation such as a live photo. We extract EXIF metadata to ensure time and location accuracy.</li>
          </ul>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8">5. Subscriptions and Payments</h2>
          <p>
            Premiums are deducted dynamically based on AI risk profiling for your localized zone. Base premiums may adjust dynamically via AI to offset localized cluster-claim risks during predictable seasonal events. You may cancel your subscription at any time; however, coverage will cease immediately upon cancellation, and no partial refunds will be provided for the current active week.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8">6. Data Collection and Privacy</h2>
          <p>
            We collect the minimum data necessary to track disruptions in your operating area, including your registered zone, platform affiliations, IP-to-Geo correlation, and payout history. Please refer to our Privacy Policy for detailed information on data handling.
          </p>

          <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 text-sm">
            <p>If you have any questions about these Terms, please contact us at legal@gigshield.com.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Terms;