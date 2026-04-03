import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Shield,
  UserPlus,
  ArrowRight,
  UserCheck,
  ShieldAlert,
  WifiOff,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { getFriendlyAuthError, type AuthUiError } from "../utils/authError";
import BrandLoader from "../components/BrandLoader";

// Firebase Imports
import { auth, db, googleProvider } from "../firebase";
import { signInWithPopup } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading, demoLogin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [demoState, setDemoState] = useState({ running: false, message: "" });
  const [authError, setAuthError] = useState<AuthUiError | null>(null);

  // State to trigger our "Needs Registration" UI
  const [needsRegistration, setNeedsRegistration] = useState(false);

  useEffect(() => {
    const redirectIfAlreadyLoggedIn = async () => {
      if (authLoading || !user) return;

      if (user.uid.startsWith("demo_")) {
        navigate(user.uid === "demo_admin" ? "/admin" : "/dashboard", {
          replace: true,
        });
        return;
      }

      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        navigate(snap.exists() ? "/dashboard" : "/register", { replace: true });
      } catch (error) {
        console.error("Error checking existing login session:", error);
      }
    };

    void redirectIfAlreadyLoggedIn();
  }, [authLoading, user, navigate]);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setAuthError(null);
      setNeedsRegistration(false); // Reset just in case
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Check if this user actually completed their profile in the database
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        // User exists! Send them straight to the dashboard.
        navigate("/dashboard");
      } else {
        // Stop the silent redirect! Show them the nice UI instead.
        setNeedsRegistration(true);
      }
    } catch (error) {
      console.error("Error signing in with Google:", error);
      setAuthError(getFriendlyAuthError(error, "login"));
    } finally {
      setLoading(false);
    }
  };

  const handleDemoMode = (role: "worker" | "admin") => {
    setDemoState({
      running: true,
      message: `Entering Phone ${role === "worker" ? "9999999999" : "8888888888"}...`,
    });
    setTimeout(() => {
      setDemoState({
        running: true,
        message: `Entering OTP ${role === "worker" ? "1234" : "4321"}...`,
      });
      setTimeout(() => {
        setDemoState({ running: true, message: "Authenticating..." });
        setTimeout(() => {
          if (role === "worker") {
            navigate("/register?mode=demo-worker");
            setDemoState({ running: false, message: "" });
            return;
          }

          if (demoLogin) demoLogin(role);
          navigate("/admin");
        }, 800);
      }, 800);
    }, 800);
  };

  if (authLoading && !user) {
    return <BrandLoader message="Restoring secure access..." />;
  }

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row relative overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* --- LEFT PANEL: PREMIUM SAAS BRANDING (DESKTOP ONLY) --- */}
      <div className="hidden lg:flex w-1/2 relative bg-slate-950 items-center justify-center p-12 lg:p-20 overflow-hidden border-r border-slate-800/60 z-10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAwMDAiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDE2em0wLTEwdjJIMjR2LTJoMTZ6bTAtMTB2MkgyNHYtMmgxNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-10" />
        <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] bg-cyan-600/20 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-lg w-full">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-black text-cyan-300 uppercase tracking-widest">
              System Access
            </span>
          </div>
          <h1 className="text-5xl lg:text-[4rem] font-black text-white leading-[1.05] mb-6 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
            Enter your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">
              Protection Hub.
            </span>
          </h1>
          <p className="text-lg text-slate-400 font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            Welcome back to GigShield. Instantly monitor risk triggers, manage
            your dynamic payouts, and secure your daily earnings.
          </p>
        </div>
      </div>

      {/* --- RIGHT PANEL: AUTHENTICATION FORM --- */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12 relative min-h-screen lg:min-h-0">
        {/* Unified Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-cyan-50/20 to-emerald-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 -z-10" />

        {/* Glowing Background Orbs */}
        <div className="absolute top-[-10%] -left-[10%] w-[300px] h-[300px] bg-cyan-500/20 rounded-full blur-[100px] pointer-events-none lg:w-[400px] lg:h-[400px] lg:-left-[5%]" />
        <div className="absolute bottom-[10%] -right-[10%] w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none lg:w-[400px] lg:h-[400px] lg:-right-[5%]" />

        <div className="w-full max-w-md flex flex-col relative z-10">
          {/* --- MOBILE BRANDING HEADER --- */}
          <div className="lg:hidden mb-8 text-center animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-4 shadow-sm">
              <Shield className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
              <span className="text-[10px] font-black text-cyan-700 dark:text-cyan-400 uppercase tracking-widest">
                System Access
              </span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white leading-[1.1] mb-2">
              Enter your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-emerald-500 dark:from-cyan-400 dark:to-emerald-400">
                Protection Hub.
              </span>
            </h1>
          </div>

          <div className="w-full bg-white dark:bg-slate-900/60 backdrop-blur-xl p-8 lg:p-10 rounded-[32px] shadow-2xl border border-slate-200 dark:border-slate-800 transition-all duration-300 relative overflow-hidden">
            {loading && (
              <div className="absolute inset-0 z-50 rounded-[32px] bg-white/90 dark:bg-slate-950/90 backdrop-blur-md">
                <BrandLoader message="Verifying your login..." />
              </div>
            )}

            {/* --- DYNAMIC UI: Show this if they need to register --- */}
            {needsRegistration ? (
              <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="inline-flex p-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30 mb-4">
                  <UserPlus className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  Looks like you're new here!
                </h2>
                <p className="text-slate-600 dark:text-slate-400 mb-8">
                  We couldn't find a complete profile for this Google account.
                  Let's get your details set up so you can access the dashboard.
                </p>
                <button
                  onClick={() => navigate("/register")}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-semibold rounded-lg shadow-lg hover:-translate-y-0.5 hover:shadow-xl transition-all"
                >
                  Complete Registration <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setNeedsRegistration(false)}
                  className="mt-4 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                >
                  Cancel and try a different account
                </button>
              </div>
            ) : (
              /* --- STANDARD UI: Normal Login View --- */
              <div className="animate-in fade-in duration-300">
                <div className="text-center mb-8">
                  <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-500 mb-4 shadow-lg shadow-cyan-500/20">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-emerald-600 dark:from-cyan-400 dark:to-emerald-400 bg-clip-text text-transparent">
                    Welcome Back
                  </h2>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                    Sign in to access your dashboard
                  </p>
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

                <div className="space-y-6">
                  <button
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold rounded-2xl shadow-[0_4px_24px_-4px_rgba(0,0,0,0.1)] border border-slate-200 dark:border-slate-700 hover:-translate-y-1 hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.15)] hover:border-cyan-300 dark:hover:border-cyan-600 transition-all duration-300 disabled:opacity-50"
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
                    {loading
                      ? "Checking credentials..."
                      : "Sign in with Google"}
                  </button>
                </div>

                <p className="text-center text-sm text-slate-600 dark:text-slate-400 mt-6 mb-2">
                  No account?{" "}
                  <Link
                    to="/register"
                    className="font-semibold text-cyan-600 hover:text-cyan-500 dark:text-cyan-400 dark:hover:text-cyan-300"
                  >
                    Register here
                  </Link>
                </p>
                <p className="text-center text-xs text-slate-500 dark:text-slate-400">
                  By signing in, you agree to our{" "}
                  <Link
                    to="/privacy"
                    state={{
                      returnTo: `${location.pathname}${location.search}`,
                    }}
                    className="font-semibold text-cyan-600 hover:text-cyan-500 dark:text-cyan-400 dark:hover:text-cyan-300 transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </p>
              </div>
            )}

            {demoState.running && (
              <div className="absolute inset-0 z-50 rounded-[32px] bg-white/90 dark:bg-slate-950/90 backdrop-blur-md">
                <BrandLoader
                  message={demoState.message || "Starting demo access..."}
                />
              </div>
            )}

            {/* --- DEMO ACCESS (JUDGES) & BACKDOOR --- */}
            <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800 relative z-10">
              <div className="mb-5 text-center">
                <span className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Demo Access (Judges)
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleDemoMode("worker")}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-50/80 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 font-bold rounded-2xl border border-emerald-200/50 dark:border-emerald-800/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/10 text-sm"
                >
                  <UserCheck className="w-4 h-4" />
                  Worker
                </button>
                <button
                  onClick={() => handleDemoMode("admin")}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-cyan-50/80 hover:bg-cyan-100 dark:bg-cyan-900/20 dark:hover:bg-cyan-900/40 text-cyan-700 dark:text-cyan-400 font-bold rounded-2xl border border-cyan-200/50 dark:border-cyan-800/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-cyan-500/10 text-sm"
                >
                  <ShieldAlert className="w-4 h-4" />
                  Admin
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Login;
