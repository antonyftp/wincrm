"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { CalendarAction } from "@/app/actions/calendar";

const MOIS_NOMS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

const JOURS_COURTS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

const MAX_ACTIONS_PER_DAY = 3;

function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const TYPE_CONFIG: Record<CalendarAction["type"], { label: string; bg: string; color: string }> = {
  appel:   { label: "Appel",   bg: "var(--info-soft)",   color: "var(--info)" },
  email:   { label: "Email",   bg: "var(--accent-soft)", color: "var(--accent)" },
  rdv:     { label: "RDV",     bg: "var(--warn-soft)",   color: "var(--warn)" },
  visite:  { label: "Visite",  bg: "var(--pos-soft)",    color: "var(--pos)" },
  relance: { label: "Relance", bg: "var(--neg-soft)",    color: "var(--neg)" },
};

type Props = {
  actions: CalendarAction[];
  annee: number;
  mois: number;
  isAdmin: boolean;
  tousLesCommerciaux: boolean;
  error?: string;
};

export default function CalendrierView({ actions, annee, mois, isAdmin, tousLesCommerciaux, error }: Props) {
  const router = useRouter();

  const firstDay = new Date(annee, mois - 1, 1);
  const daysInMonth = new Date(annee, mois, 0).getDate();
  // French week starts Monday: Sun(0)→6, Mon(1)→0, …
  const firstDayOfWeek = (firstDay.getDay() + 6) % 7;
  const totalCells = Math.ceil((firstDayOfWeek + daysInMonth) / 7) * 7;

  const actionsByDay = new Map<string, CalendarAction[]>();
  for (const action of actions) {
    const key = toDateKey(new Date(action.date));
    if (!actionsByDay.has(key)) actionsByDay.set(key, []);
    actionsByDay.get(key)!.push(action);
  }

  const now = new Date();
  const todayKey = toDateKey(now);

  function buildUrl(a: number, m: number) {
    const p = new URLSearchParams();
    p.set("annee", String(a));
    p.set("mois", String(m));
    if (tousLesCommerciaux) p.set("tous", "1");
    return `/calendrier?${p.toString()}`;
  }

  function navigate(dir: "prev" | "next") {
    let m = mois + (dir === "prev" ? -1 : 1);
    let a = annee;
    if (m < 1) { m = 12; a--; }
    if (m > 12) { m = 1; a++; }
    router.push(buildUrl(a, m));
  }

  function goToday() {
    router.push(buildUrl(now.getFullYear(), now.getMonth() + 1));
  }

  function toggleTous(checked: boolean) {
    const p = new URLSearchParams();
    p.set("annee", String(annee));
    p.set("mois", String(mois));
    if (checked) p.set("tous", "1");
    router.push(`/calendrier?${p.toString()}`);
  }

  const isCurrentMonth = now.getFullYear() === annee && now.getMonth() + 1 === mois;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Controls */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button className="btn btn-sm" onClick={() => navigate("prev")} aria-label="Mois précédent">
            ‹
          </button>
          <span style={{ fontWeight: 700, fontSize: 17, minWidth: 190, textAlign: "center", letterSpacing: "-0.01em" }}>
            {MOIS_NOMS[mois - 1]} {annee}
          </span>
          <button className="btn btn-sm" onClick={() => navigate("next")} aria-label="Mois suivant">
            ›
          </button>
        </div>

        {!isCurrentMonth && (
          <button className="btn btn-sm" onClick={goToday}>
            Aujourd'hui
          </button>
        )}

        {isAdmin && (
          <label
            style={{
              display: "flex", alignItems: "center", gap: 7,
              cursor: "pointer", fontSize: 13, fontWeight: 500,
              marginLeft: "auto",
            }}
          >
            <input
              type="checkbox"
              checked={tousLesCommerciaux}
              onChange={(e) => toggleTous(e.target.checked)}
              style={{ width: 15, height: 15, accentColor: "var(--accent)", cursor: "pointer" }}
            />
            Voir tous les commerciaux
          </label>
        )}
      </div>

      {error && (
        <div style={{ padding: "10px 14px", background: "var(--neg-soft)", color: "var(--neg)", borderRadius: "var(--r)", fontSize: 13 }}>
          {error}
        </div>
      )}

      {/* Legend */}
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        {(Object.entries(TYPE_CONFIG) as [CalendarAction["type"], typeof TYPE_CONFIG[CalendarAction["type"]]][]).map(([type, cfg]) => (
          <span key={type} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--text-muted)" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: cfg.color, flexShrink: 0 }} />
            {cfg.label}
          </span>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ overflowX: "auto" }}>
        <div style={{ minWidth: 560 }}>
          <div className="card" style={{ overflow: "hidden" }}>
            {/* Day name headers */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(7, 1fr)",
                borderBottom: "1px solid var(--border)",
                background: "var(--surface-2)",
              }}
            >
              {JOURS_COURTS.map((j) => (
                <div
                  key={j}
                  style={{
                    padding: "8px 6px",
                    textAlign: "center",
                    fontSize: 11,
                    fontWeight: 600,
                    color: "var(--text-soft)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {j}
                </div>
              ))}
            </div>

            {/* Day cells */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
              {Array.from({ length: totalCells }).map((_, i) => {
                const dayOffset = i - firstDayOfWeek;
                // JavaScript Date handles day 0 (prev month) and day > daysInMonth (next month)
                const cellDate = new Date(annee, mois - 1, dayOffset + 1);
                const isCurrentMonthDay = dayOffset >= 0 && dayOffset < daysInMonth;
                const dayNum = cellDate.getDate();
                const cellKey = `${cellDate.getFullYear()}-${String(cellDate.getMonth() + 1).padStart(2, "0")}-${String(cellDate.getDate()).padStart(2, "0")}`;
                const isToday = isCurrentMonthDay && cellKey === todayKey;
                const dayActions = isCurrentMonthDay ? (actionsByDay.get(cellKey) ?? []) : [];
                const overflow = dayActions.length - MAX_ACTIONS_PER_DAY;
                const isLastRow = i >= totalCells - 7;
                const isLastCol = (i + 1) % 7 === 0;

                return (
                  <div
                    key={i}
                    style={{
                      minHeight: 92,
                      padding: 6,
                      borderRight: !isLastCol ? "1px solid var(--border)" : "none",
                      borderBottom: !isLastRow ? "1px solid var(--border)" : "none",
                      background: isToday ? "var(--accent-soft-2)" : "var(--surface)",
                    }}
                  >
                    {/* Day number */}
                    <div style={{ marginBottom: 3 }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 24, height: 24,
                          borderRadius: "50%",
                          background: isToday ? "var(--accent)" : "transparent",
                          color: isToday
                            ? "white"
                            : isCurrentMonthDay
                            ? "var(--text)"
                            : "var(--text-faint)",
                          fontSize: 12,
                          fontWeight: isToday ? 700 : 500,
                        }}
                      >
                        {dayNum}
                      </span>
                    </div>

                    {/* Action pills */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      {dayActions.slice(0, MAX_ACTIONS_PER_DAY).map((action) => {
                        const cfg = TYPE_CONFIG[action.type];
                        const leadName = `${action.lead.prenom} ${action.lead.nom}`.trim();
                        const commercial = action.lead.titulaire
                          ? `${action.lead.titulaire.prenom} ${action.lead.titulaire.nom}`.trim()
                          : null;
                        const actionTime = new Date(action.date).toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        });
                        const tooltip = [
                          `${cfg.label} — ${leadName}`,
                          `${actionTime}`,
                          tousLesCommerciaux && commercial ? `Commercial : ${commercial}` : null,
                        ].filter(Boolean).join("\n");

                        return (
                          <Link
                            key={action.id}
                            href={`/leads/${action.lead.id}`}
                            title={tooltip}
                            style={{
                              display: "block",
                              padding: "2px 5px",
                              borderRadius: 3,
                              background: cfg.bg,
                              color: cfg.color,
                              fontSize: 10.5,
                              fontWeight: 500,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              textDecoration: "none",
                              lineHeight: 1.7,
                            }}
                          >
                            {cfg.label} · {leadName}
                          </Link>
                        );
                      })}

                      {overflow > 0 && (
                        <span style={{ fontSize: 10, color: "var(--text-faint)", paddingLeft: 3, lineHeight: 1.6 }}>
                          +{overflow} autre{overflow > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {actions.length === 0 && !error && (
        <div className="empty">
          Aucune action planifiée pour {MOIS_NOMS[mois - 1].toLowerCase()} {annee}.
        </div>
      )}
    </div>
  );
}
