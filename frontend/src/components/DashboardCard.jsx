function DashboardCard({ title, value, icon, color }) {
  return (
    <div style={styles.card}>
      <div style={{ ...styles.iconBox, background: color }}>
        {icon}
      </div>

      <div>
        <p style={styles.title}>{title}</p>
        <h2 style={styles.value}>{value}</h2>
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: "#1E293B",
    borderRadius: "15px",
    padding: "22px",
    display: "flex",
    alignItems: "center",
    gap: "18px",
    minWidth: "250px",
    flex: 1,
    boxShadow: "0 8px 20px rgba(0,0,0,.25)",
  },

  iconBox: {
    width: "60px",
    height: "60px",
    borderRadius: "14px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "#fff",
    fontSize: "24px",
  },

  title: {
    color: "#94A3B8",
    margin: 0,
    fontSize: "14px",
  },

  value: {
    color: "#fff",
    margin: "8px 0 0",
    fontSize: "30px",
    fontWeight: "700",
  },
};

export default DashboardCard;