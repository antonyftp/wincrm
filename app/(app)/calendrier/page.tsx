import { getSession } from "@/app/lib/session";
import { redirect } from "next/navigation";
import { getActionsCalendrier } from "@/app/actions/calendar";
import Topbar from "../components/Topbar";
import CalendrierView from "./CalendrierView";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function str(v: string | string[] | undefined): string {
  if (!v) return "";
  return Array.isArray(v) ? (v[0] ?? "") : v;
}

export default async function CalendrierPage({ searchParams }: { searchParams: SearchParams }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const sp = await searchParams;
  const now = new Date();

  const anneeRaw = parseInt(str(sp.annee));
  const moisRaw = parseInt(str(sp.mois));

  const annee = isNaN(anneeRaw) || anneeRaw < 2000 || anneeRaw > 2100 ? now.getFullYear() : anneeRaw;
  const mois = isNaN(moisRaw) ? now.getMonth() + 1 : Math.max(1, Math.min(12, moisRaw));
  const tousLesCommerciaux = session.role === "admin" && str(sp.tous) === "1";

  const { actions, error } = await getActionsCalendrier(annee, mois, tousLesCommerciaux);

  return (
    <>
      <Topbar title="Calendrier" />
      <div className="content">
        <CalendrierView
          actions={actions}
          annee={annee}
          mois={mois}
          isAdmin={session.role === "admin"}
          tousLesCommerciaux={tousLesCommerciaux}
          error={error}
        />
      </div>
    </>
  );
}
