export const adminTopNavLinks = [
  { id: "home", label: "Home", route: "/" },
  { id: "dashboard", label: "Dashboard", route: "/dashboard" },
  { id: "calculator", label: "Calculator", route: "/calculator" },
  { id: "claims-page", label: "Claims", route: "/claim-tracker" },
  { id: "risk", label: "Risk Insights", route: "/risk-prediction" },
  { id: "command", label: "Admin", route: "/admin" },
] as const;

export const adminSidebarSections = [
  {
    label: "Command",
    items: [
      { id: "command", label: "Command Center", icon: "⚡" },
      { id: "claims-mgmt", label: "Claims", icon: "📋", badge: "3" },
      { id: "workers", label: "Workers", icon: "👥" },
      { id: "policies", label: "Policies", icon: "🛡️" },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { id: "riskmap", label: "Risk Map", icon: "🗺️" },
      { id: "threats", label: "Threat Events", icon: "⚠️" },
      { id: "analytics", label: "Analytics", icon: "📊" },
    ],
  },
  {
    label: "Operations",
    items: [
      { id: "support", label: "Support Inbox", icon: "🎫", badge: "2" },
      { id: "settings", label: "Settings", icon: "⚙️" },
    ],
  },
] as const;

export const commandCenterEvents = [
  {
    dot: "teal",
    title: "System Initialized",
    meta: "No active disruptions · All systems nominal",
  },
];

export const commandCenterTerminalExtras = [
  { tone: "t-ok", message: "[OK] Fraud detection engine: ACTIVE" },
  { tone: "t-ok", message: "[OK] Claims auto-processor: STANDBY" },
  { tone: "t-info", message: "[INFO] Platform health score: 97/100" },
  { tone: "t-sys", message: "[SYSTEM] Awaiting admin actions..." },
];

export const pendingApprovalClaims = [
  {
    id: "#CLM-001",
    name: "Arushi Garg",
    meta: "Heatwave · Delhi · 2h ago",
    amount: "Rs 750",
  },
  {
    id: "#CLM-002",
    name: "Sv Frvb",
    meta: "Rain Disruption · Bangalore",
    amount: "Rs 900",
  },
  {
    id: "#CLM-003",
    name: "Mitali Gupta",
    meta: "AQI Alert · Mumbai",
    amount: "Rs 500",
  },
] as const;

export const sampleAdminUsers = [
  {
    id: "sample-1",
    fullName: "Arushi Garg",
    email: "arushigarg880@gmail.com",
    phone: "+919998299254",
    platform: "Amazon Flex",
    city: "Delhi",
    trustScore: 100,
    activePlan: "GigAssure Standard",
  },
  {
    id: "sample-2",
    fullName: "Sv Frvb",
    email: "frvbsrnav@gmail.com",
    phone: "+919812138798",
    platform: "Porter",
    city: "Bangalore",
    trustScore: 100,
    activePlan: "GigAssure Premium",
  },
  {
    id: "sample-3",
    fullName: "Mitali Gupta",
    email: "mitaligupta805@gmail.com",
    phone: "9558367555",
    platform: "Swiggy",
    city: "Mumbai",
    trustScore: 100,
  },
  {
    id: "sample-4",
    fullName: "SNOWBALL",
    email: "ritikschraushan30@gmail.com",
    phone: "918210556138",
    platform: "Blinkit",
    city: "Bangalore",
    trustScore: 100,
  },
] as const;

export const cityRiskSummary = [
  { city: "Delhi", risk: 82, level: "high" },
  { city: "Mumbai", risk: 61, level: "medium" },
  { city: "Bangalore", risk: 34, level: "low" },
  { city: "Chennai", risk: 55, level: "medium" },
  { city: "Hyderabad", risk: 28, level: "low" },
] as const;

export const claimsFilters = [
  "All",
  "Pending",
  "Approved",
  "Rejected",
  "On Hold",
  "Fraud Risk",
] as const;

export const claimsTableRows = [
  {
    id: "#CLM-001",
    worker: "Arushi Garg",
    sub: "Amazon Flex · Delhi",
    city: "Delhi",
    trigger: "Heatwave (42°C)",
    amount: "Rs 750",
    fraudRisk: "Low",
    fraudTone: "green",
    status: "Pending",
    statusTone: "yellow",
    confidence: 91,
  },
  {
    id: "#CLM-002",
    worker: "Sv Frvb",
    sub: "Porter · Bangalore",
    city: "Bangalore",
    trigger: "Heavy Rain",
    amount: "Rs 900",
    fraudRisk: "Low",
    fraudTone: "green",
    status: "Pending",
    statusTone: "yellow",
    confidence: 87,
  },
  {
    id: "#CLM-003",
    worker: "Mitali Gupta",
    sub: "Swiggy · Mumbai",
    city: "Mumbai",
    trigger: "AQI Alert (>300)",
    amount: "Rs 500",
    fraudRisk: "Medium",
    fraudTone: "orange",
    status: "Pending",
    statusTone: "yellow",
    confidence: 72,
  },
] as const;

