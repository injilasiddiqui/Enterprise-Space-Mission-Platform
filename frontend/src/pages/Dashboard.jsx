import { useEffect, useMemo, useState } from "react";
import {
  FaSatellite,
  FaBroadcastTower,
  FaFlagCheckered,
  FaGlobe,
  FaRobot,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTools,
  FaClock,
  FaShieldAlt,
  FaHeartbeat,
  FaServer,
  FaSyncAlt,
  FaPlayCircle,
  FaDatabase,
  FaChartLine,
} from "react-icons/fa";

import { getDashboard } from "../services/api";

const INITIAL_DASHBOARD = {
  system_status: "Loading...",

  fleet: {
    total_satellites: 0,
    active: 0,
    maintenance: 0,
    critical: 0,
  },

  missions: {
    total: 0,
    planned: 0,
    approved: 0,
    active: 0,
    completed: 0,
    cancelled: 0,
  },

  ground_stations: {
    total: 0,
    active: 0,
    maintenance: 0,
    inactive: 0,
  },

  telemetry: {
    total_records: 0,
    healthy: 0,
    warning: 0,
    critical: 0,
    latest_satellite: "No telemetry available",
  },

  ai_engine: {
    status: "Offline",
    model: "Not available",
    prediction_service: "Inactive",
  },
};

