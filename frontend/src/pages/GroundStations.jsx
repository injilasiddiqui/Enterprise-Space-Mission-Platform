import { useEffect, useMemo, useState } from "react";
import {
  FaSatelliteDish,
  FaCheckCircle,
  FaClock,
  FaTools,
  FaPlus,
  FaSearch,
  FaEdit,
  FaTrash,
  FaTimes,
  FaMapMarkerAlt,
  FaBroadcastTower,
  FaExclamationTriangle,
  FaSignal,
} from "react-icons/fa";

import {
  getGroundStations,
  createGroundStation,
  updateGroundStation,
  deleteGroundStation,
} from "../services/api";

const EMPTY_FORM = {
  station_name: "",
  location: "",
  communication_window: "",
  status: "Active",
};

const STATION_STATUSES = [
  "Active",
  "Maintenance",
  "Inactive",
];

function GroundStations() {
  const [stations, setStations] = useState([]);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    loadGroundStations();
  }, []);

  async function loadGroundStations() {
    try {
      setLoading(true);
      setError("");

      const response = await getGroundStations();

      const stationData = Array.isArray(response)
        ? response
        : response?.data || [];

      setStations(stationData);
    } catch (err) {
      console.error("Ground station loading error:", err);

      setError(
        "Unable to load ground stations. Check that the backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleInputChange(event) {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  }

  function openCreateModal() {
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setError("");
    setSuccessMessage("");
    setShowModal(true);
  }

  function openEditModal(station) {
    setEditingId(station.id);

    setFormData({
      station_name: station.station_name || "",
      location: station.location || "",
      communication_window:
        station.communication_window || "",
      status: STATION_STATUSES.includes(station.status)
        ? station.status
        : "Active",
    });

    setError("");
    setSuccessMessage("");
    setShowModal(true);
  }

  function closeModal() {
    if (saving) {
      return;
    }

    setShowModal(false);
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const stationName = formData.station_name.trim();
    const location = formData.location.trim();
    const communicationWindow =
      formData.communication_window.trim();

    if (stationName.length < 3) {
      setError(
        "Station name must contain at least 3 characters."
      );
      return;
    }

    if (location.length < 2) {
      setError("Please enter a valid station location.");
      return;
    }

    if (communicationWindow.length < 3) {
      setError(
        "Please enter a valid communication window."
      );
      return;
    }

    if (!STATION_STATUSES.includes(formData.status)) {
      setError("Please select a valid station status.");
      return;
    }

    const requestData = {
      station_name: stationName,
      location,
      communication_window: communicationWindow,
      status: formData.status,
    };

    try {
      setSaving(true);
      setError("");
      setSuccessMessage("");

      if (editingId) {
        await updateGroundStation(editingId, requestData);

        setSuccessMessage(
          "Ground station updated successfully."
        );
      } else {
        await createGroundStation(requestData);

        setSuccessMessage(
          "Ground station registered successfully."
        );
      }

      setShowModal(false);
      setEditingId(null);
      setFormData(EMPTY_FORM);

      await loadGroundStations();
      clearSuccessMessageLater();
    } catch (err) {
      console.error("Ground station save error:", err);

      const message = String(err.message || "");

      if (
        message.toLowerCase().includes("already exists")
      ) {
        setError(
          "A ground station with this name already exists."
        );
      } else {
        setError(
          "Unable to save the ground station. Check the entered information."
        );
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(station) {
    const confirmed = window.confirm(
      `Delete ground station "${station.station_name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccessMessage("");

      await deleteGroundStation(station.id);

      setStations((currentStations) =>
        currentStations.filter(
          (item) => item.id !== station.id
        )
      );

      setSuccessMessage(
        "Ground station deleted successfully."
      );

      clearSuccessMessageLater();
    } catch (err) {
      console.error("Ground station deletion error:", err);

      setError("Unable to delete this ground station.");
    }
  }

  function clearSuccessMessageLater() {
    window.setTimeout(() => {
      setSuccessMessage("");
    }, 3000);
  }

  const summary = useMemo(() => {
    const countStatus = (status) =>
      stations.filter(
        (station) =>
          String(station.status).toLowerCase() ===
          status.toLowerCase()
      ).length;

    return {
      total: stations.length,
      active: countStatus("Active"),
      maintenance: countStatus("Maintenance"),
      inactive: countStatus("Inactive"),
    };
  }, [stations]);

  const filteredStations = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return stations.filter((station) => {
      const matchesSearch =
        search === "" ||
        String(station.station_name || "")
          .toLowerCase()
          .includes(search) ||
        String(station.location || "")
          .toLowerCase()
          .includes(search) ||
        String(station.communication_window || "")
          .toLowerCase()
          .includes(search);

      const matchesStatus =
        statusFilter === "All" ||
        String(station.status).toLowerCase() ===
          statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [stations, searchTerm, statusFilter]);

  const cards = [
    {
      title: "Total Stations",
      value: summary.total,
      color: "#2563EB",
      icon: <FaSatelliteDish />,
    },
    {
      title: "Active",
      value: summary.active,
      color: "#16A34A",
      icon: <FaCheckCircle />,
    },
    {
      title: "Maintenance",
      value: summary.maintenance,
      color: "#F59E0B",
      icon: <FaTools />,
    },
    {
      title: "Inactive",
      value: summary.inactive,
      color: "#DC2626",
      icon: <FaClock />,
    },
  ];

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.heading}>
            Ground Station Operations
          </h2>

          <p style={styles.subtitle}>
            Manage communication facilities, contact windows and
            station availability.
          </p>
        </div>

        <button
          type="button"
          style={styles.addButton}
          onClick={openCreateModal}
        >
          <FaPlus />
          Add Ground Station
        </button>
      </div>

      {error && !showModal && (
        <div style={styles.errorMessage}>
          <FaExclamationTriangle />
          <span>{error}</span>

          <button
            type="button"
            style={styles.messageClose}
            onClick={() => setError("")}
          >
            <FaTimes />
          </button>
        </div>
      )}

      {successMessage && (
        <div style={styles.successMessage}>
          <FaCheckCircle />
          <span>{successMessage}</span>
        </div>
      )}

      <div style={styles.cards}>
        {cards.map((card) => (
          <SummaryCard
            key={card.title}
            title={card.title}
            value={card.value}
            color={card.color}
            icon={card.icon}
          />
        ))}
      </div>

      <div style={styles.operationsPanel}>
        <OperationItem
          icon={<FaSatelliteDish />}
          title="Ground Facility"
          text="Provides the physical communication link with satellites."
          color="#60A5FA"
        />

        <OperationItem
          icon={<FaClock />}
          title="Contact Window"
          text="Defines when the station can communicate with a satellite."
          color="#FBBF24"
        />

        <OperationItem
          icon={<FaBroadcastTower />}
          title="Data Transfer"
          text="Receives telemetry and sends approved mission commands."
          color="#A78BFA"
        />

        <OperationItem
          icon={<FaSignal />}
          title="Station Status"
          text="Shows operational availability for mission scheduling."
          color="#4ADE80"
        />
      </div>

      <div style={styles.panel}>
        <div style={styles.panelTop}>
          <div>
            <h3 style={styles.panelTitle}>
              Ground Station Status
            </h3>

            <p style={styles.panelSubtitle}>
              {filteredStations.length} station
              {filteredStations.length === 1 ? "" : "s"} displayed
            </p>
          </div>

          <div style={styles.filters}>
            <div style={styles.searchBox}>
              <FaSearch style={styles.searchIcon} />

              <input
                type="text"
                placeholder="Search stations..."
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
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
              <option value="Active">Active</option>
              <option value="Maintenance">
                Maintenance
              </option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.tableHeader}>
                  Station
                </th>
                <th style={styles.tableHeader}>
                  Location
                </th>
                <th style={styles.tableHeader}>
                  Communication Window
                </th>
                <th style={styles.tableHeader}>
                  Availability
                </th>
                <th style={styles.tableHeader}>
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="5"
                    style={styles.emptyCell}
                  >
                    Loading ground stations...
                  </td>
                </tr>
              ) : filteredStations.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    style={styles.emptyCell}
                  >
                    No ground stations found.
                  </td>
                </tr>
              ) : (
                filteredStations.map((station) => (
                  <tr key={station.id}>
                    <td style={styles.tableCell}>
                      <div style={styles.stationCell}>
                        <div style={styles.stationIcon}>
                          <FaSatelliteDish />
                        </div>

                        <div>
                          <strong>
                            {station.station_name}
                          </strong>

                          <div style={styles.recordId}>
                            Station #{station.id}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td style={styles.tableCell}>
                      <div style={styles.locationCell}>
                        <FaMapMarkerAlt />
                        {station.location}
                      </div>
                    </td>

                    <td style={styles.tableCell}>
                      <div style={styles.windowCell}>
                        <FaClock />
                        {station.communication_window}
                      </div>
                    </td>

                    <td style={styles.tableCell}>
                      <StatusBadge status={station.status} />
                    </td>

                    <td style={styles.tableCell}>
                      <div style={styles.actions}>
                        <button
                          type="button"
                          style={{
                            ...styles.actionButton,
                            color: "#60A5FA",
                            borderColor:
                              "rgba(96, 165, 250, 0.35)",
                          }}
                          onClick={() =>
                            openEditModal(station)
                          }
                          title="Edit ground station"
                        >
                          <FaEdit />
                        </button>

                        <button
                          type="button"
                          style={{
                            ...styles.actionButton,
                            color: "#F87171",
                            borderColor:
                              "rgba(248, 113, 113, 0.35)",
                          }}
                          onClick={() =>
                            handleDelete(station)
                          }
                          title="Delete ground station"
                        >
                          <FaTrash />
                        </button>
                      </div>
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
                  {editingId
                    ? "Edit Ground Station"
                    : "Add Ground Station"}
                </h3>

                <p style={styles.modalSubtitle}>
                  Enter the station location, contact window and
                  operational status.
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
                  label="Station Name"
                  name="station_name"
                  value={formData.station_name}
                  onChange={handleInputChange}
                  placeholder="Example: Karachi GS"
                  required
                />

                <FormField
                  label="Location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Example: Karachi, Pakistan"
                  required
                />

                <FormField
                  label="Communication Window"
                  name="communication_window"
                  value={formData.communication_window}
                  onChange={handleInputChange}
                  placeholder="Example: 09:00 - 11:00 UTC"
                  required
                />

                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>
                    Operational Status
                  </label>

                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    style={styles.formInput}
                  >
                    {STATION_STATUSES.map((status) => (
                      <option
                        key={status}
                        value={status}
                      >
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={styles.statusNote}>
                <FaBroadcastTower />

                <span>
                  Active stations are available for mission
                  communication scheduling.
                </span>
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
                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Update Station"
                    : "Add Station"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ title, value, color, icon }) {
  return (
    <div style={styles.card}>
      <div
        style={{
          ...styles.cardIcon,
          backgroundColor: color,
        }}
      >
        {icon}
      </div>

      <div>
        <p style={styles.cardLabel}>{title}</p>
        <h2 style={styles.cardValue}>{value}</h2>
      </div>
    </div>
  );
}

function OperationItem({ icon, title, text, color }) {
  return (
    <div style={styles.operationItem}>
      <div
        style={{
          ...styles.operationIcon,
          color,
          backgroundColor: `${color}18`,
        }}
      >
        {icon}
      </div>

      <div>
        <strong style={styles.operationTitle}>
          {title}
        </strong>

        <p style={styles.operationText}>{text}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const normalized = String(
    status || "Unknown"
  ).toLowerCase();

  const statusStyles = {
    active: {
      color: "#4ADE80",
      backgroundColor: "rgba(34, 197, 94, 0.15)",
    },
    maintenance: {
      color: "#FBBF24",
      backgroundColor: "rgba(245, 158, 11, 0.15)",
    },
    inactive: {
      color: "#F87171",
      backgroundColor: "rgba(239, 68, 68, 0.15)",
    },
  };

  const selectedStyle =
    statusStyles[normalized] || {
      color: "#CBD5E1",
      backgroundColor:
        "rgba(148, 163, 184, 0.15)",
    };

  return (
    <span
      style={{
        ...styles.statusBadge,
        ...selectedStyle,
      }}
    >
      <span
        style={{
          ...styles.statusDot,
          backgroundColor: selectedStyle.color,
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
        style={styles.formInput}
      />
    </div>
  );
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
    flexWrap: "wrap",
    marginBottom: 24,
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

  cards: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(210px, 1fr))",
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
    minHeight: 80,
  },

  cardIcon: {
    width: 52,
    height: 52,
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#FFFFFF",
    fontSize: 21,
  },

  cardLabel: {
    color: "#94A3B8",
    margin: 0,
    fontSize: 13,
  },

  cardValue: {
    color: "#F8FAFC",
    margin: "7px 0 0",
    fontSize: 25,
  },

  operationsPanel: {
    backgroundColor: "#1E293B",
    border: "1px solid #334155",
    borderRadius: 14,
    padding: 19,
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 18,
    marginBottom: 22,
  },

  operationItem: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },

  operationIcon: {
    width: 43,
    height: 43,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  operationTitle: {
    color: "#F8FAFC",
    fontSize: 13,
  },

  operationText: {
    color: "#94A3B8",
    fontSize: 11,
    lineHeight: 1.4,
    margin: "4px 0 0",
  },

  panel: {
    backgroundColor: "#1E293B",
    border: "1px solid #334155",
    borderRadius: 14,
    padding: 20,
    color: "#FFFFFF",
  },

  panelTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 18,
    flexWrap: "wrap",
    marginBottom: 18,
  },

  panelTitle: {
    margin: 0,
    color: "#F8FAFC",
    fontSize: 19,
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
    minWidth: 230,
    position: "relative",
  },

  searchIcon: {
    position: "absolute",
    left: 13,
    top: "50%",
    transform: "translateY(-50%)",
    color: "#64748B",
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
  },

  tableContainer: {
    overflowX: "auto",
  },

  table: {
    width: "100%",
    minWidth: 900,
    borderCollapse: "collapse",
  },

  tableHeader: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: 600,
    textAlign: "left",
    padding: "13px 14px",
    borderBottom: "1px solid #334155",
    textTransform: "uppercase",
  },

  tableCell: {
    color: "#E2E8F0",
    fontSize: 13,
    padding: "15px 14px",
    borderBottom:
      "1px solid rgba(51, 65, 85, 0.65)",
  },

  emptyCell: {
    textAlign: "center",
    color: "#94A3B8",
    padding: 40,
  },

  stationCell: {
    display: "flex",
    alignItems: "center",
    gap: 11,
  },

  stationIcon: {
    width: 36,
    height: 36,
    borderRadius: 9,
    backgroundColor:
      "rgba(37, 99, 235, 0.16)",
    color: "#60A5FA",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  recordId: {
    color: "#64748B",
    fontSize: 11,
    marginTop: 4,
  },

  locationCell: {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
  },

  windowCell: {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    whiteSpace: "nowrap",
  },

  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    borderRadius: 20,
    padding: "6px 10px",
    fontSize: 12,
    fontWeight: 600,
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: "50%",
  },

  actions: {
    display: "flex",
    gap: 8,
  },

  actionButton: {
    width: 34,
    height: 34,
    borderRadius: 8,
    border: "1px solid",
    backgroundColor: "#0F172A",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  errorMessage: {
    marginBottom: 18,
    padding: "12px 14px",
    borderRadius: 9,
    backgroundColor:
      "rgba(239, 68, 68, 0.12)",
    border:
      "1px solid rgba(239, 68, 68, 0.35)",
    color: "#FCA5A5",
    display: "flex",
    alignItems: "center",
    gap: 9,
  },

  messageClose: {
    marginLeft: "auto",
    border: "none",
    background: "transparent",
    color: "#FCA5A5",
    cursor: "pointer",
  },

  successMessage: {
    marginBottom: 18,
    padding: "12px 14px",
    borderRadius: 9,
    backgroundColor:
      "rgba(34, 197, 94, 0.12)",
    border:
      "1px solid rgba(34, 197, 94, 0.35)",
    color: "#86EFAC",
    display: "flex",
    alignItems: "center",
    gap: 9,
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    backgroundColor:
      "rgba(2, 6, 23, 0.78)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    zIndex: 1000,
  },

  modal: {
    width: "100%",
    maxWidth: 650,
    backgroundColor: "#1E293B",
    border: "1px solid #334155",
    borderRadius: 15,
    padding: 24,
  },

  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 20,
    marginBottom: 20,
  },

  modalTitle: {
    color: "#F8FAFC",
    margin: 0,
  },

  modalSubtitle: {
    color: "#94A3B8",
    margin: "7px 0 0",
    fontSize: 13,
  },

  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 8,
    border: "1px solid #475569",
    backgroundColor: "#0F172A",
    color: "#CBD5E1",
    cursor: "pointer",
  },

  modalError: {
    marginBottom: 18,
    padding: "11px 13px",
    borderRadius: 8,
    backgroundColor:
      "rgba(239, 68, 68, 0.12)",
    color: "#FCA5A5",
    display: "flex",
    gap: 8,
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(240px, 1fr))",
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
  },

  statusNote: {
    marginTop: 18,
    padding: "11px 13px",
    borderRadius: 8,
    backgroundColor:
      "rgba(37, 99, 235, 0.1)",
    color: "#93C5FD",
    display: "flex",
    alignItems: "center",
    gap: 9,
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
  },

  saveButton: {
    border: "none",
    borderRadius: 9,
    padding: "10px 18px",
    backgroundColor: "#2563EB",
    color: "#FFFFFF",
    cursor: "pointer",
  },
};

export default GroundStations;