export const policiesTableRows = [
  {
    id: "#POL-001",
    worker: "Arushi Garg",
    sub: "Amazon Flex",
    plan: "Standard",
    planTone: "teal",
    premium: "Rs 199/mo",
    coverage: "Rs 5,000",
    startDate: "Jan 15, 2025",
    city: "Delhi",
    status: "Active",
    statusTone: "green",
  },
  {
    id: "#POL-002",
    worker: "Sv Frvb",
    sub: "Porter",
    plan: "Premium",
    planTone: "yellow",
    premium: "Rs 281/mo",
    coverage: "Rs 9,000",
    startDate: "Feb 1, 2025",
    city: "Bangalore",
    status: "Active",
    statusTone: "green",
  },
] as const;

export const coverageGapCards = [
  {
    tone: "red",
    icon: "⚠️",
    title: "Mumbai — High Risk",
    body: "1 worker without policy. Active AQI risk. Recommend immediate outreach.",
  },
  {
    tone: "orange",
    icon: "⚠️",
    title: "Bangalore — Medium Risk",
    body: "1 worker (SNOWBALL) without policy in active city. Consider upsell.",
  },
  {
    tone: "green",
    icon: "✅",
    title: "Delhi — Covered",
    body: "All active workers have active policies. No gaps detected.",
  },
] as const;

export const threatSignals = [
  {
    dot: "red",
    title: "Heatwave — Delhi",
    meta: "42°C · Severity: High · 1 active policy affected",
    badge: "High",
    badgeTone: "red",
  },
  {
    dot: "yellow",
    title: "AQI Alert — Mumbai",
    meta: "AQI 318 · Severity: Medium · 1 worker affected",
    badge: "Medium",
    badgeTone: "yellow",
  },
  {
    dot: "teal",
    title: "All Clear — Bangalore",
    meta: "No active disruptions · Normal operations",
    badge: "Clear",
    badgeTone: "green",
  },
] as const;

export const cityReadinessScores = [
  { city: "Delhi", score: "42 / 100", tone: "red", suffix: "⚠️" },
  { city: "Mumbai", score: "61 / 100", tone: "yellow" },
  { city: "Bangalore", score: "84 / 100", tone: "green" },
  { city: "Chennai", score: "68 / 100", tone: "yellow" },
  { city: "Hyderabad", score: "79 / 100", tone: "green" },
] as const;

export const threatEvents = [
  {
    dot: "red",
    title: "Heatwave — Delhi",
    meta: "Started 6h ago · Affects 1 policy · Payout exposure: Rs 750",
  },
  {
    dot: "yellow",
    title: "AQI Alert — Mumbai",
    meta: "Started 3h ago · Affects 1 worker · AQI 318",
  },
] as const;

export const analyticsBars = {
  claims: [
    { label: "Jan", height: "20%", tone: "teal" },
    { label: "Feb", height: "35%", tone: "teal" },
    { label: "Mar", height: "55%", tone: "teal" },
    { label: "Apr", height: "40%", tone: "teal" },
    { label: "May", height: "80%", tone: "orange" },
    { label: "Jun", height: "65%", tone: "teal" },
    { label: "Jul", height: "90%", tone: "red" },
  ],
  payouts: [
    { label: "Jan", height: "15%", tone: "yellow" },
    { label: "Feb", height: "30%", tone: "yellow" },
    { label: "Mar", height: "48%", tone: "yellow" },
    { label: "Apr", height: "38%", tone: "yellow" },
    { label: "May", height: "75%", tone: "orange" },
    { label: "Jun", height: "60%", tone: "yellow" },
    { label: "Jul", height: "85%", tone: "red" },
  ],
} as const;

export const supportTickets = [
  {
    id: "#TKT-001",
    title: "Policy activation issue — Mitali Gupta",
    meta: "Mumbai · 4h ago",
    badge: "Open",
    badgeTone: "yellow",
    body: "Worker reports difficulty activating Standard plan. Payment processed but policy still shows inactive after 2 hours.",
  },
  {
    id: "#TKT-002",
    title: "Claim payout delay — Arushi Garg",
    meta: "Delhi · 2h ago",
    badge: "Urgent",
    badgeTone: "orange",
    body: "Worker submitted claim for heatwave disruption 6h ago. No payout received. Asking for manual review of claim #CLM-001.",
  },
] as const;
