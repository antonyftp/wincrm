import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { LeadEtape } from "@prisma/client";
import { ETAPE_LABELS, ETAT_LABELS, NATURE_LABELS, TYPE_LABELS, etatBadgeClass } from "../lib/labels";

type LeadWithTitulaire = Prisma.LeadGetPayload<{
  include: { titulaire: { select: { id: true; nom: true; prenom: true } } };
}>;

type Props = {
  leads: LeadWithTitulaire[];
};

const ETAPE_ORDER: LeadEtape[] = [
  "nouveau_contact",
  "en_attente_qualification",
  "qualifie",
  "biens_proposes",
  "visite_programmee",
  "visite_effectuee",
  "relance_apres_visite",
  "offre_negociation",
  "conclu",
  "perdu",
];

function columnHeaderClass(etape: LeadEtape): string {
  if (etape === "conclu") return "bg-green-600 text-white";
  if (etape === "perdu") return "bg-red-600 text-white";
  return "bg-blue-600 text-white";
}

export default function PipelineView({ leads }: Props) {
  const byEtape = new Map<LeadEtape, LeadWithTitulaire[]>();
  for (const etape of ETAPE_ORDER) {
    byEtape.set(etape, []);
  }
  for (const lead of leads) {
    const col = byEtape.get(lead.etape);
    if (col) col.push(lead);
  }

  return (
    <div className="bg-slate-100 rounded-xl p-4 overflow-x-auto">
      <div className="flex gap-4" style={{ minWidth: `${ETAPE_ORDER.length * 272}px` }}>
        {ETAPE_ORDER.map((etape) => {
          const colLeads = byEtape.get(etape) ?? [];
          return (
            <div key={etape} className="w-64 flex-shrink-0 flex flex-col">
              <div className={`rounded-t-lg px-3 py-2 flex items-center justify-between ${columnHeaderClass(etape)}`}>
                <span className="text-sm font-semibold truncate">{ETAPE_LABELS[etape]}</span>
                <span className="ml-2 flex-shrink-0 inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/20 text-xs font-bold">
                  {colLeads.length}
                </span>
              </div>

              <div className="flex-1 bg-slate-200 rounded-b-lg p-2 overflow-y-auto max-h-[calc(100vh-220px)] flex flex-col gap-2">
                {colLeads.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">Aucun lead</p>
                ) : (
                  colLeads.map((lead) => (
                    <Link
                      key={lead.id}
                      href={`/leads/${lead.id}`}
                      className="block bg-white rounded-lg p-3 shadow-sm border border-slate-100 hover:shadow-md hover:border-slate-200 transition-all"
                    >
                      <p className="font-semibold text-sm text-slate-900 mb-1.5 truncate">
                        {lead.nom} {lead.prenom}
                      </p>
                      <span className={etatBadgeClass(lead.etat)}>
                        {ETAT_LABELS[lead.etat]}
                      </span>
                      <p className="mt-2 text-xs text-slate-500 truncate">
                        {lead.titulaire
                          ? `${lead.titulaire.prenom} ${lead.titulaire.nom}`
                          : <span className="italic text-slate-400">Non assigné</span>}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {TYPE_LABELS[lead.typeLogement]} · {NATURE_LABELS[lead.natureRecherche]}
                      </p>
                    </Link>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
