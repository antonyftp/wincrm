import type { DashboardData } from "@/app/actions/dashboard";
import { ETAPE_LABELS } from "@/app/lib/labels";
import type { LeadEtape } from "@prisma/client";

type Props = {
  data: DashboardData;
  userName: string;
};

const ETAPE_ORDER: LeadEtape[] = [
  "nouveau_contact",
  "en_attente_qualification",
  "qualifie",
  "biens_proposes",
  "visite_programmee",
  "visite_effectuee",
  "relance_apres_visite",
  "offre_negociation",
  "conclu",
  "perdu",
];

const MOIS_FR = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

// ─── Sous-composants ────────────────────────────────────────────────────────

type StatCardProps = {
  label: string;
  value: number | string;
  sublabel?: string;
  accent?: "default" | "blue" | "amber" | "red";
};

function StatCard({ label, value, sublabel, accent = "default" }: StatCardProps) {
  const accentLine: Record<string, string> = {
    default: "bg-slate-200",
    blue: "bg-blue-500",
    amber: "bg-amber-400",
    red: "bg-red-500",
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col gap-3">
      <div className={`h-1 w-10 rounded-full ${accentLine[accent]}`} aria-hidden />
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="text-3xl font-bold text-slate-900 tabular-nums leading-none">
        {value}
      </p>
      {sublabel && (
        <p className="text-xs text-slate-400 -mt-1">{sublabel}</p>
      )}
    </div>
  );
}

type ProgressBarProps = {
  value: number;
  max: number;
  colorClass?: string;
};

