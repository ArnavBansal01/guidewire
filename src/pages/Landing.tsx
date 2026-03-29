import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Zap, Clock, Users, TrendingUp, CheckCircle } from 'lucide-react';
import { cities, platforms } from '../mockData';

const Landing = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    city: '',
    platform: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.phone && formData.city && formData.platform) {
      navigate('/dashboard');
    }
  };

  const stats = [
    { icon: Clock, label: '60s Avg Payout', value: 'Lightning Fast' },
    { icon: Users, label: '10M+ Eligible', value: 'Gig Workers' },
    { icon: TrendingUp, label: 'Dynamic AI Pricing', value: 'Fair & Accurate' },
    { icon: CheckCircle, label: '99.8% Auto-approved', value: 'Zero Paperwork' },
  ];

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 via-emerald-50 to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 -z-10" />

        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAwMDAiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDE2em0wLTEwdjJIMjR2LTJoMTZ6bTAtMTB2MkgyNHYtMmgxNnoiLz48L2c+PC9nPjwvc3ZnPg==')] dark:opacity-20 -z-10" />

        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 border border-cyan-500/20 dark:border-cyan-500/30 mb-6">
                <Shield className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <span className="text-sm font-medium text-cyan-700 dark:text-cyan-300">
                  AI-Powered Protection
                </span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                Parametric Protection for the{' '}
                <span className="bg-gradient-to-r from-cyan-600 to-emerald-600 bg-clip-text text-transparent">
                  Gig Economy
                </span>
              </h1>

              <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto lg:mx-0">
                Zero paperwork. AI-driven pricing. Instant payouts when the weather turns against you.
              </p>

              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <a
                  href="#register"
                  className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all"
                >
                  Get Protected Now
                </a>
                <button className="px-8 py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold rounded-lg shadow hover:shadow-lg transition-all border border-slate-200 dark:border-slate-700">
                  Learn How It Works
                </button>
              </div>
            </div>

            <div id="register" className="bg-white dark:bg-slate-900/50 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-xl">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Quick Registration</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Get started in under 60 seconds
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
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
                    {platforms.map((platform) => (
                      <option key={platform} value={platform}>
                        {platform}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full px-6 py-4 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all"
                >
                  Start My AI Risk Assessment
                </button>
              </form>

              <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-4">
                By registering, you agree to our Terms & Privacy Policy
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="group p-6 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-cyan-500 dark:hover:border-cyan-500 transition-all hover:shadow-lg"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-lg group-hover:scale-110 transition-transform">
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    {stat.label}
                  </h3>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
