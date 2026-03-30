import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, AlertCircle, Brain, Calendar } from "lucide-react";
import { mockRiskPredictions, mockHistoricalDisruptions } from "../mockData";

const RiskPrediction = () => {
  const getRiskColor = (level: string) => {
    switch (level) {
      case "high":
        return "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30";
      case "medium":
        return "text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30";
      case "low":
        return "text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30";
      default:
        return "text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800";
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 border border-cyan-500/20 dark:border-cyan-500/30 mb-4">
            <Brain className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span className="text-sm font-medium text-cyan-700 dark:text-cyan-300">
              AI-Powered Forecasting
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            AI Risk{" "}
            <span className="bg-gradient-to-r from-cyan-600 to-emerald-600 bg-clip-text text-transparent">
              Prediction
            </span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            7-day forward-looking analytics powered by weather APIs, historical
            patterns, and machine learning.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-900/50 backdrop-blur-sm rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  High Risk Days
                </p>
                <p className="text-3xl font-bold">
                  {
                    mockRiskPredictions.filter((d) => d.riskLevel === "high")
                      .length
                  }
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Next 7 days
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900/50 backdrop-blur-sm rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Expected Loss
                </p>
                <p className="text-3xl font-bold">
                  ₹
                  {mockRiskPredictions.reduce(
                    (sum, d) => sum + d.expectedIncomeLoss,
                    0,
                  )}
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Potential income impact
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900/50 backdrop-blur-sm rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Coverage Value
                </p>
                <p className="text-3xl font-bold">₹2000</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Your protection limit
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/50 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6">7-Day Risk Forecast</h2>
          <div className="w-full h-96 min-h-[300px] min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockRiskPredictions}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) =>
                    new Date(value).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })
                  }
                  className="text-sm"
                />
                <YAxis className="text-sm" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.9)",
                    border: "1px solid rgba(148, 163, 184, 0.2)",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString("en-IN", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })
                  }
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="predictedRainfall"
                  stroke="#06b6d4"
                  strokeWidth={3}
                  name="Rainfall (mm)"
                  dot={{ fill: "#06b6d4", r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="predictedAQI"
                  stroke="#10b981"
                  strokeWidth={3}
                  name="AQI"
                  dot={{ fill: "#10b981", r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="expectedIncomeLoss"
                  stroke="#ef4444"
                  strokeWidth={3}
                  name="Income Loss (₹)"
                  dot={{ fill: "#ef4444", r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white dark:bg-slate-900/50 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6">
            <h2 className="text-2xl font-bold mb-6">Daily Risk Breakdown</h2>
            <div className="space-y-4">
              {mockRiskPredictions.map((prediction) => (
                <div
                  key={prediction.date}
                  className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-semibold mb-1">
                        {new Date(prediction.date).toLocaleDateString("en-IN", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                        })}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <span>{prediction.predictedRainfall}mm</span>
                        <span>•</span>
                        <span>AQI {prediction.predictedAQI}</span>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${getRiskColor(
                        prediction.riskLevel,
                      )}`}
                    >
                      {prediction.riskLevel}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      Expected Loss:
                    </span>
                    <span className="font-bold text-red-600 dark:text-red-400">
                      ₹{prediction.expectedIncomeLoss}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900/50 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6">
            <h2 className="text-2xl font-bold mb-6">Historical Disruptions</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              Average disruption days per month in Delhi over the past 6 months
            </p>
            <div className="w-full h-80 min-h-[260px] min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockHistoricalDisruptions}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="month" className="text-sm" />
                  <YAxis className="text-sm" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(15, 23, 42, 0.9)",
                      border: "1px solid rgba(148, 163, 184, 0.2)",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="disruptionDays"
                    fill="#06b6d4"
                    name="Disruption Days"
                    radius={[8, 8, 0, 0]}
                  />
                  <Bar
                    dataKey="avgLoss"
                    fill="#10b981"
                    name="Avg Loss (₹)"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-2xl shadow-2xl p-8 text-white">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How Our AI Works</h2>
              <p className="text-cyan-50 mb-4">
                GigShield's prediction engine combines multiple data sources to
                provide accurate risk assessments:
              </p>
              <ul className="space-y-2 text-sm text-cyan-50">
                <li className="flex items-start gap-2">
                  <span className="font-semibold">Weather APIs:</span>
                  <span>
                    Real-time data from IMD, AccuWeather, and OpenWeather for
                    multi-source validation
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold">Historical Patterns:</span>
                  <span>
                    3 years of delivery disruption data correlated with weather
                    events
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold">Machine Learning:</span>
                  <span>
                    Neural networks trained on 10M+ delivery data points to
                    predict income impact
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold">Micro-zone Analysis:</span>
                  <span>
                    Risk calculated at neighborhood level, not city-wide
                    averages
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

export default RiskPrediction;
