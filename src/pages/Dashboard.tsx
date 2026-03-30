import { useState, useEffect } from 'react';
import {
  Shield,
  TrendingUp,
  Droplets,
  Thermometer,
  Wind,
  AlertTriangle,
  CheckCircle,
  Zap,
} from 'lucide-react';

import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';

import {
  mockPolicy, // Keeping mockPolicy for now until we build the checkout flow
  rainfallTriggerThreshold,
  aqiTriggerThreshold,
  temperatureHighThreshold,
} from '../mockData';

const Dashboard = () => {
  const [showClaimToast, setShowClaimToast] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  // 1. New State to hold the live Firestore user document
  const [dbUser, setDbUser] = useState<any>(null);
  
  const [envData, setEnvData] = useState({
    rainfall: 0,
    aqi: 0,
    temperature: 0
  });

  // 2. Handle Authentication AND Live User Data
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // If logged in, set up a real-time listener on their specific Firestore document
        const userRef = doc(db, 'users', currentUser.uid);
        const unsubscribeUser = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            setDbUser(docSnap.data());
          }
        });
        
        // Cleanup the listener when the component unmounts
        return () => unsubscribeUser();
      } else {
        setDbUser(null);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  // Real-time Monitoring Listener for Chandigarh
  useEffect(() => {
    const envRef = doc(db, 'environmental_data', 'chandigarh_station');
    
    const unsubscribe = onSnapshot(envRef, (snapshot) => {
      if (snapshot.exists()) {
        setEnvData(snapshot.data() as any);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSimulateDisruption = () => {
    setShowClaimToast(true);
    setTimeout(() => setShowClaimToast(false), 5000);
  };

  const getEnvironmentalStatus = (value: number, threshold: number, isBelow = false) => {
    const isWarning = isBelow ? value < threshold : value > threshold;
    return {
      isWarning,
      percentage: isBelow ? (value / threshold) * 100 : Math.min((value / threshold) * 100, 100),
    };
  };

  const rainfallStatus = getEnvironmentalStatus(envData.rainfall, rainfallTriggerThreshold);
  const aqiStatus = getEnvironmentalStatus(envData.aqi, aqiTriggerThreshold);
  const tempStatus = getEnvironmentalStatus(envData.temperature, temperatureHighThreshold);

  const daysUntilLock = Math.ceil(
    (new Date(mockPolicy.nextLockDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            {/* 3. Using live database names and platform info */}
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">
              Welcome back, {dbUser?.fullName || user?.displayName || 'Rider'}
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              {dbUser?.city || 'Your City'} • {dbUser?.platform || 'Delivery'} Rider
            </p>
          </div>
          <div className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-xl shadow-lg">
            <Shield className="w-6 h-6 text-white" />
            <div>
              <p className="text-sm text-white/80">Trust Score</p>
              {/* 4. Live Trust Score */}
              <p className="text-2xl font-bold text-white">{dbUser?.trustScore || 100}%</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white dark:bg-slate-900/50 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Policy Management</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Active Plan: {dbUser?.activePlanName || mockPolicy.type.charAt(0).toUpperCase() + mockPolicy.type.slice(1)}
                  </p>
                </div>
              </div>
              <div className="px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                  {dbUser?.hasActivePolicy ? 'Active' : 'No Active Plan'}
                </p>
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded-lg mb-6">
              <div className="flex gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-amber-900 dark:text-amber-300 mb-1">
                    Coverage Window Lock
                  </h3>
                  <p className="text-sm text-amber-800 dark:text-amber-400">
                    Next cycle locks in <span className="font-bold">{daysUntilLock} days</span> to
                    prevent weather-gaming. Adjust your plan before{' '}
                    {new Date(mockPolicy.nextLockDate).toLocaleDateString()}.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Weekly Premium</p>
                <p className="text-2xl font-bold">₹{mockPolicy.weeklyPremium}</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Coverage Amount</p>
                <p className="text-2xl font-bold">₹{mockPolicy.coverageAmount}</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Avg Daily Income</p>
                {/* 5. Fallback values for things not captured in registration yet */}
                <p className="text-2xl font-bold">₹{dbUser?.avgDailyIncome || 1200}</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Avg Deliveries/Day</p>
                <p className="text-2xl font-bold">{dbUser?.avgDailyDeliveries || 25}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900/50 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-xl">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Zero-Touch Claim</h2>
                <p className="text-xs text-slate-600 dark:text-slate-400">Automatic payouts</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Real-time monitoring</p>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <p className="text-sm font-medium">Device location verified</p>
                </div>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Platform integration</p>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <p className="text-sm font-medium">{dbUser?.platform || 'API'} API active</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleSimulateDisruption}
              className="w-full px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all"
            >
              Simulate Disruption
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/50 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6">
          <h2 className="text-2xl font-bold mb-6">Parametric Monitor</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
            Live environmental data from your zone. Automatic payout triggers when thresholds are exceeded.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl border-2 border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Droplets className="w-8 h-8 text-blue-500" />
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Rainfall</p>
                    <p className="text-3xl font-bold">
                      {envData.rainfall}
                      <span className="text-lg">mm</span>
                    </p>
                  </div>
                </div>
                {rainfallStatus.isWarning && (
                  <AlertTriangle className="w-6 h-6 text-amber-500" />
                )}
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Trigger at 50mm</span>
                  <span className="font-semibold">{rainfallStatus.percentage.toFixed(0)}%</span>
                </div>
                <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      rainfallStatus.isWarning
                        ? 'bg-gradient-to-r from-amber-500 to-red-500'
                        : 'bg-gradient-to-r from-cyan-500 to-emerald-500'
                    } transition-all`}
                    style={{ width: `${rainfallStatus.percentage}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl border-2 border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Wind className="w-8 h-8 text-purple-500" />
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">AQI</p>
                    <p className="text-3xl font-bold">{envData.aqi}</p>
                  </div>
                </div>
                {aqiStatus.isWarning && (
                  <AlertTriangle className="w-6 h-6 text-amber-500" />
                )}
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Trigger at 200</span>
                  <span className="font-semibold">{aqiStatus.percentage.toFixed(0)}%</span>
                </div>
                <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      aqiStatus.isWarning
                        ? 'bg-gradient-to-r from-amber-500 to-red-500'
                        : 'bg-gradient-to-r from-cyan-500 to-emerald-500'
                    } transition-all`}
                    style={{ width: `${aqiStatus.percentage}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl border-2 border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Thermometer className="w-8 h-8 text-red-500" />
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Temperature</p>
                    <p className="text-3xl font-bold">
                      {envData.temperature}
                      <span className="text-lg">°C</span>
                    </p>
                  </div>
                </div>
                {tempStatus.isWarning && (
                  <AlertTriangle className="w-6 h-6 text-amber-500" />
                )}
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Trigger at 45°C</span>
                  <span className="font-semibold">{tempStatus.percentage.toFixed(0)}%</span>
                </div>
                <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      tempStatus.isWarning
                        ? 'bg-gradient-to-r from-amber-500 to-red-500'
                        : 'bg-gradient-to-r from-cyan-500 to-emerald-500'
                    } transition-all`}
                    style={{ width: `${tempStatus.percentage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showClaimToast && (
        <div className="fixed bottom-8 right-8 max-w-md bg-emerald-500 text-white p-6 rounded-xl shadow-2xl animate-slide-up">
          <div className="flex items-start gap-3">
            <Zap className="w-6 h-6 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-lg mb-1">Severe Weather Detected</h3>
              <p className="text-sm text-emerald-50">
                Proof-of-Presence verified. ₹250 payout initiated instantly.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 