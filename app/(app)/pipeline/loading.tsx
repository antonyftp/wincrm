export default function Loading() {
  return (
    <>
      <header className="topbar">
        <div>
          <div className="sk sk-line-sm" style={{ width: 70, marginBottom: 6 }} />
          <div className="sk sk-line-lg" style={{ width: 130 }} />
        </div>
      </header>
      <div className="content">
        <div className="kanban">
          {[...Array(5)].map((_, col) => (
            <div key={col} className="kcol">
              <div className="kcol-h">
                <div className="sk sk-line-sm" style={{ width: 100 }} />
                <div className="sk sk-circle" style={{ width: 28, height: 20 }} />
              </div>
              <div className="kcol-body">
                {[...Array(col % 2 === 0 ? 3 : 2)].map((_, card) => (
                  <div key={card} className="kcard" style={{ display: "flex", flexDirection: "column", gap: 8, cursor: "default" }}>
                    <div className="sk sk-line" style={{ width: "80%" }} />
                    <div className="sk sk-line-sm" style={{ width: "60%" }} />
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                      <div className="sk sk-circle" style={{ width: 60, height: 20 }} />
                      <div className="sk sk-line-sm" style={{ width: 50 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
