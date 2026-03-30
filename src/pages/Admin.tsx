import { useState, useEffect } from 'react';
import { Shield, AlertTriangle, Activity, Users, Zap, Terminal, ShieldCheck, ShieldAlert } from 'lucide-react';
import { cities, disruptionTypes } from '../mockData';

import { collection, addDoc, getDocs, serverTimestamp, query, where } from "firebase/firestore";
import { db } from "../firebase";

const Admin = () => {
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDisruption, setSelectedDisruption] = useState('');
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    '[SYSTEM] GigShield Admin Console initialized',
    '[INFO] Connected to production database',
    '[INFO] Real-time monitoring active',
  ]);

  const [usersList, setUsersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activePolicies: 0,
    totalPayouts: 0,
    fraudAlerts: 0
  });

  const fetchDashboardData = async () => {
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      const usersData: any[] = [];
      let policyCount = 0;

      usersSnap.forEach((doc) => {
        const data = doc.data();
        usersData.push({ id: doc.id, ...data });
        if (data.activePlan) {
          policyCount++;
        }
      });

      // Note: Make sure your collection name is 'claims' here! 
      // You had 'activePlan' in your last snippet by accident.
      const claimsSnap = await getDocs(collection(db, 'claims'));
      let totalMoneyPaid = 0;
      let flaggedClaims = 0;

      claimsSnap.forEach((doc) => {
        const data = doc.data();
        if (data.status === 'PAID') {
          totalMoneyPaid += Number(data.amount || 0);
        }
        if (data.status === 'FLAGGED' || data.status === 'REJECTED') {
          flaggedClaims++;
        }
      });

      setUsersList(usersData);
      setStats({
        totalUsers: usersData.length,
        activePolicies: policyCount,
        totalPayouts: totalMoneyPaid,
        fraudAlerts: flaggedClaims
      });

    } catch (error) {
      console.error("Error fetching admin data:", error);
      setTerminalLogs(prev => [...prev, '[ERROR] Failed to sync with live database.']);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleDeployDisruption = async () => {
    if (!selectedCity || !selectedDisruption) return;
    const timestamp = new Date().toLocaleTimeString();
    const simulatedPayout = selectedDisruption.includes('Severe') ? 150 : 250;
    
    setTerminalLogs(prev => [
      ...prev,
      `[${timestamp}] DISRUPTION DEPLOYED: ${selectedDisruption} in ${selectedCity}`,
      `[${timestamp}] Scanning active policies in ${selectedCity}...`,
    ]);

    try {
      await addDoc(collection(db, "claims"), {
        workerName: "Simulated Deployment", 
        amount: simulatedPayout, 
        status: "PAID",
        triggerType: selectedDisruption,
        location: selectedCity,
        timeToPay: "58s",
        timestamp: serverTimestamp() 
      });
      fetchDashboardData();
    } catch (error) {
      console.error("Error pushing to Firestore: ", error);
    }
  };

  const clearLogs = () => {
    setTerminalLogs(['[SYSTEM] Terminal cleared', '[INFO] Ready for next simulation']);
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header - UPDATED WITH SUBTITLE */}
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

        {/* Live System Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {/* Stats cards stay the same... (Users, Active Policies, etc) */}
          <div className="bg-white dark:bg-slate-900/50 backdrop-blur-sm rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Users</p>
                <p className="text-3xl font-bold">{loading ? '...' : stats.totalUsers}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900/50 backdrop-blur-sm rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-lg">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Active Policies</p>
                <p className="text-3xl font-bold">{loading ? '...' : stats.activePolicies}</p>
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
                <p className="text-3xl font-bold">{loading ? '...' : stats.fraudAlerts}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900/50 backdrop-blur-sm rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-xl">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Payouts</p>
                <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                  {loading ? '...' : `₹${stats.totalPayouts.toLocaleString()}`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Live Users Table */}
        <div className="bg-white dark:bg-slate-900/50 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Users className="w-5 h-5" /> Live User Directory
            </h2>
          </div>
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-sm sticky top-0">
                <tr>
                  <th className="px-6 py-4 font-medium">Name & Contact</th>
                  <th className="px-6 py-4 font-medium">Platform / City</th>
                  <th className="px-6 py-4 font-medium">Trust Score</th>
                  <th className="px-6 py-4 font-medium">Policy Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {loading ? (
                  <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">Syncing with database...</td></tr>
                ) : (
                  usersList.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/25 transition-colors">
                      {/* UPDATED: Name cell now shows BOTH email and phone */}
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-900 dark:text-white">{user.fullName || 'User'}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                        <p className="text-xs text-cyan-600 dark:text-cyan-400 mt-0.5">{user.phone}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium">{user.platform}</p>
                        <p className="text-sm text-slate-500">{user.city}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-sm font-medium">
                          {user.trustScore || 100}%
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {user.activePlan ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-sm font-medium">
                            <ShieldCheck className="w-4 h-4" />
                            {user.activePlan}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-sm font-medium">
                            <ShieldAlert className="w-4 h-4" /> No Policy
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Rest of the Simulator and Terminal UI... */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
           {/* (Simulator and Terminal code stays the same) */}
           <div className="bg-white dark:bg-slate-900/50 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-xl">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold">Global Disruption Simulator</h2>
            </div>
            {/* ... controls ... */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">Target City</label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                >
                  <option value="">Select city</option>
                  {cities.map((city) => <option key={city} value={city}>{city}</option>)}
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
                  {disruptionTypes.map((type) => <option key={type} value={type}>{type}</option>)}
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

          <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden flex flex-col h-full">
            <div className="flex items-center justify-between px-6 py-3 bg-slate-800 border-b border-slate-700">
              <div className="flex items-center gap-3">
                <Terminal className="w-5 h-5 text-emerald-400" />
                <h2 className="font-bold text-white">System Terminal</h2>
              </div>
              <button onClick={clearLogs} className="px-3 py-1 bg-slate-700 text-slate-300 text-sm rounded hover:bg-slate-600 transition-colors">Clear</button>
            </div>
            <div className="p-6 font-mono text-sm text-emerald-400 flex-grow overflow-y-auto">
              {terminalLogs.map((log, index) => (
                <div key={index} className="mb-1">{log}</div>
              ))}
              <div className="animate-pulse">_</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;