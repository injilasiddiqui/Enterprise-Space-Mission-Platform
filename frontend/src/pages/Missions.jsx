import { useEffect, useMemo, useState } from "react";
import {
  FaSatelliteDish,
  FaCheckCircle,
  FaClock,
  FaPlayCircle,
  FaPlus,
  FaSearch,
  FaEdit,
  FaTrash,
  FaTimes,
  FaShieldAlt,
  FaExclamationTriangle,
  FaCalendarAlt,
  FaSatellite,
  FaBan,
} from "react-icons/fa";

import {
  getMissions,
  getSatellites,
  createMission,
  updateMission,
  deleteMission,
  approveMission,
} from "../services/api";

const EMPTY_FORM = {
  mission_name: "",
  satellite_name: "",
  launch_date: "",
  status: "Planned",
};

const EDITABLE_STATUSES = [
  "Planned",
  "Active",
  "Completed",
  "Cancelled",
];

function Missions() {
  const [missions, setMissions] = useState([]);
  const [satellites, setSatellites] = useState([]);

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [approvingId, setApprovingId] = useState(null);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    loadPageData();
  }, []);

  async function loadPageData() {
    try {
      setLoading(true);
      setError("");

      const [missionResponse, satelliteResponse] =
        await Promise.all([
          getMissions(),
          getSatellites(),
        ]);

      const missionData = Array.isArray(missionResponse)
        ? missionResponse
        : missionResponse?.data || [];

      const satelliteData = Array.isArray(satelliteResponse)
        ? satelliteResponse
        : satelliteResponse?.data || [];

      setMissions(missionData);
      setSatellites(satelliteData);
    } catch (err) {
      console.error("Mission page loading error:", err);

      setError(
        "Unable to load mission information. Check that the backend is running."
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
    setFormData({
      ...EMPTY_FORM,
      satellite_name:
        satellites.length > 0 ? satellites[0].name : "",
    });

    setError("");
    setSuccessMessage("");
    setShowModal(true);
  }

  function openEditModal(mission) {
    if (String(mission.status).toLowerCase() === "approved") {
      setError(
        "Approved missions cannot be edited through this form."
      );
      return;
    }

    setEditingId(mission.id);

    setFormData({
      mission_name: mission.mission_name || "",
      satellite_name: mission.satellite_name || "",
      launch_date: normalizeDate(mission.launch_date),
      status: EDITABLE_STATUSES.includes(mission.status)
        ? mission.status
        : "Planned",
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

    const missionName = formData.mission_name.trim();
    const satelliteName = formData.satellite_name.trim();

    if (missionName.length < 3) {
      setError(
        "Mission name must contain at least 3 characters."
      );
      return;
    }

    if (satelliteName.length < 3) {
      setError("Please select or enter a satellite name.");
      return;
    }

    if (!formData.launch_date) {
      setError("Launch date is required.");
      return;
    }

    if (!EDITABLE_STATUSES.includes(formData.status)) {
      setError("Please select a valid mission status.");
      return;
    }

    const requestData = {
      mission_name: missionName,
      satellite_name: satelliteName,
      launch_date: formData.launch_date,
      status: formData.status,
    };

    try {
      setSaving(true);
      setError("");
      setSuccessMessage("");

      if (editingId) {
        await updateMission(editingId, requestData);

        setSuccessMessage(
          "Mission updated successfully."
        );
      } else {
        await createMission(requestData);

        setSuccessMessage(
          "Mission created successfully."
        );
      }

      setShowModal(false);
      setEditingId(null);
      setFormData(EMPTY_FORM);

      await loadPageData();

      clearSuccessMessageLater();
    } catch (err) {
      console.error("Mission save error:", err);

      const message = String(err.message || "");

      if (
        message.toLowerCase().includes("already exists")
      ) {
        setError(
          "A mission with this name already exists."
        );
      } else {
        setError(
          "Unable to save the mission. Check all entered information."
        );
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleApprove(mission) {
    if (
      String(mission.status).toLowerCase() !== "planned"
    ) {
      setError(
        "Only planned missions can be approved."
      );
      return;
    }

    const confirmed = window.confirm(
      `Approve mission "${mission.mission_name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setApprovingId(mission.id);
      setError("");
      setSuccessMessage("");

      await approveMission(mission.id);

      setSuccessMessage(
        "Mission approved successfully."
      );

      await loadPageData();

      clearSuccessMessageLater();
    } catch (err) {
      console.error("Mission approval error:", err);

      setError("Unable to approve this mission.");
    } finally {
      setApprovingId(null);
    }
  }

  async function handleDelete(mission) {
    const confirmed = window.confirm(
      `Delete mission "${mission.mission_name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccessMessage("");

      await deleteMission(mission.id);

      setMissions((currentMissions) =>
        currentMissions.filter(
          (item) => item.id !== mission.id
        )
      );

      setSuccessMessage(
        "Mission deleted successfully."
      );

      clearSuccessMessageLater();
    } catch (err) {
      console.error("Mission deletion error:", err);

      setError("Unable to delete this mission.");
    }
  }

  function clearSuccessMessageLater() {
    window.setTimeout(() => {
      setSuccessMessage("");
    }, 3000);
  }

  const summary = useMemo(() => {
    const countByStatus = (status) =>
      missions.filter(
        (mission) =>
          String(mission.status).toLowerCase() ===
          status.toLowerCase()
      ).length;

    return {
      total: missions.length,
      planned: countByStatus("Planned"),
      approved: countByStatus("Approved"),
      active: countByStatus("Active"),
      completed: countByStatus("Completed"),
      cancelled: countByStatus("Cancelled"),
    };
  }, [missions]);

  const filteredMissions = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return missions.filter((mission) => {
      const matchesSearch =
        search === "" ||
        String(mission.mission_name || "")
          .toLowerCase()
          .includes(search) ||
        String(mission.satellite_name || "")
          .toLowerCase()
          .includes(search) ||
        String(mission.launch_date || "")
          .toLowerCase()
          .includes(search);

      const matchesStatus =
        statusFilter === "All" ||
        String(mission.status).toLowerCase() ===
          statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [missions, searchTerm, statusFilter]);

  const cards = [
    {
      title: "Total Missions",
      value: summary.total,
      color: "#2563EB",
      icon: <FaSatelliteDish />,
    },
    {
      title: "Planned",
      value: summary.planned,
      color: "#F59E0B",
      icon: <FaClock />,
    },
    {
      title: "Approved",
      value: summary.approved,
      color: "#8B5CF6",
      icon: <FaShieldAlt />,
    },
    {
      title: "Active",
      value: summary.active,
      color: "#06B6D4",
      icon: <FaPlayCircle />,
    },
    {
      title: "Completed",
      value: summary.completed,
      color: "#16A34A",
      icon: <FaCheckCircle />,
    },
  ];

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.heading}>
            Mission Control Platform
          </h2>

          <p style={styles.subtitle}>
            Create, approve and monitor satellite mission
            operations.
          </p>
        </div>

        <button
          type="button"
          style={styles.addButton}
          onClick={openCreateModal}
        >
          <FaPlus />
          Create Mission
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

      <div style={styles.workflowPanel}>
        <div style={styles.workflowStep}>
          <div
            style={{
              ...styles.workflowIcon,
              backgroundColor:
                "rgba(245, 158, 11, 0.16)",
              color: "#FBBF24",
            }}
          >
            <FaClock />
          </div>

          <div>
            <strong style={styles.workflowTitle}>
              1. Plan
            </strong>

            <p style={styles.workflowText}>
              Create the mission and assign a satellite.
            </p>
          </div>
        </div>

        <div style={styles.workflowArrow}>→</div>

        <div style={styles.workflowStep}>
          <div
            style={{
              ...styles.workflowIcon,
              backgroundColor:
                "rgba(139, 92, 246, 0.16)",
              color: "#A78BFA",
            }}
          >
            <FaShieldAlt />
          </div>

          <div>
            <strong style={styles.workflowTitle}>
              2. Approve
            </strong>

            <p style={styles.workflowText}>
              Authorize the mission before execution.
            </p>
          </div>
        </div>

        <div style={styles.workflowArrow}>→</div>

        <div style={styles.workflowStep}>
          <div
            style={{
              ...styles.workflowIcon,
              backgroundColor:
                "rgba(6, 182, 212, 0.16)",
              color: "#22D3EE",
            }}
          >
            <FaPlayCircle />
          </div>

          <div>
            <strong style={styles.workflowTitle}>
              3. Execute
            </strong>

            <p style={styles.workflowText}>
              Track active mission operations.
            </p>
          </div>
        </div>

        <div style={styles.workflowArrow}>→</div>

        <div style={styles.workflowStep}>
          <div
            style={{
              ...styles.workflowIcon,
              backgroundColor:
                "rgba(34, 197, 94, 0.16)",
              color: "#4ADE80",
            }}
          >
            <FaCheckCircle />
          </div>

          <div>
            <strong style={styles.workflowTitle}>
              4. Complete
            </strong>

            <p style={styles.workflowText}>
              Close the mission and retain its history.
            </p>
          </div>
        </div>
      </div>

      <div style={styles.tableCard}>
        <div style={styles.tableTop}>
          <div>
            <h3 style={styles.tableTitle}>
              Mission Schedule
            </h3>

            <p style={styles.tableSubtitle}>
              {filteredMissions.length} mission
              {filteredMissions.length === 1 ? "" : "s"}{" "}
              displayed
            </p>
          </div>

          <div style={styles.filters}>
            <div style={styles.searchBox}>
              <FaSearch style={styles.searchIcon} />

              <input
                type="text"
                placeholder="Search missions..."
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
              <option value="Planned">Planned</option>
              <option value="Approved">Approved</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.tableHeader}>
                  Mission
                </th>
                <th style={styles.tableHeader}>
                  Satellite
                </th>
                <th style={styles.tableHeader}>
                  Launch Date
                </th>
                <th style={styles.tableHeader}>
                  Status
                </th>
                <th style={styles.tableHeader}>
                  Approval
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
                    colSpan="6"
                    style={styles.emptyCell}
                  >
                    Loading missions...
                  </td>
                </tr>
              ) : filteredMissions.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    style={styles.emptyCell}
                  >
                    No missions found.
                  </td>
                </tr>
              ) : (
                filteredMissions.map((mission) => {
                  const isPlanned =
                    String(
                      mission.status
                    ).toLowerCase() === "planned";

                  const isApproved =
                    String(
                      mission.status
                    ).toLowerCase() === "approved";

                  return (
                    <tr key={mission.id}>
                      <td style={styles.tableCell}>
                        <div style={styles.missionCell}>
                          <div style={styles.missionIcon}>
                            <FaSatelliteDish />
                          </div>

                          <div>
                            <strong>
                              {mission.mission_name}
                            </strong>

                            <div style={styles.recordId}>
                              Mission #{mission.id}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td style={styles.tableCell}>
                        <div style={styles.satelliteCell}>
                          <FaSatellite />
                          {mission.satellite_name}
                        </div>
                      </td>

                      <td style={styles.tableCell}>
                        <div style={styles.dateCell}>
                          <FaCalendarAlt />
                          {formatDate(
                            mission.launch_date
                          )}
                        </div>
                      </td>

                      <td style={styles.tableCell}>
                        <StatusBadge
                          status={mission.status}
                        />
                      </td>

                      <td style={styles.tableCell}>
                        {isPlanned ? (
                          <button
                            type="button"
                            style={styles.approveButton}
                            onClick={() =>
                              handleApprove(mission)
                            }
                            disabled={
                              approvingId === mission.id
                            }
                          >
                            <FaShieldAlt />

                            {approvingId === mission.id
                              ? "Approving..."
                              : "Approve"}
                          </button>
                        ) : isApproved ? (
                          <span
                            style={
                              styles.approvedIndicator
                            }
                          >
                            <FaCheckCircle />
                            Approved
                          </span>
                        ) : (
                          <span
                            style={styles.notApplicable}
                          >
                            —
                          </span>
                        )}
                      </td>

                      <td style={styles.tableCell}>
                        <div style={styles.actions}>
                          <button
                            type="button"
                            style={{
                              ...styles.actionButton,
                              color: isApproved
                                ? "#64748B"
                                : "#60A5FA",
                              borderColor: isApproved
                                ? "#334155"
                                : "rgba(96, 165, 250, 0.35)",
                              cursor: isApproved
                                ? "not-allowed"
                                : "pointer",
                            }}
                            onClick={() =>
                              openEditModal(mission)
                            }
                            disabled={isApproved}
                            title={
                              isApproved
                                ? "Approved missions cannot be edited"
                                : "Edit mission"
                            }
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
                              handleDelete(mission)
                            }
                            title="Delete mission"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
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
                    ? "Edit Mission"
                    : "Create Mission"}
                </h3>

                <p style={styles.modalSubtitle}>
                  Enter the mission assignment and launch
                  information.
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
                  label="Mission Name"
                  name="mission_name"
                  value={formData.mission_name}
                  onChange={handleInputChange}
                  placeholder="Example: Earth Observation Mission"
                  required
                />

                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>
                    Assigned Satellite
                  </label>

                  {satellites.length > 0 ? (
                    <select
                      name="satellite_name"
                      value={formData.satellite_name}
                      onChange={handleInputChange}
                      style={styles.formInput}
                      required
                    >
                      <option value="">
                        Select Satellite
                      </option>

                      {satellites.map((satellite) => (
                        <option
                          key={satellite.id}
                          value={satellite.name}
                        >
                          {satellite.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      name="satellite_name"
                      value={formData.satellite_name}
                      onChange={handleInputChange}
                      placeholder="Example: ODI-SAT-01"
                      style={styles.formInput}
                      required
                    />
                  )}
                </div>

                <FormField
                  label="Launch Date"
                  name="launch_date"
                  type="date"
                  value={formData.launch_date}
                  onChange={handleInputChange}
                  required
                />

                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>
                    Mission Status
                  </label>

                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    style={styles.formInput}
                  >
                    {EDITABLE_STATUSES.map((status) => (
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

              <div style={styles.approvalNote}>
                <FaShieldAlt />

                <span>
                  Create the mission as Planned, then use
                  the Approve button from the mission
                  schedule.
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
                    ? "Update Mission"
                    : "Create Mission"}
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

function StatusBadge({ status }) {
  const normalized = String(
    status || "Unknown"
  ).toLowerCase();

  const statusStyles = {
    planned: {
      color: "#FBBF24",
      backgroundColor: "rgba(245, 158, 11, 0.15)",
    },
    approved: {
      color: "#A78BFA",
      backgroundColor: "rgba(139, 92, 246, 0.15)",
    },
    active: {
      color: "#22D3EE",
      backgroundColor: "rgba(6, 182, 212, 0.15)",
    },
    completed: {
      color: "#4ADE80",
      backgroundColor: "rgba(34, 197, 94, 0.15)",
    },
    cancelled: {
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

function normalizeDate(value) {
  if (!value) {
    return "";
  }

  return String(value).slice(0, 10);
}

function formatDate(value) {
  if (!value) {
    return "Not specified";
  }

  const parsedDate = new Date(
    `${String(value).slice(0, 10)}T00:00:00`
  );

  if (Number.isNaN(parsedDate.getTime())) {
    return String(value);
  }

  return parsedDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
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
      "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 18,
    marginBottom: 22,
  },

  card: {
    backgroundColor: "#1E293B",
    border: "1px solid #334155",
    borderRadius: 14,
    padding: 19,
    display: "flex",
    alignItems: "center",
    gap: 15,
    minHeight: 80,
    boxShadow:
      "0 8px 20px rgba(0, 0, 0, 0.12)",
  },

  cardIcon: {
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

  cardLabel: {
    color: "#94A3B8",
    fontSize: 13,
    margin: 0,
  },

  cardValue: {
    color: "#F8FAFC",
    fontSize: 25,
    margin: "7px 0 0",
  },

  workflowPanel: {
    backgroundColor: "#1E293B",
    border: "1px solid #334155",
    borderRadius: 14,
    padding: 18,
    marginBottom: 22,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
  },

  workflowStep: {
    display: "flex",
    alignItems: "center",
    gap: 11,
    flex: "1 1 190px",
  },

  workflowIcon: {
    width: 42,
    height: 42,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  workflowTitle: {
    color: "#F8FAFC",
    fontSize: 13,
  },

  workflowText: {
    color: "#94A3B8",
    fontSize: 11,
    margin: "4px 0 0",
    lineHeight: 1.4,
  },

  workflowArrow: {
    color: "#475569",
    fontSize: 18,
  },

  tableCard: {
    backgroundColor: "#1E293B",
    border: "1px solid #334155",
    borderRadius: 14,
    padding: 20,
    color: "#FFFFFF",
    boxShadow:
      "0 8px 20px rgba(0, 0, 0, 0.12)",
  },

  tableTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 18,
    flexWrap: "wrap",
    marginBottom: 18,
  },

  tableTitle: {
    margin: 0,
    color: "#F8FAFC",
    fontSize: 19,
  },

  tableSubtitle: {
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
    fontSize: 14,
  },

  searchInput: {
    boxSizing: "border-box",
    width: "100%",
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
    minWidth: 980,
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
    letterSpacing: "0.04em",
  },

  tableCell: {
    color: "#E2E8F0",
    fontSize: 13,
    padding: "15px 14px",
    borderBottom:
      "1px solid rgba(51, 65, 85, 0.65)",
    verticalAlign: "middle",
  },

  emptyCell: {
    textAlign: "center",
    color: "#94A3B8",
    padding: 40,
  },

  missionCell: {
    display: "flex",
    alignItems: "center",
    gap: 11,
  },

  missionIcon: {
    width: 36,
    height: 36,
    borderRadius: 9,
    backgroundColor:
      "rgba(37, 99, 235, 0.16)",
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

  satelliteCell: {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    color: "#CBD5E1",
  },

  dateCell: {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    color: "#CBD5E1",
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
    whiteSpace: "nowrap",
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: "50%",
  },

  approveButton: {
    border:
      "1px solid rgba(139, 92, 246, 0.38)",
    borderRadius: 8,
    padding: "7px 10px",
    backgroundColor:
      "rgba(139, 92, 246, 0.13)",
    color: "#C4B5FD",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    fontSize: 12,
    fontWeight: 600,
  },

  approvedIndicator: {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    color: "#A78BFA",
    fontSize: 12,
    fontWeight: 600,
  },

  notApplicable: {
    color: "#64748B",
  },

  actions: {
    display: "flex",
    alignItems: "center",
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
    fontSize: 13,
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
    fontSize: 13,
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
    backdropFilter: "blur(4px)",
  },

  modal: {
    width: "100%",
    maxWidth: 650,
    maxHeight: "90vh",
    overflowY: "auto",
    backgroundColor: "#1E293B",
    border: "1px solid #334155",
    borderRadius: 15,
    padding: 24,
    boxShadow:
      "0 25px 60px rgba(0, 0, 0, 0.45)",
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
  },

  modalError: {
    marginBottom: 18,
    padding: "11px 13px",
    borderRadius: 8,
    backgroundColor:
      "rgba(239, 68, 68, 0.12)",
    border:
      "1px solid rgba(239, 68, 68, 0.35)",
    color: "#FCA5A5",
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 13,
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
    fontSize: 14,
    outline: "none",
  },

  approvalNote: {
    marginTop: 18,
    padding: "11px 13px",
    borderRadius: 8,
    backgroundColor:
      "rgba(139, 92, 246, 0.1)",
    border:
      "1px solid rgba(139, 92, 246, 0.26)",
    color: "#C4B5FD",
    display: "flex",
    alignItems: "center",
    gap: 9,
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

export default Missions;