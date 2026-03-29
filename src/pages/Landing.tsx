import { Link } from 'react-router-dom';
import { Shield, Zap, Plug, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const defaultFadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: false, margin: "-20px" },
  transition: { duration: 0.4, ease: 'easeOut' }
} as const;

const Landing = () => {
  const stats = [
    { label: 'Average Payout Time', value: '< 5 Minutes' },
    { label: 'Workers Covered', value: '10,000+' },
    { label: 'Claim Approval Rate', value: '99.9%' },
  ];

  const steps = [
    { icon: Plug, title: 'Link Your Platform', desc: 'Connect your Swiggy, Zomato, or Uber account.' },
    { icon: Activity, title: 'Disruption Detected', desc: 'Our system monitors for outages or delays automatically.' },
    { icon: Zap, title: 'Get Paid Instantly', desc: 'Payouts are triggered directly to your account with zero hassle.' },
  ];

  const platforms = ['Zomato', 'Swiggy', 'Blinkit', 'Zepto', 'Uber', 'Ola'];

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Global Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 via-emerald-50 to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 -z-10" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAwMDAiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDE2em0wLTEwdjJIMjR2LTJoMTZ6bTAtMTB2MkgyNHYtMmgxNnoiLz48L2c+PC9nPjwvc3ZnPg==')] dark:opacity-20 -z-10" />

      {/* Hero Section */}
      <section className="relative pt-6 pb-12 lg:pt-12 lg:pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            
            {/* Left Side: Text & CTA */}
            <div className="text-left order-2 lg:order-1 flex flex-col items-center lg:items-start">
              <div className="w-full flex justify-center lg:justify-start">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 border border-cyan-500/20 dark:border-cyan-500/30 mb-8 mt-4 lg:mt-0">
                  <Shield className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  <span className="text-sm font-medium text-cyan-700 dark:text-cyan-300">
                    AI-Powered Risk Engine
                  </span>
                </div>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-5xl xl:text-6xl font-bold mb-6 leading-[1.15] tracking-tight text-slate-900 dark:text-white text-center lg:text-left">
                Shield your earnings. <br />
                Smart. Simple. <br />
                <span className="bg-gradient-to-r from-cyan-600 to-emerald-600 bg-clip-text text-transparent">
                  Instant.
                </span>
              </h1>

              <p className="text-lg sm:text-xl lg:text-base xl:text-lg text-slate-600 dark:text-slate-300 mb-8 max-w-xl leading-relaxed font-medium text-center lg:text-left">
                Platforms crash. Rain hits. GigShield pays. <br className="hidden sm:block" />
                Instant payouts triggered by real-world data, not paperwork. Secure your daily earnings in 60 seconds.
              </p>

              <div className="space-y-4 mb-12 w-full max-w-md lg:max-w-none px-4 lg:px-0">
                {[
                  'Seamless coverage for top delivery & ride-hail platforms',
                  'Automated payouts triggered by real-time data events',
                  'Zero subscription fees. Pay only for the protection you need'
                ].map((benefit, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center">
                      <Zap className="w-4 h-4 text-emerald-500" />
                    </div>
                    <span className="text-slate-600 dark:text-slate-300 font-medium">{benefit}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-4 items-center justify-center lg:justify-start w-full">
                <Link
                  to="/register"
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all text-lg text-center"
                >
                  Get Protected Now
                </Link>
                <button 
                  onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                  className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold rounded-lg shadow hover:shadow-lg transition-all border border-slate-200 dark:border-slate-700 flex items-center justify-center text-lg"
                >
                  See How It Works
                </button>
              </div>
            </div>

            {/* Right Side: Delivery Boy Image (Hidden on Mobile) */}
            <div className="hidden lg:flex order-1 lg:order-2 justify-center lg:translate-x-12 lg:translate-y-12">
              <motion.div 
                initial={{ opacity: 0, scale: 0.8, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative"
              >
                <div className="absolute -inset-10 bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 rounded-full blur-[80px] -z-10" />
                <img 
                  src="/delivery_boy.png" 
                  alt="Delivery Professional" 
                  className="w-full max-w-[400px] h-auto rounded-xl object-contain drop-shadow-lg"
                />
              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* Stats Banner */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            {...defaultFadeUp}
            className="grid sm:grid-cols-3 gap-8 text-center"
          >
            {stats.map((stat, index) => (
              <div key={index} className="p-6">
                <div className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-cyan-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-slate-600 dark:text-slate-400 font-medium mt-2">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div {...defaultFadeUp} className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Automated protection running in the background. Set it up once and let our AI handle the rest.
            </p>
          </motion.div>

          {/* Desktop: Horizontal Layout, Mobile: Vertical Layout */}
          <motion.div 
             {...defaultFadeUp}
             transition={{ ...defaultFadeUp.transition, delay: 0.2 }}
             className="relative flex flex-col md:flex-row gap-8 lg:gap-12"
          >
            {steps.map((step, index) => (
              <div key={index} className="flex-1 relative group">
                <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/50 p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all h-full z-10 relative">
                  <div className="w-14 h-14 bg-gradient-to-br from-cyan-500/10 to-emerald-500/10 dark:from-cyan-500/20 dark:to-emerald-500/20 rounded-xl flex items-center justify-center mb-6 text-cyan-600 dark:text-cyan-400 group-hover:scale-110 transition-transform">
                    <step.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
                {/* Connectors (hidden on small screens, shown between cards on large screens) */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-6 lg:-right-8 w-12 lg:w-16 h-0.5 border-t-2 border-dashed border-cyan-400 dark:border-cyan-600 animate-pulse z-0" style={{ transform: 'translateY(-50%)' }} />
                )}
                {/* Mobile Connector (visible only on small screens) */}
                {index < steps.length - 1 && (
                   <div className="md:hidden w-0.5 h-8 border-l-2 border-dashed border-cyan-400 dark:border-cyan-600 animate-pulse mx-auto mt-4" />
                )}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Supported Platforms Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 text-center">
        <motion.div {...defaultFadeUp} className="max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold mb-8">Who We Work With</h3>
          <div className="flex flex-wrap justify-center gap-4">
            {platforms.map((platform) => (
              <div 
                key={platform}
                className="px-6 py-3 rounded-full border border-slate-200/50 dark:border-slate-700/50 bg-white/30 dark:bg-slate-800/30 backdrop-blur-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-800/50 transition-colors shadow-sm"
              >
                {platform}
              </div>
            ))}
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default Landing;
