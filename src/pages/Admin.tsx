import { useState } from 'react';
import { Shield, AlertTriangle, Activity, Users, Zap, Terminal } from 'lucide-react';
import { mockAdminStats, mockFraudAlerts, cities, disruptionTypes } from '../mockData';

const Admin = () => {
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDisruption, setSelectedDisruption] = useState('');
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    '[SYSTEM] GigShield Admin Console initialized',
    '[INFO] Connected to production environment',
    '[INFO] Real-time monitoring active',
  ]);

  const handleDeployDisruption = () => {
    if (!selectedCity || !selectedDisruption) {
      return;
    }

    const timestamp = new Date().toLocaleTimeString();
    const newLogs = [
      `[${timestamp}] DISRUPTION DEPLOYED: ${selectedDisruption} in ${selectedCity}`,
      `[${timestamp}] Scanning active policies in ${selectedCity}...`,
      `[${timestamp}] Found 1,247 eligible policies`,
      `[${timestamp}] Cross-referencing with weather APIs...`,
      `[${timestamp}] IMD API: Confirmed - ${selectedDisruption} threshold exceeded`,
      `[${timestamp}] Verifying worker locations via GPS...`,
      `[${timestamp}] 1,189 workers verified in disruption zone`,
      `[${timestamp}] Platform API check: Active delivery sessions confirmed`,
      `[${timestamp}] Calculating payout amounts...`,
      `[${timestamp}] Total payout: ₹2,97,250`,
      `[${timestamp}] Initiating UPI transfers...`,
      `[${timestamp}] ✓ 1,189 payouts completed in 58 seconds`,
      `[${timestamp}] Blockchain proof recorded: 0x7a9f4...`,
      `[${timestamp}] SMS notifications sent to all workers`,
      `[${timestamp}] DEPLOYMENT COMPLETE`,
    ];

    setTerminalLogs([...terminalLogs, ...newLogs]);
  };

  const clearLogs = () => {
    setTerminalLogs([
      '[SYSTEM] Terminal cleared',
      '[INFO] Ready for next simulation',
    ]);
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 dark:border-red-500/30 mb-4">
            <Shield className="w-4 h-4 text-red-600 dark:text-red-400" />
            <span className="text-sm font-medium text-red-700 dark:text-red-300">
              Admin Access Only
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            God Mode{' '}
            <span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              Simulator
            </span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Control center for system health, fraud detection, and hackathon demonstrations.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-900/50 backdrop-blur-sm rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Active Policies</p>
                <p className="text-3xl font-bold">{mockAdminStats.totalActivePolicies.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900/50 backdrop-blur-sm rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Claim Ratio</p>
                <p className="text-3xl font-bold">{(mockAdminStats.claimRatio * 100).toFixed(1)}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900/50 backdrop-blur-sm rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Fraud Alerts</p>
                <p className="text-3xl font-bold">{mockAdminStats.fraudAlerts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900/50 backdrop-blur-sm rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Payouts</p>
                <p className="text-3xl font-bold">₹{(mockAdminStats.totalPayouts / 100000).toFixed(1)}L</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white dark:bg-slate-900/50 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold">Fraud Detection System</h2>
            </div>

            <div className="space-y-4">
              {mockFraudAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-xl border-l-4 ${
                    alert.severity === 'high'
                      ? 'bg-red-50 dark:bg-red-900/20 border-red-500'
                      : 'bg-amber-50 dark:bg-amber-900/20 border-amber-500'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      {alert.type}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold uppercase ${
                        alert.severity === 'high'
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                          : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                      }`}
                    >
                      {alert.severity}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    {alert.description}
                  </p>
                  <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
                    <span>User: {alert.userId}</span>
                    <span>{alert.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900/50 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-xl">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold">Global Disruption Simulator</h2>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              Trigger parametric events for hackathon demonstrations and system testing.
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">Target City</label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                >
                  <option value="">Select city</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Disruption Type</label>
                <select
                  value={selectedDisruption}
                  onChange={(e) => setSelectedDisruption(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                >
                  <option value="">Select disruption</option>
                  {disruptionTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleDeployDisruption}
              disabled={!selectedCity || !selectedDisruption}
              className="w-full px-6 py-4 bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-lg"
            >
              DEPLOY PARAMETRIC DISRUPTION
            </button>
          </div>
        </div>

        <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-3 bg-slate-800 border-b border-slate-700">
            <div className="flex items-center gap-3">
              <Terminal className="w-5 h-5 text-emerald-400" />
              <h2 className="font-bold text-white">System Terminal</h2>
            </div>
            <button
              onClick={clearLogs}
              className="px-3 py-1 bg-slate-700 text-slate-300 text-sm rounded hover:bg-slate-600 transition-colors"
            >
              Clear
            </button>
          </div>
          <div className="p-6 font-mono text-sm text-emerald-400 h-96 overflow-y-auto">
            {terminalLogs.map((log, index) => (
              <div key={index} className="mb-1">
                {log}
              </div>
            ))}
            <div className="animate-pulse">_</div>
          </div>
        </div>

        <div className="mt-8 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl shadow-2xl p-8 text-white">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Anti-Gaming Mechanisms</h2>
              <p className="text-red-50 mb-4">
                GigShield employs multiple layers of fraud prevention to protect the system:
              </p>
              <ul className="space-y-2 text-sm text-red-50">
                <li className="flex items-start gap-2">
                  <span className="font-semibold">Coverage Window Locks:</span>
                  <span>
                    48-hour advance purchase required before weather events to prevent
                    weather-gaming
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold">GPS Zone Verification:</span>
                  <span>
                    Real-time location tracking prevents boundary manipulation attempts
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold">Platform API Integration:</span>
                  <span>
                    Cross-verification with Swiggy/Zomato APIs confirms actual delivery activity
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold">Behavioral AI:</span>
                  <span>
                    Machine learning models flag suspicious patterns like coordinated claims
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
