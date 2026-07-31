import { useEffect, useMemo, useState } from "react";
import {
  FaBatteryThreeQuarters,
  FaSolarPanel,
  FaThermometerHalf,
  FaBroadcastTower,
  FaMicrochip,
  FaPlus,
  FaSearch,
  FaTrash,
  FaTimes,
  FaExclamationTriangle,
  FaCheckCircle,
  FaHeartbeat,
} from "react-icons/fa";

import {
  getTelemetry,
  createTelemetry,
  deleteTelemetry,
} from "../services/api";

const initialFormData = {
  satellite_name: "",
  battery: "",
  temperature: "",
  solar_panel: "",
  communication: "Online",
};

function Telemetry() {
  const [telemetryRecords, setTelemetryRecords] = useState([]);
  const [formData, setFormData] = useState(initialFormData);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    loadTelemetry();
  }, []);

  async function loadTelemetry() {
    try {
      setLoading(true);
      setError("");

      const response = await getTelemetry();

      if (Array.isArray(response)) {
        setTelemetryRecords(response);
      } else {
        setTelemetryRecords(response?.data || []);
      }
    } catch (err) {
      console.error("Telemetry loading error:", err);
      setError(
        "Unable to load telemetry records. Please check that the backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  function calculateStatus(battery, temperature, solarPanel, communication) {
    const batteryValue = Number(battery);
    const temperatureValue = Number(temperature);
    const solarValue = Number(solarPanel);
    const communicationValue = String(communication).toLowerCase();

    if (
      batteryValue < 40 ||
      temperatureValue > 65 ||
      temperatureValue < -20 ||
      solarValue < 40 ||
      communicationValue === "offline"
    ) {
      return "Critical";
    }

    if (
      batteryValue < 70 ||
      temperatureValue > 50 ||
      temperatureValue < 0 ||
      solarValue < 70 ||
      communicationValue === "weak"
    ) {
      return "Warning";
    }

    return "Healthy";
  }

  function handleInputChange(event) {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  }

  function openAddModal() {
    setFormData(initialFormData);
    setError("");
    setSuccessMessage("");
    setShowModal(true);
  }

  function closeModal() {
    if (saving) {
      return;
    }

    setShowModal(false);
    setFormData(initialFormData);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!formData.satellite_name.trim()) {
      setError("Satellite name is required.");
      return;
    }

    const battery = Number(formData.battery);
    const temperature = Number(formData.temperature);
    const solarPanel = Number(formData.solar_panel);

    if (
      formData.battery === "" ||
      Number.isNaN(battery) ||
      battery < 0 ||
      battery > 100
    ) {
      setError("Battery health must be between 0 and 100.");
      return;
    }

    if (
      formData.solar_panel === "" ||
      Number.isNaN(solarPanel) ||
      solarPanel < 0 ||
      solarPanel > 100
    ) {
      setError("Solar efficiency must be between 0 and 100.");
      return;
    }

    if (
      formData.temperature === "" ||
      Number.isNaN(temperature) ||
      temperature < -100 ||
      temperature > 150
    ) {
      setError("Please enter a valid temperature.");
      return;
    }

    const automaticStatus = calculateStatus(
      battery,
      temperature,
      solarPanel,
      formData.communication
    );

    const telemetryData = {
      satellite_name: formData.satellite_name.trim(),
      battery,
      temperature,
      solar_panel: solarPanel,
      communication: formData.communication,
      status: automaticStatus,
    };

    try {
      setSaving(true);
      setError("");
      setSuccessMessage("");

      await createTelemetry(telemetryData);

      setShowModal(false);
      setFormData(initialFormData);

      setSuccessMessage("Telemetry record added successfully.");

      await loadTelemetry();

      window.setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (err) {
      console.error("Telemetry creation error:", err);
      setError(
        "Unable to add telemetry. Please check the entered information."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(record) {
    const confirmed = window.confirm(
      `Delete telemetry record for ${record.satellite_name}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccessMessage("");

      await deleteTelemetry(record.id);

      setTelemetryRecords((previousRecords) =>
        previousRecords.filter((item) => item.id !== record.id)
      );

      setSuccessMessage("Telemetry record deleted successfully.");

      window.setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (err) {
      console.error("Telemetry deletion error:", err);
      setError("Unable to delete the telemetry record.");
    }
  }

  const summary = useMemo(() => {
    const totalRecords = telemetryRecords.length;

    const healthy = telemetryRecords.filter(
      (record) => String(record.status).toLowerCase() === "healthy"
    ).length;

    const warning = telemetryRecords.filter(
      (record) => String(record.status).toLowerCase() === "warning"
    ).length;

    const critical = telemetryRecords.filter(
      (record) => String(record.status).toLowerCase() === "critical"
    ).length;

    const totalBattery = telemetryRecords.reduce(
      (total, record) => total + Number(record.battery || 0),
      0
    );

    const totalSolar = telemetryRecords.reduce(
      (total, record) => total + Number(record.solar_panel || 0),
      0
    );

    const totalTemperature = telemetryRecords.reduce(
      (total, record) => total + Number(record.temperature || 0),
      0
    );

    return {
      totalRecords,
      healthy,
      warning,
      critical,
      averageBattery:
        totalRecords > 0 ? Math.round(totalBattery / totalRecords) : 0,
      averageSolar:
        totalRecords > 0 ? Math.round(totalSolar / totalRecords) : 0,
      averageTemperature:
        totalRecords > 0
          ? Math.round(totalTemperature / totalRecords)
          : 0,
    };
  }, [telemetryRecords]);

  const filteredRecords = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return telemetryRecords.filter((record) => {
      const matchesSearch =
        normalizedSearch === "" ||
        String(record.satellite_name || "")
          .toLowerCase()
          .includes(normalizedSearch) ||
        String(record.communication || "")
          .toLowerCase()
          .includes(normalizedSearch) ||
        String(record.status || "")
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "All" ||
        String(record.status).toLowerCase() ===
          statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [telemetryRecords, searchTerm, statusFilter]);

  const cards = [
    {
      title: "Total Records",
      value: summary.totalRecords,
      color: "#2563EB",
      icon: <FaHeartbeat />,
    },
    {
      title: "Healthy Systems",
      value: summary.healthy,
      color: "#16A34A",
      icon: <FaCheckCircle />,
    },
    {
      title: "Warnings",
      value: summary.warning,
      color: "#F59E0B",
      icon: <FaExclamationTriangle />,
    },
    {
      title: "Critical Alerts",
      value: summary.critical,
      color: "#DC2626",
      icon: <FaExclamationTriangle />,
    },
    {
      title: "Average Battery",
      value: `${summary.averageBattery}%`,
      color: "#8B5CF6",
      icon: <FaBatteryThreeQuarters />,
    },
  ];

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.heading}>Telemetry Monitoring Platform</h2>

          <p style={styles.subtitle}>
            Monitor satellite engineering data, subsystem health and
            operational alerts.
          </p>
        </div>

        <button
          type="button"
          style={styles.addButton}
          onClick={openAddModal}
        >
          <FaPlus />
          Add Telemetry
        </button>
      </div>

      {error && !showModal && (
        <div style={styles.errorMessage}>
          <FaExclamationTriangle />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div style={styles.successMessage}>
          <FaCheckCircle />
          <span>{successMessage}</span>
        </div>
      )}

      <div style={styles.grid}>
        {cards.map((card) => (
          <div key={card.title} style={styles.card}>
            <div
              style={{
                ...styles.icon,
                backgroundColor: card.color,
              }}
            >
              {card.icon}
            </div>

            <div>
              <p style={styles.label}>{card.title}</p>
              <h2 style={styles.value}>{card.value}</h2>
            </div>
          </div>
        ))}
      </div>

      <div style={styles.healthOverview}>
        <HealthItem
          icon={<FaBatteryThreeQuarters />}
          title="Average Battery"
          value={summary.averageBattery}
          suffix="%"
          color="#16A34A"
        />

        <HealthItem
          icon={<FaSolarPanel />}
          title="Average Solar Efficiency"
          value={summary.averageSolar}
          suffix="%"
          color="#F59E0B"
        />

        <HealthItem
          icon={<FaThermometerHalf />}
          title="Average Temperature"
          value={summary.averageTemperature}
          suffix="°C"
          color="#DC2626"
          showProgress={false}
        />

        <HealthItem
          icon={<FaBroadcastTower />}
          title="Communication Systems"
          value={telemetryRecords.filter(
            (record) =>
              String(record.communication).toLowerCase() === "online"
          ).length}
          suffix={` / ${summary.totalRecords} Online`}
          color="#2563EB"
          showProgress={false}
        />
      </div>

      <div style={styles.panel}>
        <div style={styles.panelHeader}>
          <div>
            <h3 style={styles.panelTitle}>Latest Telemetry</h3>

            <p style={styles.panelSubtitle}>
              {filteredRecords.length} record
              {filteredRecords.length === 1 ? "" : "s"} displayed
            </p>
          </div>

          <div style={styles.filters}>
            <div style={styles.searchBox}>
              <FaSearch style={styles.searchIcon} />

              <input
                type="text"
                placeholder="Search satellite..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                style={styles.searchInput}
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
              style={styles.filterSelect}
            >
              <option value="All">All Statuses</option>
              <option value="Healthy">Healthy</option>
              <option value="Warning">Warning</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
        </div>

        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.tableHeader}>Satellite</th>
                <th style={styles.tableHeader}>Battery</th>
                <th style={styles.tableHeader}>Solar</th>
                <th style={styles.tableHeader}>Temperature</th>
                <th style={styles.tableHeader}>Communication</th>
                <th style={styles.tableHeader}>Status</th>
                <th style={styles.tableHeader}>Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={styles.emptyCell}>
                    Loading telemetry records...
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan="7" style={styles.emptyCell}>
                    No telemetry records found.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => (
                  <tr key={record.id}>
                    <td style={styles.tableCell}>
                      <div style={styles.satelliteCell}>
                        <div style={styles.satelliteIcon}>
                          <FaMicrochip />
                        </div>

                        <div>
                          <strong>
                            {record.satellite_name || "Unknown"}
                          </strong>

                          <div style={styles.recordId}>
                            Record #{record.id}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td style={styles.tableCell}>
                      <MetricProgress
                        value={Number(record.battery || 0)}
                        color={getMetricColor(
                          Number(record.battery || 0)
                        )}
                      />
                    </td>

                    <td style={styles.tableCell}>
                      <MetricProgress
                        value={Number(record.solar_panel || 0)}
                        color={getMetricColor(
                          Number(record.solar_panel || 0)
                        )}
                      />
                    </td>

                    <td style={styles.tableCell}>
                      <span
                        style={{
                          ...styles.temperatureBadge,
                          color: getTemperatureColor(
                            Number(record.temperature || 0)
                          ),
                        }}
                      >
                        {record.temperature}°C
                      </span>
                    </td>

                    <td style={styles.tableCell}>
                      <span
                        style={{
                          ...styles.communicationBadge,
                          color:
                            String(
                              record.communication
                            ).toLowerCase() === "online"
                              ? "#22C55E"
                              : String(
                                  record.communication
                                ).toLowerCase() === "weak"
                              ? "#F59E0B"
                              : "#EF4444",
                        }}
                      >
                        <FaBroadcastTower />
                        {record.communication}
                      </span>
                    </td>

                    <td style={styles.tableCell}>
                      <StatusBadge status={record.status} />
                    </td>

                    <td style={styles.tableCell}>
                      <button
                        type="button"
                        style={styles.deleteButton}
                        onClick={() => handleDelete(record)}
                        title="Delete telemetry record"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <div>
                <h3 style={styles.modalTitle}>
                  Add Telemetry Record
                </h3>

                <p style={styles.modalSubtitle}>
                  Enter the latest engineering values received from a
                  satellite.
                </p>
              </div>

              <button
                type="button"
                style={styles.closeButton}
                onClick={closeModal}
                disabled={saving}
              >
                <FaTimes />
              </button>
            </div>

            {error && (
              <div style={styles.modalError}>
                <FaExclamationTriangle />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={styles.formGrid}>
                <FormField
                  label="Satellite Name"
                  name="satellite_name"
                  value={formData.satellite_name}
                  onChange={handleInputChange}
                  placeholder="Example: ODI-SAT-01"
                  required
                />

                <FormField
                  label="Battery Health (%)"
                  name="battery"
                  type="number"
                  value={formData.battery}
                  onChange={handleInputChange}
                  placeholder="0 - 100"
                  min="0"
                  max="100"
                  required
                />

                <FormField
                  label="Solar Efficiency (%)"
                  name="solar_panel"
                  type="number"
                  value={formData.solar_panel}
                  onChange={handleInputChange}
                  placeholder="0 - 100"
                  min="0"
                  max="100"
                  required
                />

                <FormField
                  label="Temperature (°C)"
                  name="temperature"
                  type="number"
                  value={formData.temperature}
                  onChange={handleInputChange}
                  placeholder="Example: 32"
                  min="-100"
                  max="150"
                  required
                />

                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>
                    Communication
                  </label>

                  <select
                    name="communication"
                    value={formData.communication}
                    onChange={handleInputChange}
                    style={styles.formInput}
                  >
                    <option value="Online">Online</option>
                    <option value="Weak">Weak</option>
                    <option value="Offline">Offline</option>
                  </select>
                </div>

                <div style={styles.statusPreview}>
                  <p style={styles.previewLabel}>
                    Automatic Status
                  </p>

                  <StatusBadge
                    status={calculateStatus(
                      formData.battery || 0,
                      formData.temperature || 0,
                      formData.solar_panel || 0,
                      formData.communication
                    )}
                  />
                </div>
              </div>

              <div style={styles.statusNote}>
                Status is calculated automatically using battery,
                temperature, solar efficiency and communication
                condition.
              </div>

              <div style={styles.modalActions}>
                <button
                  type="button"
                  style={styles.cancelButton}
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  style={{
                    ...styles.saveButton,
                    opacity: saving ? 0.7 : 1,
                  }}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Telemetry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function HealthItem({
  icon,
  title,
  value,
  suffix,
  color,
  showProgress = true,
}) {
  return (
    <div style={styles.healthItem}>
      <div
        style={{
          ...styles.healthIcon,
          color,
          backgroundColor: `${color}18`,
        }}
      >
        {icon}
      </div>

      <div style={styles.healthContent}>
        <div style={styles.healthTop}>
          <span style={styles.healthTitle}>{title}</span>

          <strong style={styles.healthValue}>
            {value}
            {suffix}
          </strong>
        </div>

        {showProgress && (
          <div style={styles.healthProgressBackground}>
            <div
              style={{
                ...styles.healthProgressFill,
                width: `${Math.min(Math.max(value, 0), 100)}%`,
                backgroundColor: color,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function MetricProgress({ value, color }) {
  const safeValue = Math.min(Math.max(value, 0), 100);

  return (
    <div style={styles.metricContainer}>
      <div style={styles.metricTop}>
        <span>{safeValue}%</span>
      </div>

      <div style={styles.metricBackground}>
        <div
          style={{
            ...styles.metricFill,
            width: `${safeValue}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const normalizedStatus = String(status || "Unknown").toLowerCase();

  let color = "#94A3B8";
  let backgroundColor = "rgba(148, 163, 184, 0.15)";

  if (normalizedStatus === "healthy") {
    color = "#22C55E";
    backgroundColor = "rgba(34, 197, 94, 0.15)";
  }

  if (normalizedStatus === "warning") {
    color = "#F59E0B";
    backgroundColor = "rgba(245, 158, 11, 0.15)";
  }

  if (normalizedStatus === "critical") {
    color = "#EF4444";
    backgroundColor = "rgba(239, 68, 68, 0.15)";
  }

  return (
    <span
      style={{
        ...styles.statusBadge,
        color,
        backgroundColor,
      }}
    >
      <span
        style={{
          ...styles.statusDot,
          backgroundColor: color,
        }}
      />

      {status || "Unknown"}
    </span>
  );
}

function FormField({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required,
  min,
  max,
}) {
  return (
    <div style={styles.formGroup}>
      <label style={styles.formLabel} htmlFor={name}>
        {label}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        min={min}
        max={max}
        style={styles.formInput}
      />
    </div>
  );
}

function getMetricColor(value) {
  if (value >= 70) {
    return "#22C55E";
  }

  if (value >= 40) {
    return "#F59E0B";
  }

  return "#EF4444";
}

function getTemperatureColor(value) {
  if (value > 65 || value < -20) {
    return "#EF4444";
  }

  if (value > 50 || value < 0) {
    return "#F59E0B";
  }

  return "#22C55E";
}

const styles = {
  page: {
    minHeight: "100%",
  },

  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 20,
    marginBottom: 24,
    flexWrap: "wrap",
  },

  heading: {
    color: "#F8FAFC",
    margin: 0,
    fontSize: 28,
    fontWeight: 700,
  },

  subtitle: {
    color: "#94A3B8",
    margin: "8px 0 0",
    fontSize: 14,
  },

  addButton: {
    border: "none",
    borderRadius: 10,
    padding: "12px 18px",
    backgroundColor: "#2563EB",
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 8,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
    gap: 18,
    marginBottom: 22,
  },

  card: {
    backgroundColor: "#1E293B",
    border: "1px solid #334155",
    borderRadius: 14,
    padding: 20,
    display: "flex",
    alignItems: "center",
    gap: 16,
    minHeight: 82,
    boxShadow: "0 8px 20px rgba(0, 0, 0, 0.12)",
  },

  icon: {
    width: 52,
    height: 52,
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#FFFFFF",
    fontSize: 21,
    flexShrink: 0,
  },

  label: {
    color: "#94A3B8",
    margin: 0,
    fontSize: 13,
  },

  value: {
    color: "#F8FAFC",
    margin: "7px 0 0",
    fontSize: 25,
  },

  healthOverview: {
    backgroundColor: "#1E293B",
    border: "1px solid #334155",
    borderRadius: 14,
    padding: 20,
    marginBottom: 22,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 20,
  },

  healthItem: {
    display: "flex",
    alignItems: "center",
    gap: 13,
  },

  healthIcon: {
    width: 42,
    height: 42,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 18,
    flexShrink: 0,
  },

  healthContent: {
    width: "100%",
  },

  healthTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 8,
  },

  healthTitle: {
    color: "#94A3B8",
    fontSize: 12,
  },

  healthValue: {
    color: "#F8FAFC",
    fontSize: 13,
    whiteSpace: "nowrap",
  },

  healthProgressBackground: {
    height: 6,
    backgroundColor: "#334155",
    borderRadius: 20,
    overflow: "hidden",
  },

  healthProgressFill: {
    height: "100%",
    borderRadius: 20,
    transition: "width 0.3s ease",
  },

  panel: {
    backgroundColor: "#1E293B",
    border: "1px solid #334155",
    borderRadius: 14,
    padding: 20,
    color: "#FFFFFF",
    boxShadow: "0 8px 20px rgba(0, 0, 0, 0.12)",
  },

  panelHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 18,
    flexWrap: "wrap",
    marginBottom: 18,
  },

  panelTitle: {
    margin: 0,
    fontSize: 19,
    color: "#F8FAFC",
  },

  panelSubtitle: {
    margin: "5px 0 0",
    color: "#94A3B8",
    fontSize: 13,
  },

  filters: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
  },

  searchBox: {
    position: "relative",
    minWidth: 230,
  },

  searchIcon: {
    position: "absolute",
    left: 13,
    top: "50%",
    transform: "translateY(-50%)",
    color: "#64748B",
    fontSize: 14,
  },

  searchInput: {
    width: "100%",
    boxSizing: "border-box",
    backgroundColor: "#0F172A",
    border: "1px solid #334155",
    color: "#F8FAFC",
    borderRadius: 9,
    padding: "10px 12px 10px 38px",
    outline: "none",
  },

  filterSelect: {
    backgroundColor: "#0F172A",
    border: "1px solid #334155",
    color: "#F8FAFC",
    borderRadius: 9,
    padding: "10px 12px",
    outline: "none",
    cursor: "pointer",
  },

  tableContainer: {
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: 980,
  },

  tableHeader: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: 600,
    textAlign: "left",
    padding: "13px 14px",
    borderBottom: "1px solid #334155",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },

  tableCell: {
    color: "#E2E8F0",
    fontSize: 13,
    padding: "15px 14px",
    borderBottom: "1px solid rgba(51, 65, 85, 0.65)",
    verticalAlign: "middle",
  },

  emptyCell: {
    textAlign: "center",
    color: "#94A3B8",
    padding: 40,
    fontSize: 14,
  },

  satelliteCell: {
    display: "flex",
    alignItems: "center",
    gap: 11,
  },

  satelliteIcon: {
    width: 36,
    height: 36,
    borderRadius: 9,
    backgroundColor: "rgba(37, 99, 235, 0.16)",
    color: "#60A5FA",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  recordId: {
    color: "#64748B",
    fontSize: 11,
    marginTop: 4,
  },

  metricContainer: {
    minWidth: 90,
    maxWidth: 120,
  },

  metricTop: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 6,
    color: "#E2E8F0",
    fontSize: 12,
  },

  metricBackground: {
    height: 6,
    backgroundColor: "#334155",
    borderRadius: 20,
    overflow: "hidden",
  },

  metricFill: {
    height: "100%",
    borderRadius: 20,
  },

  temperatureBadge: {
    fontWeight: 600,
  },

  communicationBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    fontWeight: 600,
  },

  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    borderRadius: 20,
    padding: "6px 10px",
    fontSize: 12,
    fontWeight: 600,
    whiteSpace: "nowrap",
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: "50%",
  },

  deleteButton: {
    width: 34,
    height: 34,
    border: "1px solid rgba(239, 68, 68, 0.35)",
    borderRadius: 8,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    color: "#F87171",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  errorMessage: {
    marginBottom: 18,
    padding: "12px 14px",
    borderRadius: 9,
    backgroundColor: "rgba(239, 68, 68, 0.12)",
    border: "1px solid rgba(239, 68, 68, 0.35)",
    color: "#FCA5A5",
    display: "flex",
    alignItems: "center",
    gap: 9,
    fontSize: 13,
  },

  successMessage: {
    marginBottom: 18,
    padding: "12px 14px",
    borderRadius: 9,
    backgroundColor: "rgba(34, 197, 94, 0.12)",
    border: "1px solid rgba(34, 197, 94, 0.35)",
    color: "#86EFAC",
    display: "flex",
    alignItems: "center",
    gap: 9,
    fontSize: 13,
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(2, 6, 23, 0.78)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    zIndex: 1000,
    backdropFilter: "blur(4px)",
  },

  modal: {
    width: "100%",
    maxWidth: 680,
    maxHeight: "90vh",
    overflowY: "auto",
    backgroundColor: "#1E293B",
    border: "1px solid #334155",
    borderRadius: 15,
    padding: 24,
    boxShadow: "0 25px 60px rgba(0, 0, 0, 0.45)",
  },

  modalHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 20,
    marginBottom: 20,
  },

  modalTitle: {
    margin: 0,
    color: "#F8FAFC",
    fontSize: 21,
  },

  modalSubtitle: {
    margin: "7px 0 0",
    color: "#94A3B8",
    fontSize: 13,
    lineHeight: 1.5,
  },

  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 8,
    border: "1px solid #475569",
    backgroundColor: "#0F172A",
    color: "#CBD5E1",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  modalError: {
    marginBottom: 18,
    padding: "11px 13px",
    borderRadius: 8,
    backgroundColor: "rgba(239, 68, 68, 0.12)",
    border: "1px solid rgba(239, 68, 68, 0.35)",
    color: "#FCA5A5",
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 13,
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 17,
  },

  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 7,
  },

  formLabel: {
    color: "#CBD5E1",
    fontSize: 13,
    fontWeight: 600,
  },

  formInput: {
    width: "100%",
    boxSizing: "border-box",
    backgroundColor: "#0F172A",
    border: "1px solid #475569",
    borderRadius: 9,
    padding: "11px 12px",
    color: "#F8FAFC",
    fontSize: 14,
    outline: "none",
  },

  statusPreview: {
    backgroundColor: "#0F172A",
    border: "1px solid #334155",
    borderRadius: 10,
    padding: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  previewLabel: {
    margin: 0,
    color: "#94A3B8",
    fontSize: 13,
  },

  statusNote: {
    marginTop: 18,
    padding: "11px 13px",
    borderRadius: 8,
    backgroundColor: "rgba(37, 99, 235, 0.1)",
    border: "1px solid rgba(37, 99, 235, 0.25)",
    color: "#93C5FD",
    fontSize: 12,
    lineHeight: 1.5,
  },

  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 11,
    marginTop: 22,
  },

  cancelButton: {
    border: "1px solid #475569",
    borderRadius: 9,
    padding: "10px 17px",
    backgroundColor: "transparent",
    color: "#CBD5E1",
    cursor: "pointer",
    fontWeight: 600,
  },

  saveButton: {
    border: "none",
    borderRadius: 9,
    padding: "10px 18px",
    backgroundColor: "#2563EB",
    color: "#FFFFFF",
    cursor: "pointer",
    fontWeight: 600,
  },
};

export default Telemetry;