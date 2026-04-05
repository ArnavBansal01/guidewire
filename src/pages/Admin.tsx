import { useEffect, useMemo, useState } from "react";
import "./AdminDashboard.css";
import { useTheme } from "../contexts/ThemeContext";
import {
  claimsFilters,
  analyticsBars,
  cityReadinessScores,
  cityRiskSummary,
  supportTickets,
  threatEvents,
  threatSignals,
} from "../data/adminDashboardContent";
import {
  buildAdminStatsFromData,
  buildSystemIntelligenceFromData,
  subscribeUsersRealtime,
} from "../services/adminService";
import { buildInitialAdminTerminalLogs } from "../services/adminConsoleService";
import { cities } from "../mockData";
import LocationSearchSelect from "../components/LocationSearchSelect";
import type { AdminStats, UserProfile } from "../types/domain";
import { useMutation } from "@tanstack/react-query";
import {
  type ClaimRecord,
  approveClaim,
  rejectClaim,
  createSimulatedClaim,
  subscribeClaimsRealtime,
} from "../services/claimsService";

const getErrorMessage = (err: unknown) =>
  err instanceof Error ? err.message : "Unknown error";

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
  totalUsers: 0,
  activePolicies: 0,
  totalPayouts: 0,
  fraudAlerts: 0,
};

const cleanSidebarSections = [
  {
    label: "Main",
    items: [
      { id: "command", label: "Command Center", icon: "⚡" },
      { id: "claims-mgmt", label: "Claims", icon: "📋" },
      { id: "workers", label: "Workers", icon: "👥" },
      { id: "policies", label: "Policies", icon: "🛡️" },
    ],
  },
  {
    label: "Account",
    items: [{ id: "settings", label: "Settings", icon: "⚙️" }],
  },
] as const;

const normalizeStatus = (status?: string) => {
  const normalized = (status || "PENDING").toUpperCase();
  if (normalized === "APPROVED") return "Approved";
  if (normalized === "REJECTED") return "Rejected";
  if (normalized === "ON HOLD") return "On Hold";
  return "Pending";
};

const normalizeFraudRisk = (fraudRisk?: string) => {
  const normalized = (fraudRisk || "low").toLowerCase();
  if (normalized === "high") return "High";
  if (normalized === "medium") return "Medium";
  return "Low";
};

type AdminClaimRow = {
  id: string;
  worker: string;
  sub?: string;
  city?: string;
  trigger?: string;
  amount: string;
  fraudRisk?: string;
  fraudTone?: "green" | "orange" | "red";
  status?: string;
  statusTone?: "green" | "yellow" | "red";
  confidence: number;
  realId?: string;
  platform?: string;
  location?: string;
};

