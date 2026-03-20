import {
  Bell,
  User,
  LayoutDashboard,
  Shield,
  FileText,
  Brain,
  Settings
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export default function App() {
   const data = [
    { day: "Mon", risk: 20 },
    { day: "Tue", risk: 40 },
    { day: "Wed", risk: 35 },
    { day: "Thu", risk: 60 },
    { day: "Fri", risk: 50 },
    { day: "Sat", risk: 70 },
    { day: "Sun", risk: 65 },
  ];
  return (
    <div className="flex h-screen bg-gray-100 animate-fadeIn">

      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-white flex flex-col p-5">
        <h1 className="text-2xl font-bold mb-8">
          Gig
          <span className="text-blue-400 drop-shadow-[0_0_10px_rgba(96,165,250,0.9)]">
            Shield
          </span>
        </h1>

        <nav className="space-y-4">
          <SidebarItem icon={<LayoutDashboard size={18}/>} text="Dashboard" />
          <SidebarItem icon={<Shield size={18}/>} text="Policies" />
          <SidebarItem icon={<FileText size={18}/>} text="Claims" />
          <SidebarItem icon={<Brain size={18}/>} text="AI Insights" />
          <SidebarItem icon={<Settings size={18}/>} text="Settings" />
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto">

        {/* Top Bar */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Dashboard
          </h2>
          <div className="flex items-center gap-4">
            <Bell className="cursor-pointer hover:scale-110 transition" />
            <User className="cursor-pointer hover:scale-110 transition" />
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="animate-fadeIn delay-100">
            <Card title="Active Plan" value="Premium" highlight />
          </div>
          <div className="animate-fadeIn delay-200">
            <Card title="Weekly Premium" value="₹40" />
          </div>
          <div className="animate-fadeIn delay-300">
            <Card title="Max Coverage" value="₹700" />
          </div>
          <div className="animate-fadeIn delay-500">
            <Card title="Income Protected" value="₹300" highlight />
          </div>
        </div>

        {/* Middle Section */}
      {/* Middle Section */}
<div className="grid grid-cols-3 gap-6">

  {/* Chart */}
  <div className="col-span-2 bg-white p-5 rounded-xl shadow hover:shadow-lg transition-all duration-300">
    <h3 className="font-semibold mb-3 text-gray-700">
      Weekly Risk Analysis 📊
    </h3>

    <div className="h-40">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="day" stroke="#9CA3AF" />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="risk"
            stroke="url(#colorGradient)"
            strokeWidth={3}
            dot={{ r: 4 }}
          />
          <defs>
            <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>  {/* ✅ THIS WAS MISSING */}

  {/* AI Insights */}
  <div className="bg-white p-5 rounded-xl shadow border border-blue-200 shadow-blue-200/40 hover:-translate-y-1 transition-all duration-300">
    <h3 className="font-semibold mb-3 text-gray-800 flex items-center gap-2">
      🤖 AI Insights
    </h3>

    <ul className="text-sm space-y-3 text-gray-700 font-medium">
      <li className="flex items-center gap-2">
        🌧️ <span className="text-blue-600">High rainfall expected</span>
      </li>
      <li className="flex items-center gap-2">
        📈 Premium may increase to{" "}
        <span className="text-purple-600 font-semibold">₹45</span>
      </li>
      <li className="flex items-center gap-2">
        ⚠️ Risk Level:{" "}
        <span className="text-red-500 font-semibold">HIGH</span>
      </li>
    </ul>
  </div>

</div>

        {/* Bottom Section */}
        <div className="grid grid-cols-2 gap-6 mt-6">

          {/* Coverage */}
          <div className="bg-white p-5 rounded-xl shadow hover:-translate-y-1 transition-all duration-300">
            <h3 className="font-semibold mb-3 text-gray-800">
              Coverage Status
            </h3>

            <p className="text-sm text-gray-600 mb-2">
              ₹300 / ₹700 used
            </p>

            <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full animate-bar shadow-md shadow-blue-400/50"></div>
            </div>
          </div>

          {/* Claims */}
          <div className="bg-white p-5 rounded-xl shadow hover:-translate-y-1 transition-all duration-300">
            <h3 className="font-semibold mb-3 text-gray-800">
              Claim History
            </h3>

            <ul className="text-sm text-gray-700 space-y-2 font-medium">
              <li className="flex items-center gap-2">
                🌧️ Rainfall Claim – <span className="text-blue-600">₹150</span>
              </li>
              <li className="flex items-center gap-2">
                🌡️ Heatwave Claim – <span className="text-red-500">₹120</span>
              </li>
            </ul>
          </div>

        </div>

      </div>
    </div>
  );
}

// Sidebar Item
function SidebarItem({ icon, text }) {
  return (
    <div className="flex items-center gap-2 text-gray-300 hover:text-white cursor-pointer transition-all duration-200 hover:translate-x-1 hover:scale-105">
      {icon}
      {text}
    </div>
  );
}

// Card Component
function Card({ title, value, highlight }) {
  return (
    <div className={`bg-white p-4 rounded-xl shadow transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer ${
      highlight ? "hover:shadow-blue-300/50" : ""
    }`}>
      <p className="text-xs uppercase tracking-wide text-gray-400 font-medium">
        {title}
      </p>

      <h3 className={`text-xl font-bold mt-1 ${
        highlight
          ? "text-blue-600 drop-shadow-[0_0_6px_rgba(59,130,246,0.6)]"
          : "text-gray-800"
      }`}>
        {value}
      </h3>
    </div>
  );
}