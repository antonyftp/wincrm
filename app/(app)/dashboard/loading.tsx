export default function Loading() {
  return (
    <>
      <header className="topbar">
        <div>
          <div className="sk sk-line-sm" style={{ width: 80, marginBottom: 6 }} />
          <div className="sk sk-line-lg" style={{ width: 160 }} />
        </div>
      </header>
      <div className="content">
        <div className="stats-grid" style={{ marginBottom: 16 }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="stat">
              <div className="sk sk-line-sm" style={{ width: 100 }} />
              <div className="sk sk-line-lg" style={{ width: 60, marginTop: 8 }} />
            </div>
          ))}
        </div>
        <div className="dashboard-grid">
          <div className="card" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="sk sk-line" style={{ width: 140 }} />
            <div className="sk sk-box" style={{ height: 200 }} />
          </div>
          <div className="card" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="sk sk-line" style={{ width: 120 }} />
            {[...Array(5)].map((_, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <div className="sk sk-circle" style={{ width: 28, height: 28, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div className="sk sk-line-sm" style={{ width: "70%", marginBottom: 4 }} />
                  <div className="sk sk-line-sm" style={{ width: "40%" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
