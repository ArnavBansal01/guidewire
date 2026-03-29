import { Link, useLocation } from 'react-router-dom';
import { Shield, Zap, Plug, Activity, Check, Star, CloudRain, AlertTriangle, Thermometer, Wind, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { plans } from '../data/plans';

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
    { icon: Plug, title: 'Sync Data Sources', desc: 'Securely link your active gig economy accounts in under 60 seconds.' },
    { icon: Activity, title: 'Autonomous Monitoring', desc: 'Our systems track environmental and infrastructure variables in real-time.' },
    { icon: Zap, title: 'Rapid Settlement', desc: 'Disruptions trigger direct-to-bank settlements without any manual claim filing.' },
  ];

  const platforms = ['Zomato', 'Swiggy', 'Blinkit', 'Zepto', 'Uber', 'Ola'];

  const triggers = [
    { icon: CloudRain, label: 'Intense Rainfall', color: 'text-blue-500', bg: 'bg-white/80 dark:bg-slate-900/80', border: 'border-blue-100 dark:border-blue-900/40', desc: 'Rainfall exceeding 15mm/hr in your delivery zone.' },
    { icon: AlertTriangle, label: 'Emergency Curfews', color: 'text-red-500', bg: 'bg-white/80 dark:bg-slate-900/80', border: 'border-red-100 dark:border-red-900/40', desc: 'Government-mandated movement restrictions.' },
    { icon: Thermometer, label: 'Severe Heatwave', color: 'text-amber-500', bg: 'bg-white/80 dark:bg-slate-900/80', border: 'border-amber-100 dark:border-amber-900/40', desc: 'Temperature peaks crossing 42°C for safety.' },
    { icon: Wind, label: 'Critical Air Quality', color: 'text-purple-500', bg: 'bg-white/80 dark:bg-slate-900/80', border: 'border-purple-100 dark:border-purple-900/40', desc: 'AQI levels crossing the hazardous 400+ mark.' },
  ];

  const testimonials = [
    {
      name: 'Rahul Kumar',
      role: 'Delivery Partner · Swiggy',
      quote: "App went down for 3 hours. By Sunday morning, ₹600 was in my account. I did not file anything.",
      amount: '₹600 received',
      reason: 'App Outage'
    },
    {
      name: 'Priya Mistry',
      role: 'Delivery Partner · Zomato',
      quote: "Heavy rain kept me home. Got a message saying ₹560 deposited. No calls, no forms. It just happened.",
      amount: '₹560 received',
      reason: 'Heavy Rain'
    },
    {
      name: 'Arjun Sharma',
      role: 'Driver Partner · Uber',
      quote: "Curfew was declared and I could not drive all day. Got an SMS that ₹350 was initiated within 90 mins.",
      amount: '₹350 received',
      reason: 'Curfew'
    }
  ];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (location.hash === '#plans') {
      setIsModalOpen(true);
      document.body.style.overflow = 'hidden';
    } else {
      setIsModalOpen(false);
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    }
  }, [location.hash]);

  const closeModal = () => {
    window.location.hash = '';
    setIsModalOpen(false);
  };

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

              <h1 className="text-3xl sm:text-6xl lg:text-5xl xl:text-8xl font-black mb-6 leading-[1.1] tracking-tighter text-slate-900 dark:text-white text-center lg:text-left">
                Shield your earnings. <br />
                Smart. Simple. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-emerald-500">
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

      <section className="py-12 sm:py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            {...defaultFadeUp}
            className="flex flex-row justify-between sm:grid sm:grid-cols-3 gap-2 sm:gap-8 text-center"
          >
            {stats.map((stat, index) => (
              <div key={index} className="flex-1 p-2 sm:p-6 min-w-0">
                <div className="text-xl sm:text-5xl font-black bg-gradient-to-r from-cyan-600 to-emerald-600 bg-clip-text text-transparent mb-1 sm:mb-2 whitespace-nowrap">
                  {stat.value}
                </div>
                <div className="text-[8px] sm:text-base text-slate-600 dark:text-slate-400 font-bold uppercase tracking-tight">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div {...defaultFadeUp} className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-black mb-4 tracking-tighter text-slate-900 dark:text-white uppercase italic">Our Protection Architecture</h2>
            <div className="w-20 h-1 bg-cyan-500 mx-auto mb-6 rounded-full" />
            <p className="text-base sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              GigShield operates autonomously in the background. Connect your platform once and let our risk engine manage your coverage.
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
                  <h3 className="text-xl font-bold mb-3 italic tracking-tight">{step.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
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
      <section className="py-24 px-4 sm:px-6 lg:px-8 text-center border-t border-slate-200 dark:border-slate-800 bg-white/5 dark:bg-slate-900/5 backdrop-blur-sm">
        <motion.div {...defaultFadeUp} className="max-w-4xl mx-auto">
          <h3 className="text-3xl font-bold mb-4">Our Supported Ecosystems</h3>
          <p className="text-slate-500 mb-12 max-w-xl mx-auto">Get instantaneous coverage across India's largest delivery and mobility platforms.</p>
          <div className="flex flex-wrap justify-center gap-4">
            {platforms.map((platform) => (
              <div 
                key={platform}
                className="px-8 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-bold text-slate-800 dark:text-slate-200 hover:border-cyan-500 dark:hover:border-cyan-500 transition-all shadow-sm hover:shadow-md"
              >
                {platform}
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Triggers Section */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[120px] -z-10" />
        
        <div className="max-w-7xl mx-auto">
          <motion.div {...defaultFadeUp} className="text-center mb-12 sm:mb-20">
            <h2 className="text-4xl sm:text-6xl font-black mb-4 sm:mb-6 tracking-tight relative inline-block">
              <span className="text-slate-900 dark:text-white">Auto-Detection</span>
              <span className="block text-emerald-500 dark:text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">Protocols</span>
            </h2>
            <p className="text-sm sm:text-xl text-slate-500 max-w-2xl mx-auto mt-4 sm:mt-6 px-4">When the world gets tough, GigShield steps in. Our data engine monitors these environmental triggers 24/7 to secure your livelihood.</p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
             {triggers.map((trigger, i) => (
               <motion.div 
                 key={i} 
                 {...defaultFadeUp}
                 transition={{ ...defaultFadeUp.transition, delay: i * 0.1 }}
                 className="relative group h-full"
               >
                 <div className="absolute -inset-1 bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 rounded-[32px] blur opacity-25 group-hover:opacity-100 transition duration-500" />
                 <div className="relative h-full bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/20 dark:border-slate-800/50 p-6 sm:p-10 rounded-[32px] sm:rounded-[32px] flex flex-col items-center text-center gap-4 sm:gap-6 shadow-xl hover:shadow-2xl transition-all">
                   <div className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl ${trigger.bg} border ${trigger.border} group-hover:scale-110 transition-transform shadow-inner`}>
                     <trigger.icon className={`w-8 h-8 sm:w-10 sm:h-10 ${trigger.color}`} />
                   </div>
                   <div>
                     <h4 className="text-base sm:text-2xl font-bold text-slate-900 dark:text-white mb-2 sm:mb-3 leading-tight">{trigger.label}</h4>
                     <p className="text-[10px] sm:text-sm text-slate-500 leading-relaxed font-medium">{(trigger as any).desc}</p>
                   </div>
                   <div className="mt-auto pt-2 sm:pt-4 flex items-center gap-2 text-[8px] sm:text-[10px] font-black uppercase tracking-tighter text-emerald-500/60">
                      <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                      Live Monitoring Active
                   </div>
                 </div>
               </motion.div>
             ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-slate-50/50 dark:bg-slate-950/20">
        <div className="max-w-7xl mx-auto">
           <motion.div {...defaultFadeUp} className="text-center mb-16 sm:mb-24">
              <span className="text-[10px] sm:text-xs font-bold text-emerald-500 uppercase tracking-[0.3em] mb-4 block">Proven Resilience</span>
              <h2 className="text-3xl sm:text-5xl font-black mb-6">Real Payouts, Real Stories</h2>
              <div className="w-16 sm:w-24 h-1 sm:h-1.5 bg-gradient-to-r from-cyan-500 to-emerald-500 mx-auto rounded-full" />
           </motion.div>

           <div className="grid md:grid-cols-3 gap-6 sm:gap-8 items-start">
              {testimonials.map((t, i) => (
                <motion.div 
                   key={i} 
                   {...defaultFadeUp} 
                   transition={{ ...defaultFadeUp.transition, delay: i * 0.1 }}
                   className={`p-8 sm:p-10 bg-white dark:bg-slate-900 rounded-[32px] sm:rounded-[40px] border border-slate-200 dark:border-slate-800 text-left flex flex-col relative shadow-lg hover:shadow-2xl transition-all ${i === 1 ? 'md:-translate-y-8' : ''}`}
                >
                   <div className="absolute -top-5 sm:-top-6 left-8 sm:left-10 p-3 sm:p-4 bg-slate-900 dark:bg-white rounded-xl sm:rounded-2xl shadow-xl">
                      <Star className="w-4 h-4 sm:w-6 sm:h-6 text-amber-400 fill-current" />
                   </div>
                   
                   <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed italic mb-8 sm:mb-12 mt-2 sm:mt-4 font-medium">
                      "{t.quote}"
                   </p>
                   
                   <div className="flex items-center gap-4 border-t border-slate-100 dark:border-slate-800 pt-8">
                      <div className="w-12 h-12 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 rounded-full flex-shrink-0" />
                      <div>
                         <div className="font-bold text-slate-900 dark:text-white leading-none mb-1">{t.name}</div>
                         <div className="text-[10px] text-slate-400 uppercase tracking-widest font-black">{t.role}</div>
                      </div>
                   </div>
                   
                   <div className="mt-8 py-3 px-5 bg-emerald-500/10 rounded-2xl flex items-center justify-between">
                      <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">{t.reason} Event</span>
                      <span className="text-emerald-500 font-bold">{t.amount}</span>
                   </div>
                </motion.div>
              ))}
           </div>
        </div>
      </section>

      {/* About Section - Revamped */}
      <section id="about" className="py-24 sm:py-40 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] bg-cyan-500/10 rounded-full blur-[150px] translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] bg-emerald-500/10 rounded-full blur-[150px] -translate-x-1/2 translate-y-1/2" />

        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 sm:gap-20 items-center">
            <motion.div {...defaultFadeUp}>
              <h2 className="text-4xl sm:text-7xl font-black mb-6 sm:mb-8 leading-tight">
                Insurance that <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-emerald-500">Doesn't Argue.</span>
              </h2>
              <div className="space-y-6 sm:space-y-8 text-lg sm:text-xl text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                <p>
                  Old-school coverage is broken. Why should you file a claim for a storm everyone can see on the radar? Why wait weeks for a human to "verify" what data already knows?
                </p>
                <p className="p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-3xl sm:rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-xl relative">
                  <span className="absolute -top-3 -left-3 sm:-top-4 sm:-left-4 text-4xl sm:text-6xl text-cyan-500/20 font-black italic">"</span>
                  GigShield is built on the principle of <span className="text-slate-900 dark:text-white font-black">Parametric Truth</span>. Our data ecosystem connects directly to your platform's pulse, ensuring you get paid for the hours you intended to work — guaranteed.
                </p>
              </div>
            </motion.div>

            <motion.div 
               {...defaultFadeUp} 
               transition={{ ...defaultFadeUp.transition, delay: 0.2 }}
               className="grid sm:grid-cols-2 gap-6"
            >
               {[
                  { title: 'Zero Arguments', desc: 'Real-world data points serve as the final verdict. If the storm hit, we pay.' },
                  { title: 'Privacy First', desc: 'We monitor zones and platform APIs, not your individual GPS steps.' },
                  { title: 'Pure Automation', desc: 'From risk calculation to bank settlement, not a single human delays your payout.' },
                  { title: 'Liquidity Pools', desc: 'GigShield maintains massive rainy-day reserves to ensure settlement even in city-wide outages.' }
               ].map((item, idx) => (
                  <div key={idx} className="p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm hover:shadow-xl transition-all">
                     <h4 className="text-lg font-black text-slate-900 dark:text-white mb-3 uppercase tracking-tight">{item.title}</h4>
                     <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                  </div>
               ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section - Premium Redesign */}
      <section id="faq" className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-slate-50/30 dark:bg-slate-900/10">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2" />
        
        <motion.div {...defaultFadeUp} className="max-w-4xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <span className="text-[10px] sm:text-xs font-black text-cyan-500 uppercase tracking-[0.2em] mb-4 block">Knowledge Base</span>
            <h2 className="text-3xl sm:text-5xl font-black mb-4 sm:mb-6 tracking-tight">Got Questions? <br /><span className="text-slate-400">We've Got Answers.</span></h2>
          </div>
          
          <div className="grid gap-3 sm:gap-4">
            {[
              { q: 'How does the payout process work?', a: 'Completely autonomously. Our nodes monitor weather and platform data streams. When a disruption threshold is crossed in your active zone, a settlement is automatically initiated. Zero paperwork required.' },
              { q: 'Is there any upfront cost?', a: 'No. GigShield operates on a performance-based contribution model. Your weekly premium is automatically handled via your linked account, ensuring your coverage is always active without requiring upfront deposits.' },
              { q: 'What is the average settlement time?', a: 'GigShield is engineered for speed. Most settlements are processed and initiated toward your registered bank account within 5 minutes of the disruption event being logged.' },
              { q: 'Can I cancel my coverage?', a: 'Yes, at any time. You have full control over your protection cycles. Canceling immediately stops the next week\'s deduction while keeping you covered for the remainder of your current active cycle.' }
            ].map((faq, index) => (
              <motion.div 
                key={index}
                whileHover={{ scale: 1.01 }}
                className="group p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-[24px] sm:rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-cyan-500/30 transition-all cursor-default"
              >
                <div className="flex gap-4 sm:gap-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 group-hover:bg-cyan-500/10 transition-colors">
                    <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400 group-hover:text-cyan-500 transition-colors" />
                  </div>
                  <div>
                    <h4 className="text-base sm:text-xl font-bold text-slate-900 dark:text-white mb-2 sm:mb-3 tracking-tight leading-tight">{faq.q}</h4>
                    <p className="text-[10px] sm:text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                      {faq.a}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
          <h3 className="text-lg sm:text-2xl font-black mb-8 italic text-slate-400 dark:text-slate-600 text-center max-w-2xl px-4">
            "Your safety net, automated. Focus on the work, we'll handle the unexpected."
          </h3>
          <div className="flex flex-row items-center justify-center flex-wrap gap-4 sm:gap-6 mt-4">
            <Link to="/terms" className="text-[10px] sm:text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">Terms & Conditions</Link>
            <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
            <Link to="/privacy" className="text-[10px] sm:text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">Privacy Policy</Link>
            <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
            <a href="#" className="text-[10px] sm:text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">Contact Support</a>
          </div>
          <p className="text-xs text-slate-400 mt-12">© {new Date().getFullYear()} Gigshield Inc. All rights reserved.</p>
        </div>
      </footer>

      {/* Plans Modal Overlay */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/40 dark:bg-slate-900/60 backdrop-blur-sm" onClick={closeModal} />
            
            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-5xl max-h-[85vh] overflow-y-auto bg-white dark:bg-slate-950 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8"
            >
              <button 
                onClick={closeModal}
                className="absolute top-4 right-4 p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors z-10"
              >
                <X className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              </button>

              <div className="text-center mb-10 mt-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Flexible Coverage</span>
                <h2 className="text-3xl sm:text-4xl font-bold mb-3">Choose your protection</h2>
                <p className="text-sm text-slate-500 max-w-xl mx-auto">No upfront payment. Premium deducted only when disruptions trigger your coverage.</p>
              </div>

              <div className="grid md:grid-cols-3 gap-5 lg:gap-6">
                 {plans.map((plan, i) => (
                   <div 
                     key={i} 
                     className={`relative p-6 rounded-[24px] border ${plan.popular ? 'bg-slate-900 dark:bg-white border-slate-900 dark:border-white shadow-xl scale-100 md:scale-105 z-10' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800'} flex flex-col items-start text-left`}
                   >
                     {plan.popular && (
                       <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-amber-400 text-slate-900 text-[10px] font-black uppercase rounded-full">Most Popular</span>
                     )}
                     <span className={`text-[10px] font-bold ${plan.popular ? 'text-cyan-400 dark:text-cyan-600' : 'text-slate-400'} uppercase mb-1`}>{plan.name}</span>
                     <div className="flex items-baseline gap-1 mb-6">
                        <span className={`text-4xl font-black ${plan.popular ? 'text-white dark:text-slate-900' : 'text-slate-900 dark:text-white'}`}>{plan.price}</span>
                        <span className={`text-xs ${plan.popular ? 'text-slate-400' : 'text-slate-500'}`}>/week</span>
                     </div>
                     
                     <div className="space-y-3 mb-8 flex-1 w-full">
                        {plan.features.map((feature, j) => (
                          <div key={j} className="flex gap-2.5">
                             <Check className={`w-4 h-4 flex-shrink-0 ${plan.popular ? 'text-emerald-400' : 'text-emerald-500'}`} />
                             <span className={`text-xs ${plan.popular ? 'text-slate-300 dark:text-slate-600' : 'text-slate-600 dark:text-slate-400 font-medium'}`}>{feature}</span>
                          </div>
                        ))}
                     </div>

                     <button className={`w-full py-3.5 rounded-xl text-sm font-black transition-all ${plan.popular ? 'bg-amber-400 text-slate-900 hover:bg-amber-300 shadow-md' : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100'}`}>
                        {plan.cta} &rarr;
                     </button>
                   </div>
                 ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Landing;
