import { notFound } from "next/navigation";
import Link from "next/link";
import { getLead, getCommercials, updateLead } from "@/app/actions/leads";
import LeadForm from "../../components/LeadForm";
import Topbar from "../../../components/Topbar";

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
    <>
      <Topbar
        title="Modifier le lead"
        crumbs={
          <>
            <Link href="/leads" style={{ color: "var(--text-soft)", textDecoration: "none" }}>Leads</Link>
            {" / "}
            <Link href={`/leads/${id}`} style={{ color: "var(--text-soft)", textDecoration: "none" }}>
              {lead.prenom} {lead.nom}
            </Link>
          </>
        }
      />
      <div className="content">
        <LeadForm mode="edit" lead={lead} commercials={commercials} action={action} />
      </div>
    </>
  );
}
