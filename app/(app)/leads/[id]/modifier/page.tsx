import { notFound } from "next/navigation";
import Link from "next/link";
import { getLead, getCommercials, updateLead } from "@/app/actions/leads";
import LeadForm from "../../components/LeadForm";

export default async function ModifierLeadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [lead, commercialsResult] = await Promise.all([
    getLead(id),
    getCommercials(),
  ]);

  if (!lead) notFound();

  const commercials = Array.isArray(commercialsResult) ? commercialsResult : [];

  const action = updateLead.bind(null, id);

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
        <Link
          href={`/leads/${id}`}
          className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          {lead.prenom} {lead.nom}
        </Link>
        <span className="text-slate-300">/</span>
        <h1 className="text-2xl font-bold text-slate-900">Modifier</h1>
      </div>
      <LeadForm mode="edit" lead={lead} commercials={commercials} action={action} />
    </div>
  );
}
