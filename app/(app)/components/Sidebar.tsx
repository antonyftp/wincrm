"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "@/app/components/Icon";
import { logout } from "@/app/actions/auth";

type Props = {
  userName: string;
  userEmail: string;
  userInitials: string;
  isAdmin: boolean;
};

const NAV_ITEMS = [
  { href: "/dashboard", icon: "home", label: "Tableau de bord" },
  { href: "/leads", icon: "users", label: "Leads" },
  { href: "/pipeline", icon: "columns", label: "Pipeline" },
];

const ADMIN_ITEMS = [
  { href: "/admin", icon: "user", label: "Utilisateurs" },
];

export default function Sidebar({ userName, userEmail, userInitials, isAdmin }: Props) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    if (href === "/leads") return pathname.startsWith("/leads");
    return pathname.startsWith(href);
  }

  return (
    <aside className="sidebar">
      <div className="sb-brand">
        <div className="logo">W</div>
        <div className="name">
          WIN CRM
          <small>Immobilier</small>
        </div>
      </div>

      <nav className="sb-nav">
        <div className="sb-section">Principal</div>
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`sb-link${isActive(item.href) ? " active" : ""}`}
          >
            <span className="ico">
              <Icon name={item.icon} size={17} />
            </span>
            <span>{item.label}</span>
          </Link>
        ))}

        {isAdmin && (
          <>
            <div className="sb-section">Administration</div>
            {ADMIN_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`sb-link${isActive(item.href) ? " active" : ""}`}
              >
                <span className="ico">
                  <Icon name={item.icon} size={17} />
                </span>
                <span>{item.label}</span>
              </Link>
            ))}
          </>
        )}
      </nav>

      <div className="sb-foot">
        <div className="avatar" style={{ background: "var(--accent)" }}>
          {userInitials}
        </div>
        <div className="who">
          <div className="nm">{userName}</div>
          <div className="em">{userEmail}</div>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="icon-btn"
            style={{ width: 28, height: 28 }}
            title="Déconnexion"
            aria-label="Déconnexion"
          >
            <Icon name="logout" size={14} />
          </button>
        </form>
      </div>
    </aside>
  );
}
