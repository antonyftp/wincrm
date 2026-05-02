"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = {
  isAdmin: boolean;
};

export default function BottomNav({ isAdmin }: Props) {
  const pathname = usePathname();

  function isActive(href: string): boolean {
    if (href === "/dashboard") return pathname === "/dashboard";
    if (href === "/pipeline") return pathname.startsWith("/pipeline");
    if (href === "/leads") return pathname.startsWith("/leads") && !pathname.startsWith("/pipeline");
    if (href === "/admin") return pathname.startsWith("/admin");
    return false;
  }

  return (
    <nav className="mobile-nav">
      <Link href="/dashboard" className={`mobile-nav-item${isActive("/dashboard") ? " active" : ""}`}>
        <svg
          width={22}
          height={22}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1V9.5Z" />
        </svg>
        <span>Accueil</span>
      </Link>

      <Link href="/leads" className={`mobile-nav-item${isActive("/leads") ? " active" : ""}`}>
        <svg
          width={22}
          height={22}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <circle cx="9" cy="8" r="4" />
          <path d="M2 21a7 7 0 0 1 14 0" />
          <path d="M16 4a4 4 0 0 1 0 8" />
          <path d="M22 21a7 7 0 0 0-5-6.7" />
        </svg>
        <span>Leads</span>
      </Link>

      <Link href="/pipeline" className={`mobile-nav-item${isActive("/pipeline") ? " active" : ""}`}>
        <svg
          width={22}
          height={22}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M9 3v18M15 3v18" />
        </svg>
        <span>Pipeline</span>
      </Link>

      {isAdmin && (
        <Link href="/admin" className={`mobile-nav-item${isActive("/admin") ? " active" : ""}`}>
          <svg
            width={22}
            height={22}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21a8 8 0 0 1 16 0" />
          </svg>
          <span>Utilisateurs</span>
        </Link>
      )}
    </nav>
  );
}