function Dashboard() {
  const [dashboard, setDashboard] =
    useState(INITIAL_DASHBOARD);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard(manualRefresh = false) {
    try {
      if (manualRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const data = await getDashboard();

      setDashboard({
        system_status:
          data?.system_status || "Unknown",

        fleet: {
          ...INITIAL_DASHBOARD.fleet,
          ...(data?.fleet || {}),
        },

        missions: {
          ...INITIAL_DASHBOARD.missions,
          ...(data?.missions || {}),
        },

        ground_stations: {
          ...INITIAL_DASHBOARD.ground_stations,
          ...(data?.ground_stations || {}),
        },

        telemetry: {
          ...INITIAL_DASHBOARD.telemetry,
          ...(data?.telemetry || {}),
        },

        ai_engine: {
          ...INITIAL_DASHBOARD.ai_engine,
          ...(data?.ai_engine || {}),
        },
      });
    } catch (requestError) {
      console.error("Dashboard API Error:", requestError);

      setError(
        "Unable to load dashboard information. Check that the FastAPI backend is running."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  const systemTheme = useMemo(() => {
    const status = dashboard.system_status.toLowerCase();

    if (status.includes("attention")) {
      return {
        color: "#FCA5A5",
        background: "rgba(239, 68, 68, 0.15)",
        border: "rgba(239, 68, 68, 0.35)",
        icon: <FaExclamationTriangle />,
      };
    }

    if (status.includes("warning")) {
      return {
        color: "#FCD34D",
        background: "rgba(245, 158, 11, 0.15)",
        border: "rgba(245, 158, 11, 0.35)",
        icon: <FaExclamationTriangle />,
      };
    }

    return {
      color: "#86EFAC",
      background: "rgba(34, 197, 94, 0.15)",
      border: "rgba(34, 197, 94, 0.35)",
      icon: <FaCheckCircle />,
    };
  }, [dashboard.system_status]);

  const fleetOperationalRate = calculatePercentage(
    dashboard.fleet.active,
    dashboard.fleet.total_satellites
  );

  const stationAvailabilityRate = calculatePercentage(
    dashboard.ground_stations.active,
    dashboard.ground_stations.total
  );

  const completedMissionRate = calculatePercentage(
    dashboard.missions.completed,
    dashboard.missions.total
  );

  const healthyTelemetryRate = calculatePercentage(
    dashboard.telemetry.healthy,
    dashboard.telemetry.total_records
  );

  const totalAlerts =
    Number(dashboard.fleet.critical || 0) +
    Number(dashboard.telemetry.warning || 0) +
    Number(dashboard.telemetry.critical || 0);

  const primaryCards = [
    {
      title: "Total Satellites",
      value: dashboard.fleet.total_satellites,
      subtitle: `${dashboard.fleet.active} currently active`,
      color: "#2563EB",
      icon: <FaSatellite />,
    },
    {
      title: "Telemetry Records",
      value: dashboard.telemetry.total_records,
      subtitle: `${dashboard.telemetry.healthy} healthy records`,
      color: "#16A34A",
      icon: <FaBroadcastTower />,
    },
    {
      title: "Total Missions",
      value: dashboard.missions.total,
      subtitle: `${dashboard.missions.active} active missions`,
      color: "#8B5CF6",
      icon: <FaFlagCheckered />,
    },
    {
      title: "Ground Stations",
      value: dashboard.ground_stations.total,
      subtitle: `${dashboard.ground_stations.active} available`,
      color: "#F59E0B",
      icon: <FaGlobe />,
    },
    {
      title: "Operational Alerts",
      value: totalAlerts,
      subtitle:
        totalAlerts > 0
          ? "Requires operator review"
          : "No current alerts",
      color: totalAlerts > 0 ? "#DC2626" : "#16A34A",
      icon: <FaExclamationTriangle />,
    },
  ];

  return (
    <div style={styles.page}>
      <section style={styles.hero}>
        <div style={styles.heroGlowOne} />
        <div style={styles.heroGlowTwo} />

        <div style={styles.heroContent}>
          <div>
            <p style={styles.eyebrow}>
              ODI MISSION OPERATIONS CENTER
            </p>

            <h1 style={styles.title}>
              Enterprise Space Mission Operations Platform
            </h1>

            <p style={styles.subtitle}>
              Centralized command, telemetry monitoring, mission
              coordination and AI-powered spacecraft health analysis.
            </p>

            <div style={styles.heroBadges}>
              <div
                style={{
                  ...styles.statusBadge,
                  color: systemTheme.color,
                  backgroundColor: systemTheme.background,
                  borderColor: systemTheme.border,
                }}
              >
                {systemTheme.icon}
                System: {dashboard.system_status}
              </div>

              <div style={styles.aiBadge}>
                <FaRobot />
                AI Engine: {dashboard.ai_engine.status}
              </div>
            </div>
          </div>

          <button
            type="button"
            style={styles.refreshButton}
            onClick={() => loadDashboard(true)}
            disabled={refreshing}
          >
            <FaSyncAlt
              style={{
                animation: refreshing
                  ? "dashboard-spin 1s linear infinite"
                  : "none",
              }}
            />

            {refreshing ? "Refreshing..." : "Refresh Data"}
          </button>
        </div>
      </section>

      {error && (
        <div style={styles.errorMessage}>
          <FaExclamationTriangle />
          <span>{error}</span>
        </div>
      )}

      <div style={styles.cards}>
        {primaryCards.map((card) => (
          <KpiCard
            key={card.title}
            {...card}
            loading={loading}
          />
        ))}
      </div>

      <div style={styles.commandGrid}>
        <section style={styles.largePanel}>
          <PanelHeader
            icon={<FaSatellite />}
            title="Fleet Operational Overview"
            subtitle="Live spacecraft availability and health distribution"
            color="#60A5FA"
          />

          <div style={styles.overviewRate}>
            <div>
              <p style={styles.overviewRateLabel}>
                Fleet Operational Rate
              </p>

              <h2 style={styles.overviewRateValue}>
                {fleetOperationalRate}%
              </h2>
            </div>

            <CircularIndicator
              value={fleetOperationalRate}
              color="#2563EB"
            />
          </div>

          <ProgressBar
            value={fleetOperationalRate}
            color="#2563EB"
          />

          <div style={styles.statusGrid}>
            <StatusMetric
              title="Active"
              value={dashboard.fleet.active}
              color="#22C55E"
              icon={<FaCheckCircle />}
            />

            <StatusMetric
              title="Maintenance"
              value={dashboard.fleet.maintenance}
              color="#F59E0B"
              icon={<FaTools />}
            />

            <StatusMetric
              title="Critical"
              value={dashboard.fleet.critical}
              color="#EF4444"
              icon={<FaExclamationTriangle />}
            />
          </div>
        </section>

        <section style={styles.largePanel}>
          <PanelHeader
            icon={<FaFlagCheckered />}
            title="Mission Operations"
            subtitle="Mission lifecycle and execution status"
            color="#A78BFA"
          />

          <div style={styles.overviewRate}>
            <div>
              <p style={styles.overviewRateLabel}>
                Mission Completion Rate
              </p>

              <h2 style={styles.overviewRateValue}>
                {completedMissionRate}%
              </h2>
            </div>

            <CircularIndicator
              value={completedMissionRate}
              color="#8B5CF6"
            />
          </div>

          <ProgressBar
            value={completedMissionRate}
            color="#8B5CF6"
          />

          <div style={styles.statusGrid}>
            <StatusMetric
              title="Planned"
              value={dashboard.missions.planned}
              color="#F59E0B"
              icon={<FaClock />}
            />

            <StatusMetric
              title="Approved"
              value={dashboard.missions.approved}
              color="#A78BFA"
              icon={<FaShieldAlt />}
            />

            <StatusMetric
              title="Active"
              value={dashboard.missions.active}
              color="#22D3EE"
              icon={<FaPlayCircle />}
            />

            <StatusMetric
              title="Completed"
              value={dashboard.missions.completed}
              color="#22C55E"
              icon={<FaCheckCircle />}
            />
          </div>
        </section>
      </div>

      <div style={styles.secondaryGrid}>
        <section style={styles.mediumPanel}>
          <PanelHeader
            icon={<FaBroadcastTower />}
            title="Telemetry Health"
            subtitle="Engineering data health classification"
            color="#4ADE80"
          />

          <SystemRate
            title="Healthy Telemetry"
            value={healthyTelemetryRate}
            color="#22C55E"
          />

          <div style={styles.compactMetrics}>
            <CompactMetric
              title="Healthy"
              value={dashboard.telemetry.healthy}
              color="#22C55E"
            />

            <CompactMetric
              title="Warning"
              value={dashboard.telemetry.warning}
              color="#F59E0B"
            />

            <CompactMetric
              title="Critical"
              value={dashboard.telemetry.critical}
              color="#EF4444"
            />
          </div>

          <div style={styles.latestTelemetry}>
            <div style={styles.latestTelemetryIcon}>
              <FaHeartbeat />
            </div>

            <div>
              <p style={styles.latestLabel}>
                Latest Telemetry Source
              </p>

              <strong style={styles.latestValue}>
                {dashboard.telemetry.latest_satellite}
              </strong>
            </div>
          </div>
        </section>

        <section style={styles.mediumPanel}>
          <PanelHeader
            icon={<FaGlobe />}
            title="Ground Station Network"
            subtitle="Communication facility availability"
            color="#FBBF24"
          />

          <SystemRate
            title="Network Availability"
            value={stationAvailabilityRate}
            color="#F59E0B"
          />

          <div style={styles.compactMetrics}>
            <CompactMetric
              title="Active"
              value={dashboard.ground_stations.active}
              color="#22C55E"
            />

            <CompactMetric
              title="Maintenance"
              value={
                dashboard.ground_stations.maintenance
              }
              color="#F59E0B"
            />

            <CompactMetric
              title="Inactive"
              value={dashboard.ground_stations.inactive}
              color="#EF4444"
            />
          </div>

          <div style={styles.networkMessage}>
            <FaBroadcastTower />

            <span>
              {dashboard.ground_stations.active} stations currently
              available for satellite communication.
            </span>
          </div>
        </section>

        <section style={styles.mediumPanel}>
          <PanelHeader
            icon={<FaRobot />}
            title="AI Predictive Engine"
            subtitle="Automated spacecraft health assessment"
            color="#C4B5FD"
          />

          <div style={styles.aiEngineCard}>
            <div style={styles.aiEngineIcon}>
              <FaRobot />
            </div>

            <div>
              <p style={styles.aiEngineLabel}>
                Prediction Service
              </p>

              <h3 style={styles.aiEngineStatus}>
                {dashboard.ai_engine.prediction_service}
              </h3>
            </div>
          </div>

          <div style={styles.aiDetail}>
            <span>Engine Status</span>
            <strong>{dashboard.ai_engine.status}</strong>
          </div>

          <div style={styles.aiDetail}>
            <span>Prediction Model</span>
            <strong>{dashboard.ai_engine.model}</strong>
          </div>

          <div style={styles.aiDetail}>
            <span>Capabilities</span>
            <strong>Health & Risk Analysis</strong>
          </div>
        </section>
      </div>

      <section style={styles.platformPanel}>
        <PanelHeader
          icon={<FaServer />}
          title="Enterprise Platform Services"
          subtitle="Live status of the integrated mission operations stack"
          color="#60A5FA"
        />

        <div style={styles.serviceGrid}>
          <ServiceCard
            icon={<FaDatabase />}
            title="Operational Database"
            description="Satellite, mission, telemetry and station records"
            status="Connected"
            color="#22C55E"
          />

          <ServiceCard
            icon={<FaServer />}
            title="FastAPI Services"
            description="REST APIs and enterprise business logic"
            status="Running"
            color="#60A5FA"
          />

          <ServiceCard
            icon={<FaChartLine />}
            title="React Dashboard"
            description="Real-time operational monitoring interface"
            status="Online"
            color="#A78BFA"
          />

          <ServiceCard
            icon={<FaRobot />}
            title="AI Analytics"
            description="Predictive health and maintenance recommendations"
            status={dashboard.ai_engine.status}
            color="#F59E0B"
          />
        </div>
      </section>
    </div>
  );
}

function KpiCard({
  title,
  value,
  subtitle,
  color,
  icon,
  loading,
}) {
  return (
    <div style={styles.kpiCard}>
      <div
        style={{
          ...styles.kpiIcon,
          backgroundColor: color,
        }}
      >
        {icon}
      </div>

      <div>
        <p style={styles.kpiTitle}>{title}</p>

        <h2 style={styles.kpiValue}>
          {loading ? "—" : value}
        </h2>

        <p style={styles.kpiSubtitle}>{subtitle}</p>
      </div>
    </div>
  );
}

function PanelHeader({
  icon,
  title,
  subtitle,
  color,
}) {
  return (
    <div style={styles.panelHeader}>
      <div
        style={{
          ...styles.panelIcon,
          color,
          backgroundColor: `${color}18`,
        }}
      >
        {icon}
      </div>

      <div>
        <h3 style={styles.panelTitle}>{title}</h3>
        <p style={styles.panelSubtitle}>{subtitle}</p>
      </div>
    </div>
  );
}

function CircularIndicator({ value, color }) {
  return (
    <div
      style={{
        ...styles.circularIndicator,
        borderColor: color,
      }}
    >
      <strong>{value}%</strong>
    </div>
  );
}

function ProgressBar({ value, color }) {
  return (
    <div style={styles.progressBackground}>
      <div
        style={{
          ...styles.progressFill,
          width: `${Math.min(Math.max(value, 0), 100)}%`,
          backgroundColor: color,
        }}
      />
    </div>
  );
}

function StatusMetric({
  title,
  value,
  color,
  icon,
}) {
  return (
    <div style={styles.statusMetric}>
      <div
        style={{
          ...styles.statusMetricIcon,
          color,
          backgroundColor: `${color}18`,
        }}
      >
        {icon}
      </div>

      <div>
        <p style={styles.statusMetricTitle}>{title}</p>
        <strong style={styles.statusMetricValue}>
          {value}
        </strong>
      </div>
    </div>
  );
}

function SystemRate({ title, value, color }) {
  return (
    <div style={styles.systemRate}>
      <div style={styles.systemRateTop}>
        <span>{title}</span>
        <strong>{value}%</strong>
      </div>

      <ProgressBar value={value} color={color} />
    </div>
  );
}

function CompactMetric({ title, value, color }) {
  return (
    <div style={styles.compactMetric}>
      <span
        style={{
          ...styles.compactDot,
          backgroundColor: color,
        }}
      />

      <span style={styles.compactTitle}>{title}</span>

      <strong style={styles.compactValue}>
        {value}
      </strong>
    </div>
  );
}

function ServiceCard({
  icon,
  title,
  description,
  status,
  color,
}) {
  return (
    <div style={styles.serviceCard}>
      <div
        style={{
          ...styles.serviceIcon,
          color,
          backgroundColor: `${color}18`,
        }}
      >
        {icon}
      </div>

      <div style={styles.serviceContent}>
        <strong style={styles.serviceTitle}>
          {title}
        </strong>

        <p style={styles.serviceDescription}>
          {description}
        </p>
      </div>

      <span
        style={{
          ...styles.serviceStatus,
          color,
          backgroundColor: `${color}18`,
        }}
      >
        {status}
      </span>
    </div>
  );
}

function calculatePercentage(value, total) {
  const safeValue = Number(value || 0);
  const safeTotal = Number(total || 0);

  if (safeTotal === 0) {
    return 0;
  }

  return Math.round((safeValue / safeTotal) * 100);
}

const styles = {
  page: {
    minHeight: "100%",
  },

  hero: {
    position: "relative",
    overflow: "hidden",
    background:
      "linear-gradient(135deg, #172554 0%, #1E3A8A 45%, #2563EB 100%)",
    border: "1px solid rgba(96, 165, 250, 0.25)",
    borderRadius: 18,
    padding: 30,
    marginBottom: 24,
    color: "#FFFFFF",
  },

  heroGlowOne: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: "50%",
    background: "rgba(96, 165, 250, 0.18)",
    right: -60,
    top: -100,
  },

  heroGlowTwo: {
    position: "absolute",
    width: 170,
    height: 170,
    borderRadius: "50%",
    background: "rgba(139, 92, 246, 0.18)",
    right: 160,
    bottom: -120,
  },

  heroContent: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 24,
    flexWrap: "wrap",
  },

  eyebrow: {
    margin: 0,
    color: "#93C5FD",
    fontSize: 11,
    letterSpacing: "0.16em",
    fontWeight: 700,
  },

  title: {
    margin: "10px 0 0",
    fontSize: 30,
    maxWidth: 760,
  },

  subtitle: {
    margin: "11px 0 0",
    color: "#DCEAFE",
    fontSize: 14,
    maxWidth: 740,
    lineHeight: 1.6,
  },

  heroBadges: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    marginTop: 19,
  },

  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    border: "1px solid",
    borderRadius: 22,
    padding: "8px 12px",
    fontSize: 12,
    fontWeight: 600,
  },

  aiBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    border: "1px solid rgba(196, 181, 253, 0.35)",
    borderRadius: 22,
    padding: "8px 12px",
    backgroundColor: "rgba(139, 92, 246, 0.16)",
    color: "#DDD6FE",
    fontSize: 12,
    fontWeight: 600,
  },

  refreshButton: {
    border: "1px solid rgba(255, 255, 255, 0.3)",
    borderRadius: 10,
    padding: "11px 15px",
    backgroundColor: "rgba(15, 23, 42, 0.28)",
    color: "#FFFFFF",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontWeight: 600,
  },

  errorMessage: {
    display: "flex",
    alignItems: "center",
    gap: 9,
    marginBottom: 18,
    padding: "12px 14px",
    borderRadius: 9,
    color: "#FCA5A5",
    backgroundColor: "rgba(239, 68, 68, 0.12)",
    border: "1px solid rgba(239, 68, 68, 0.35)",
  },

  cards: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(190px, 1fr))",
    gap: 18,
    marginBottom: 22,
  },

  kpiCard: {
    minHeight: 92,
    padding: 19,
    borderRadius: 14,
    display: "flex",
    alignItems: "center",
    gap: 15,
    backgroundColor: "#1E293B",
    border: "1px solid #334155",
  },

  kpiIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    color: "#FFFFFF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 20,
    flexShrink: 0,
  },

  kpiTitle: {
    margin: 0,
    color: "#94A3B8",
    fontSize: 12,
  },

  kpiValue: {
    margin: "5px 0 0",
    color: "#F8FAFC",
    fontSize: 25,
  },

  kpiSubtitle: {
    margin: "4px 0 0",
    color: "#64748B",
    fontSize: 10,
  },

  commandGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(380px, 1fr))",
    gap: 22,
    marginBottom: 22,
  },

  secondaryGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 22,
    marginBottom: 22,
  },

  largePanel: {
    padding: 21,
    backgroundColor: "#1E293B",
    border: "1px solid #334155",
    borderRadius: 14,
  },

  mediumPanel: {
    padding: 20,
    backgroundColor: "#1E293B",
    border: "1px solid #334155",
    borderRadius: 14,
  },

  panelHeader: {
    display: "flex",
    alignItems: "center",
    gap: 11,
    marginBottom: 20,
  },

  panelIcon: {
    width: 41,
    height: 41,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  panelTitle: {
    margin: 0,
    color: "#F8FAFC",
    fontSize: 17,
  },

  panelSubtitle: {
    margin: "4px 0 0",
    color: "#94A3B8",
    fontSize: 11,
  },

  overviewRate: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },

  overviewRateLabel: {
    margin: 0,
    color: "#94A3B8",
    fontSize: 12,
  },

  overviewRateValue: {
    margin: "6px 0 0",
    color: "#F8FAFC",
    fontSize: 28,
  },

  circularIndicator: {
    width: 64,
    height: 64,
    borderRadius: "50%",
    border: "6px solid",
    backgroundColor: "#0F172A",
    color: "#F8FAFC",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
  },

  progressBackground: {
    height: 7,
    borderRadius: 20,
    backgroundColor: "#334155",
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    borderRadius: 20,
    transition: "width 0.4s ease",
  },

  statusGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(115px, 1fr))",
    gap: 11,
    marginTop: 18,
  },

  statusMetric: {
    padding: 12,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    gap: 9,
    backgroundColor: "#0F172A",
    border: "1px solid #334155",
  },

  statusMetricIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  statusMetricTitle: {
    margin: 0,
    color: "#94A3B8",
    fontSize: 10,
  },

  statusMetricValue: {
    display: "block",
    color: "#F8FAFC",
    marginTop: 3,
  },

  systemRate: {
    marginBottom: 19,
  },

  systemRateTop: {
    display: "flex",
    justifyContent: "space-between",
    color: "#CBD5E1",
    fontSize: 12,
    marginBottom: 9,
  },

  compactMetrics: {
    display: "flex",
    flexDirection: "column",
    gap: 9,
  },

  compactMetric: {
    display: "flex",
    alignItems: "center",
    padding: "10px 11px",
    borderRadius: 9,
    backgroundColor: "#0F172A",
    border: "1px solid #334155",
  },

  compactDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    marginRight: 9,
  },

  compactTitle: {
    color: "#CBD5E1",
    fontSize: 12,
  },

  compactValue: {
    marginLeft: "auto",
    color: "#F8FAFC",
  },

  latestTelemetry: {
    display: "flex",
    alignItems: "center",
    gap: 11,
    marginTop: 17,
    padding: 13,
    borderRadius: 10,
    backgroundColor: "rgba(34, 197, 94, 0.08)",
    border: "1px solid rgba(34, 197, 94, 0.2)",
  },

  latestTelemetryIcon: {
    width: 38,
    height: 38,
    borderRadius: 9,
    color: "#4ADE80",
    backgroundColor: "rgba(34, 197, 94, 0.15)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  latestLabel: {
    margin: 0,
    color: "#94A3B8",
    fontSize: 10,
  },

  latestValue: {
    display: "block",
    color: "#F8FAFC",
    marginTop: 4,
  },

  networkMessage: {
    display: "flex",
    alignItems: "center",
    gap: 9,
    marginTop: 17,
    padding: 12,
    color: "#FCD34D",
    backgroundColor: "rgba(245, 158, 11, 0.08)",
    borderRadius: 9,
    fontSize: 11,
  },

  aiEngineCard: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: 14,
    marginBottom: 15,
    borderRadius: 10,
    backgroundColor: "rgba(139, 92, 246, 0.1)",
    border: "1px solid rgba(139, 92, 246, 0.25)",
  },

  aiEngineIcon: {
    width: 44,
    height: 44,
    borderRadius: 11,
    color: "#C4B5FD",
    backgroundColor: "rgba(139, 92, 246, 0.16)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 20,
  },

  aiEngineLabel: {
    margin: 0,
    color: "#A78BFA",
    fontSize: 10,
  },

  aiEngineStatus: {
    margin: "4px 0 0",
    color: "#F8FAFC",
  },

  aiDetail: {
    display: "flex",
    justifyContent: "space-between",
    gap: 15,
    padding: "10px 0",
    borderBottom: "1px solid rgba(51, 65, 85, 0.6)",
    color: "#94A3B8",
    fontSize: 11,
  },

  platformPanel: {
    padding: 20,
    backgroundColor: "#1E293B",
    border: "1px solid #334155",
    borderRadius: 14,
  },

  serviceGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(250px, 1fr))",
    gap: 13,
  },

  serviceCard: {
    display: "flex",
    alignItems: "center",
    gap: 11,
    padding: 13,
    backgroundColor: "#0F172A",
    border: "1px solid #334155",
    borderRadius: 10,
  },

  serviceIcon: {
    width: 39,
    height: 39,
    borderRadius: 9,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  serviceContent: {
    flex: 1,
  },

  serviceTitle: {
    color: "#F8FAFC",
    fontSize: 12,
  },

  serviceDescription: {
    color: "#64748B",
    margin: "4px 0 0",
    fontSize: 10,
    lineHeight: 1.4,
  },

  serviceStatus: {
    borderRadius: 20,
    padding: "5px 8px",
    fontSize: 9,
    fontWeight: 700,
    whiteSpace: "nowrap",
  },
};

export default Dashboard;