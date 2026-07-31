import { useState } from "react";

import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

import Dashboard from "../pages/Dashboard";
import Satellites from "../pages/Satellites";
import Telemetry from "../pages/Telemetry";
import Missions from "../pages/Missions";
import GroundStations from "../pages/GroundStations";
import AIPrediction from "../pages/AIPrediction";

function Layout() {
  const [page, setPage] = useState("dashboard");

  const renderPage = () => {
    switch (page) {
      case "satellites":
        return <Satellites />;

      case "telemetry":
        return <Telemetry />;

      case "missions":
        return <Missions />;

      case "groundstations":
        return <GroundStations />;

      case "ai":
        return <AIPrediction />;

      default:
        return <Dashboard />;
    }
  };

  return (
    <div style={styles.container}>
      <Sidebar page={page} setPage={setPage} />

      <div style={styles.main}>
        <Navbar />

        <div style={styles.content}>{renderPage()}</div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    background: "#0F172A",
  },

  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },

  content: {
    padding: "30px",
    flex: 1,
    overflowY: "auto",
  },
};

export default Layout;
