import Link from "next/link";
import { getLeads } from "@/app/actions/leads";
import { getSession } from "@/app/lib/session";
import { ETAT_LABELS, ETAPE_LABELS, etatBadgeClass } from "./lib/labels";
import DeleteButton from "./components/DeleteButton";

export default async function LeadsPage() {
  const [leadsResult, session] = await Promise.all([getLeads(), getSession()]);

  const leads = Array.isArray(leadsResult) ? leadsResult : [];
  const isAdmin = session?.role === "admin";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Leads</h1>
        <Link
          href="/leads/nouveau"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <span aria-hidden>+</span> Nouveau lead
        </Link>
      </div>

      {leads.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
              />
            </svg>
          </div>
          <p className="text-slate-600 font-medium">Aucun lead pour l'instant</p>
          <p className="text-slate-400 text-sm mt-1">
            Commencez par créer votre premier lead.
          </p>
          <Link
            href="/leads/nouveau"
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Créer un lead
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">
                    Nom / Prénom
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">
                    État
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">
                    Étape
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">
                    Commercial
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">
                    Date saisie
                  </th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leads.map((lead) => {
                  const canEdit =
                    isAdmin ||
                    lead.titulaireId === null ||
                    lead.titulaireId === session?.userId;

                  return (
                    <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {lead.nom} {lead.prenom}
                      </td>
                      <td className="px-4 py-3">
                        <span className={etatBadgeClass(lead.etat)}>
                          {ETAT_LABELS[lead.etat]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {ETAPE_LABELS[lead.etape]}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {lead.titulaire ? (
                          `${lead.titulaire.prenom} ${lead.titulaire.nom}`
                        ) : (
                          <span className="text-slate-400 italic">Non assigné</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {new Date(lead.dateSaisie).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/leads/${lead.id}`}
                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors"
                          >
                            Voir
                          </Link>
                          {canEdit && (
                            <Link
                              href={`/leads/${lead.id}/modifier`}
                              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                            >
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
  );
}
