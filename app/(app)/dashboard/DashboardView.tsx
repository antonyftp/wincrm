import type { DashboardData } from "@/app/actions/dashboard";
import { ETAPE_LABELS } from "@/app/lib/labels";
import { ETAPE_ORDER, ETAPE_COLORS } from "@/app/lib/etape-colors";
import Topbar from "../components/Topbar";
import Link from "next/link";

type Props = {
  data: DashboardData;
  userName: string;
};

export default function DashboardView({ data, userName }: Props) {
  const {
    totalLeads,
    nouveauxCeMois,
    relancesDuJour,
    leadsEnRetard,
    leadsParCommercial,
    leadsParEtape,
    tauxTransformation,
    bilanMensuel,
  } = data;

  const etapesTriees = ETAPE_ORDER.map((etape) => {
    const found = leadsParEtape.find((e) => e.etape === etape);
    return { etape, count: found?.count ?? 0 };
  }).filter((e) => e.count > 0);

  const maxEtape = Math.max(...etapesTriees.map((e) => e.count), 1);
  const maxCommercial = leadsParCommercial[0]?.count ?? 1;

  const totalGP = bilanMensuel.conclus + bilanMensuel.perdus;
  const pctGagnes = totalGP > 0 ? Math.round((bilanMensuel.conclus / totalGP) * 100) : 0;

  return (
    <>
      <Topbar
        title="Tableau de bord"
        crumbs="Vue d'ensemble de l'activité"
        actions={
          <Link href="/leads/nouveau" className="btn btn-primary btn-sm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Nouveau lead
          </Link>
        }
      />

      <div className="content">
        {/* KPI */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 16 }}>
          <div className="stat">
            <div className="row between">
              <span className="label">Total leads</span>
              <span style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(59,130,246,0.1)", color: "#3b82f6", display: "grid", placeItems: "center" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0"/><path d="M16 4a4 4 0 0 1 0 8"/><path d="M22 21a7 7 0 0 0-5-6.7"/>
                </svg>
              </span>
            </div>
            <div className="value">{totalLeads}</div>
            <div className="delta pos">dans le CRM</div>
          </div>

          <div className="stat">
            <div className="row between">
              <span className="label">Nouveaux ce mois</span>
              <span style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(16,185,129,0.1)", color: "#10b981", display: "grid", placeItems: "center" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M12 5v14M5 12h14"/>
                </svg>
              </span>
            </div>
            <div className="value">{nouveauxCeMois}</div>
            <div className="delta neutral">leads créés</div>
          </div>

          <div className="stat">
            <div className="row between">
              <span className="label">Relances du jour</span>
              <span style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(245,158,11,0.1)", color: "#f59e0b", display: "grid", placeItems: "center" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10 21a2 2 0 0 0 4 0"/>
                </svg>
              </span>
            </div>
            <div className="value">{relancesDuJour}</div>
            <div className={`delta ${leadsEnRetard > 0 ? "neg" : "neutral"}`}>{leadsEnRetard} en retard</div>
          </div>

          <div className="stat">
            <div className="row between">
              <span className="label">Taux de conversion</span>
              <span style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(139,92,246,0.1)", color: "#8b5cf6", display: "grid", placeItems: "center" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M3 3v18h18"/><path d="M7 14l4-4 4 4 5-6"/>
                </svg>
              </span>
            </div>
            <div className="value">{tauxTransformation.toFixed(1)} %</div>
            <div className="delta pos">leads convertis</div>
          </div>
        </div>

        {/* Pipeline par étape + commerciaux */}
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 16, marginBottom: 16 }}>
          <div className="card">
            <div className="card-h">
              <h3>Pipeline par étape</h3>
              <span className="meta">{totalLeads} leads</span>
            </div>
            <div className="card-b">
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {etapesTriees.map(({ etape, count }) => (
                  <div key={etape} style={{ display: "grid", gridTemplateColumns: "160px 1fr 40px", gap: 12, alignItems: "center", fontSize: 13 }}>
                    <span style={{ display: "flex", gap: 8, alignItems: "center", color: "var(--text-muted)" }}>
                      <span style={{ width: 8, height: 8, borderRadius: 999, background: ETAPE_COLORS[etape] ?? "var(--accent)", flexShrink: 0 }} />
                      {ETAPE_LABELS[etape] ?? etape}
                    </span>
                    <div className="bar">
                      <i style={{ width: `${(count / maxEtape) * 100}%`, background: ETAPE_COLORS[etape] ?? "var(--accent)" }} />
                    </div>
                    <span className="tnum bold" style={{ textAlign: "right" }}>{count}</span>
                  </div>
                ))}
                {etapesTriees.length === 0 && <p className="muted" style={{ fontSize: 13, margin: 0 }}>Aucune donnée</p>}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-h">
              <h3>Performance commerciaux</h3>
              <span className="meta">Ce mois</span>
            </div>
            <div className="card-b">
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {leadsParCommercial.map((c, i) => {
                  const initials = `${c.prenom[0] ?? ""}${c.nom[0] ?? ""}`.toUpperCase();
                  return (
                    <div key={c.titulaireId ?? "non-assigne"} style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 12, alignItems: "center" }}>
                      <span className="avatar" style={{ background: i === 0 ? "var(--accent)" : "var(--surface-3)", color: i === 0 ? "white" : "var(--text-muted)" }}>
                        {initials}
                      </span>
                      <div style={{ minWidth: 0 }}>
                        <div className="bold" style={{ fontSize: 13 }}>{c.prenom} {c.nom}</div>
                        <div className="bar" style={{ marginTop: 5 }}>
                          <i style={{ width: `${maxCommercial > 0 ? (c.count / maxCommercial) * 100 : 0}%` }} />
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div className="bold tnum">{c.count}</div>
                        <div className="muted" style={{ fontSize: 11 }}>leads</div>
                      </div>
                    </div>
                  );
                })}
                {leadsParCommercial.length === 0 && <p className="muted" style={{ fontSize: 13, margin: 0 }}>Aucune donnée</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Bilan mensuel */}
        <div className="card">
          <div className="card-h">
            <h3>Bilan du mois</h3>
            <span className="meta">Deals finalisés</span>
          </div>
          <div className="card-b">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <p className="h-eyebrow">Taux de transformation</p>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 4 }}>
                  <span style={{ fontSize: 36, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
                    {tauxTransformation.toFixed(1)}
                  </span>
                  <span style={{ fontSize: 18, fontWeight: 600, color: "var(--text-soft)", marginBottom: 2 }}>%</span>
                </div>
                <div className="bar"><i style={{ width: `${Math.min(tauxTransformation, 100)}%` }} /></div>
                <p className="muted" style={{ fontSize: 12, margin: 0 }}>Leads convertis en vente</p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <p className="h-eyebrow">Leads gagnés</p>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
                  <span style={{ fontSize: 36, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1, color: "var(--pos)", fontVariantNumeric: "tabular-nums" }}>
                    {bilanMensuel.conclus}
                  </span>
                  {totalGP > 0 && (
                    <span className="badge pos" style={{ marginBottom: 4 }}>+{pctGagnes}%</span>
                  )}
                </div>
                <div className="bar"><i style={{ width: totalGP > 0 ? `${pctGagnes}%` : "0%", background: "var(--pos)" }} /></div>
                <p className="muted" style={{ fontSize: 12, margin: 0 }}>Sur {totalGP} deal{totalGP > 1 ? "s" : ""} ce mois</p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <p className="h-eyebrow">Leads perdus</p>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
                  <span style={{ fontSize: 36, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1, color: "var(--neg)", fontVariantNumeric: "tabular-nums" }}>
                    {bilanMensuel.perdus}
                  </span>
                  {bilanMensuel.perdus > 0 && (
                    <span className="badge neg" style={{ marginBottom: 4 }}>{100 - pctGagnes}%</span>
                  )}
                </div>
                <div className="bar"><i style={{ width: totalGP > 0 ? `${100 - pctGagnes}%` : "0%", background: "var(--neg)" }} /></div>
                <p className="muted" style={{ fontSize: 12, margin: 0 }}>Opportunités non abouties</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
