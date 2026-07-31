import {
  FaHome,
  FaSatellite,
  FaBroadcastTower,
  FaBullseye,
  FaGlobe,
  FaRobot,
} from "react-icons/fa";

function Sidebar({ page, setPage }) {
  const menu = [
    { id: "dashboard", label: "Dashboard", icon: <FaHome /> },
    { id: "satellites", label: "Satellites", icon: <FaSatellite /> },
    { id: "telemetry", label: "Telemetry", icon: <FaBroadcastTower /> },
    { id: "missions", label: "Mission Control", icon: <FaBullseye /> },
    { id: "groundstations", label: "Ground Stations", icon: <FaGlobe /> },
    { id: "ai", label: "AI Prediction", icon: <FaRobot /> },
  ];

  return (
    <div style={styles.sidebar}>
      <div>
        <h1 style={styles.logo}>ODI</h1>
        <p style={styles.subtitle}>MISSION OPERATIONS</p>

        <div style={{ marginTop: 40 }}>
          {menu.map((item) => (
            <div
              key={item.id}
              onClick={() => setPage(item.id)}
              style={{
                ...styles.item,
                background:
                  page === item.id ? "#2563EB" : "transparent",
              }}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.status}>
        <p style={{ color: "#94A3B8", marginBottom: 10 }}>
          System Status
        </p>

        <h3 style={{ color: "#22C55E", margin: 0 }}>
          All Systems Nominal
        </h3>
      </div>
    </div>
  );
}

const styles = {
  sidebar: {
    width: 260,
    background: "#111827",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: 25,
  },

  logo: {
    color: "white",
    margin: 0,
    fontSize: 42,
  },

  subtitle: {
    color: "#60A5FA",
    letterSpacing: 1,
    fontSize: 13,
  },

  item: {
    color: "white",
    display: "flex",
    alignItems: "center",
    gap: 15,
    padding: "16px",
    borderRadius: 10,
    cursor: "pointer",
    marginBottom: 8,
    transition: ".2s",
  },

  status: {
    background: "#1E293B",
    borderRadius: 12,
    padding: 18,
  },
};

export default Sidebar;