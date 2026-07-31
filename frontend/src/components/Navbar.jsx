export default function Navbar() {
  return (
    <div style={styles.navbar}>
      <div>
        <h2 style={styles.title}>Mission Control Center</h2>
        <p style={styles.subtitle}>Enterprise Space Mission Operations Platform</p>
      </div>

      <div style={styles.user}>
        👩‍🚀 Admin
      </div>
    </div>
  );
}

const styles = {
  navbar: {
    height: "80px",
    backgroundColor: "#111827",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 30px",
    borderBottom: "1px solid #1f2937",
  },

  title: {
    margin: 0,
    color: "#ffffff",
  },

  subtitle: {
    margin: "5px 0 0 0",
    color: "#9ca3af",
    fontSize: "14px",
  },

  user: {
    backgroundColor: "#2563eb",
    padding: "10px 18px",
    borderRadius: "20px",
    color: "white",
    fontWeight: "bold",
  },
}