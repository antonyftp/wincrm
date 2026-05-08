import { notFound } from "next/navigation";
import Link from "next/link";
import { getLead } from "@/app/actions/leads";
import { getSession } from "@/app/lib/session";
import {
  ETAPE_LABELS,
  NATURE_LABELS,
  SITUATION_LABELS,
  TYPE_LABELS,
  etapeBadgeClass,
} from "@/app/lib/labels";
import DeleteButton from "../components/DeleteButton";
import CommentSection from "../components/CommentSection";
import VisitSection from "../components/VisitSection";
import ActionSection from "../components/ActionSection";
import Topbar from "../../components/Topbar";
import type { ReactNode } from "react";

function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="info-row">
      <span className="lbl">{label}</span>
      <span className="val">
        {value ?? <span style={{ color: "var(--text-faint)", fontStyle: "italic" }}>—</span>}
      </span>
    </div>
  );
}

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [lead, session] = await Promise.all([getLead(id), getSession()]);

  if (!lead) notFound();

  const isAdmin = session?.role === "admin";
  const canEdit =
    isAdmin ||
    lead.titulaireId === null ||
    lead.titulaireId === session?.userId;

  const canDeleteVisit =
    isAdmin ||
    lead.titulaireId === session?.userId;

  const initials = `${lead.prenom[0] ?? ""}${lead.nom[0] ?? ""}`.toUpperCase();

  return (
    <>
      <Topbar
        title={`${lead.prenom} ${lead.nom}`}
        crumbs={
          <>
            <Link href="/leads" style={{ color: "var(--text-soft)", textDecoration: "none" }}>
              Leads
            </Link>
            {" "}/{" "}
            <span>{lead.prenom} {lead.nom}</span>
          </>
        }
        actions={
          <>
            <a href={`/api/export/leads/${lead.id}`} className="btn btn-sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/>
              </svg>
              Export PDF
            </a>
            {canEdit && (
              <Link href={`/leads/${lead.id}/modifier`} className="btn btn-sm">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                Modifier
              </Link>
            )}
            {isAdmin && <DeleteButton id={lead.id} />}
          </>
        }
      />

      <div className="content">
        {/* Header du lead */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ padding: "20px 24px", display: "flex", gap: 20, alignItems: "center" }}>
            <span className="avatar avatar-lg" style={{ background: "var(--accent)" }}>{initials}</span>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }}>
                <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em" }}>
                  {lead.genre === "M" ? "M." : lead.genre === "Mme" ? "Mme" : ""} {lead.prenom} {lead.nom}
                </h2>
                <span className={etapeBadgeClass(lead.etape)}><span className="dot" />{ETAPE_LABELS[lead.etape]}</span>
              </div>
              <div style={{ display: "flex", gap: 16, fontSize: 13, color: "var(--text-soft)" }}>
                {lead.telephone && <span>📞 {lead.telephone}</span>}
                {lead.email && <span>✉ {lead.email}</span>}
                {lead.adresse && <span>📍 {lead.adresse}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Corps */}
        <div className="lead-detail-grid">
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Identité */}
            <div className="card">
              <div className="card-h"><h3>Identité</h3></div>
              <div className="card-b" style={{ padding: "0 18px" }}>
                <div className="info-row">
                  <span className="lbl">Genre</span>
                  <span className="val">{lead.genre === "M" ? "M." : lead.genre === "Mme" ? "Mme" : "Autre"}</span>
                </div>
                <div className="info-row">
                  <span className="lbl">Prénom</span>
                  <span className="val">{lead.prenom}</span>
                </div>
                <div className="info-row">
                  <span className="lbl">Nom</span>
                  <span className="val">{lead.nom}</span>
                </div>
                {lead.age !== null && (
                  <div className="info-row">
                    <span className="lbl">Âge</span>
                    <span className="val">{lead.age} ans</span>
                  </div>
                )}
                {lead.situationMaritale && (
                  <div className="info-row">
                    <span className="lbl">Situation</span>
                    <span className="val">{SITUATION_LABELS[lead.situationMaritale]}</span>
                  </div>
                )}
                {lead.heritier !== null && (
                  <div className="info-row">
                    <span className="lbl">Héritier</span>
                    <span className="val">{lead.heritier ? "Oui" : "Non"}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Projet immobilier */}
            <div className="card">
              <div className="card-h"><h3>Projet immobilier</h3></div>
              <div className="card-b" style={{ padding: "0 18px" }}>
                {lead.natureRecherche && (
                  <div className="info-row">
                    <span className="lbl">Nature</span>
                    <span className="val"><span className="badge info">{NATURE_LABELS[lead.natureRecherche]}</span></span>
                  </div>
                )}
                {lead.typeLogement && (
                  <div className="info-row">
                    <span className="lbl">Type</span>
                    <span className="val">{TYPE_LABELS[lead.typeLogement]}</span>
                  </div>
                )}
                {lead.budgetAchat !== null && (
                  <div className="info-row">
                    <span className="lbl">Budget achat</span>
                    <span className="val tnum">{lead.budgetAchat.toLocaleString("fr-FR")} €</span>
                  </div>
                )}
                {lead.budgetLocation !== null && (
                  <div className="info-row">
                    <span className="lbl">Budget location</span>
                    <span className="val tnum">{lead.budgetLocation.toLocaleString("fr-FR")} €</span>
                  </div>
                )}
                {lead.criteresSpecifiques && (
                  <div className="info-row">
                    <span className="lbl">Critères</span>
                    <span className="val" style={{ whiteSpace: "pre-wrap" }}>{lead.criteresSpecifiques}</span>
                  </div>
                )}
              </div>
            </div>

            <ActionSection leadId={lead.id} actions={lead.actions} />
            <VisitSection leadId={lead.id} visits={lead.visits} canDelete={canDeleteVisit} />
            <CommentSection
              leadId={lead.id}
              comments={lead.comments}
              sessionUserId={session?.userId ?? ""}
              sessionRole={session?.role ?? ""}
            />
          </div>

          {/* Sidebar droite */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Contact */}
            <div className="card">
              <div className="card-h"><h3>Coordonnées</h3></div>
              <div className="card-b" style={{ padding: "0 18px" }}>
                {lead.email && (
                  <div className="info-row">
                    <span className="lbl">Email</span>
                    <span className="val" style={{ minWidth: 0, overflow: "hidden" }}>
                      <a href={`mailto:${lead.email}`} style={{ color: "var(--accent)", textDecoration: "none", overflowWrap: "break-word", wordBreak: "break-all", display: "block" }}>{lead.email}</a>
                    </span>
                  </div>
                )}
                {lead.telephone && (
                  <div className="info-row">
                    <span className="lbl">Téléphone</span>
                    <span className="val">
                      <a href={`tel:${lead.telephone}`} style={{ color: "var(--accent)", textDecoration: "none" }}>{lead.telephone}</a>
                    </span>
                  </div>
                )}
                {lead.adresse && (
                  <div className="info-row">
                    <span className="lbl">Adresse</span>
                    <span className="val">{lead.adresse}</span>
                  </div>
                )}
                {lead.dateMailEntrant && (
                  <div className="info-row">
                    <span className="lbl">Mail entrant</span>
                    <span className="val">
                      {new Date(lead.dateMailEntrant).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Suivi commercial */}
            <div className="card">
              <div className="card-h"><h3>Suivi commercial</h3></div>
              <div className="card-b" style={{ padding: "0 18px" }}>
                <div className="info-row">
                  <span className="lbl">Commercial</span>
                  <span className="val">
                    {lead.titulaire ? (
                      <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <span className="avatar avatar-sm" style={{ background: "var(--accent)" }}>
                          {`${lead.titulaire.prenom[0] ?? ""}${lead.titulaire.nom[0] ?? ""}`.toUpperCase()}
                        </span>
                        {lead.titulaire.prenom} {lead.titulaire.nom}
                      </span>
                    ) : (
                      <span style={{ color: "var(--text-faint)", fontStyle: "italic" }}>Non assigné</span>
                    )}
                  </span>
                </div>
                <div className="info-row">
                  <span className="lbl">Saisi le</span>
                  <span className="val">
                    {new Date(lead.dateSaisie).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                  </span>
                </div>
                <div className="info-row">
                  <span className="lbl">Modifié le</span>
                  <span className="val">
                    {new Date(lead.updatedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
