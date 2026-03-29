import { useState } from 'react';
import { Calculator as CalcIcon, TrendingUp, Shield, Zap, CheckCircle } from 'lucide-react';
import { cities, pricingTiers } from '../mockData';

const Calculator = () => {
  const [formData, setFormData] = useState({
    dailyDeliveries: 25,
    dailyIncome: 1000,
    zone: '',
  });

  const [calculated, setCalculated] = useState(false);
  const [surgeAmount, setSurgeAmount] = useState(0);

  const handleCalculate = () => {
    const randomSurge = Math.floor(Math.random() * 15) + 5;
    setSurgeAmount(randomSurge);
    setCalculated(true);
  };

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
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Our AI analyzes your location, income, and real-time weather data to calculate a fair,
            personalized premium.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          <div className="bg-white dark:bg-slate-900/50 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-xl">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold">Your Details</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Average Daily Deliveries
                </label>
                <input
                  type="number"
                  value={formData.dailyDeliveries}
                  onChange={(e) =>
                    setFormData({ ...formData, dailyDeliveries: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                  placeholder="25"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Higher volume = better AI risk modeling
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Average Daily Income (₹)
                </label>
                <input
                  type="number"
                  value={formData.dailyIncome}
                  onChange={(e) =>
                    setFormData({ ...formData, dailyIncome: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                  placeholder="1000"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Used to calculate coverage amount
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Primary Zone</label>
                <select
                  value={formData.zone}
                  onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                >
                  <option value="">Select your primary zone</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Weather risk varies by location
                </p>
              </div>

              <button
                onClick={handleCalculate}
                disabled={!formData.zone}
                className="w-full px-6 py-4 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                Calculate My AI Risk Premium
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900/50 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-xl">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold">How It Works</h2>
            </div>

            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400 font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Location Analysis</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    AI analyzes historical weather patterns and disruption frequency in your zone.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400 font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Income Assessment</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Your daily income determines appropriate coverage levels and payout amounts.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400 font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Real-Time Adjustments</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Premium fluctuates based on upcoming weather forecasts and seasonal trends.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400 font-bold">
                  4
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Fair Pricing</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    No hidden fees. Transparent AI-driven pricing that adapts to your risk profile.
                  </p>
                </div>
              </div>
            </div>

            {calculated && surgeAmount > 0 && (
              <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 rounded-lg">
                <div className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-amber-900 dark:text-amber-300 mb-1">
                      Surge Indicator
                    </h3>
                    <p className="text-sm text-amber-800 dark:text-amber-400">
                      +₹{surgeAmount} High Rainfall Risk this week. Premium adjusted based on
                      7-day forecast for {formData.zone}.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {calculated && (
          <div>
            <h2 className="text-3xl font-bold text-center mb-8">
              Your Personalized Pricing Options
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {pricingTiers.map((tier) => (
                <div
                  key={tier.type}
                  className={`relative bg-white dark:bg-slate-900/50 backdrop-blur-sm rounded-2xl shadow-xl border-2 p-8 transition-all hover:scale-105 ${
                    tier.popular
                      ? 'border-cyan-500 dark:border-cyan-500'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {tier.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white text-sm font-bold rounded-full">
                      MOST POPULAR
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold">
                        ₹{tier.weeklyPremium + (calculated ? surgeAmount : 0)}
                      </span>
                      <span className="text-slate-600 dark:text-slate-400">/week</span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                      Coverage up to ₹{tier.coverageAmount}
                    </p>
                  </div>

                  <div className="space-y-3 mb-6">
                    {tier.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    className={`w-full px-6 py-3 rounded-lg font-semibold transition-all ${
                      tier.popular
                        ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    Select {tier.name}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Calculator;
