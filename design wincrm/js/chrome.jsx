// Shared chrome: sidebar, topbar, components
const { useState, useEffect } = React;

window.WIN = window.WIN || {};

function Icon({ name, size = 18 }) {
  return <span className="ico" dangerouslySetInnerHTML={{ __html: WIN.icon(name, size) }} />;
}

function Avatar({ id, name, color, size = "" }) {
  const initials = name ? name.split(" ").map(n => n[0]).slice(0, 2).join("") : id;
  return <span className={`avatar ${size}`} style={{ background: color || "var(--accent)" }}>{initials}</span>;
}

function Badge({ tone = "", children, dot = false }) {
  return <span className={`badge ${tone}`}>{dot && <span className="dot"></span>}{children}</span>;
}

function Sidebar({ active }) {
  const items = [
    { k: "DASHBOARD", l: "Tableau de bord", icon: "home", href: "dashboard.html" },
    { k: "LEADS", l: "Leads", icon: "users", href: "leads.html", count: WIN.LEADS.length },
    { k: "PIPELINE", l: "Pipeline", icon: "columns", href: "pipeline.html" },
    { k: "CALENDAR", l: "Calendrier", icon: "cal", href: "#" },
  ];
  const adminItems = [
    { k: "ADMIN", l: "Utilisateurs", icon: "user", href: "admin.html", count: 3 },
    { k: "SETTINGS", l: "Paramètres", icon: "cog", href: "#" },
  ];
  return (
    <aside className="sidebar">
      <div className="sb-brand">
        <div className="logo">W</div>
        <div className="name">WIN CRM<small>Immobilier</small></div>
      </div>
      <div className="sb-search">
        <input className="input input-search" placeholder="Rechercher..." />
      </div>
      <nav className="sb-nav">
        <div className="sb-section">Principal</div>
        {items.map((it) => (
          <a key={it.k} href={it.href} className={`sb-link ${active === it.k ? "active" : ""}`}>
            <Icon name={it.icon} size={17} />
            <span>{it.l}</span>
            {it.count != null && <span className="badge-n">{it.count}</span>}
          </a>
        ))}
        <div className="sb-section">Administration</div>
        {adminItems.map((it) => (
          <a key={it.k} href={it.href} className={`sb-link ${active === it.k ? "active" : ""}`}>
            <Icon name={it.icon} size={17} />
            <span>{it.l}</span>
            {it.count != null && <span className="badge-n">{it.count}</span>}
          </a>
        ))}
      </nav>
      <div className="sb-foot">
        <Avatar id="AF" name="Antony Fantapie" color="#10b981" />
        <div className="who">
          <div className="nm">Antony Fantapie</div>
          <div className="em">antony.f@wincrm.fr</div>
        </div>
        <button className="icon-btn" style={{ width: 28, height: 28 }} title="Déconnexion" onClick={() => location.href = "login.html"}>
          <Icon name="logout" size={14} />
        </button>
      </div>
    </aside>
  );
}

function Topbar({ title, crumbs, actions }) {
  const [theme, setTheme] = useState(document.documentElement.getAttribute("data-theme") || "light");
  const flip = () => { WIN.toggleTheme(); setTheme(document.documentElement.getAttribute("data-theme")); };
  return (
    <header className="topbar">
      <div>
        {crumbs && <div className="crumbs">{crumbs}</div>}
        <h1>{title}</h1>
      </div>
      <div className="right">
        {actions}
        <button className="icon-btn" onClick={flip} title="Thème">
          <Icon name={theme === "dark" ? "sun" : "moon"} size={16} />
        </button>
        <button className="icon-btn" title="Notifications">
          <Icon name="bell" size={16} />
        </button>
      </div>
    </header>
  );
}

function Stage({ stage }) {
  return (
    <span className="badge" style={{
      background: `color-mix(in oklab, ${stage.color} 12%, transparent)`,
      color: stage.color,
    }}>
      <span className="dot" style={{ background: stage.color }}></span>
      {stage.label}
    </span>
  );
}

Object.assign(window, { Icon, Avatar, Badge, Sidebar, Topbar, Stage });
