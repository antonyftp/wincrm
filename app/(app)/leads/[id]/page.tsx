import { notFound } from "next/navigation";
import Link from "next/link";
import { getLead } from "@/app/actions/leads";
import { getSession } from "@/app/lib/session";
import { ETAT_LABELS, ETAPE_LABELS, etatBadgeClass, etapeBadgeClass } from "../lib/labels";
import DeleteButton from "../components/DeleteButton";
import CommentSection from "../components/CommentSection";
import VisitSection from "../components/VisitSection";
import ActionSection from "../components/ActionSection";
import type { ReactNode } from "react";

function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-0.5">
        {label}
      </dt>
      <dd className="text-sm text-slate-900">
        {value ?? <span className="text-slate-400 italic">—</span>}
      </dd>
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

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/leads"
          className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          ← Leads
        </Link>
        <span className="text-slate-300">/</span>
        <h1 className="text-2xl font-bold text-slate-900">
          {lead.prenom} {lead.nom}
        </h1>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className={etatBadgeClass(lead.etat)}>{ETAT_LABELS[lead.etat]}</span>
          <span className={etapeBadgeClass(lead.etape)}>{ETAPE_LABELS[lead.etape]}</span>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={`/api/export/leads/${lead.id}`}
            className="inline-flex items-center px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Exporter PDF
          </a>
          {canEdit && (
            <Link
              href={`/leads/${lead.id}/modifier`}
              className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Modifier
            </Link>
          )}
          {isAdmin && <DeleteButton id={lead.id} />}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-base font-semibold text-slate-900 mb-5">Identité</h2>
            <dl className="grid grid-cols-2 sm:grid-cols-3 gap-5">
              <InfoRow
                label="Genre"
                value={lead.genre === "M" ? "M." : lead.genre === "Mme" ? "Mme" : "Autre"}
              />
              <InfoRow label="Prénom" value={lead.prenom} />
              <InfoRow label="Nom" value={lead.nom} />
              <InfoRow label="Âge" value={lead.age !== null ? `${lead.age} ans` : null} />
              <InfoRow
                label="Situation maritale"
                value={
                  lead.situationMaritale
                    ? ({
                        marie: "Marié(e)",
                        veuf: "Veuf/Veuve",
                        celibataire: "Célibataire",
                        divorce: "Divorcé(e)",
                      } as Record<string, string>)[lead.situationMaritale]
                    : null
                }
              />
              <InfoRow
                label="Héritier"
                value={
                  lead.heritier === true
                    ? "Oui"
                    : lead.heritier === false
                    ? "Non"
                    : null
                }
              />
            </dl>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-base font-semibold text-slate-900 mb-5">Contact</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <InfoRow
                label="Email"
                value={
                  lead.email ? (
                    <a href={`mailto:${lead.email}`} className="text-blue-600 hover:underline">
                      {lead.email}
                    </a>
                  ) : null
                }
              />
              <InfoRow
                label="Téléphone"
                value={
                  lead.telephone ? (
                    <a href={`tel:${lead.telephone}`} className="text-blue-600 hover:underline">
                      {lead.telephone}
                    </a>
                  ) : null
                }
              />
              <InfoRow label="Adresse" value={lead.adresse} />
            </dl>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-base font-semibold text-slate-900 mb-5">Projet immobilier</h2>
            <dl className="grid grid-cols-2 sm:grid-cols-3 gap-5">
              <InfoRow
                label="Nature recherche"
                value={
                  lead.natureRecherche
                    ? ({
                        achat: "Achat",
                        location: "Location",
                        investissement: "Investissement",
                      } as Record<string, string>)[lead.natureRecherche]
                    : null
                }
              />
              <InfoRow
                label="Type logement"
                value={
                  lead.typeLogement
                    ? ({
                        appartement: "Appartement",
                        maison: "Maison",
                        studio: "Studio",
                        t2: "T2",
                        t3: "T3",
                        t4: "T4",
                        autre: "Autre",
                      } as Record<string, string>)[lead.typeLogement]
                    : null
                }
              />
              <InfoRow
                label="Budget"
                value={
                  lead.budgetMin !== null || lead.budgetMax !== null
                    ? `${lead.budgetMin !== null ? lead.budgetMin.toLocaleString("fr-FR") + " €" : "—"} → ${lead.budgetMax !== null ? lead.budgetMax.toLocaleString("fr-FR") + " €" : "—"}`
                    : null
                }
              />
              {lead.criteresSpecifiques && (
                <div className="col-span-2 sm:col-span-3">
                  <InfoRow
                    label="Critères spécifiques"
                    value={<p className="whitespace-pre-wrap">{lead.criteresSpecifiques}</p>}
                  />
                </div>
              )}
            </dl>
          </div>

          <ActionSection
            leadId={lead.id}
            actions={lead.actions}
          />

          <VisitSection
            leadId={lead.id}
            visits={lead.visits}
            canDelete={canDeleteVisit}
          />

          <CommentSection
            leadId={lead.id}
            comments={lead.comments}
            sessionUserId={session?.userId ?? ""}
            sessionRole={session?.role ?? ""}
          />
        </section>

        <aside className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-base font-semibold text-slate-900 mb-5">Suivi</h2>
            <dl className="space-y-4">
              <InfoRow
                label="Commercial assigné"
                value={
                  lead.titulaire ? (
                    `${lead.titulaire.prenom} ${lead.titulaire.nom}`
                  ) : (
                    <span className="text-slate-400 italic">Non assigné</span>
                  )
                }
              />
              <InfoRow
                label="Date de saisie"
                value={new Date(lead.dateSaisie).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              />
              <InfoRow
                label="Dernière modification"
                value={new Date(lead.updatedAt).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              />
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
}
