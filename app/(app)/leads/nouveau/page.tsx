import { getCommercials } from "@/app/actions/leads";
import { createLead } from "@/app/actions/leads";
import LeadForm from "../components/LeadForm";
import Link from "next/link";

export default async function NouveauLeadPage() {
  const commercialsResult = await getCommercials();
  const commercials = Array.isArray(commercialsResult) ? commercialsResult : [];

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
        <h1 className="text-2xl font-bold text-slate-900">Nouveau lead</h1>
      </div>
      <LeadForm mode="create" commercials={commercials} action={createLead} />
    </div>
  );
}
