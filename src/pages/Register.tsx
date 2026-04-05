import { useEffect, useMemo, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { Sparkles, Zap, ArrowRight, WifiOff } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { getFriendlyAuthError, type AuthUiError } from "../utils/authError";

// Firebase Imports
import { auth, db, googleProvider } from "../firebase";
import { signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import BrandLoader from "../components/BrandLoader";

// Data Imports
import { DEMO_WORKER_DEFAULT_PROFILE } from "../data/demoProfile";
import { cities } from "../mockData";
import { partners } from "../data/partners";
import LocationSearchSelect from "../components/LocationSearchSelect";

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading, demoLogin } = useAuth();
  const [searchParams] = useSearchParams();
  const isDemoWorkerMode = searchParams.get("mode") === "demo-worker";

  // Manage whether we are showing the Google button (1) or the details form (2)
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [authUser, setAuthUser] = useState<any>(null); // Stores Google user data temporarily
  const [authError, setAuthError] = useState<AuthUiError | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    city: "",
    platform: "",
  });

  const demoPrefill = useMemo(
    () => ({
      name: DEMO_WORKER_DEFAULT_PROFILE.fullName || "Demo Worker",
      phone: DEMO_WORKER_DEFAULT_PROFILE.phone || "9999999999",
      city: DEMO_WORKER_DEFAULT_PROFILE.city || "",
      platform: DEMO_WORKER_DEFAULT_PROFILE.platform || "",
    }),
    [],
  );

  useEffect(() => {
    if (!isDemoWorkerMode) return;

    setStep(2);
    setAuthError(null);
    setFormData(demoPrefill);
  }, [isDemoWorkerMode, demoPrefill]);

  // Check if a user landed here with a dangling Firebase session but no Firestore profile
  useEffect(() => {
    const checkExistingSession = async () => {
      if (!user || user.uid.startsWith("demo_") || step !== 1) return;

      try {
        setLoading(true);
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          // Complete user found, redirect
          navigate("/dashboard");
        } else {
          // Orphan session found, push to step 2 automatically
          setAuthUser(user as any);
          setFormData((prev) => ({
            ...prev,
            name: user.displayName || prev.name,
          }));
          setStep(2);
        }
      } catch (error) {
        console.error("Error auto-resuming session:", error);
      } finally {
        setLoading(false);
      }
    };

    void checkExistingSession();
  }, [user, step, navigate, db]);

  // STEP 1: Handle Google Authentication
  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setAuthError(null);
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Check if this user already completed registration in Firestore
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        // User already exists! Send them straight to the dashboard.
        navigate("/dashboard");
      } else {
        // New user! Move to Step 2 and pre-fill their name from Google.
        setAuthUser(user);
        setFormData({ ...formData, name: user.displayName || "" });
        setStep(2);
      }
    } catch (error) {
      console.error("Error signing in with Google:", error);
      setAuthError(getFriendlyAuthError(error, "register"));
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Handle Final Form Submission to Firestore
  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isDemoWorkerMode) {
      setLoading(true);
      setAuthError(null);
      const demoProfile = {
        uid: DEMO_WORKER_DEFAULT_PROFILE.uid,
        email: DEMO_WORKER_DEFAULT_PROFILE.email,
        fullName: formData.name,
        phone: formData.phone,
        city: formData.city,
        platform: formData.platform,
        trustScore: DEMO_WORKER_DEFAULT_PROFILE.trustScore,
        avgDailyIncome: DEMO_WORKER_DEFAULT_PROFILE.avgDailyIncome,
        avgDailyDeliveries: DEMO_WORKER_DEFAULT_PROFILE.avgDailyDeliveries,
        role: DEMO_WORKER_DEFAULT_PROFILE.role,
        updatedAt: serverTimestamp(),
        policyStatus: DEMO_WORKER_DEFAULT_PROFILE.policyStatus,
        activePlan: DEMO_WORKER_DEFAULT_PROFILE.activePlan,
        weeklyPremium: DEMO_WORKER_DEFAULT_PROFILE.weeklyPremium,
      };

      try {
        await setDoc(
          doc(db, "users", DEMO_WORKER_DEFAULT_PROFILE.uid),
          demoProfile,
          {
            merge: true,
          },
        );
        localStorage.setItem(
          "dbUser",
          JSON.stringify({
            ...demoProfile,
            updatedAt: new Date().toISOString(),
          }),
        );
        localStorage.setItem("isRegistered", "true");
        if (demoLogin) {
          demoLogin("worker");
        }
        navigate("/dashboard");
      } catch (error) {
        console.error("Error saving demo profile to Firestore:", error);
        setAuthError(getFriendlyAuthError(error, "profile-save"));
        setLoading(false);
        return;
      }
      setLoading(false);
      return;
    }

    if (!authUser) return;

    try {
      setLoading(true);
      setAuthError(null);

      // Save all details to Firestore under the 'users' collection using their secure UID
      await setDoc(doc(db, "users", authUser.uid), {
        uid: authUser.uid,
        email: authUser.email,
        fullName: formData.name,
        phone: formData.phone,
        city: formData.city,
        platform: formData.platform,
        createdAt: serverTimestamp(), // Secure Firebase timestamp
        trustScore: 100, // Default starting score for new users
        role: "user",
      });

      // Registration complete! Send to dashboard.
      navigate("/dashboard");
    } catch (error) {
      console.error("Error saving user details:", error);
      setAuthError(getFriendlyAuthError(error, "profile-save"));
    } finally {
      setLoading(false);
    }
  };

  if (!isDemoWorkerMode && (authLoading || (user && step === 1 && loading))) {
    return <BrandLoader message="Preparing your profile..." />;
  }

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row relative overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* --- LEFT PANEL: PREMIUM SAAS BRANDING (DESKTOP ONLY) --- */}
      <div className="hidden lg:flex w-1/2 relative bg-slate-950 items-center justify-center p-12 lg:p-20 overflow-hidden border-r border-slate-800/60 z-10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAwMDAiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDE2em0wLTEwdjJIMjR2LTJoMTZ6bTAtMTB2MkgyNHYtMmgxNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-10" />
        <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] bg-cyan-600/20 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-lg w-full">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-black text-emerald-300 uppercase tracking-widest">
              Get Started
            </span>
          </div>
          <h1 className="text-5xl lg:text-[4rem] font-black text-white leading-[1.05] mb-6 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
            Protect your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              Future Today.
            </span>
          </h1>
          <p className="text-lg text-slate-400 font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            Join the GigAssure network. Get AI-powered risk assessment and
            autonomous instant payouts when life disrupts your hustle.
          </p>
        </div>
      </div>

      {/* --- RIGHT PANEL: AUTHENTICATION FORM --- */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12 relative min-h-screen lg:min-h-0">
        {/* Unified Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-emerald-50/20 to-cyan-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 -z-10" />

        {/* Glowing Background Orbs */}
        <div className="absolute top-[-10%] -left-[10%] w-[300px] h-[300px] bg-emerald-500/20 rounded-full blur-[100px] pointer-events-none lg:w-[400px] lg:h-[400px] lg:-left-[5%]" />
        <div className="absolute bottom-[10%] -right-[10%] w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none lg:w-[400px] lg:h-[400px] lg:-right-[5%]" />

        <div className="w-full max-w-md flex flex-col relative z-10">
          {/* --- MOBILE BRANDING HEADER --- */}
          <div className="lg:hidden mb-8 text-center animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4 shadow-sm">
              <Zap className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">
                Get Started
              </span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white leading-[1.1] mb-2">
              Protect your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-cyan-500 dark:from-emerald-400 dark:to-cyan-400">
                Future Today.
              </span>
            </h1>
          </div>

          <div className="w-full bg-white dark:bg-slate-900/60 backdrop-blur-xl p-8 lg:p-10 rounded-[32px] shadow-2xl border border-slate-200 dark:border-slate-800 transition-all duration-300 relative overflow-hidden">
            {loading && (
              <div className="absolute inset-0 z-50 rounded-[32px] bg-white/90 dark:bg-slate-950/90 backdrop-blur-md">
                <BrandLoader
                  message={
                    step === 1
                      ? "Checking your account..."
                      : "Saving profile..."
                  }
                />
              </div>
            )}

            <div className="text-center mb-8">
              <div className="inline-flex p-3 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-xl mb-4 shadow-lg shadow-cyan-500/20">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-emerald-600 bg-clip-text text-transparent">
                  {step === 1 ? "Get Protected" : "Complete Profile"}
                </h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                  {step === 1
                    ? "Register in under 60 seconds"
                    : "Just a few more details"}
                </p>
              </div>
            </div>

            {authError && (
              <div className="mb-5 rounded-2xl border border-amber-200/80 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/30 px-4 py-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/50">
                    <WifiOff className="h-4 w-4 text-amber-700 dark:text-amber-300" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-amber-900 dark:text-amber-200">
                      {authError.title}
                    </p>
                    <p className="text-sm text-amber-800/90 dark:text-amber-300/90 mt-0.5">
                      {authError.message}
                    </p>
                    {authError.hint && (
                      <p className="text-xs text-amber-700 dark:text-amber-300/80 mt-1.5">
                        Tip: {authError.hint}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* --- UI FOR STEP 1: GOOGLE AUTH --- */}
            {step === 1 && (
              <div className="space-y-4">
                <button
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold rounded-2xl shadow-[0_4px_24px_-4px_rgba(0,0,0,0.1)] border border-slate-200 dark:border-slate-700 hover:-translate-y-1 hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.15)] hover:border-emerald-300 dark:hover:border-emerald-600 transition-all duration-300 disabled:opacity-50"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  {loading ? "Connecting..." : "Sign up with Google"}
                </button>
              </div>
            )}

            {/* --- UI FOR STEP 2: ADDITIONAL DETAILS --- */}
            {step === 2 && (
              <form onSubmit={handleFinalSubmit} className="space-y-5">
                {isDemoWorkerMode && (
                  <div className="rounded-2xl border border-cyan-200/80 dark:border-cyan-700/50 bg-gradient-to-r from-cyan-50 to-emerald-50 dark:from-cyan-950/40 dark:to-emerald-950/30 p-4 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-500 text-white shadow-lg shadow-cyan-500/25">
                        <Sparkles className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          Demo Worker profile is prefilled
                        </p>
                        <p className="text-xs text-slate-700 dark:text-slate-300 mt-1">
                          Name, phone, city, and delivery partner are ready. You
                          can edit any field before entering the dashboard.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hover:bg-white dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 outline-none transition-all shadow-sm font-medium"
                    placeholder="Enter your name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hover:bg-white dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 outline-none transition-all shadow-sm font-medium"
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
                    State / UT
                  </label>
                  <LocationSearchSelect
                    value={formData.city}
                    onChange={(city) => setFormData({ ...formData, city })}
                    options={cities}
                    required
                    placeholder="Search and select your state/UT"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
                    Platform
                  </label>
                  <select
                    required
                    value={formData.platform}
                    onChange={(e) =>
                      setFormData({ ...formData, platform: e.target.value })
                    }
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hover:bg-white dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 outline-none transition-all shadow-sm font-medium"
                  >
                    <option value="">Select your platform</option>
                    {partners.map((platform) => (
                      <option key={platform} value={platform}>
                        {platform}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-4 mt-8 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-bold rounded-2xl shadow-[0_8px_30px_-4px_rgba(16,185,129,0.3)] hover:shadow-[0_12px_40px_-4px_rgba(16,185,129,0.4)] transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50"
                >
                  {loading
                    ? "Saving..."
                    : isDemoWorkerMode
                      ? "Enter Demo Worker Dashboard"
                      : "Start My AI Risk Assessment"}
                </button>
              </form>
            )}

            <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-6">
              By registering, you agree to our Terms &{" "}
              <Link
                to="/privacy"
                state={{ returnTo: `${location.pathname}${location.search}` }}
                className="font-semibold text-cyan-600 hover:text-cyan-500 dark:text-cyan-400 dark:hover:text-cyan-300 transition-colors"
              >
                Privacy Policy
              </Link>
            </p>

            {step === 1 && (
              <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700 text-center">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-5">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="font-semibold text-cyan-600 hover:text-cyan-500 dark:text-cyan-400 dark:hover:text-cyan-300 transition-colors"
                  >
                    Log in here
                  </Link>
                </p>
                <div className="flex justify-center w-full">
                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="group w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-50 hover:bg-cyan-50/50 dark:bg-slate-800/50 dark:hover:bg-cyan-900/20 text-slate-700 dark:text-slate-300 font-medium rounded-xl border border-dashed border-slate-300 dark:border-slate-600 hover:border-cyan-300 dark:hover:border-cyan-700 transition-all text-sm shadow-sm"
                  >
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors" />
                      <span className="group-hover:text-cyan-700 dark:group-hover:text-cyan-300 transition-colors">
                        Judges: Enter Demo Access Mode
                      </span>
                      <ArrowRight className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors ml-1" />
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
