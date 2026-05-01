"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ETAT_LABELS, ETAPE_LABELS } from "../lib/labels";
import type { LeadEtat, LeadEtape } from "@prisma/client";

type Props = {
  commercials: { id: string; nom: string; prenom: string }[];
};

const SORT_OPTIONS = [
  { label: "Date saisie (récent)", sortBy: "dateSaisie", sortDir: "desc" },
  { label: "Date saisie (ancien)", sortBy: "dateSaisie", sortDir: "asc" },
  { label: "Nom A→Z", sortBy: "nom", sortDir: "asc" },
  { label: "Nom Z→A", sortBy: "nom", sortDir: "desc" },
  { label: "État", sortBy: "etat", sortDir: "asc" },
  { label: "Étape", sortBy: "etape", sortDir: "asc" },
  { label: "Type logement", sortBy: "typeLogement", sortDir: "asc" },
] as const;

function sortKey(sortBy: string, sortDir: string): string {
  return `${sortBy}__${sortDir}`;
}

export default function LeadsFilters({ commercials }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const commercial = searchParams.get("commercial") ?? "";
  const etat = searchParams.get("etat") ?? "";
  const etape = searchParams.get("etape") ?? "";
  const typeLogement = searchParams.get("typeLogement") ?? "";
  const natureRecherche = searchParams.get("natureRecherche") ?? "";
  const sortBy = searchParams.get("sortBy") ?? "dateSaisie";
  const sortDir = searchParams.get("sortDir") ?? "desc";
  const view = searchParams.get("view") ?? "list";

  const currentSortKey = sortKey(sortBy, sortDir);

  function pushParams(overrides: Record<string, string>) {
    const params = new URLSearchParams(window.location.search);
    for (const [key, value] of Object.entries(overrides)) {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }
    router.push(`/leads?${params.toString()}`);
  }

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const capturedQ = q;
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      if (capturedQ) {
        params.set("q", capturedQ);
      } else {
        params.delete("q");
      }
      router.push(`/leads?${params.toString()}`);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [q]);

  function handleSortChange(value: string) {
    const option = SORT_OPTIONS.find((o) => sortKey(o.sortBy, o.sortDir) === value);
    if (!option) return;
    pushParams({ sortBy: option.sortBy, sortDir: option.sortDir });
  }

  function handleReset() {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setQ("");
    router.push(`/leads?view=${view}`);
  }

  const hasActiveFilters =
    !!q || !!commercial || !!etat || !!etape || !!typeLogement || !!natureRecherche ||
    sortBy !== "dateSaisie" || sortDir !== "desc";

  return (
    <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 mb-4">
      <div className="flex flex-wrap gap-3 items-center">
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Nom, prénom, tél, email…"
          className="flex-[2] min-w-48 px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-slate-50 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />

        <select
          value={commercial}
          onChange={(e) => pushParams({ commercial: e.target.value })}
          className="flex-1 min-w-36 px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tous les commerciaux</option>
          {commercials.map((c) => (
            <option key={c.id} value={c.id}>
              {c.prenom} {c.nom}
            </option>
          ))}
        </select>

        <select
          value={etat}
          onChange={(e) => pushParams({ etat: e.target.value })}
          className="flex-1 min-w-36 px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tous les états</option>
          {(Object.entries(ETAT_LABELS) as [LeadEtat, string][]).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>

        <select
          value={etape}
          onChange={(e) => pushParams({ etape: e.target.value })}
          className="flex-1 min-w-44 px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Toutes les étapes</option>
          {(Object.entries(ETAPE_LABELS) as [LeadEtape, string][]).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>

        <select
          value={typeLogement}
          onChange={(e) => pushParams({ typeLogement: e.target.value })}
          className="flex-1 min-w-32 px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tous types</option>
          <option value="appartement">Appartement</option>
          <option value="maison">Maison</option>
          <option value="studio">Studio</option>
          <option value="t2">T2</option>
          <option value="t3">T3</option>
          <option value="t4">T4</option>
          <option value="autre">Autre</option>
        </select>

        <select
          value={natureRecherche}
          onChange={(e) => pushParams({ natureRecherche: e.target.value })}
          className="flex-1 min-w-32 px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Toutes natures</option>
          <option value="achat">Achat</option>
          <option value="location">Location</option>
          <option value="investissement">Investissement</option>
        </select>

        <select
          value={currentSortKey}
          onChange={(e) => handleSortChange(e.target.value)}
          className="flex-1 min-w-44 px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={sortKey(o.sortBy, o.sortDir)} value={sortKey(o.sortBy, o.sortDir)}>
              {o.label}
            </option>
          ))}
        </select>

        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="px-3 py-1.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors whitespace-nowrap"
          >
            Réinitialiser
          </button>
        )}
      </div>
    </div>
  );
}
