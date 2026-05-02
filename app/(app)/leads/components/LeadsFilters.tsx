"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ETAT_LABELS, ETAPE_LABELS, TYPE_LABELS } from "@/app/lib/labels";
import type { LeadEtat, LeadEtape, TypeLogement } from "@prisma/client";

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
] as const;

function sortKey(sortBy: string, sortDir: string): string {
  return `${sortBy}__${sortDir}`;
}

export default function LeadsFilters({ commercials }: Props) {
  const router = useRouter();
  const pathname = usePathname();
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
    router.push(`${pathname}?${params.toString()}`);
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
      router.push(`${pathname}?${params.toString()}`);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [q, router]);

  function handleSortChange(value: string) {
    const option = SORT_OPTIONS.find((o) => sortKey(o.sortBy, o.sortDir) === value);
    if (!option) return;
    pushParams({ sortBy: option.sortBy, sortDir: option.sortDir });
  }

  function handleReset() {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setQ("");
    router.push(pathname);
  }

  const hasActiveFilters =
    !!q || !!commercial || !!etat || !!etape || !!typeLogement || !!natureRecherche ||
    sortBy !== "dateSaisie" || sortDir !== "desc";

  return (
    <>
      <input
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Nom, prénom, tél, email…"
        className="input input-search"
        style={{ flex: 2, minWidth: 200 }}
      />

      <select
        value={commercial}
        onChange={(e) => pushParams({ commercial: e.target.value })}
        className="input"
        style={{ flex: 1, minWidth: 140 }}
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
        className="input"
        style={{ flex: 1, minWidth: 140 }}
      >
        <option value="">Tous les états</option>
        {(Object.entries(ETAT_LABELS) as [LeadEtat, string][]).map(([value, label]) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>

      <select
        value={etape}
        onChange={(e) => pushParams({ etape: e.target.value })}
        className="input"
        style={{ flex: 1, minWidth: 160 }}
      >
        <option value="">Toutes les étapes</option>
        {(Object.entries(ETAPE_LABELS) as [LeadEtape, string][]).map(([value, label]) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>

      <select
        value={typeLogement}
        onChange={(e) => pushParams({ typeLogement: e.target.value })}
        className="input"
        style={{ flex: 1, minWidth: 140 }}
      >
        <option value="">Tous types</option>
        {(Object.entries(TYPE_LABELS) as [TypeLogement, string][]).map(([value, label]) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>

      <select
        value={natureRecherche}
        onChange={(e) => pushParams({ natureRecherche: e.target.value })}
        className="input"
        style={{ flex: 1, minWidth: 120 }}
      >
        <option value="">Toutes natures</option>
        <option value="achat">Achat</option>
        <option value="location">Location</option>
        <option value="investissement">Investissement</option>
      </select>

      <select
        value={currentSortKey}
        onChange={(e) => handleSortChange(e.target.value)}
        className="input"
        style={{ flex: 1, minWidth: 160 }}
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
          className="btn btn-sm btn-ghost"
        >
          Réinitialiser
        </button>
      )}
    </>
  );
}
