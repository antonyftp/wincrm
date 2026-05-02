export default function Loading() {
  return (
    <>
      <header className="topbar">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div className="sk sk-circle" style={{ width: 36, height: 36 }} />
          <div>
            <div className="sk sk-line-sm" style={{ width: 80, marginBottom: 6 }} />
            <div className="sk sk-line-lg" style={{ width: 180 }} />
          </div>
        </div>
      </header>
      <div className="content">
        <div className="lead-detail-grid">
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card">
                <div className="card-h">
                  <div className="sk sk-line" style={{ width: 120 }} />
                </div>
                <div className="card-b" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {[...Array(4)].map((_, j) => (
                    <div key={j} style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: 12, padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                      <div className="sk sk-line-sm" style={{ width: 90 }} />
                      <div className="sk sk-line-sm" style={{ width: "70%" }} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="card">
              <div className="card-h"><div className="sk sk-line" style={{ width: 100 }} /></div>
              <div className="card-b" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="sk sk-box" style={{ height: 60 }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
