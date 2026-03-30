import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap } from 'lucide-react';

// Firebase Imports
import { auth, db, googleProvider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

// Data Imports
import { cities } from '../mockData';
import { partners } from '../data/partners';

const Register = () => {
  const navigate = useNavigate();
  
  // Manage whether we are showing the Google button (1) or the details form (2)
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [authUser, setAuthUser] = useState<any>(null); // Stores Google user data temporarily

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    city: '',
    platform: '',
  });

  // STEP 1: Handle Google Authentication
  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Check if this user already completed registration in Firestore
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        // User already exists! Send them straight to the dashboard.
        navigate('/dashboard');
      } else {
        // New user! Move to Step 2 and pre-fill their name from Google.
        setAuthUser(user);
        setFormData({ ...formData, name: user.displayName || '' });
        setStep(2);
      }
    } catch (error) {
      console.error("Error signing in with Google:", error);
      alert("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Handle Final Form Submission to Firestore
  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authUser) return;

    try {
      setLoading(true);
      
      // Save all details to Firestore under the 'users' collection using their secure UID
      await setDoc(doc(db, 'users', authUser.uid), {
        uid: authUser.uid,
        email: authUser.email,
        fullName: formData.name,
        phone: formData.phone,
        city: formData.city,
        platform: formData.platform,
        createdAt: serverTimestamp(), // Secure Firebase timestamp
        trustScore: 100, // Default starting score for new users
        role: 'user'
      });

      // Registration complete! Send to dashboard.
      navigate('/dashboard');
    } catch (error) {
      console.error("Error saving user details:", error);
      alert("Could not save details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 via-emerald-50 to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 -z-10" />
      
      <div className="max-w-md w-full space-y-6 bg-white dark:bg-slate-900/50 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-xl">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-emerald-600 bg-clip-text text-transparent">
              {step === 1 ? 'Get Protected' : 'Complete Profile'}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {step === 1 ? 'Register in under 60 seconds' : 'Just a few more details'}
            </p>
          </div>
        </div>

        {/* --- UI FOR STEP 1: GOOGLE AUTH --- */}
        {step === 1 && (
          <div className="space-y-4">
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold rounded-lg shadow-md border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              {loading ? 'Connecting...' : 'Sign up with Google'}
            </button>
          </div>
        )}

        {/* --- UI FOR STEP 2: ADDITIONAL DETAILS --- */}
        {step === 2 && (
          <form onSubmit={handleFinalSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Phone Number</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                placeholder="+91 XXXXX XXXXX"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">City</label>
              <select
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
              >
                <option value="">Select your city</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Platform</label>
              <select
                required
                value={formData.platform}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
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
              className="w-full px-6 py-4 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all mt-4 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Start My AI Risk Assessment'}
            </button>
          </form>
        )}

        <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-4">
          By registering, you agree to our Terms & Privacy Policy
        </p>

        {step === 1 && (
          <div className="pt-4 border-t border-slate-200 dark:border-slate-700 text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Already registered?{' '}
              <Link to="/login" className="font-semibold text-cyan-600 hover:text-cyan-500">
                Log in
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;