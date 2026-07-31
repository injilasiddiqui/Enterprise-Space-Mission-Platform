import { useEffect, useState } from "react";
import {
  FaPlus,
  FaSearch,
  FaEdit,
  FaTrash,
  FaSatellite,
} from "react-icons/fa";

import {
  getSatellites,
  createSatellite,
  updateSatellite,
  deleteSatellite,
  getFleetPerformance,
} from "../services/api";

function Satellites() {
const [satellites, setSatellites] = useState([]);
const [fleet, setFleet] = useState({
  total_satellites: 0,
  active: 0,
  maintenance: 0,
  critical: 0,
});
const [search, setSearch] = useState("");

const [formData, setFormData] = useState({
  name: "",
  orbit: "",
  mission: "",
  health: 100,
  status: "Active",
});

const [showModal, setShowModal] = useState(false);
const [editingId, setEditingId] = useState(null);

const loadSatellites = async () => {
  try {
    const satelliteData = await getSatellites();
    setSatellites(satelliteData);

    const fleetData = await getFleetPerformance();
    setFleet(fleetData);

  } catch (error) {
    console.error(error);
  }
};

useEffect(() => {
  loadSatellites();
}, []);

const handleChange = (e) => {
  setFormData({
    ...formData,
    [e.target.name]: e.target.value,
  });
};

const handleSave = async () => {
  try {
    const updatedFormData = {
      ...formData,
      status:
        Number(formData.health) >= 80
          ? "Active"
          : Number(formData.health) >= 50
          ? "Maintenance"
          : "Critical",
    };

    if (editingId) {
      const { id, ...satelliteData } = updatedFormData;
      await updateSatellite(editingId, satelliteData);
    } else {
      await createSatellite(updatedFormData);
    }

    await loadSatellites();

    setShowModal(false);
    setEditingId(null);

    setFormData({
      name: "",
      orbit: "",
      mission: "",
      health: 100,
      status: "Active",
    });
  } catch (error) {
    console.error(error);
  }
};
 const handleEdit = (sat) => {
  setEditingId(sat.id);
  setFormData(sat);
  setShowModal(true);
};


const handleDelete = async (id) => {
  if (!window.confirm("Delete this satellite?")) return;

  try {
    await deleteSatellite(id);
    await loadSatellites();
  } catch (error) {
    console.error(error);
  }
};

  return (
    <>
      <div style={styles.header}>
        <div>
          <h2 style={styles.heading}>Satellite Fleet Management</h2>
          <p style={styles.subheading}>
            Manage and monitor the complete satellite constellation.
          </p>
        </div>
<button
  style={styles.button}
  onClick={() => {
    setEditingId(null);

    setFormData({
      name: "",
      orbit: "",
      mission: "",
      health: 100,
      status: "Active",
    });

    setShowModal(true);
  }}
>
  <FaPlus />
  Add Satellite
</button>
      </div>
  
<div style={styles.kpiContainer}>

  <div style={styles.kpiCard}>
    <h3>Total Fleet</h3>
    <h1>{fleet.fleet_size}</h1> 
  </div>

  <div style={styles.kpiCard}>
    <h3>🟢 Active</h3>
    <h1>{fleet.active_satellites}</h1>
  </div>

  <div style={styles.kpiCard}>
    <h3>🟡 Maintenance</h3>
    <h1>{fleet.maintenance_satellites}</h1>
  </div>

  <div style={styles.kpiCard}>
    <h3>🔴 Critical</h3>
    <h1>{fleet.critical_satellites}</h1>
  </div>

</div>



      <div style={styles.searchBar}>
        <FaSearch color="#94A3B8" />

      <input
  type="text"
  placeholder="Search satellite..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  style={styles.input}
/>
      </div>

      <div style={styles.tableCard}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Satellite</th>
              <th>Orbit</th>
              <th>Mission</th>
              <th>Health</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
          {satellites
  .filter((sat) =>
    sat.name.toLowerCase().includes(search.toLowerCase())
  )
  .map((sat) => (
              <tr key={sat.id}>
                <td>{sat.id}</td>

                <td>
                  <div style={styles.nameCell}>
                    <FaSatellite color="#3B82F6" />
                    {sat.name}
                  </div>
                </td>

                <td>{sat.orbit}</td>

                <td>{sat.mission}</td>

                <td>
                  <div style={styles.progress}>
                    <div
                      style={{
                        ...styles.progressFill,
                        width: `${sat.health}%`,
                      }}
                    />
                  </div>

                  <span>{sat.health}%</span>
                </td>

                <td>
                  <span
                    style={{
                      ...styles.badge,
                      background:
                        sat.status === "Active"
                          ? "#16A34A"
                          : "#F59E0B",
                    }}
                  >
                    {sat.status}
                  </span>
                </td>

                <td>
                  <div style={styles.actions}>
                  <FaEdit
  onClick={() => handleEdit(sat)}
  style={{
    cursor: "pointer",
    color: "#3B82F6",
  }}
/>
<FaTrash
  onClick={() => handleDelete(sat.id)}
  style={{
    cursor: "pointer",
    color: "#EF4444",
  }}
/>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
            </div>

      {showModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h2>{editingId ? "Edit Satellite" : "Add Satellite"}</h2>

            <input
              name="name"
              placeholder="Satellite Name"
              value={formData.name}
              onChange={handleChange}
              style={styles.modalInput}
            />

            <input
              name="orbit"
              placeholder="Orbit"
              value={formData.orbit}
              onChange={handleChange}
              style={styles.modalInput}
            />

            <input
              name="mission"
              placeholder="Mission"
              value={formData.mission}
              onChange={handleChange}
              style={styles.modalInput}
            />

            <input
              type="number"
              name="health"
              placeholder="Health"
              value={formData.health}
              onChange={handleChange}
              style={styles.modalInput}
            />

            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              style={styles.modalInput}
            >
              <option>Active</option>
              <option>Maintenance</option>
              <option>Critical</option>
            </select>

            <div style={styles.modalButtons}>
              <button
                style={styles.cancelButton}
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>

              <button
                style={styles.saveButton}
                onClick={handleSave}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
}


const styles = {
  heading: {
    color: "white",
    margin: 0,
  },

  subheading: {
    color: "#94A3B8",
    marginTop: 6,
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },

  button: {
    background: "#2563EB",
    color: "white",
    border: "none",
    padding: "12px 18px",
    borderRadius: 8,
    cursor: "pointer",
    display: "flex",
    gap: 8,
    alignItems: "center",
    fontWeight: "600",
  },

  searchBar: {
    background: "#1E293B",
    borderRadius: 10,
    padding: "12px 18px",
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 25,
  },

  input: {
    flex: 1,
    background: "transparent",
    border: "none",
    outline: "none",
    color: "white",
    fontSize: 15,
  },

  tableCard: {
    background: "#1E293B",
    borderRadius: 12,
    padding: 20,
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    color: "white",
  },

  nameCell: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },

  progress: {
    width: 90,
    height: 8,
    background: "#334155",
    borderRadius: 10,
    marginBottom: 5,
  },

  progressFill: {
    height: "100%",
    background: "#22C55E",
    borderRadius: 10,
  },

  badge: {
    padding: "6px 12px",
    borderRadius: 20,
    color: "white",
    fontSize: 13,
  },

  actions: {
    display: "flex",
    gap: 12,
    fontSize: 16,
  },

kpiContainer: {
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)",
  gap: "20px",
  marginBottom: "25px",
},

kpiCard: {
  background: "#1E293B",
  borderRadius: "12px",
  padding: "20px",
  color: "white",
  textAlign: "center",
},

overlay: {

    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },


  modal: {
    background: "#1E293B",
    padding: "30px",
    borderRadius: "12px",
    width: "450px",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    color: "white",
    boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
  },
  modalInput: {
  background: "#0F172A",
  border: "1px solid #475569",
  borderRadius: "8px",
  color: "white",
  padding: "12px",
},

modalButtons: {
  display: "flex",
  justifyContent: "flex-end",
  gap: "10px",
  marginTop: "20px",
},

cancelButton: {
  background: "#64748B",
  color: "white",
  border: "none",
  padding: "10px 18px",
  borderRadius: "8px",
  cursor: "pointer",
},

saveButton: {
  background: "#2563EB",
  color: "white",
  border: "none",
  padding: "10px 18px",
  borderRadius: "8px",
  cursor: "pointer",
},

  modalInput: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #475569",
    background: "#0F172A",
    color: "white",
    fontSize: "15px",
    outline: "none",
  },

  modalButtons: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "10px",
  },

  cancelButton: {
    padding: "10px 18px",
    border: "none",
    borderRadius: "8px",
    background: "#64748B",
    color: "white",
    cursor: "pointer",
    fontWeight: "600",
  },

  saveButton: {
    padding: "10px 18px",
    border: "none",
    borderRadius: "8px",
    background: "#2563EB",
    color: "white",
    cursor: "pointer",
    fontWeight: "600",
  },
};

export default Satellites;