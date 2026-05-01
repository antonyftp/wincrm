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
    <div className="flex items-center justify-between gap-3 py-2.5 px-1">
      <Link
        href={`/leads/${lead.id}`}
        className="text-sm font-medium text-slate-900 hover:text-blue-600 transition-colors"
      >
        {lead.prenom} {lead.nom}
      </Link>
      <div className="flex items-center gap-3 flex-shrink-0">
        {nextAction && (
          <span className="text-xs text-slate-500">
            {TYPE_LABELS[nextAction.type] ?? nextAction.type} — {formatDate(nextAction.date)}
          </span>
        )}
        <span className="text-xs text-slate-400">
          {lead.titulaire
            ? `${lead.titulaire.prenom} ${lead.titulaire.nom}`
            : "Non assigné"}
        </span>
      </div>
    </div>
  );
}

export default async function LeadsARelancer() {
  const result = await getLeadsARelancer();

  if (result.error) {
    return (
      <div className="mb-6 p-4 rounded-xl border border-red-200 bg-red-50 text-sm text-red-700">
        Impossible de charger les leads à relancer.
      </div>
    );
  }

  const { retard, aujourdhui } = result;

  if (retard.length === 0 && aujourdhui.length === 0) return null;

  return (
    <div className="mb-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
      {retard.length > 0 && (
        <div className="bg-white rounded-xl border border-red-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              En retard
            </span>
            <span className="text-sm font-semibold text-slate-900">
              {retard.length} lead{retard.length > 1 ? "s" : ""}
            </span>
          </div>
          <div className="divide-y divide-slate-100">
            {retard.map((lead) => (
              <LeadLine key={lead.id} lead={lead} />
            ))}
          </div>
        </div>
      )}

      {aujourdhui.length > 0 && (
        <div className="bg-white rounded-xl border border-blue-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Aujourd'hui
            </span>
            <span className="text-sm font-semibold text-slate-900">
              {aujourdhui.length} lead{aujourdhui.length > 1 ? "s" : ""}
            </span>
          </div>
          <div className="divide-y divide-slate-100">
            {aujourdhui.map((lead) => (
              <LeadLine key={lead.id} lead={lead} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
