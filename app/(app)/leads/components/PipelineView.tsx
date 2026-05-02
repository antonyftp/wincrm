import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { LeadEtape } from "@prisma/client";
import { ETAPE_LABELS, ETAT_LABELS, NATURE_LABELS, TYPE_LABELS, etatBadgeClass } from "@/app/lib/labels";
import { ETAPE_ORDER, ETAPE_COLORS } from "@/app/lib/etape-colors";

type LeadWithTitulaire = Prisma.LeadGetPayload<{
  include: { titulaire: { select: { id: true; nom: true; prenom: true } } };
}>;

type Props = {
  leads: LeadWithTitulaire[];
};

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
    <div className="kanban">
      {ETAPE_ORDER.map((etape) => {
        const colLeads = byEtape.get(etape) ?? [];
        const color = ETAPE_COLORS[etape] ?? "var(--accent)";

        return (
          <div key={etape} className="kcol">
            <div className="kcol-h">
              <div className="ttl">
                <span className="colordot" style={{ background: color }} />
                {ETAPE_LABELS[etape]}
              </div>
              <span className="count">{colLeads.length}</span>
            </div>
            <div className="kcol-body">
              {colLeads.length === 0 ? (
                <p style={{ fontSize: 12, color: "var(--text-faint)", textAlign: "center", padding: "20px 0" }}>
                  Aucun lead
                </p>
              ) : (
                colLeads.map((lead) => (
                  <Link key={lead.id} href={`/leads/${lead.id}`} className="kcard">
                    <div className="kc-name">{lead.nom} {lead.prenom}</div>
                    <div className="kc-sub">{TYPE_LABELS[lead.typeLogement]} · {NATURE_LABELS[lead.natureRecherche]}</div>
                    <div className="kc-foot">
                      <span className={etatBadgeClass(lead.etat)}>
                        <span className="dot" />
                        {ETAT_LABELS[lead.etat]}
                      </span>
                      <span className="kc-meta">
                        {lead.titulaire
                          ? `${lead.titulaire.prenom} ${lead.titulaire.nom}`
                          : <span style={{ fontStyle: "italic" }}>Non assigné</span>}
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
