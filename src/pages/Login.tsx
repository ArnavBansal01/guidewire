import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, UserPlus, ArrowRight } from 'lucide-react';

// Firebase Imports
import { auth, db, googleProvider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // NEW: State to trigger our "Needs Registration" UI
  const [needsRegistration, setNeedsRegistration] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setNeedsRegistration(false); // Reset just in case
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Check if this user actually completed their profile in the database
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        // User exists! Send them straight to the dashboard.
        navigate('/dashboard');
      } else {
        // Stop the silent redirect! Show them the nice UI instead.
        setNeedsRegistration(true);
      }
    } catch (error) {
      console.error("Error signing in with Google:", error);
      alert("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 via-emerald-50 to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 -z-10" />
      
      <div className="max-w-md w-full bg-white dark:bg-slate-900/50 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 transition-all duration-300">
        
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
              We couldn't find a complete profile for this Google account. Let's get your details set up so you can access the dashboard.
            </p>
            <button
              onClick={() => navigate('/register')}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all"
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
              <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-500 mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-emerald-600 bg-clip-text text-transparent">
                Welcome Back
              </h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Sign in to access your dashboard
              </p>
            </div>

            <div className="space-y-6">
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold rounded-lg shadow-md border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                {loading ? 'Checking credentials...' : 'Sign in with Google'}
              </button>
            </div>

            <p className="text-center text-sm text-slate-600 dark:text-slate-400 mt-6">
              No account?{' '}
              <Link to="/register" className="font-semibold text-cyan-600 hover:text-cyan-500">
                Register here
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;