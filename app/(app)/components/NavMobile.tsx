"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { logout } from "@/app/actions/auth";

type Props = {
  isAdmin: boolean;
};

export default function NavMobile({ isAdmin }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  return (
    <>
      {/* Bouton hamburger — visible uniquement sur mobile */}
      <button
        type="button"
        aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
        aria-expanded={open}
        aria-controls="mobile-nav"
        onClick={() => setOpen((v) => !v)}
        className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
      >
        {open ? (
          /* Icone X */
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          /* Icone hamburger */
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Menu drawer mobile */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            aria-hidden="true"
            onClick={() => setOpen(false)}
          />
          <div className="md:hidden absolute top-14 left-0 right-0 bg-white border-b border-slate-200 shadow-sm z-50">
          <nav id="mobile-nav" className="flex flex-col px-4 py-3 gap-1">
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="px-3 py-2.5 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Tableau de bord
            </Link>
            <Link
              href="/leads"
              onClick={() => setOpen(false)}
              className="px-3 py-2.5 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Leads
            </Link>
            <Link
              href="/pipeline"
              onClick={() => setOpen(false)}
              className="px-3 py-2.5 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Pipeline
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="px-3 py-2.5 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Administration
              </Link>
            )}
            <div className="border-t border-slate-100 mt-1 pt-1">
              <form action={logout}>
                <button
                  type="submit"
                  className="w-full text-left px-3 py-2.5 text-sm font-medium text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Déconnexion
                </button>
              </form>
            </div>
          </nav>
          </div>
        </>
      )}
    </>
  );
}
