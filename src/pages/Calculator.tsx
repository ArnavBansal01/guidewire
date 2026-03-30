import { useState, useEffect } from 'react';
import { Calculator as CalcIcon, TrendingUp, Shield, Zap, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import { cities } from '../mockData';
import { plans } from '../data/plans';
// Firebase Imports
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore'; 

const Calculator = () => {
  const [formData, setFormData] = useState({
    dailyDeliveries: 25,
    dailyIncome: 1000,
    zone: '',
    platform: 'Zomato',
  });

  const [loading, setLoading] = useState(false);
  const [fetchingUser, setFetchingUser] = useState(true); 
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  // 1. AUTO-FETCH USER DATA FROM FIREBASE
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setFormData(prev => ({
              ...prev,
              zone: data.city || '', 
              platform: data.platform || 'Zomato'
            }));
          }
        } catch (err) {
          console.error("Error fetching user location:", err);
        }
      }
      setFetchingUser(false); 
    });
    return () => unsubscribe();
  }, []);

  // 2. FETCH AI PRICING FROM VERCEL BACKEND
  const handleCalculate = async () => {
    if (!formData.zone) {
      setError("Please ensure your city is set in your profile.");
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      // THE MAGIC LINK: This pulls the URL from your .env file automatically!
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      const response = await fetch(`${apiUrl}/api/calculate-premium`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          city: formData.zone, 
          platform: formData.platform, 
          deliveries: Number(formData.dailyDeliveries) 
        }),
      });

      if (!response.ok) throw new Error('Failed to connect to AI Risk Engine.');

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // 3. SAVE THE SELECTED PLAN TO FIREBASE
  const handleSelectPlan = async (planName: string, finalPrice: number) => {
    if (!auth.currentUser) {
      alert("You must be logged in to select a plan.");
      return;
    }

    try {
      // Update the user's document with their new active policy
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        activePlan: planName,
        weeklyPremium: finalPrice,
        policyStatus: 'Active',
        policyStartDate: new Date().toISOString()
      });
      
      alert(`🎉 Success! You are now covered under the ${planName} for ₹${finalPrice}/week.`);
      // Optional: Redirect them to dashboard
      // window.location.href = '/dashboard'; 
      
    } catch (error) {
      console.error("Error saving plan to database:", error);
      alert("Failed to activate policy. Please try again.");
    }
  };

  const getNumericPrice = (priceStr: string) => {
    return parseInt(priceStr.replace(/[^0-9]/g, ''), 10) || 0;
  };

  // Show a loading state while we fetch their city from Firebase
  if (fetchingUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
        <p className="text-slate-500 animate-pulse">Syncing Hyper-local Data...</p>
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
            Calculate Your{' '}
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
                  <label className="block text-sm font-medium mb-2">Daily Deliveries</label>
                  <input
                    type="number"
                    value={formData.dailyDeliveries}
                    onChange={(e) => setFormData({ ...formData, dailyDeliveries: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Platform</label>
                  <select
                    value={formData.platform}
                    onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
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
                <label className="block text-sm font-medium mb-2">Primary Zone (City)</label>
                <select
                  value={formData.zone}
                  onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                >
                  <option value="">Select city</option>
                  {cities.map((city) => <option key={city} value={city}>{city}</option>)}
                </select>
              </div>

              <button
                onClick={handleCalculate}
                disabled={!formData.zone || loading}
                className="w-full px-6 py-4 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {loading ? 'Consulting AI Risk Engine...' : 'Generate AI Risk Profile'}
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
          <div className="bg-white dark:bg-slate-900/50 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-xl">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold">Risk Assessment</h2>
            </div>

            {!result ? (
              <div className="space-y-4 opacity-50">
                <p className="text-slate-500 italic">Complete the form to see hyper-local risk factors...</p>
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

                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase text-slate-500">AI Factor Adjustments</h4>
                  {result.breakdown.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center text-sm p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                      <span className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-500" /> {item.factor}
                      </span>
                      <span className={`font-mono font-bold ${item.impact.startsWith('-') ? 'text-emerald-500' : item.impact === '₹0' ? 'text-slate-500' : 'text-amber-500'}`}>
                        {item.impact}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Pricing Cards Section */}
        {result && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h2 className="text-3xl font-bold text-center mb-8">Personalized Protection Plans</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {plans.map((plan) => {
                const engineBase = 45; 
                const adjustment = result.finalPremium - engineBase;
                const basePrice = getNumericPrice(plan.price);
                const finalPrice = Math.max(basePrice + adjustment, 25);

                return (
                  <div
                    key={plan.name}
                    className={`relative bg-white dark:bg-slate-900/50 backdrop-blur-sm rounded-2xl shadow-xl border-2 p-8 transition-all hover:scale-105 ${
                      plan.popular ? 'border-cyan-500' : 'border-slate-200 dark:border-slate-800'
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
                        <span className="text-4xl font-bold text-cyan-600 dark:text-cyan-400">₹{finalPrice}</span>
                        <span className="text-slate-600 dark:text-slate-400">{plan.period}</span>
                      </div>
                    </div>
                    <div className="space-y-3 mb-8">
                      {plan.features.map((f, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5" /> <span>{f}</span>
                        </div>
                      ))}
                    </div>
                    
                    {/* FIXED: Added onClick to trigger the handleSelectPlan function */}
                    <button 
                      onClick={() => handleSelectPlan(plan.name, finalPrice)}
                      className={`w-full px-6 py-3 rounded-xl font-bold transition-all ${
                        plan.popular 
                          ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-white hover:shadow-lg' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {plan.cta || "Activate Policy"}
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