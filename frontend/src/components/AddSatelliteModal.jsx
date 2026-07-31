import { useEffect, useState } from "react";

function AddSatelliteModal({
  isOpen,
  onClose,
  onSave,
  formData,
  setFormData,
  editingId,
}) {
  useEffect(() => {
    if (!isOpen) return;

    if (!editingId) {
      setFormData({
        name: "",
        orbit: "LEO",
        mission: "",
        health: 100,
        status: "Active",
      });
    }
  }, [isOpen, editingId, setFormData]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]:
        e.target.name === "health"
          ? Number(e.target.value)
          : e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave();
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2 style={styles.title}>
          {editingId ? "Edit Satellite" : "Add Satellite"}
        </h2>

        <form onSubmit={handleSubmit}>
          <label>Satellite Name</label>
          <input
            style={styles.input}
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <label>Orbit</label>

          <select
            style={styles.input}
            name="orbit"
            value={formData.orbit}
            onChange={handleChange}
          >
            <option value="LEO">LEO</option>
            <option value="MEO">MEO</option>
            <option value="GEO">GEO</option>
          </select>

          <label>Mission</label>

          <input
            style={styles.input}
            name="mission"
            value={formData.mission}
            onChange={handleChange}
            required
          />

          <label>Health (%)</label>

          <input
            style={styles.input}
            type="number"
            min="0"
            max="100"
            name="health"
            value={formData.health}
            onChange={handleChange}
          />

          <label>Status</label>

          <select
            style={styles.input}
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="Active">Active</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Inactive">Inactive</option>
          </select>

          <div style={styles.buttons}>
            <button
              type="button"
              style={styles.cancel}
              onClick={onClose}
            >
              Cancel
            </button>

            <button type="submit" style={styles.save}>
              {editingId ? "Update Satellite" : "Save Satellite"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.65)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },

  modal: {
    width: 470,
    background: "#1E293B",
    borderRadius: 12,
    padding: 30,
    color: "#fff",
  },

  title: {
    marginTop: 0,
    marginBottom: 25,
  },

  input: {
    width: "100%",
    padding: 12,
    marginTop: 6,
    marginBottom: 18,
    borderRadius: 8,
    border: "1px solid #334155",
    background: "#0F172A",
    color: "#fff",
    boxSizing: "border-box",
  },

  buttons: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 25,
  },

  cancel: {
    padding: "10px 18px",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
  },

  save: {
    padding: "10px 18px",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    background: "#2563EB",
    color: "#fff",
  },
};

export default AddSatelliteModal;