const Admin = () => {
  const { theme } = useTheme();
  const [activePage, setActivePage] = useState<AdminPage>("command");
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [usersLoaded, setUsersLoaded] = useState(false);
  const [realClaims, setRealClaims] = useState<ClaimRecord[]>([]);
  const [claimsLoading, setClaimsLoading] = useState(true);
  const [claimsError, setClaimsError] = useState(false);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string>("");
  const [claimsFilter, setClaimsFilter] =
    useState<(typeof claimsFilters)[number]>("All");
  const [claimsSearch, setClaimsSearch] = useState("");
  const [workersSearch, setWorkersSearch] = useState("");
  const [simCity, setSimCity] = useState("");
  const [simType, setSimType] = useState("");
  const [simSeverity, setSimSeverity] = useState("High");
  const [pendingClaimIds, setPendingClaimIds] = useState<string[]>([]);
  const [preview, setPreview] = useState<{
    workers: number;
    payout: number;
  } | null>(null);
  const [terminalLogs, setTerminalLogs] = useState(() => [
    ...buildInitialAdminTerminalLogs(),
    "[INFO] 9 admin modules registered",
  ]);

  useEffect(() => {
    const markSynced = () => {
      setIsRealtimeConnected(true);
      setLastSyncedAt(new Date().toLocaleTimeString("en-IN"));
    };

    const usersUnsub = subscribeUsersRealtime(
      (liveUsers) => {
        setUsers(liveUsers);
        setUsersLoaded(true);
        markSynced();
      },
      (error) => {
        console.error("Users realtime listener failed:", error);
        setUsersLoaded(true);
        setIsRealtimeConnected(false);
        setTerminalLogs((prev) => [
          ...prev,
          `[WARN] Users realtime sync failed: ${getErrorMessage(error)}`,
        ]);
      },
    );

    const claimsUnsub = subscribeClaimsRealtime(
      (claims) => {
        setRealClaims(claims);
        setClaimsLoading(false);
        setClaimsError(false);
        markSynced();
      },
      (error) => {
        console.error("Claims realtime listener failed:", error);
        setClaimsLoading(false);
        setClaimsError(true);
        setIsRealtimeConnected(false);
      },
    );

    return () => {
      usersUnsub();
      claimsUnsub();
    };
  }, []);

  const displayUsers: UserProfile[] = users;

  const stats: AdminStats = useMemo(() => {
    if (!usersLoaded && realClaims.length === 0) {
      return fallbackStats;
    }
    return buildAdminStatsFromData(displayUsers, realClaims);
  }, [displayUsers, realClaims, usersLoaded]);

  const intel = useMemo(
    () => buildSystemIntelligenceFromData(displayUsers, realClaims),
    [displayUsers, realClaims],
  );

  const intelLoading = !usersLoaded && claimsLoading;

  // ── APPROVE MUTATION ──
  const approveMutation = useMutation({
    mutationFn: (id: string) => approveClaim(id),
    onMutate: async (id: string) => {
      setPendingClaimIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
      setRealClaims((prev) =>
        prev.map((claim) =>
          claim.id === id ? { ...claim, status: "APPROVED" } : claim,
        ),
      );
      return { id };
    },
    onSuccess: (_data: unknown, id: string) => {
      setTerminalLogs((prev) => [
        ...prev,
        `[OK] Claim ${id} approved successfully.`,
      ]);
    },
    onError: (err: unknown, id: string, context?: { id: string }) => {
      const rollbackId = context?.id || id;
      setRealClaims((prev) =>
        prev.map((claim) =>
          claim.id === rollbackId ? { ...claim, status: "PENDING" } : claim,
        ),
      );
      setTerminalLogs((prev) => [
        ...prev,
        `[ERROR] Approve failed for ${id}: ${getErrorMessage(err)}`,
      ]);
    },
    onSettled: (_data, _error, id) => {
      setPendingClaimIds((prev) =>
        prev.filter((pendingId) => pendingId !== id),
      );
    },
  });

  // ── REJECT MUTATION ──
  const rejectMutation = useMutation({
    mutationFn: (id: string) => rejectClaim(id),
    onMutate: async (id: string) => {
      setPendingClaimIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
      setRealClaims((prev) =>
        prev.map((claim) =>
          claim.id === id ? { ...claim, status: "REJECTED" } : claim,
        ),
      );
      return { id };
    },
    onSuccess: (_data: unknown, id: string) => {
      setTerminalLogs((prev) => [
        ...prev,
        `[OK] Claim ${id} rejected successfully.`,
      ]);
    },
    onError: (err: unknown, id: string, context?: { id: string }) => {
      const rollbackId = context?.id || id;
      setRealClaims((prev) =>
        prev.map((claim) =>
          claim.id === rollbackId ? { ...claim, status: "PENDING" } : claim,
        ),
      );
      setTerminalLogs((prev) => [
        ...prev,
        `[ERROR] Reject failed for ${id}: ${getErrorMessage(err)}`,
      ]);
    },
    onSettled: (_data, _error, id) => {
      setPendingClaimIds((prev) =>
        prev.filter((pendingId) => pendingId !== id),
      );
    },
  });

  useEffect(() => {
    if (!claimsError) return;
    setTerminalLogs((prev) => {
      if (
        prev.includes(
          "[WARN] Claims realtime stream unavailable. Live claims cannot be loaded.",
        )
      ) {
        return prev;
      }
      return [
        ...prev,
        "[WARN] Claims realtime stream unavailable. Live claims cannot be loaded.",
      ];
    });
  }, [claimsError]);

  // ── BUTTON HANDLERS ──
  const handleApprove = (id: string) => {
    approveMutation.mutate(id);
  };

  const handleReject = (id: string) => {
    rejectMutation.mutate(id);
  };

  const claimsSource: AdminClaimRow[] = realClaims.map((claim) => ({
    id: claim.id,
    worker: claim.workerName || "Unknown",
    sub: `${claim.platform || "Platform unavailable"} · ${claim.location || "Unknown city"}`,
    city: claim.location || "",
    trigger: claim.triggerSource || claim.triggerType || "Manual",
    amount: `Rs ${(claim.amount || 0).toLocaleString("en-IN")}`,
    fraudRisk: claim.fraudRisk || "Low",
    fraudTone:
      (claim.fraudRisk || "").toLowerCase() === "high"
        ? "red"
        : (claim.fraudRisk || "").toLowerCase() === "medium"
          ? "orange"
          : "green",
    status: claim.status || "PENDING",
    statusTone:
      claim.status === "APPROVED"
        ? "green"
        : claim.status === "REJECTED"
          ? "red"
          : "yellow",
    confidence: claim.confidenceScore || 75,
    realId: claim.id,
  }));

  const normalizedClaimsSource = claimsSource.map((claim) => {
    const fraudRisk = normalizeFraudRisk(claim.fraudRisk);
    const status = normalizeStatus(claim.status);
    return {
      ...claim,
      sub:
        claim.sub ||
        `${claim.platform || "Platform unavailable"} · ${claim.location || "Unknown city"}`,
      fraudRisk,
      fraudTone:
        fraudRisk === "High"
          ? "red"
          : fraudRisk === "Medium"
            ? "orange"
            : "green",
      status,
      statusTone:
        status === "Approved"
          ? "green"
          : status === "Rejected"
            ? "red"
            : "yellow",
      isMock: !claim.realId,
    };
  });

  const filteredClaims = normalizedClaimsSource.filter((claim) => {
    const text = `${claim.id} ${claim.worker} ${claim.city}`.toLowerCase();
    const filterMatch =
      claimsFilter === "All" ||
      (claimsFilter === "Fraud Risk" && claim.fraudRisk !== "Low") ||
      normalizeStatus(claim.status) === claimsFilter;
    return filterMatch && text.includes(claimsSearch.toLowerCase());
  });

  const pendingClaims = normalizedClaimsSource.filter(
    (claim) => claim.status === "Pending",
  );
  const approvedClaims = normalizedClaimsSource.filter(
    (claim) => claim.status === "Approved",
  );
  const rejectedClaims = normalizedClaimsSource.filter(
    (claim) => claim.status === "Rejected",
  );

  const activePolicyUsers = displayUsers.filter((user) =>
    Boolean(user.activePlan),
  );
  const inactivePolicyUsersCount = Math.max(
    displayUsers.length - activePolicyUsers.length,
    0,
  );

  const policyRows = activePolicyUsers.map((user, index) => {
    const userClaims = realClaims.filter(
      (claim) =>
        (claim.workerName || "").toLowerCase().trim() ===
        (user.fullName || "").toLowerCase().trim(),
    );

    const paidAmount = userClaims.reduce(
      (sum, claim) =>
        normalizeStatus(claim.status) === "Approved"
          ? sum + (claim.amount || 0)
          : sum,
      0,
    );

    return {
      id: `POL-${user.id.slice(0, 6).toUpperCase()}-${String(index + 1).padStart(2, "0")}`,
      worker: user.fullName || "Unnamed Worker",
      sub: user.platform || "Platform unavailable",
      plan: user.activePlan || "Active",
      premium: "Rs 25 / week",
      coverage: `Rs ${Math.max(5000, paidAmount + 5000).toLocaleString("en-IN")}`,
      startDate: "Live policy",
      city: user.city || "Unknown",
      status: "Active",
      claimsCount: userClaims.length,
    };
  });

  const filteredWorkers = displayUsers.filter((user) =>
    `${user.fullName || ""} ${user.platform || ""} ${user.city || ""}`
      .toLowerCase()
      .includes(workersSearch.toLowerCase()),
  );

  const previewImpact = () => {
    if (!simCity || !simType) return;
    const workerCount =
      (
        {
          Delhi: 1,
          Mumbai: 1,
          Bangalore: 2,
          Chennai: 0,
          Hyderabad: 0,
          Pune: 0,
        } as Record<string, number>
      )[simCity] || 0;
    const payout =
      (
        {
          Low: 250,
          Medium: 600,
          High: 900,
          Critical: 1500,
        } as Record<string, number>
      )[simSeverity] || 500;
    setPreview({ workers: workerCount, payout: workerCount * payout });
  };

  const publishThreat = async () => {
    if (!simCity || !simType) return;
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
      <div className="shell">
        <aside className="sidebar">
          {cleanSidebarSections.map((section) => (
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
                  {item.id === "claims-mgmt" ? (
                    <span className="sidebar-badge">
                      {pendingClaims.length}
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
          ))}
        </aside>

        <main className="main">
          <div className="live-status-row">
            <span className={`badge ${isRealtimeConnected ? "green" : "red"}`}>
              {isRealtimeConnected ? "Live stream connected" : "Disconnected"}
            </span>
            <span className="live-chip">Users: {stats.totalUsers}</span>
            <span className="live-chip">Policies: {stats.activePolicies}</span>
            <span className="live-chip">
              Payouts: Rs {stats.totalPayouts.toLocaleString("en-IN")}
            </span>
            <span className="live-chip">Fraud alerts: {stats.fraudAlerts}</span>
            <span className="live-chip live-sync">
              Last sync: {lastSyncedAt || "Waiting for first snapshot..."}
            </span>
          </div>

          {/* ── COMMAND CENTER ── */}
          {activePage === "command" && (
            <>
              <Header
                badge="Admin Access Only"
                title="Command Center"
                accent="Simulator"
                subtitle="Control center for system health, fraud detection, and hackathon demonstrations. Phase 1 foundation active with 9 registered admin modules."
              />
              <div className="kpi-grid">
                <Kpi
                  tone="green"
                  icon="👥"
                  label="Active Users"
                  value={
                    intelLoading
                      ? "..."
                      : String(intel?.health.activeUsers || 0)
                  }
                  sub="System Health"
                />
                <Kpi
                  tone="teal"
                  icon="🛡️"
                  label="Active Policies"
                  value={
                    intelLoading
                      ? "..."
                      : String(intel?.health.activePolicies || 0)
                  }
                  sub="System Health"
                />
                <Kpi
                  tone="yellow"
                  icon="⚠️"
                  label="Fraud Alerts"
                  value={
                    intelLoading
                      ? "..."
                      : String(intel?.fraud.suspiciousClaims || 0)
                  }
                  sub="Threat Detection"
                />
                <Kpi
                  tone="orange"
                  icon="🌩️"
                  label="High Risk Cities"
                  value={
                    intelLoading
                      ? "..."
                      : String(intel?.environment.highRiskCities || 0)
                  }
                  sub="Environment"
                />
              </div>

              <div className="two-col">
                <Section title="Financial & Risk Overview" tone="teal">
                  <div
                    className="kpi-grid"
                    style={{
                      gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
                      marginBottom: 0,
                    }}
                  >
                    <Kpi
                      tone="green"
                      icon="💵"
                      label="Premium Collected"
                      value={
                        intelLoading
                          ? "..."
                          : `₹ ${intel?.financial.premiumCollected?.toLocaleString() || 0}`
                      }
                      sub="Total Book Value"
                    />
                    <Kpi
                      tone="red"
                      icon="💸"
                      label="Total Payouts"
                      value={
                        intelLoading
                          ? "..."
                          : `₹ ${intel?.financial.totalPayouts?.toLocaleString() || 0}`
                      }
                      sub="Approved Claims"
                    />
                  </div>
                  <div
                    style={{
                      marginTop: "20px",
                      padding: "15px",
                      background: "rgba(0,0,0,0.2)",
                      borderRadius: "8px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "8px",
                      }}
                    >
                      <span style={{ color: "var(--text-muted)" }}>
                        Actuarial Loss Ratio
                      </span>
                      <span
                        style={{
                          color:
                            (intel?.financial.lossRatio || 0) > 80
                              ? "var(--red)"
                              : "var(--teal)",
                          fontWeight: "bold",
                        }}
                      >
                        {intelLoading
                          ? "..."
                          : `${intel?.financial.lossRatio || 0}%`}
                      </span>
                    </div>
                    <div className="score-bar">
                      <div
                        className="score-fill"
                        style={{
                          width: `${Math.min(intel?.financial.lossRatio || 0, 100)}%`,
                          background:
                            (intel?.financial.lossRatio || 0) > 80
                              ? "var(--red)"
                              : "linear-gradient(90deg, var(--teal), var(--teal2))",
                        }}
                      />
                    </div>
                  </div>
                </Section>

                <Section title="Live Environment Risks" tone="orange">
                  {intelLoading ? (
                    <div className="sub">Loading API Telemetry...</div>
                  ) : (
                    <>
                      {intel?.environment.activeDisruptions?.map(
                        (disruption: string, i: number) => (
                          <div className="event-item" key={i}>
                            <div className={`event-dot orange`} />
                            <div>
                              <div className="event-title">{disruption}</div>
                            </div>
                          </div>
                        ),
                      )}
                      <div
                        style={{
                          marginTop: "20px",
                          display: "flex",
                          gap: "20px",
                        }}
                      >
                        <div>
                          <div className="sub">Average AQI</div>
                          <div
                            style={{
                              fontSize: "24px",
                              fontWeight: "bold",
                              color: "var(--yellow)",
                            }}
                          >
                            {intel?.environment.avgAqi || 0}
                          </div>
                        </div>
                        <div>
                          <div className="sub">Risk Score Index</div>
                          <div
                            style={{
                              fontSize: "24px",
                              fontWeight: "bold",
                              color: "var(--orange)",
                            }}
                          >
                            {intel?.environment.riskScoreIndex || 0}/100
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </Section>
              </div>

              <div className="two-col">
                <Section title="Live Claim Activity" tone="teal">
                  <div className="sub" style={{ marginBottom: "15px" }}>
                    {intel?.activity?.recentClaimsCount || 0} claims in the last
                    1 hour.
                  </div>
                  {intelLoading ? (
                    <div className="sub">Loading events...</div>
                  ) : (
                    <div className="table-scroll">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Time</th>
                            <th>Worker & City</th>
                            <th>Status</th>
                            <th>Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {intel?.activity.eventsLog?.map((event) => (
                            <tr key={event.id}>
                              <td
                                style={{
                                  color: "var(--text-muted)",
                                  fontSize: "11px",
                                }}
                              >
                                {new Date(event.timestamp).toLocaleTimeString(
                                  [],
                                  { hour: "2-digit", minute: "2-digit" },
                                )}
                              </td>
                              <td>
                                <div className="name">{event.worker}</div>
                                <div className="sub">{event.city}</div>
                              </td>
                              <td>
                                <span
                                  className={`badge ${event.status === "APPROVED" ? "green" : event.status === "PENDING" ? "yellow" : "red"}`}
                                >
                                  {event.status}
                                </span>
                              </td>
                              <td
                                style={{
                                  color: "var(--yellow)",
                                  fontWeight: "bold",
                                }}
                              >
                                ₹{(event.amount || 0).toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Section>
                <Section title="System Telemetry" tone="green">
                  <div className="terminal">
                    <div className="t-sys">
                      [SYSTEM] Backend connected. Latency:{" "}
                      {intel?.health.apiResponseTime || 0}ms
                    </div>
                    <div className="t-info">
                      [INFO] Node process uptime:{" "}
                      {Math.floor((intel?.health.uptime || 0) / 60)} minutes
                    </div>
                    <div className="t-warn">
                      [WARN] Flagged workers detected:{" "}
                      {intel?.fraud.flaggedWorkers || 0}
                    </div>
                    <div className="t-warn">
                      [WARN] High-risk claims isolated:{" "}
                      {intel?.fraud.highRiskCount || 0}
                    </div>
                    <br />
                    <div className="t-info">
                      Monitoring Open-Meteo integration streams [OK]
                    </div>
                    <div className="t-ok">
                      GigAssure Core Systems operating normally.
                    </div>
                    <br />
                    {terminalLogs.slice(-5).map((log, i) => {
                      const lower = log.toLowerCase();
                      let className = "t-info";
                      if (lower.includes("[error]")) className = "t-err";
                      if (lower.includes("[ok]")) className = "t-ok";
                      if (lower.includes("[warn]")) className = "t-warn";
                      if (lower.includes("[system]")) className = "t-sys";
                      return (
                        <div key={i} className={className}>
                          {log}
                        </div>
                      );
                    })}
                  </div>
                </Section>
              </div>
            </>
          )}

          {/* ── CLAIMS MANAGEMENT ── */}
          {activePage === "claims-mgmt" && (
            <>
              <Header
                badge="Claims Control"
                title="Claims"
                accent="Management"
                subtitle="Review, approve, reject, and manage all insurance claims with fraud risk indicators."
              />
              <div className="kpi-grid">
                <Kpi
                  tone="teal"
                  icon="📋"
                  label="Total Claims"
                  value={String(normalizedClaimsSource.length)}
                  sub={`${activePolicyUsers.length} users with active policies`}
                />
                <Kpi
                  tone="yellow"
                  icon="⏳"
                  label="Pending"
                  value={String(pendingClaims.length)}
                  sub={`${activePolicyUsers.length} policyholders in coverage`}
                />
                <Kpi
                  tone="green"
                  icon="✅"
                  label="Approved"
                  value={String(approvedClaims.length)}
                  sub="Settled claims"
                />
                <Kpi
                  tone="orange"
                  icon="❌"
                  label="Rejected"
                  value={String(rejectedClaims.length)}
                  sub="Declined claims"
                />
              </div>
              <Section title="Claims Table" className="claims-compact">
                <div className="search-bar-wrap">
                  <input
                    value={claimsSearch}
                    onChange={(e) => setClaimsSearch(e.target.value)}
                    placeholder="Search by Claim ID, user, city..."
                  />
                </div>
                <div className="filter-pills">
                  {claimsFilters.map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      className={`pill ${claimsFilter === filter ? "active" : ""}`}
                      onClick={() => setClaimsFilter(filter)}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
                <div className="table-scroll">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Claim ID</th>
                        <th>Worker</th>
                        <th>City</th>
                        <th>Trigger Source</th>
                        <th>Amount</th>
                        <th>Fraud Risk</th>
                        <th>Status</th>
                        <th>Confidence</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {claimsLoading ? (
                        <tr>
                          <td
                            colSpan={9}
                            style={{
                              textAlign: "center",
                              color: "var(--teal)",
                            }}
                          >
                            Loading claims...
                          </td>
                        </tr>
                      ) : filteredClaims.length === 0 ? (
                        <tr>
                          <td
                            colSpan={9}
                            style={{
                              textAlign: "center",
                              color: "var(--text-muted)",
                            }}
                          >
                            No claims found
                          </td>
                        </tr>
                      ) : (
                        filteredClaims.map((claim) => (
                          <tr key={claim.id}>
                            <td
                              style={{ color: "var(--teal)", fontWeight: 700 }}
                            >
                              {claim.id}
                            </td>
                            <td>
                              <div className="name">{claim.worker}</div>
                              <div className="sub">{claim.sub}</div>
                            </td>
                            <td>{claim.city}</td>
                            <td>{claim.trigger}</td>
                            <td
                              style={{
                                color: "var(--yellow)",
                                fontWeight: 700,
                              }}
                            >
                              {claim.amount}
                            </td>
                            <td>
                              <span className={`badge ${claim.fraudTone}`}>
                                {claim.fraudRisk}
                              </span>
                            </td>
                            <td>
                              <span className={`badge ${claim.statusTone}`}>
                                {claim.status}
                              </span>
                            </td>
                            <td>
                              <div className="score-wrap">
                                <div className="score-bar">
                                  <div
                                    className="score-fill"
                                    style={{ width: `${claim.confidence}%` }}
                                  />
                                </div>
                                <div className="score-val">
                                  {claim.confidence}%
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className="action-row">
                                {(() => {
                                  const actionId = claim.realId || claim.id;
                                  const isPending =
                                    pendingClaimIds.includes(actionId);
                                  return (
                                    <>
                                      <button
                                        className="btn btn-primary"
                                        type="button"
                                        disabled={
                                          isPending ||
                                          claim.status === "Approved"
                                        }
                                        onClick={() => handleApprove(actionId)}
                                      >
                                        {isPending &&
                                        claim.status === "Approved"
                                          ? "..."
                                          : claim.status === "Approved"
                                            ? "Approved"
                                            : "✓ Approve"}
                                      </button>
                                      <button
                                        className="btn btn-danger"
                                        type="button"
                                        disabled={
                                          isPending ||
                                          claim.status === "Rejected"
                                        }
                                        onClick={() => handleReject(actionId)}
                                      >
                                        {isPending &&
                                        claim.status === "Rejected"
                                          ? "..."
                                          : claim.status === "Rejected"
                                            ? "Rejected"
                                            : "✗ Reject"}
                                      </button>
                                    </>
                                  );
                                })()}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Section>
              <div className="two-col">
                <Section
                  title="Approved Claims"
                  tone="green"
                  className="claims-compact"
                >
                  {approvedClaims.length === 0 ? (
                    <div className="sub">No approved claims yet.</div>
                  ) : (
                    <div className="claims-stack">
                      {approvedClaims.slice(0, 6).map((claim) => (
                        <div
                          key={`approved-${claim.id}`}
                          className="claim-status-card approved"
                        >
                          <div>
                            <div className="claim-status-title">
                              {claim.worker}
                            </div>
                            <div className="sub">
                              {claim.id} · {claim.city}
                            </div>
                          </div>
                          <div className="claim-status-right">
                            <span className="badge green">Approved</span>
                            <div className="claim-amount-text">
                              {claim.amount}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Section>
                <Section
                  title="Rejected Claims"
                  tone="red"
                  className="claims-compact"
                >
                  {rejectedClaims.length === 0 ? (
                    <div className="sub">No rejected claims yet.</div>
                  ) : (
                    <div className="claims-stack">
                      {rejectedClaims.slice(0, 6).map((claim) => (
                        <div
                          key={`rejected-${claim.id}`}
                          className="claim-status-card rejected"
                        >
                          <div>
                            <div className="claim-status-title">
                              {claim.worker}
                            </div>
                            <div className="sub">
                              {claim.id} · {claim.city}
                            </div>
                          </div>
                          <div className="claim-status-right">
                            <span className="badge red">Rejected</span>
                            <div className="claim-amount-text">
                              {claim.amount}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Section>
              </div>
            </>
          )}

          {/* ── WORKERS ── */}
          {activePage === "workers" && (
            <>
              <Header
                badge="Workers Module"
                title="Worker"
                accent="Directory"
                subtitle="Manage all registered gig workers — view profiles, stability scores, and account actions."
              />
              <div className="kpi-grid">
                <Kpi
                  tone="teal"
                  icon="👥"
                  label="Total Workers"
                  value={String(displayUsers.length)}
                />
                <Kpi tone="green" icon="🟢" label="Active Today" value="2" />
                <Kpi tone="orange" icon="🚩" label="Flagged" value="0" />
                <Kpi
                  tone="yellow"
                  icon="📊"
                  label="Avg Stability"
                  value="96%"
                />
              </div>
              <Section title="All Workers">
                <div className="search-bar-wrap">
                  <input
                    value={workersSearch}
                    onChange={(e) => setWorkersSearch(e.target.value)}
                    placeholder="Search worker name, city, platform..."
                  />
                </div>
                <div className="table-scroll">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Worker</th>
                        <th>Platform / City</th>
                        <th>Policy</th>
                        <th>Total Claims</th>
                        <th>Claim Ratio</th>
                        <th>Stability Score</th>
                        <th>Last Active</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredWorkers.map((user) => {
                        const score = Math.min(
                          100,
                          Math.max(0, user.trustScore || 80),
                        );
                        const claimCount = realClaims.filter(
                          (claim) =>
                            (claim.workerName || "").toLowerCase().trim() ===
                            (user.fullName || "").toLowerCase().trim(),
                        ).length;
                        return (
                          <tr key={user.id}>
                            <td>
                              <div className="name">{user.fullName}</div>
                              <div className="sub">
                                {user.email} · {user.phone}
                              </div>
                            </td>
                            <td>
                              <div className="name">{user.platform}</div>
                              <div className="sub">{user.city}</div>
                            </td>
                            <td>
                              <span
                                className={`badge ${user.activePlan ? "teal" : "gray"}`}
                              >
                                {user.activePlan || "No Policy"}
                              </span>
                            </td>
                            <td>{claimCount}</td>
                            <td
                              style={{
                                color:
                                  score < 95 ? "var(--yellow)" : "var(--green)",
                              }}
                            >
                              {score < 95 ? "Medium" : "Low"}
                            </td>
                            <td>
                              <div className="score-wrap">
                                <div className="score-bar">
                                  <div
                                    className="score-fill"
                                    style={{ width: `${score}%` }}
                                  />
                                </div>
                                <div className="score-val">{score}%</div>
                              </div>
                            </td>
                            <td style={{ color: "var(--text-muted)" }}>
                              {lastSyncedAt || "Live"}
                            </td>
                            <td>
                              <div className="action-row">
                                <button className="btn btn-ghost" type="button">
                                  👁 View
                                </button>
                                <button
                                  className="btn btn-danger"
                                  type="button"
                                >
                                  🚩 Flag
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Section>
            </>
          )}

          {/* ── POLICIES ── */}
          {activePage === "policies" && (
            <>
              <Header
                badge="Policy Management"
                title="Policy"
                accent="Control"
                subtitle="Manage all insurance plans — activate, deactivate, renew, and analyze coverage gaps."
              />
              <div className="kpi-grid">
                <Kpi
                  tone="green"
                  icon="✅"
                  label="Active Policies"
                  value={String(activePolicyUsers.length)}
                  sub="Live policyholders"
                />
                <Kpi
                  tone="teal"
                  icon="⏸"
                  label="Inactive"
                  value={String(inactivePolicyUsersCount)}
                  sub="Workers without active plan"
                />
                <Kpi
                  tone="yellow"
                  icon="⚡"
                  label="Total Premium"
                  value={`Rs ${(activePolicyUsers.length * 25).toLocaleString("en-IN")}`}
                  sub="Base weekly premium"
                />
                <Kpi
                  tone="orange"
                  icon="🛡️"
                  label="Max Coverage"
                  value={
                    policyRows.length
                      ? `Rs ${Math.max(...policyRows.map((row) => Number(row.coverage.replace(/[^0-9]/g, "")) || 0)).toLocaleString("en-IN")}`
                      : "Rs 0"
                  }
                />
              </div>
              <Section title="Policy Registry">
                <div className="table-scroll">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Policy ID</th>
                        <th>Worker</th>
                        <th>Plan Type</th>
                        <th>Premium</th>
                        <th>Coverage</th>
                        <th>Start Date</th>
                        <th>City</th>
                        <th>Claims</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {policyRows.length === 0 ? (
                        <tr>
                          <td
                            colSpan={10}
                            style={{
                              textAlign: "center",
                              color: "var(--text-muted)",
                            }}
                          >
                            No active policies found.
                          </td>
                        </tr>
                      ) : (
                        policyRows.map((policy) => (
                          <tr key={policy.id}>
                            <td
                              style={{ color: "var(--teal)", fontWeight: 700 }}
                            >
                              {policy.id}
                            </td>
                            <td>
                              <div className="name">{policy.worker}</div>
                              <div className="sub">{policy.sub}</div>
                            </td>
                            <td>
                              <span className="badge teal">{policy.plan}</span>
                            </td>
                            <td>{policy.premium}</td>
                            <td
                              style={{ color: "var(--green)", fontWeight: 600 }}
                            >
                              {policy.coverage}
                            </td>
                            <td style={{ color: "var(--text-muted)" }}>
                              {policy.startDate}
                            </td>
                            <td>{policy.city}</td>
                            <td>{policy.claimsCount}</td>
                            <td>
                              <span className="badge green">
                                {policy.status}
                              </span>
                            </td>
                            <td>
                              <div className="action-row">
                                <button className="btn btn-ghost" type="button">
                                  Renew
                                </button>
                                <button
                                  className="btn btn-danger"
                                  type="button"
                                >
                                  Deactivate
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Section>
              <Section title="Coverage Gap Detector" tone="orange">
                <MiniStat
                  label="Workers With No Active Policy"
                  value={String(inactivePolicyUsersCount)}
                  tone={inactivePolicyUsersCount > 0 ? "orange" : "green"}
                />
                <MiniStat
                  label="Workers With Active Policy"
                  value={String(activePolicyUsers.length)}
                  tone="green"
                />
                <MiniStat
                  label="Policy Coverage Rate"
                  value={`${displayUsers.length ? Math.round((activePolicyUsers.length / displayUsers.length) * 100) : 0}%`}
                  tone="teal"
                />
              </Section>
            </>
          )}

          {/* ── RISK MAP ── */}
          {activePage === "riskmap" && (
            <>
              <Header
                badge="Risk Intelligence"
                title="Risk"
                accent="Map"
                subtitle="City-wise risk overview, disruption markers, and live threat intelligence dashboard."
              />
              <div className="kpi-grid">
                <Kpi
                  tone="orange"
                  icon="🏙️"
                  label="High Risk Cities"
                  value="1"
                  sub="Delhi: 82%"
                />
                <Kpi
                  tone="yellow"
                  icon="🌡️"
                  label="Active Triggers"
                  value="2"
                  sub="Heatwave, AQI"
                />
                <Kpi
                  tone="teal"
                  icon="👷"
                  label="Affected Workers"
                  value="3"
                  sub="In risk zones"
                />
                <Kpi
                  tone="orange"
                  icon="💸"
                  label="Payout Exposure"
                  value="Rs 2,150"
                  sub="Expected liability"
                />
              </div>
              <div className="two-col">
                <Section title="City Risk Index">
                  {cityRiskSummary.map((item) => (
                    <RiskRow
                      key={item.city}
                      city={item.city}
                      risk={item.risk}
                      level={item.level}
                      suffixEmoji
                    />
                  ))}
                </Section>
                <div>
                  <Section title="Active Threat Signals" tone="red">
                    {threatSignals.map((signal) => (
                      <div className="event-item" key={signal.title}>
                        <div className={`event-dot ${signal.dot}`} />
                        <div style={{ flex: 1 }}>
                          <div className="event-title">{signal.title}</div>
                          <div className="event-meta">{signal.meta}</div>
                        </div>
                        <span className={`badge ${signal.badgeTone}`}>
                          {signal.badge}
                        </span>
                      </div>
                    ))}
                  </Section>
                  <Section title="City Readiness Score">
                    {cityReadinessScores.map((item) => (
                      <MiniStat
                        key={item.city}
                        label={item.city}
                        value={`${item.score}${"suffix" in item ? ` ${item.suffix}` : ""}`}
                        tone={item.tone}
                      />
                    ))}
                  </Section>
                </div>
              </div>
            </>
          )}

          {/* ── THREATS ── */}
          {activePage === "threats" && (
            <>
              <Header
                badge="Threat Engine"
                title="Threat Events &"
                accent="Triggers"
                subtitle="Create, simulate, and manage disruption events. Preview impact before publishing."
              />
              <div className="two-col">
                <Section title="Global Disruption Simulator" tone="orange">
                  <Field label="Target State / UT">
                    <LocationSearchSelect
                      value={simCity}
                      onChange={setSimCity}
                      options={cities}
                      placeholder="Search and select state/UT"
                      className="w-full"
                    />
                  </Field>
                  <Field label="Disruption Type">
                    <select
                      className="form-select"
                      value={simType}
                      onChange={(e) => setSimType(e.target.value)}
                    >
                      <option value="">Select type</option>
                      <option>Heatwave</option>
                      <option>Heavy Rain</option>
                      <option>AQI Alert</option>
                      <option>Cyclone Warning</option>
                      <option>Cold Wave</option>
                      <option>Thunderstorm</option>
                    </select>
                  </Field>
                  <Field label="Severity">
                    <select
                      className="form-select"
                      value={simSeverity}
                      onChange={(e) => setSimSeverity(e.target.value)}
                    >
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                      <option>Critical</option>
                    </select>
                  </Field>
                  <div className="action-row">
                    <button
                      className="btn btn-warn"
                      type="button"
                      onClick={previewImpact}
                    >
                      🔍 Preview Impact
                    </button>
                    <button
                      className="btn btn-primary"
                      type="button"
                      onClick={() => void publishThreat()}
                    >
                      ⚡ Publish Event
                    </button>
                    <button className="btn btn-ghost" type="button">
                      💾 Save Draft
                    </button>
                  </div>
                </Section>
                <div>
                  {preview && (
                    <Section title="Impact Preview" tone="yellow">
                      <MiniStat
                        label="Workers Affected"
                        value={String(preview.workers)}
                        tone="yellow"
                      />
                      <MiniStat
                        label="Est. Payout Exposure"
                        value={`Rs ${preview.payout}`}
                        tone="orange"
                      />
                      <div className="ticket-body" style={{ marginTop: 10 }}>
                        {simType} in {simCity} at {simSeverity} severity will
                        trigger automated claim checks for {preview.workers}{" "}
                        active worker(s).
                      </div>
                    </Section>
                  )}
                  <Section title="Active Events" tone="red">
                    {threatEvents.map((event) => (
                      <div className="event-item" key={event.title}>
                        <div className={`event-dot ${event.dot}`} />
                        <div style={{ flex: 1 }}>
                          <div className="event-title">{event.title}</div>
                          <div className="event-meta">{event.meta}</div>
                        </div>
                        <button className="btn btn-ghost" type="button">
                          Resolve
                        </button>
                      </div>
                    ))}
                  </Section>
                </div>
              </div>
            </>
          )}

          {/* ── ANALYTICS ── */}
          {activePage === "analytics" && (
            <>
              <Header
                badge="Analytics Module"
                title="Platform"
                accent="Analytics"
                subtitle="Deep insights on claims, payouts, policy adoption, and loss forecasting."
              />
              <div className="kpi-grid">
                <Kpi
                  tone="teal"
                  icon="📈"
                  label="Approval Rate"
                  value="0%"
                  sub="Pending review"
                />
                <Kpi
                  tone="green"
                  icon="⚡"
                  label="Avg Settlement"
                  value="—"
                  sub="No settled claims yet"
                />
                <Kpi
                  tone="yellow"
                  icon="🔮"
                  label="7-Day Forecast"
                  value="Rs 3,200"
                  sub="Predicted payout"
                />
                <Kpi
                  tone="orange"
                  icon="🛡️"
                  label="Policy Penetration"
                  value="50%"
                  sub="2 of 4 workers"
                />
              </div>
              <div className="two-col">
                <Section title="Claims Over Time">
                  <BarChart bars={analyticsBars.claims} />
                </Section>
                <Section title="Payouts Over Time" tone="yellow">
                  <BarChart bars={analyticsBars.payouts} />
                </Section>
              </div>
              <div className="two-col">
                <Section title="Loss Forecast Panel" tone="orange">
                  <MiniStat
                    label="Today"
                    value="Rs 0 (0 claims)"
                    tone="yellow"
                  />
                  <MiniStat
                    label="Next 3 Days"
                    value="~Rs 1,200"
                    tone="yellow"
                  />
                  <MiniStat
                    label="Next 7 Days"
                    value="~Rs 3,200"
                    tone="orange"
                  />
                  <MiniStat
                    label="Risk Drivers"
                    value="Delhi Heatwave"
                    tone="red"
                  />
                  <MiniStat label="Model Confidence" value="81%" tone="green" />
                </Section>
                <Section title="Platform Distribution">
                  <MiniStat label="Amazon Flex" value="1 worker (25%)" />
                  <MiniStat label="Porter" value="1 worker (25%)" />
                  <MiniStat label="Swiggy" value="1 worker (25%)" />
                  <MiniStat label="Blinkit" value="1 worker (25%)" />
                  <MiniStat label="Policy Conversion" value="50%" tone="teal" />
                </Section>
              </div>
            </>
          )}

          {/* ── SUPPORT ── */}
          {activePage === "support" && (
            <>
              <Header
                badge="Support Ops"
                title="Support"
                accent="Inbox"
                subtitle="Review support tickets, flagged claims, and admin verification queue."
              />
              <div className="kpi-grid">
                <Kpi tone="yellow" icon="🎫" label="Open Tickets" value="2" />
                <Kpi tone="orange" icon="🚩" label="Flagged Claims" value="1" />
                <Kpi tone="teal" icon="✅" label="Resolved Today" value="0" />
                <Kpi tone="green" icon="⚡" label="Avg Response" value="—" />
              </div>
              <div className="two-col">
                <Section title="Open Tickets" tone="yellow">
                  {supportTickets.map((ticket) => (
                    <div className="ticket" key={ticket.id}>
                      <div className="ticket-top">
                        <div>
                          <div className="ticket-title">{ticket.title}</div>
                          <div className="sub">
                            {ticket.id} · {ticket.meta}
                          </div>
                        </div>
                        <span className={`badge ${ticket.badgeTone}`}>
                          {ticket.badge}
                        </span>
                      </div>
                      <div className="ticket-body">{ticket.body}</div>
                      <div className="ticket-foot">
                        <button className="btn btn-primary" type="button">
                          ✓ Resolve
                        </button>
                        <button className="btn btn-ghost" type="button">
                          💬 Reply
                        </button>
                        <button
                          className={`btn ${ticket.badgeTone === "orange" ? "btn-danger" : "btn-warn"}`}
                          type="button"
                        >
                          {ticket.badgeTone === "orange"
                            ? "🚩 Flag Fraud"
                            : "🔺 Escalate"}
                        </button>
                      </div>
                    </div>
                  ))}
                </Section>
                <div>
                  <Section title="Priority Recommendation" tone="red">
                    <div className="ticket">
                      <div
                        className="ticket-title"
                        style={{ color: "var(--teal)" }}
                      >
                        Admin Action Suggested
                      </div>
                      <div className="ticket-body">
                        1. Approve claim #CLM-001 — high confidence, valid
                        trigger
                        <br />
                        2. Review #TKT-002 — worker reporting delay, escalation
                        risk
                        <br />
                        3. Outreach Mumbai workers — policy coverage gap
                        detected
                        <br />
                        4. Increase monitoring in Delhi — heatwave risk at 82%
                      </div>
                    </div>
                  </Section>
                  <Section title="Fraud Watchlist" tone="orange">
                    <MiniStat
                      label="Active Watchlist Entries"
                      value="0"
                      tone="green"
                    />
                    <MiniStat
                      label="Suspicious Claims"
                      value="1 (Medium)"
                      tone="yellow"
                    />
                    <MiniStat label="Fraud Score Threshold" value="75%" />
                  </Section>
                </div>
              </div>
            </>
          )}

          {/* ── SETTINGS ── */}
          {activePage === "settings" && (
            <>
              <Header
                badge="Admin Settings"
                title="Profile &"
                accent="Settings"
                subtitle="Manage your admin account, notification preferences, and system configuration."
              />
              <div className="two-col">
                <Section title="Admin Profile">
                  <div className="profile-row">
                    <div className="profile-avatar">A</div>
                    <div>
                      <div className="profile-name">Super Admin</div>
                      <div className="profile-role">God Mode Access</div>
                      <div className="sub" style={{ marginTop: 6 }}>
                        admin@gigshield.io
                      </div>
                    </div>
                  </div>
                  <Field label="Display Name">
                    <input className="form-input" defaultValue="Super Admin" />
                  </Field>
                  <Field label="Email">
                    <input
                      className="form-input"
                      defaultValue="admin@gigshield.io"
                    />
                  </Field>
                  <div className="action-row">
                    <button className="btn btn-primary" type="button">
                      Save Changes
                    </button>
                    <button className="btn btn-ghost" type="button">
                      Change Password
                    </button>
                  </div>
                </Section>
                <div>
                  <Section title="Notification Settings" tone="yellow">
                    <MiniStat label="Fraud Alerts" value="Email + SMS" />
                    <MiniStat label="New Claims" value="Email" />
                    <MiniStat label="Disruption Events" value="Push + Email" />
                    <MiniStat label="Daily Report" value="Disabled" />
                  </Section>
                  <Section title="System Configuration" tone="orange">
                    <Field label="Fraud Score Threshold">
                      <input className="form-input" defaultValue="75%" />
                    </Field>
                    <Field label="Auto-Approve Confidence Minimum">
                      <input className="form-input" defaultValue="90%" />
                    </Field>
                    <div className="action-row">
                      <button className="btn btn-primary" type="button">
                        Apply Config
                      </button>
                    </div>
                  </Section>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

// ── HELPER COMPONENTS ──

function Header(props: {
  badge: string;
  title: string;
  accent: string;
  subtitle: string;
}) {
  return (
    <div className="pg-header">
      <div className="pg-badge">{props.badge}</div>
      <h1 className="pg-title">
        {props.title} <span>{props.accent}</span>
      </h1>
      <p className="pg-sub">{props.subtitle}</p>
    </div>
  );
}

function Section(props: {
  title: string;
  children: React.ReactNode;
  tone?: "green" | "red" | "orange" | "yellow" | "teal";
  className?: string;
}) {
  const dotStyle = props.tone
    ? {
        background: `var(--${props.tone})`,
        boxShadow: `0 0 8px var(--${props.tone})`,
      }
    : undefined;
  return (
    <div className={`section-card ${props.className || ""}`.trim()}>
      <div className="section-title">
        <span className="dot" style={dotStyle} />
        {props.title}
      </div>
      {props.children}
    </div>
  );
}

function Kpi(props: {
  tone: "teal" | "orange" | "green" | "yellow" | "red";
  icon: string;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className={`kpi-card ${props.tone}`}>
      <div className="kpi-icon">{props.icon}</div>
      <div className="kpi-label">{props.label}</div>
      <div className="kpi-value">{props.value}</div>
      {props.sub ? <div className="kpi-sub">{props.sub}</div> : null}
    </div>
  );
}

function MiniStat(props: { label: string; value: string; tone?: string }) {
  return (
    <div className="stat-mini">
      <span className="stat-mini-label">{props.label}</span>
      <span
        className="stat-mini-val"
        style={props.tone ? { color: `var(--${props.tone})` } : undefined}
      >
        {props.value}
      </span>
    </div>
  );
}

function Field(props: { label: string; children: React.ReactNode }) {
  return (
    <div className="form-group">
      <label className="form-label">{props.label}</label>
      {props.children}
    </div>
  );
}

function RiskRow(props: {
  city: string;
  risk: number;
  level: "high" | "medium" | "low";
  suffixEmoji?: boolean;
}) {
  const emoji = props.suffixEmoji
    ? props.level === "high"
      ? " 🔴"
      : props.level === "medium"
        ? " 🟡"
        : " 🟢"
    : "";
  return (
    <div className="risk-city">
      <div className="city-name">{props.city}</div>
      <div className="risk-bar">
        <div
          className={`risk-fill ${props.level}`}
          style={{ width: `${props.risk}%` }}
        />
      </div>
      <div className={`risk-pct ${props.level}`}>
        {props.risk}%{emoji}
      </div>
    </div>
  );
}

function BarChart(props: {
  bars: readonly { label: string; height: string; tone: string }[];
}) {
  return (
    <div className="bar-chart">
      {props.bars.map((bar) => (
        <div className="bar-col" key={bar.label}>
          <div className={`bar ${bar.tone}`} style={{ height: bar.height }} />
          <div className="bar-lbl">{bar.label}</div>
        </div>
      ))}
    </div>
  );
}

export default Admin;
