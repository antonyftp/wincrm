import Link from "next/link";
import { getLeadsARelancer } from "@/app/actions/tracking";

const TYPE_LABELS: Record<string, string> = {
  appel: "Appel",
  email: "Email",
  rdv: "RDV",
  visite: "Visite",
  relance: "Relance",
};

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type LeadRow = {
  id: string;
  prenom: string;
  nom: string;
  titulaire: { prenom: string; nom: string } | null;
  actions: Array<{ id: string; type: string; date: Date; done: boolean }>;
};

function LeadLine({ lead }: { lead: LeadRow }) {
  const nextAction = lead.actions[0];
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
      <Link href={`/leads/${lead.id}`} style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", textDecoration: "none" }}>
        {lead.prenom} {lead.nom}
      </Link>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        {nextAction && (
          <span className="muted" style={{ fontSize: 12 }}>
            {TYPE_LABELS[nextAction.type] ?? nextAction.type} — {formatDate(nextAction.date)}
          </span>
        )}
        <span className="faint" style={{ fontSize: 12 }}>
          {lead.titulaire ? `${lead.titulaire.prenom} ${lead.titulaire.nom}` : "Non assigné"}
        </span>
      </div>
    </div>
  );
}

export default async function LeadsARelancer() {
  const result = await getLeadsARelancer();

  if (result.error) {
    return (
      <div className="badge neg" style={{ padding: "10px 14px", borderRadius: "var(--r)", fontSize: 13, marginBottom: 16 }}>
        Impossible de charger les leads à relancer.
      </div>
    );
  }

  const { retard, aujourdhui } = result;

  if (retard.length === 0 && aujourdhui.length === 0) return null;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 12, marginBottom: 16 }}>
      {retard.length > 0 && (
        <div className="card">
          <div className="card-h" style={{ borderColor: "var(--neg-soft)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="badge neg"><span className="dot" />En retard</span>
              <span className="bold" style={{ fontSize: 13 }}>{retard.length} lead{retard.length > 1 ? "s" : ""}</span>
            </div>
          </div>
          <div className="card-b">
            {retard.map((lead) => <LeadLine key={lead.id} lead={lead} />)}
          </div>
        </div>
      )}

      {aujourdhui.length > 0 && (
        <div className="card">
          <div className="card-h">
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="badge info"><span className="dot" />Aujourd&apos;hui</span>
              <span className="bold" style={{ fontSize: 13 }}>{aujourdhui.length} lead{aujourdhui.length > 1 ? "s" : ""}</span>
            </div>
          </div>
          <div className="card-b">
            {aujourdhui.map((lead) => <LeadLine key={lead.id} lead={lead} />)}
          </div>
        </div>
      )}
    </div>
  );
}
