import { getCommercials, createLead } from "@/app/actions/leads";
import LeadForm from "../components/LeadForm";
import Topbar from "../../components/Topbar";
import Link from "next/link";

export default async function NouveauLeadPage() {
  const commercialsResult = await getCommercials();
  const commercials = Array.isArray(commercialsResult) ? commercialsResult : [];

  return (
    <>
      <Topbar
        title="Nouveau lead"
        crumbs={
          <Link href="/leads" style={{ color: "var(--text-soft)", textDecoration: "none" }}>
            Leads
          </Link>
        }
      />
      <div className="content">
        <LeadForm mode="create" commercials={commercials} action={createLead} />
      </div>
    </>
  );
}
