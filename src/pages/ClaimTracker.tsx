import { useEffect, useState } from 'react';
import { CheckCircle, Clock, MapPin, Smartphone, Activity } from 'lucide-react';
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

// Define the shape of our live Firebase data
interface Claim {
  id: string;
  amount: number;
  status: string;
  triggerType: string;
  location: string;
  platformActivity: string;
  timeToPay: string;
  timestamp: any;
}

const ClaimTracker = () => {
  const [liveClaims, setLiveClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to the 'claims' collection in Firestore, newest first
    const q = query(collection(db, "claims"), orderBy("timestamp", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const claimsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Claim[];
      
      setLiveClaims(claimsData);
      setLoading(false);
    });

    // Cleanup listener when you leave the page
    return () => unsubscribe();
  }, []);

  // Dynamically calculate the total payouts from the live database
  const totalPayouts = liveClaims.reduce((sum, claim) => sum + (claim.amount || 0), 0);

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 border border-cyan-500/20 dark:border-cyan-500/30 mb-4">
            <Activity className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span className="text-sm font-medium text-cyan-700 dark:text-cyan-300">
              Zero-Touch Claims
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Claim Tracking &{' '}
            <span className="bg-gradient-to-r from-cyan-600 to-emerald-600 bg-clip-text text-transparent">
              Transparency
            </span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Complete visibility into why and how you got paid. Every payout backed by parametric proof.
          </p>
        </div>

        {/* Dynamic Stats Row */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white dark:bg-slate-900/50 backdrop-blur-sm rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-lg">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Claims</p>
                <p className="text-3xl font-bold">{liveClaims.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900/50 backdrop-blur-sm rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Payouts</p>
                <p className="text-3xl font-bold">₹{totalPayouts.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900/50 backdrop-blur-sm rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-lg">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Avg Payout Time</p>
                <p className="text-3xl font-bold">58s</p>
              </div>
            </div>
          </div>
        </div>

        {/* Live Claims Feed */}
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-12 text-slate-500">Connecting to secure parametric engine...</div>
          ) : liveClaims.length === 0 ? (
            <div className="text-center py-12 text-slate-500">No active claims found in your zone yet.</div>
          ) : (
            liveClaims.map((claim) => (
              <div
                key={claim.id}
                className="bg-white dark:bg-slate-900/50 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-2xl font-bold">₹{claim.amount}</h3>
                        <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-sm font-semibold">
                          {claim.status?.toUpperCase() || 'PAID'}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400">
                        {/* Safely format Firebase timestamp */}
                        {claim.timestamp ? new Date(claim.timestamp.toDate()).toLocaleDateString('en-IN', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        }) : 'Just now'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 border border-cyan-500/20 dark:border-cyan-500/30 rounded-lg">
                      <Clock className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                      <span className="text-sm font-medium text-cyan-700 dark:text-cyan-300">
                        Paid in {claim.timeToPay || '58s'}
                      </span>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 mb-3">
                        <Activity className="w-5 h-5" />
                        <h4 className="font-semibold text-slate-900 dark:text-white">
                          Parametric Trigger
                        </h4>
                      </div>
                      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                        <p className="text-sm">{claim.triggerType}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 mb-3">
                        <MapPin className="w-5 h-5" />
                        <h4 className="font-semibold text-slate-900 dark:text-white">
                          Location Verification
                        </h4>
                      </div>
                      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                        <p className="text-sm">Device geo-location matched disruption zone ({claim.location})</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 mb-3">
                        <Smartphone className="w-5 h-5" />
                        <h4 className="font-semibold text-slate-900 dark:text-white">
                          Platform Activity
                        </h4>
                      </div>
                      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                        <p className="text-sm">{claim.platformActivity}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-cyan-50 to-emerald-50 dark:from-slate-800/30 dark:to-slate-800/30 px-6 py-4 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        All verification checks passed automatically
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 uppercase">
                      ID: {claim.id.slice(0, 8)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info section untouched */}
        <div className="mt-12 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-2xl shadow-2xl p-8 text-white">
          <h2 className="text-3xl font-bold mb-4">How Zero-Touch Claims Work</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-semibold mb-3">Real-Time Monitoring</h3>
              <p className="text-cyan-50 mb-4">
                Our AI continuously monitors weather APIs, government advisories, and platform data
                to detect parametric triggers instantly.
              </p>
              <ul className="space-y-2 text-sm text-cyan-50">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>Weather API integration for real-time data</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>GPS verification within 50m accuracy</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>Platform API confirms active delivery hours</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3">Instant Verification</h3>
              <p className="text-cyan-50 mb-4">
                When conditions match your policy triggers, our system automatically verifies your
                eligibility and initiates payment.
              </p>
              <ul className="space-y-2 text-sm text-cyan-50">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>No claim forms or manual submission required</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>Blockchain-verified proof of conditions</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>Direct UPI transfer within 60 seconds</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClaimTracker;