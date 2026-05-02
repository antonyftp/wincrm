import Link from "next/link";
import { Suspense } from "react";
import { getLeads, getCommercials } from "@/app/actions/leads";
import { getSession } from "@/app/lib/session";
import { ETAT_LABELS, ETAPE_LABELS, etatBadgeClass } from "@/app/lib/labels";
import DeleteButton from "./components/DeleteButton";
import LeadsFilters from "./components/LeadsFilters";
import LeadsARelancer from "./components/LeadsARelancer";
import Topbar from "../components/Topbar";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function str(value: string | string[] | undefined): string {
  if (!value) return "";
  return Array.isArray(value) ? value[0] ?? "" : value;
}

export default async function LeadsPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;

  const q = str(sp.q);
  const commercial = str(sp.commercial);
  const etat = str(sp.etat);
  const etape = str(sp.etape);
  const typeLogement = str(sp.typeLogement);
  const natureRecherche = str(sp.natureRecherche);
  const sortBy = str(sp.sortBy);
  const sortDir = (str(sp.sortDir) || "desc") as "asc" | "desc";

  const filters = {
    ...(q && { q }),
    ...(commercial && { commercial }),
    ...(etat && { etat }),
    ...(etape && { etape }),
    ...(typeLogement && { typeLogement }),
    ...(natureRecherche && { natureRecherche }),
    ...(sortBy && { sortBy }),
    sortDir,
  };

  const [leadsResult, commercialsResult, session] = await Promise.all([
    getLeads(filters),
    getCommercials(),
    getSession(),
  ]);

  const leads = Array.isArray(leadsResult) ? leadsResult : [];
  const commercials = Array.isArray(commercialsResult) ? commercialsResult : [];
  const isAdmin = session?.role === "admin";

  const exportParams = new URLSearchParams();
  if (q) exportParams.set("q", q);
  if (commercial) exportParams.set("commercial", commercial);
  if (etat) exportParams.set("etat", etat);
  if (etape) exportParams.set("etape", etape);
  if (typeLogement) exportParams.set("typeLogement", typeLogement);
  if (natureRecherche) exportParams.set("natureRecherche", natureRecherche);
  if (sortBy) exportParams.set("sortBy", sortBy);
  exportParams.set("sortDir", sortDir);
  const exportUrl = `/api/export/leads?${exportParams.toString()}`;

  return (
    <>
      <Topbar
        title="Leads"
        crumbs={`${leads.length} contacts dans votre base`}
        actions={
          <>
            <a href={exportUrl} className="btn btn-sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/>
              </svg>
              Exporter
            </a>
            <Link href="/leads/nouveau" className="btn btn-primary btn-sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M12 5v14M5 12h14"/>
              </svg>
              Nouveau lead
            </Link>
          </>
        }
      />

      <div className="content">
        <Suspense fallback={null}>
          <LeadsARelancer />
        </Suspense>

        <div className="card" style={{ marginBottom: 16 }}>
          <div className="filter-bar" style={{ display: "flex", gap: 8, alignItems: "center", padding: "14px 18px", flexWrap: "wrap" }}>
            <LeadsFilters commercials={commercials} />
          </div>
        </div>

        {leads.length === 0 ? (
          <div className="empty" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)" }}>
            <p className="bold" style={{ margin: "0 0 4px" }}>Aucun lead pour l&apos;instant</p>
            <p style={{ margin: "0 0 16px" }}>Commencez par créer votre premier lead.</p>
            <Link href="/leads/nouveau" className="btn btn-primary">
              Créer un lead
            </Link>
          </div>
        ) : (
          <div className="card">
            <div className="table-responsive">
              <table className="table leads-table">
                <thead>
                  <tr>
                    <th>Contact</th>
                    <th>État</th>
                    <th>Étape</th>
                    <th>Commercial</th>
                    <th>Date saisie</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => {
                    const canEdit =
                      isAdmin ||
                      lead.titulaireId === null ||
                      lead.titulaireId === session?.userId;

                    const initials = `${lead.prenom[0] ?? ""}${lead.nom[0] ?? ""}`.toUpperCase();

                    return (
                      <tr key={lead.id}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span className="avatar" style={{ background: "var(--accent)" }}>{initials}</span>
                            <div>
                              <div className="bold">{lead.nom} {lead.prenom}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={etatBadgeClass(lead.etat)}>
                            {ETAT_LABELS[lead.etat]}
                          </span>
                        </td>
                        <td className="muted">{ETAPE_LABELS[lead.etape]}</td>
                        <td className="muted">
                          {lead.titulaire
                            ? `${lead.titulaire.prenom} ${lead.titulaire.nom}`
                            : <span style={{ fontStyle: "italic" }}>Non assigné</span>}
                        </td>
                        <td className="muted" style={{ fontSize: 12 }}>
                          {new Date(lead.dateSaisie).toLocaleDateString("fr-FR")}
                        </td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6 }}>
                            <Link href={`/leads/${lead.id}`} className="btn btn-sm btn-ghost">
                              Voir
                            </Link>
                            {canEdit && (
                              <Link href={`/leads/${lead.id}/modifier`} className="btn btn-sm">
                                Modifier
                              </Link>
                            )}
                            {isAdmin && <DeleteButton id={lead.id} />}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
