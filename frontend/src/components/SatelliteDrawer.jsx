import { useState, useEffect } from "react";
import "../styles/satellites.css";

function SatelliteDrawer({ open, onClose, onSave }) {
  const [form, setForm] = useState({
    name: "",
    orbit: "LEO",
    mission: "",
    health: 100,
    status: "Active",
  });

  useEffect(() => {
    if (!open) {
      setForm({
        name: "",
        orbit: "LEO",
        mission: "",
        health: 100,
        status: "Active",
      });
    }
  }, [open]);

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]:
        e.target.name === "health"
          ? Number(e.target.value)
          : e.target.value,
    });
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (!form.name.trim()) {
      alert("Satellite name is required.");
      return;
    }

    if (!form.mission.trim()) {
      alert("Mission is required.");
      return;
    }

    onSave(form);
  }

  if (!open) return null;

  return (
    <div className="drawer-overlay">
      <div className="drawer">

        <h2>Add New Satellite</h2>

        <form onSubmit={handleSubmit}>

          <label>Satellite Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
          />

          <label>Orbit</label>

          <select
            name="orbit"
            value={form.orbit}
            onChange={handleChange}
          >
            <option value="LEO">LEO</option>
            <option value="MEO">MEO</option>
            <option value="GEO">GEO</option>
          </select>

          <label>Mission</label>

          <input
            name="mission"
            value={form.mission}
            onChange={handleChange}
          />

          <label>Health (%)</label>

          <input
            type="number"
            name="health"
            min="0"
            max="100"
            value={form.health}
            onChange={handleChange}
          />

          <label>Status</label>

          <select
            name="status"
            value={form.status}
            onChange={handleChange}
          >
            <option value="Active">Active</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Inactive">Inactive</option>
          </select>

          <div className="drawer-buttons">

            <button
              type="button"
              className="cancel-btn"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="save-btn"
            >
              Save Satellite
            </button>

          </div>

        </form>

      </div>
    </div>
  );
}

export default SatelliteDrawer;