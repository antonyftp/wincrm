export default function Loading() {
  return (
    <>
      <header className="topbar">
        <div>
          <div className="sk sk-line-sm" style={{ width: 60, marginBottom: 6 }} />
          <div className="sk sk-line-lg" style={{ width: 120 }} />
        </div>
        <div className="right" style={{ gap: 8 }}>
          <div className="sk" style={{ width: 80, height: 30 }} />
          <div className="sk" style={{ width: 110, height: 30 }} />
        </div>
      </header>
      <div className="content">
        <div className="card" style={{ marginBottom: 16, padding: "14px 18px" }}>
          <div className="sk" style={{ height: 36, width: "100%", maxWidth: 300 }} />
        </div>
        <div className="card">
          <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--border)", background: "var(--surface-2)", display: "flex", gap: 32 }}>
            {["Contact", "État", "Étape", "Commercial", "Date"].map((_, i) => (
              <div key={i} className="sk sk-line-sm" style={{ width: 80 }} />
            ))}
          </div>
          {[...Array(8)].map((_, i) => (
            <div key={i} style={{ display: "flex", gap: 32, padding: "14px 14px", borderBottom: "1px solid var(--border)", alignItems: "center" }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center", flex: 1 }}>
                <div className="sk sk-circle" style={{ width: 28, height: 28 }} />
                <div className="sk sk-line" style={{ width: 120 }} />
              </div>
              <div className="sk sk-line-sm" style={{ width: 70 }} />
              <div className="sk sk-line-sm" style={{ width: 90 }} />
              <div className="sk sk-line-sm" style={{ width: 80 }} />
              <div className="sk sk-line-sm" style={{ width: 60 }} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
