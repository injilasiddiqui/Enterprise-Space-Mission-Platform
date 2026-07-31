import {
  FaSatellite,
  FaEdit,
  FaTrash,
} from "react-icons/fa";

function SatelliteTable({
  satellites,
  onEdit,
  onDelete,
}) {
  return (
    <div className="table-card">
      <table>

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

          {satellites.length === 0 ? (
            <tr>
              <td
                colSpan="7"
                style={{
                  textAlign: "center",
                  padding: 40,
                  color: "#94A3B8",
                }}
              >
                No satellites found.
              </td>
            </tr>
          ) : (
            satellites.map((sat) => (
              <tr key={sat.id}>

                <td>{sat.id}</td>

                <td>
                  <div className="name-cell">
                    <FaSatellite color="#3B82F6" />
                    {sat.name}
                  </div>
                </td>

                <td>{sat.orbit}</td>

                <td>{sat.mission}</td>

                <td>

                  <div className="progress">

                    <div
                      className="progress-fill"
                      style={{
                        width: `${sat.health}%`,
                      }}
                    />

                  </div>

                  {sat.health}%

                </td>

                <td>

                  <span
                    className="badge"
                    style={{
                      background:
                        sat.status === "Active"
                          ? "#16A34A"
                          : sat.status === "Maintenance"
                          ? "#F59E0B"
                          : "#DC2626",
                    }}
                  >
                    {sat.status}
                  </span>

                </td>

                <td>

                  <div className="actions">

                    <FaEdit
                      color="#3B82F6"
                      onClick={() => onEdit(sat)}
                    />

                    <FaTrash
                      color="#EF4444"
                      onClick={() => onDelete(sat.id)}
                    />

                  </div>

                </td>

              </tr>
            ))
          )}

        </tbody>

      </table>
    </div>
  );
}

export default SatelliteTable;