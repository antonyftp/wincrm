import { getLeads, getCommercials } from "@/app/actions/leads";
import { getSession } from "@/app/lib/session";
import PipelineView from "@/app/(app)/leads/components/PipelineView";
import LeadsFilters from "@/app/(app)/leads/components/LeadsFilters";
import Topbar from "@/app/(app)/components/Topbar";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function str(value: string | string[] | undefined): string {
  if (!value) return "";
  return Array.isArray(value) ? value[0] ?? "" : value;
}

export default async function PipelinePage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;

  const q = str(sp.q);
  const commercial = str(sp.commercial);
  const etape = str(sp.etape);
  const typeLogement = str(sp.typeLogement);
  const natureRecherche = str(sp.natureRecherche);
  const sortBy = str(sp.sortBy);
  const sortDir = (str(sp.sortDir) || "desc") as "asc" | "desc";

  const filters = {
    ...(q && { q }),
    ...(commercial && { commercial }),
    ...(etape && { etape }),
    ...(typeLogement && { typeLogement }),
    ...(natureRecherche && { natureRecherche }),
    ...(sortBy && { sortBy }),
    sortDir,
  };

  const [leadsResult, commercialsResult] = await Promise.all([
    getLeads(filters),
    getCommercials(),
  ]);

  const leads = Array.isArray(leadsResult) ? leadsResult : [];
  const commercials = Array.isArray(commercialsResult) ? commercialsResult : [];

  return (
    <>
      <Topbar
        title="Pipeline"
        crumbs={`${leads.length} leads en cours`}
      />

      <div className="content">
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="filter-bar" style={{ display: "flex", gap: 8, alignItems: "center", padding: "14px 18px", flexWrap: "wrap" }}>
            <LeadsFilters commercials={commercials} />
          </div>
        </div>

        <PipelineView leads={leads} />
      </div>
    </>
  );
}