function ProgressBar({ value, max, colorClass = "bg-blue-500" }: ProgressBarProps) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div
      className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden"
      role="progressbar"
      aria-valuenow={value}
      aria-valuemax={max}
      aria-valuemin={0}
    >
      <div
        className={`h-full rounded-full ${colorClass}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// ─── Composant principal ─────────────────────────────────────────────────────

export default function DashboardView({ data, userName }: Props) {
  const {
    totalLeads,
    nouveauxCeMois,
    relancesDuJour,
    leadsEnRetard,
    leadsParCommercial,
    leadsParEtape,
    tauxTransformation,
    bilanMensuel,
  } = data;

  const moisCourant = MOIS_FR[new Date().getMonth()];

  const commerciaux = leadsParCommercial;
  const maxCommercial = commerciaux[0]?.count ?? 1;

  const etapesTriees = ETAPE_ORDER.map((etape) => {
    const found = leadsParEtape.find((e) => e.etape === etape);
    return { etape, count: found?.count ?? 0 };
  }).filter((e) => e.count > 0);

  const maxEtape = Math.max(...etapesTriees.map((e) => e.count), 1);

  const totalGP = bilanMensuel.conclus + bilanMensuel.perdus;
  const pctGagnes = totalGP > 0
    ? Math.round((bilanMensuel.conclus / totalGP) * 100)
    : 0;

  return (
    <div>
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Bonjour, {userName}
        </h1>
        <p className="mt-1 text-slate-500 text-sm">
          Vue d'ensemble de votre activité commerciale
        </p>
      </div>

      {/* ── 1. Compteurs KPI ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total leads"
          value={totalLeads}
          sublabel="dans le CRM"
          accent="blue"
        />
        <StatCard
          label="Nouveaux ce mois"
          value={nouveauxCeMois}
          sublabel={`leads créés en ${moisCourant}`}
          accent="default"
        />
        <StatCard
          label="Relances du jour"
          value={relancesDuJour}
          sublabel="actions planifiées"
          accent="amber"
        />
        <StatCard
          label="En retard"
          value={leadsEnRetard}
          sublabel="leads avec action dépassée"
          accent={leadsEnRetard > 0 ? "red" : "default"}
        />
      </div>

      {/* ── 2 & 3. Par commercial + Par étape ───────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">

        {/* Par commercial */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-sm font-semibold text-slate-900 mb-5">
            Leads par commercial
          </h2>

          {commerciaux.length === 0 ? (
            <p className="text-sm text-slate-400 italic">Aucune donnée</p>
          ) : (
            <ol className="flex flex-col gap-4">
              {commerciaux.map((c, index) => {
                const initiales = `${c.prenom[0] ?? ""}${c.nom[0] ?? ""}`.toUpperCase();
                const isFirst = index === 0;
                return (
                  <li key={c.titulaireId ?? "non-assigne"} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold flex-shrink-0 ${
                            isFirst
                              ? "bg-blue-100 text-blue-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                          aria-hidden
                        >
                          {initiales}
                        </span>
                        <span className="text-sm font-medium text-slate-900 truncate">
                          {c.prenom} {c.nom}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-sm font-semibold text-slate-900 tabular-nums">
                          {c.count}
                        </span>
                        <span className="text-xs text-slate-400">
                          lead{c.count > 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                    <ProgressBar
                      value={c.count}
                      max={maxCommercial}
                      colorClass={isFirst ? "bg-blue-500" : "bg-slate-300"}
                    />
                  </li>
                );
              })}
            </ol>
          )}
        </div>

        {/* Par étape */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-sm font-semibold text-slate-900 mb-5">
            Leads par étape
          </h2>

          {etapesTriees.length === 0 ? (
            <p className="text-sm text-slate-400 italic">Aucune donnée</p>
          ) : (
            <ol className="flex flex-col gap-3.5">
              {etapesTriees.map(({ etape, count }) => {
                const isConclu = etape === "conclu";
                const isPerdu = etape === "perdu";
                const barColor = isConclu
                  ? "bg-green-500"
                  : isPerdu
                  ? "bg-red-400"
                  : "bg-blue-400";
                const countColor = isConclu
                  ? "text-green-700"
                  : isPerdu
                  ? "text-red-600"
                  : "text-slate-900";

                return (
                  <li key={etape} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium text-slate-600 truncate">
                        {ETAPE_LABELS[etape] ?? etape}
                        {isConclu && (
                          <span className="ml-1 text-green-600" aria-label="étape conclue">
                            ✓
                          </span>
                        )}
                        {isPerdu && (
                          <span className="ml-1 text-red-500" aria-label="étape perdue">
                            ✗
                          </span>
                        )}
                      </span>
                      <span className={`text-xs font-semibold tabular-nums ${countColor}`}>
                        {count}
                      </span>
                    </div>
                    <ProgressBar value={count} max={maxEtape} colorClass={barColor} />
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </div>

      {/* ── 4. Bilan mensuel ─────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-sm font-semibold text-slate-900 mb-6">
          Bilan du mois
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">

          {/* Taux de transformation */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Taux de transformation
            </p>
            <div className="flex items-end gap-1.5">
              <span className="text-4xl font-bold text-slate-900 tabular-nums leading-none">
                {tauxTransformation.toFixed(1)}
              </span>
              <span className="text-lg font-semibold text-slate-400 mb-0.5">%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-blue-500"
                style={{ width: `${Math.min(tauxTransformation, 100)}%` }}
              />
            </div>
            <p className="text-xs text-slate-400">
              Leads convertis en vente / location
            </p>
          </div>

          {/* Gagnés */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Leads gagnés
            </p>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-green-600 tabular-nums leading-none">
                {bilanMensuel.conclus}
              </span>
              {totalGP > 0 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mb-1">
                  +{pctGagnes}%
                </span>
              )}
            </div>
            <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-green-500"
                style={{ width: totalGP > 0 ? `${pctGagnes}%` : "0%" }}
              />
            </div>
            <p className="text-xs text-slate-400">
              Sur {totalGP} deal{totalGP > 1 ? "s" : ""} finalisé{totalGP > 1 ? "s" : ""} ce mois
            </p>
          </div>

          {/* Perdus */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Leads perdus
            </p>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-red-500 tabular-nums leading-none">
                {bilanMensuel.perdus}
              </span>
              {bilanMensuel.perdus > 0 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 mb-1">
                  {100 - pctGagnes}%
                </span>
              )}
            </div>
            <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-red-400"
                style={{ width: totalGP > 0 ? `${100 - pctGagnes}%` : "0%" }}
              />
            </div>
            <p className="text-xs text-slate-400">
              Opportunités non abouties ce mois
            </p>
          </div>
        </div>

        {totalGP > 0 && (
          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center gap-3">
            <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden flex">
              <div
                className="h-full bg-green-500 rounded-l-full"
                style={{ width: `${pctGagnes}%` }}
              />
              <div
                className="h-full bg-red-400 rounded-r-full"
                style={{ width: `${100 - pctGagnes}%` }}
              />
            </div>
            <span className="text-xs text-slate-500 flex-shrink-0 tabular-nums">
              {bilanMensuel.conclus}G / {bilanMensuel.perdus}P
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
