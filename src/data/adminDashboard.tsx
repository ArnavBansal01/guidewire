import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import "./AdminDashboard.css";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import {
  adminSidebarSections,
  adminTopNavLinks,
  analyticsBars,
  cityReadinessScores,
  cityRiskSummary,
  claimsFilters,
  claimsTableRows,
  commandCenterEvents,
  commandCenterTerminalExtras,
  coverageGapCards,
  pendingApprovalClaims,
  policiesTableRows,
  sampleAdminUsers,
  supportTickets,
  threatEvents,
  threatSignals,
} from "../data/adminDashboardContent";
import { fetchAdminDashboardData } from "../services/adminService";
import { createSimulatedClaim } from "../services/claimsService";
import { buildInitialAdminTerminalLogs } from "../services/adminConsoleService";
import type { AdminStats, UserProfile } from "../types/domain";

type AdminPage =
  | "command"
  | "claims-mgmt"
  | "workers"
  | "policies"
  | "riskmap"
  | "threats"
  | "analytics"
  | "support"
  | "settings";

const fallbackStats: AdminStats = {
  totalUsers: 4,
  activePolicies: 2,
  totalPayouts: 2150,
  fraudAlerts: 0,
};

const Admin = () => {
  const { signOutUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activePage, setActivePage] = useState<AdminPage>("command");
  const [stats, setStats] = useState<AdminStats>(fallbackStats);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimsFilter, setClaimsFilter] =
    useState<(typeof claimsFilters)[number]>("All");
  const [claimsSearch, setClaimsSearch] = useState("");
  const [workersSearch, setWorkersSearch] = useState("");
  const [simCity, setSimCity] = useState("");
  const [simType, setSimType] = useState("");
  const [simSeverity, setSimSeverity] = useState("High");
  const [preview, setPreview] = useState<{ workers: number; payout: number } | null>(null);
  const [terminalLogs, setTerminalLogs] = useState(() => [
    ...buildInitialAdminTerminalLogs(),
    "[INFO] 9 admin modules registered",
  ]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchAdminDashboardData();
        setStats({
          totalUsers: data.stats.totalUsers || fallbackStats.totalUsers,
          activePolicies: data.stats.activePolicies || fallbackStats.activePolicies,
          totalPayouts: data.stats.totalPayouts || fallbackStats.totalPayouts,
          fraudAlerts: data.stats.fraudAlerts || fallbackStats.fraudAlerts,
        });
        setUsers(data.users);
      } catch (error) {
        console.error("Error fetching admin dashboard:", error);
        setTerminalLogs((prev) => [
          ...prev,
          "[WARN] Live admin data unavailable, showing fallback content.",
        ]);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const displayUsers: UserProfile[] = users.length
    ? users
    : ([...sampleAdminUsers] as UserProfile[]);
  const filteredClaims = claimsTableRows.filter((claim) => {
    const text = `${claim.id} ${claim.worker} ${claim.city}`.toLowerCase();
    const filterMatch =
      claimsFilter === "All" ||
      (claimsFilter === "Fraud Risk" && claim.fraudRisk !== "Low") ||
      claim.status === claimsFilter;
    return filterMatch && text.includes(claimsSearch.toLowerCase());
  });
  const filteredWorkers = displayUsers.filter((user) =>
    `${user.fullName || ""} ${user.platform || ""} ${user.city || ""}`
      .toLowerCase()
      .includes(workersSearch.toLowerCase()),
  );

  const previewImpact = () => {
    if (!simCity || !simType) {
      return;
    }
    const workerCount = { Delhi: 1, Mumbai: 1, Bangalore: 2, Chennai: 0, Hyderabad: 0, Pune: 0 }[simCity] || 0;
    const payout = { Low: 250, Medium: 600, High: 900, Critical: 1500 }[simSeverity] || 500;
    setPreview({ workers: workerCount, payout: workerCount * payout });
  };

  const publishThreat = async () => {
    if (!simCity || !simType) {
      return;
    }
    setTerminalLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString("en-IN")}] Threat event published: ${simType} in ${simCity}`,
    ]);
    try {
      await createSimulatedClaim({
        selectedCity: simCity,
        selectedDisruption: simType,
        amount: preview?.payout || 250,
      });
    } catch (error) {
      console.error("Error publishing threat:", error);
      setTerminalLogs((prev) => [...prev, "[ERROR] Threat event sync failed."]);
    }
  };

  return (
    <div className={`admin-dashboard ${theme}`}>
      <nav className="topnav">
        <div className="nav-brand">
          <div className="nav-logo">⚡</div>
          <span className="nav-name">GigShield</span>
        </div>
        <div className="nav-links">
          {adminTopNavLinks.map((item) =>
            item.route === "/admin" ? (
              <button key={item.id} type="button" className="nav-link active" onClick={() => setActivePage("command")}>
                {item.label}
              </button>
            ) : (
              <Link key={item.id} to={item.route} className="nav-link">
                {item.label}
              </Link>
            ),
          )}
        </div>
        <div className="nav-right">
          <button
            className="theme-toggle"
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle admin theme"
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? (
              <Sun className="theme-toggle-icon" />
            ) : (
              <Moon className="theme-toggle-icon" />
            )}
          </button>
          <div className="nav-badge">Admin Access Only</div>
          <button className="btn-signout" type="button" onClick={() => void signOutUser()}>
            Sign Out
          </button>
        </div>
      </nav>

      <div className="shell">
        <aside className="sidebar">
          {adminSidebarSections.map((section) => (
            <div key={section.label}>
              <div className="sidebar-label">{section.label}</div>
              {section.items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`sidebar-item ${activePage === item.id ? "active" : ""}`}
                  onClick={() => setActivePage(item.id as AdminPage)}
                >
                  <span className="sidebar-icon">{item.icon}</span>
                  {item.label}
                  {"badge" in item ? (
                    <span className="sidebar-badge">{item.badge}</span>
                  ) : null}
                </button>
              ))}
            </div>
          ))}
        </aside>

        <main className="main">
          {activePage === "command" && (
            <>
              <Header badge="Admin Access Only" title="God Mode" accent="Simulator" subtitle="Control center for system health, fraud detection, and hackathon demonstrations. Phase 1 foundation active with 9 registered admin modules." />
              <div className="kpi-grid">
                <Kpi tone="teal" icon="👥" label="Total Users" value={loading ? "..." : String(stats.totalUsers)} sub="Registered workers" />
                <Kpi tone="teal" icon="🛡️" label="Active Policies" value={loading ? "..." : String(stats.activePolicies)} sub="Currently active" />
                <Kpi tone="orange" icon="⚠️" label="Fraud Alerts" value={loading ? "..." : String(stats.fraudAlerts)} sub="No active alerts" />
                <Kpi tone="yellow" icon="⚡" label="Total Payouts" value={loading ? "..." : `Rs ${stats.totalPayouts.toLocaleString()}`} sub="Live payout exposure" />
              </div>
              <div className="two-col">
                <Section title="Live User Directory">
                  <table className="data-table"><thead><tr><th>Name & Contact</th><th>Platform / City</th><th>Trust Score</th><th>Policy Status</th></tr></thead><tbody>{displayUsers.map((user) => <tr key={user.id}><td><div className="name">{user.fullName || "User"}</div><div className="sub">{user.email || "No email"}</div><div className="sub" style={{ color: "var(--teal)" }}>{user.phone || "No phone"}</div></td><td><div className="name">{user.platform || "Platform"}</div><div className="sub">{user.city || "Unknown City"}</div></td><td><span style={{ color: "var(--teal)", fontWeight: 700 }}>{user.trustScore || 100}%</span></td><td><span className={`badge ${user.activePlan ? "teal" : "gray"}`}>{user.activePlan || "No Policy"}</span></td></tr>)}</tbody></table>
                </Section>
                <div>
                  <Section title="Active Disruptions" tone="orange">
                    {commandCenterEvents.map((event) => <div className="event-item" key={event.title}><div className={`event-dot ${event.dot}`} /><div><div className="event-title">{event.title}</div><div className="event-meta">{event.meta}</div></div></div>)}
                    <div className="action-row"><button className="btn btn-warn" type="button" onClick={() => setActivePage("threats")}>⚡ Simulate Threat</button><button className="btn btn-ghost" type="button" onClick={() => setActivePage("riskmap")}>📊 View Map</button></div>
                  </Section>
                  <Section title="System Terminal" tone="green">
                    <div className="terminal">
                      {terminalLogs.map((log) => <div key={log} className={log.includes("[SYSTEM]") ? "t-sys" : log.includes("[ERROR]") ? "t-err" : log.includes("[OK]") ? "t-ok" : "t-info"}>{log}</div>)}
                      {commandCenterTerminalExtras.map((item) => <div key={item.message} className={item.tone}>{item.message}</div>)}
                    </div>
                  </Section>
                </div>
              </div>
              <div className="three-col">
                <Section title="Operational Health"><HealthCard /></Section>
                <Section title="Pending Approvals" tone="yellow">{pendingApprovalClaims.map((claim) => <div className="claim-row" key={claim.id}><div className="claim-id">{claim.id}</div><div className="claim-info"><div className="claim-name">{claim.name}</div><div className="claim-meta">{claim.meta}</div></div><div className="claim-amount">{claim.amount}</div></div>)}<div className="action-row"><button className="btn btn-primary" type="button" onClick={() => setActivePage("claims-mgmt")}>Review All</button></div></Section>
                <Section title="City Risk Summary" tone="red">{cityRiskSummary.map((item) => <RiskRow key={item.city} city={item.city} risk={item.risk} level={item.level} />)}</Section>
              </div>
            </>
          )}

          {activePage === "claims-mgmt" && (
            <>
              <Header badge="Claims Control" title="Claims" accent="Management" subtitle="Review, approve, reject, and manage all insurance claims with fraud risk indicators." />
              <div className="kpi-grid"><Kpi tone="teal" icon="📋" label="Total Claims" value="3" sub="All time" /><Kpi tone="yellow" icon="⏳" label="Pending" value="3" sub="Awaiting review" /><Kpi tone="green" icon="✅" label="Approved" value="0" sub="This month" /><Kpi tone="orange" icon="❌" label="Rejected" value="0" sub="This month" /></div>
              <Section title="Claims Table"><div className="search-bar-wrap"><input value={claimsSearch} onChange={(e) => setClaimsSearch(e.target.value)} placeholder="Search by Claim ID, user, city..." /></div><div className="filter-pills">{claimsFilters.map((filter) => <button key={filter} type="button" className={`pill ${claimsFilter === filter ? "active" : ""}`} onClick={() => setClaimsFilter(filter)}>{filter}</button>)}</div><table className="data-table"><thead><tr><th>Claim ID</th><th>Worker</th><th>City</th><th>Trigger Source</th><th>Amount</th><th>Fraud Risk</th><th>Status</th><th>Confidence</th><th>Actions</th></tr></thead><tbody>{filteredClaims.map((claim) => <tr key={claim.id}><td style={{ color: "var(--teal)", fontWeight: 700 }}>{claim.id}</td><td><div className="name">{claim.worker}</div><div className="sub">{claim.sub}</div></td><td>{claim.city}</td><td>{claim.trigger}</td><td style={{ color: "var(--yellow)", fontWeight: 700 }}>{claim.amount}</td><td><span className={`badge ${claim.fraudTone}`}>{claim.fraudRisk}</span></td><td><span className={`badge ${claim.statusTone}`}>{claim.status}</span></td><td><div className="score-wrap"><div className="score-bar"><div className="score-fill" style={{ width: `${claim.confidence}%` }} /></div><div className="score-val">{claim.confidence}%</div></div></td><td><div className="action-row"><button className="btn btn-primary" type="button">✓ Approve</button><button className="btn btn-danger" type="button">✗ Reject</button></div></td></tr>)}</tbody></table></Section>
            </>
          )}

          {activePage === "workers" && (
            <>
              <Header badge="Workers Module" title="Worker" accent="Directory" subtitle="Manage all registered gig workers — view profiles, stability scores, and account actions." />
              <div className="kpi-grid"><Kpi tone="teal" icon="👥" label="Total Workers" value="4" /><Kpi tone="green" icon="🟢" label="Active Today" value="2" /><Kpi tone="orange" icon="🚩" label="Flagged" value="0" /><Kpi tone="yellow" icon="📊" label="Avg Stability" value="96%" /></div>
              <Section title="All Workers"><div className="search-bar-wrap"><input value={workersSearch} onChange={(e) => setWorkersSearch(e.target.value)} placeholder="Search worker name, city, platform..." /></div><table className="data-table"><thead><tr><th>Worker</th><th>Platform / City</th><th>Policy</th><th>Total Claims</th><th>Claim Ratio</th><th>Stability Score</th><th>Last Active</th><th>Actions</th></tr></thead><tbody>{filteredWorkers.map((user, index) => { const score = [98, 95, 91, 100][index] || 96; const claimCount = [1, 1, 1, 0][index] || 0; return <tr key={user.id}><td><div className="name">{user.fullName}</div><div className="sub">{user.email} · {user.phone}</div></td><td><div className="name">{user.platform}</div><div className="sub">{user.city}</div></td><td><span className={`badge ${user.activePlan ? "teal" : "gray"}`}>{user.activePlan || "No Policy"}</span></td><td>{claimCount}</td><td style={{ color: score < 95 ? "var(--yellow)" : "var(--green)" }}>{score < 95 ? "Medium" : "Low"}</td><td><div className="score-wrap"><div className="score-bar"><div className="score-fill" style={{ width: `${score}%` }} /></div><div className="score-val">{score}%</div></div></td><td style={{ color: "var(--text-muted)" }}>{["2h ago", "1h ago", "5h ago", "1d ago"][index] || "Today"}</td><td><div className="action-row"><button className="btn btn-ghost" type="button">👁 View</button><button className="btn btn-danger" type="button">🚩 Flag</button></div></td></tr>; })}</tbody></table></Section>
            </>
          )}

          {activePage === "policies" && (
            <>
              <Header badge="Policy Management" title="Policy" accent="Control" subtitle="Manage all insurance plans — activate, deactivate, renew, and analyze coverage gaps." />
              <div className="kpi-grid"><Kpi tone="green" icon="✅" label="Active Policies" value="2" /><Kpi tone="teal" icon="⏸" label="Inactive" value="0" /><Kpi tone="yellow" icon="⚡" label="Total Premium" value="Rs 480" /><Kpi tone="orange" icon="🛡️" label="Max Coverage" value="Rs 9,000" /></div>
              <Section title="Policy Registry"><table className="data-table"><thead><tr><th>Policy ID</th><th>Worker</th><th>Plan Type</th><th>Premium</th><th>Coverage</th><th>Start Date</th><th>City</th><th>Status</th><th>Actions</th></tr></thead><tbody>{policiesTableRows.map((policy) => <tr key={policy.id}><td style={{ color: "var(--teal)", fontWeight: 700 }}>{policy.id}</td><td><div className="name">{policy.worker}</div><div className="sub">{policy.sub}</div></td><td><span className={`badge ${policy.planTone}`}>{policy.plan}</span></td><td>{policy.premium}</td><td style={{ color: "var(--green)", fontWeight: 600 }}>{policy.coverage}</td><td style={{ color: "var(--text-muted)" }}>{policy.startDate}</td><td>{policy.city}</td><td><span className={`badge ${policy.statusTone}`}>{policy.status}</span></td><td><div className="action-row"><button className="btn btn-ghost" type="button">Renew</button><button className="btn btn-danger" type="button">Deactivate</button></div></td></tr>)}</tbody></table></Section>
              <Section title="Coverage Gap Detector" tone="orange"><div className="three-col">{coverageGapCards.map((card) => <div key={card.title} className="ticket"><div style={{ marginBottom: 8, fontSize: 20 }}>{card.icon}</div><div className="ticket-title">{card.title}</div><div className="ticket-body">{card.body}</div></div>)}</div></Section>
            </>
          )}

          {activePage === "riskmap" && (
            <>
              <Header badge="Risk Intelligence" title="Risk" accent="Map" subtitle="City-wise risk overview, disruption markers, and live threat intelligence dashboard." />
              <div className="kpi-grid"><Kpi tone="orange" icon="🏙️" label="High Risk Cities" value="1" sub="Delhi: 82%" /><Kpi tone="yellow" icon="🌡️" label="Active Triggers" value="2" sub="Heatwave, AQI" /><Kpi tone="teal" icon="👷" label="Affected Workers" value="3" sub="In risk zones" /><Kpi tone="orange" icon="💸" label="Payout Exposure" value="Rs 2,150" sub="Expected liability" /></div>
              <div className="two-col"><Section title="City Risk Index">{cityRiskSummary.map((item) => <RiskRow key={item.city} city={item.city} risk={item.risk} level={item.level} suffixEmoji />)}</Section><div><Section title="Active Threat Signals" tone="red">{threatSignals.map((signal) => <div className="event-item" key={signal.title}><div className={`event-dot ${signal.dot}`} /><div style={{ flex: 1 }}><div className="event-title">{signal.title}</div><div className="event-meta">{signal.meta}</div></div><span className={`badge ${signal.badgeTone}`}>{signal.badge}</span></div>)}</Section><Section title="City Readiness Score">{cityReadinessScores.map((item) => <MiniStat key={item.city} label={item.city} value={`${item.score}${"suffix" in item ? ` ${item.suffix}` : ""}`} tone={item.tone} />)}</Section></div></div>
            </>
          )}

          {activePage === "threats" && (
            <>
              <Header badge="Threat Engine" title="Threat Events &" accent="Triggers" subtitle="Create, simulate, and manage disruption events. Preview impact before publishing." />
              <div className="two-col"><Section title="Global Disruption Simulator" tone="orange"><Field label="Target City"><select className="form-select" value={simCity} onChange={(e) => setSimCity(e.target.value)}><option value="">Select city</option><option>Delhi</option><option>Mumbai</option><option>Bangalore</option><option>Chennai</option><option>Hyderabad</option><option>Pune</option></select></Field><Field label="Disruption Type"><select className="form-select" value={simType} onChange={(e) => setSimType(e.target.value)}><option value="">Select type</option><option>Heatwave</option><option>Heavy Rain</option><option>AQI Alert</option><option>Cyclone Warning</option><option>Cold Wave</option><option>Thunderstorm</option></select></Field><Field label="Severity"><select className="form-select" value={simSeverity} onChange={(e) => setSimSeverity(e.target.value)}><option>Low</option><option>Medium</option><option>High</option><option>Critical</option></select></Field><div className="action-row"><button className="btn btn-warn" type="button" onClick={previewImpact}>🔍 Preview Impact</button><button className="btn btn-primary" type="button" onClick={() => void publishThreat()}>⚡ Publish Event</button><button className="btn btn-ghost" type="button">💾 Save Draft</button></div></Section><div>{preview ? <Section title="Impact Preview" tone="yellow"><MiniStat label="Workers Affected" value={String(preview.workers)} tone="yellow" /><MiniStat label="Est. Payout Exposure" value={`Rs ${preview.payout}`} tone="orange" /><div className="ticket-body">{simType} in {simCity} at {simSeverity} severity will trigger automated claim checks for {preview.workers} active worker(s).</div></Section> : null}<Section title="Active Events" tone="red">{threatEvents.map((event) => <div className="event-item" key={event.title}><div className={`event-dot ${event.dot}`} /><div style={{ flex: 1 }}><div className="event-title">{event.title}</div><div className="event-meta">{event.meta}</div></div><button className="btn btn-ghost" type="button">Resolve</button></div>)}</Section></div></div>
            </>
          )}

          {activePage === "analytics" && (
            <>
              <Header badge="Analytics Module" title="Platform" accent="Analytics" subtitle="Deep insights on claims, payouts, policy adoption, and loss forecasting." />
              <div className="kpi-grid"><Kpi tone="teal" icon="📈" label="Approval Rate" value="0%" sub="Pending review" /><Kpi tone="green" icon="⚡" label="Avg Settlement" value="—" sub="No settled claims yet" /><Kpi tone="yellow" icon="🔮" label="7-Day Forecast" value="Rs 3,200" sub="Predicted payout" /><Kpi tone="orange" icon="🛡️" label="Policy Penetration" value="50%" sub="2 of 4 workers" /></div>
              <div className="two-col"><Section title="Claims Over Time"><BarChart bars={analyticsBars.claims} /></Section><Section title="Payouts Over Time" tone="yellow"><BarChart bars={analyticsBars.payouts} /></Section></div>
              <div className="two-col"><Section title="Loss Forecast Panel" tone="orange"><MiniStat label="Today" value="Rs 0 (0 claims)" tone="yellow" /><MiniStat label="Next 3 Days" value="~Rs 1,200" tone="yellow" /><MiniStat label="Next 7 Days" value="~Rs 3,200" tone="orange" /><MiniStat label="Risk Drivers" value="Delhi Heatwave" tone="red" /><MiniStat label="Model Confidence" value="81%" tone="green" /></Section><Section title="Platform Distribution"><MiniStat label="Amazon Flex" value="1 worker (25%)" /><MiniStat label="Porter" value="1 worker (25%)" /><MiniStat label="Swiggy" value="1 worker (25%)" /><MiniStat label="Blinkit" value="1 worker (25%)" /><MiniStat label="Policy Conversion" value="50%" tone="teal" /></Section></div>
            </>
          )}

          {activePage === "support" && (
            <>
              <Header badge="Support Ops" title="Support" accent="Inbox" subtitle="Review support tickets, flagged claims, and admin verification queue." />
              <div className="kpi-grid"><Kpi tone="yellow" icon="🎫" label="Open Tickets" value="2" /><Kpi tone="orange" icon="🚩" label="Flagged Claims" value="1" /><Kpi tone="teal" icon="✅" label="Resolved Today" value="0" /><Kpi tone="green" icon="⚡" label="Avg Response" value="—" /></div>
              <div className="two-col"><Section title="Open Tickets" tone="yellow">{supportTickets.map((ticket) => <div className="ticket" key={ticket.id}><div className="ticket-top"><div><div className="ticket-title">{ticket.title}</div><div className="sub">{ticket.id} · {ticket.meta}</div></div><span className={`badge ${ticket.badgeTone}`}>{ticket.badge}</span></div><div className="ticket-body">{ticket.body}</div><div className="ticket-foot"><button className="btn btn-primary" type="button">✓ Resolve</button><button className="btn btn-ghost" type="button">💬 Reply</button><button className={`btn ${ticket.badgeTone === "orange" ? "btn-danger" : "btn-warn"}`} type="button">{ticket.badgeTone === "orange" ? "🚩 Flag Fraud" : "🔺 Escalate"}</button></div></div>)}</Section><div><Section title="Priority Recommendation" tone="red"><div className="ticket"><div className="ticket-title" style={{ color: "var(--teal)" }}>Admin Action Suggested</div><div className="ticket-body">1. Approve claim #CLM-001 — high confidence, valid trigger<br />2. Review #TKT-002 — worker reporting delay, escalation risk<br />3. Outreach Mumbai workers — policy coverage gap detected<br />4. Increase monitoring in Delhi — heatwave risk at 82%</div></div></Section><Section title="Fraud Watchlist" tone="orange"><MiniStat label="Active Watchlist Entries" value="0" tone="green" /><MiniStat label="Suspicious Claims" value="1 (Medium)" tone="yellow" /><MiniStat label="Fraud Score Threshold" value="75%" /></Section></div></div>
            </>
          )}

          {activePage === "settings" && (
            <>
              <Header badge="Admin Settings" title="Profile &" accent="Settings" subtitle="Manage your admin account, notification preferences, and system configuration." />
              <div className="two-col"><Section title="Admin Profile"><div className="profile-row"><div className="profile-avatar">A</div><div><div className="profile-name">Super Admin</div><div className="profile-role">God Mode Access</div><div className="sub" style={{ marginTop: 6 }}>admin@gigshield.io</div></div></div><Field label="Display Name"><input className="form-input" value="Super Admin" readOnly /></Field><Field label="Email"><input className="form-input" value="admin@gigshield.io" readOnly /></Field><div className="action-row"><button className="btn btn-primary" type="button">Save Changes</button><button className="btn btn-ghost" type="button">Change Password</button></div></Section><div><Section title="Notification Settings" tone="yellow"><MiniStat label="Fraud Alerts" value="Email + SMS" /><MiniStat label="New Claims" value="Email" /><MiniStat label="Disruption Events" value="Push + Email" /><MiniStat label="Daily Report" value="Disabled" /></Section><Section title="System Configuration" tone="orange"><Field label="Fraud Score Threshold"><input className="form-input" value="75%" readOnly /></Field><Field label="Auto-Approve Confidence Minimum"><input className="form-input" value="90%" readOnly /></Field><div className="action-row"><button className="btn btn-primary" type="button">Apply Config</button></div></Section></div></div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

function Header(props: { badge: string; title: string; accent: string; subtitle: string }) {
  return <div className="pg-header"><div className="pg-badge">{props.badge}</div><h1 className="pg-title">{props.title} <span>{props.accent}</span></h1><p className="pg-sub">{props.subtitle}</p></div>;
}

function Section(props: { title: string; children: React.ReactNode; tone?: "green" | "red" | "orange" | "yellow" }) {
  const style = props.tone ? { background: `var(--${props.tone})`, boxShadow: `0 0 8px var(--${props.tone})` } : undefined;
  return <div className="section-card"><div className="section-title"><span className="dot" style={style} />{props.title}</div>{props.children}</div>;
}

function Kpi(props: { tone: "teal" | "orange" | "green" | "yellow"; icon: string; label: string; value: string; sub?: string }) {
  return <div className={`kpi-card ${props.tone}`}><div className="kpi-icon">{props.icon}</div><div className="kpi-label">{props.label}</div><div className="kpi-value">{props.value}</div>{props.sub ? <div className="kpi-sub">{props.sub}</div> : null}</div>;
}

function MiniStat(props: { label: string; value: string; tone?: string }) {
  return <div className="stat-mini"><span className="stat-mini-label">{props.label}</span><span className="stat-mini-val" style={props.tone ? { color: `var(--${props.tone})` } : undefined}>{props.value}</span></div>;
}

function Field(props: { label: string; children: React.ReactNode }) {
  return <div className="form-group"><label className="form-label">{props.label}</label>{props.children}</div>;
}

function RiskRow(props: { city: string; risk: number; level: "high" | "medium" | "low"; suffixEmoji?: boolean }) {
  const emoji = props.suffixEmoji ? (props.level === "high" ? " 🔴" : props.level === "medium" ? " 🟡" : " 🟢") : "";
  return <div className="risk-city"><div className="city-name">{props.city}</div><div className="risk-bar"><div className={`risk-fill ${props.level}`} style={{ width: `${props.risk}%` }} /></div><div className={`risk-pct ${props.level}`}>{props.risk}%{emoji}</div></div>;
}

function HealthCard() {
  return <><div className="health-ring"><svg viewBox="0 0 110 110" width="110" height="110"><circle cx="55" cy="55" r="46" fill="none" stroke="rgba(32,80,140,0.3)" strokeWidth="10" /><circle cx="55" cy="55" r="46" fill="none" stroke="url(#healthGradient)" strokeWidth="10" strokeDasharray="289 289" strokeDashoffset="29" strokeLinecap="round" /><defs><linearGradient id="healthGradient" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#00d4c8" /><stop offset="100%" stopColor="#00b8d4" /></linearGradient></defs></svg><div className="health-text"><div className="health-pct">97%</div><div className="health-lbl">Health</div></div></div><MiniStat label="Uptime" value="99.9%" tone="green" /><MiniStat label="Automation Rate" value="84%" tone="teal" /><MiniStat label="Pending Actions" value="3" tone="yellow" /></>;
}

function BarChart(props: { bars: readonly { label: string; height: string; tone: string }[] }) {
  return <div className="bar-chart">{props.bars.map((bar) => <div className="bar-col" key={bar.label}><div className={`bar ${bar.tone}`} style={{ height: bar.height }} /><div className="bar-lbl">{bar.label}</div></div>)}</div>;
}

export default Admin;