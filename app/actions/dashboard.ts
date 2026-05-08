"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/app/lib/session";

// ─── Return types ────────────────────────────────────────────────────────────

export type LeadsParCommercial = {
  titulaireId: string | null;
  nom: string;
  prenom: string;
  count: number;
};

export type LeadsParEtape = {
  etape: string;
  count: number;
};

export type BilanMensuel = {
  conclus: number;
  perdus: number;
};

export type AcquisitionPoint = {
  label: string;
  count: number;
};

export type ProchaineAction = {
  id: string;
  type: string;
  date: Date;
  leadId: string;
  leadPrenom: string;
  leadNom: string;
  leadType: string;
  titulaireId: string | null;
  titulairePrenom: string | null;
  titulaireNom: string | null;
};

export type DashboardData = {
  totalLeads: number;
  nouveauxCeMois: number;
  relancesDuJour: number;
  leadsEnRetard: number;
  leadsParCommercial: LeadsParCommercial[];
  leadsParEtape: LeadsParEtape[];
  tauxTransformation: number;
  bilanMensuel: BilanMensuel;
  acquisitionParMois: AcquisitionPoint[];
  prochainesActions: ProchaineAction[];
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getMoisCourantBornes(): { debut: Date; fin: Date } {
  const now = new Date();
  return {
    debut: new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0),
    fin: new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0, 0),
  };
}

function getAujourdhuiBornes(): { debutJour: Date; finJour: Date } {
  const now = new Date();
  return {
    debutJour: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0),
    finJour: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0),
  };
}

// ─── Server Action ────────────────────────────────────────────────────────────

export async function getDashboardData(): Promise<DashboardData> {
  const session = await getSession();
  if (!session) throw new Error("Non autorisé");

  const { debut: debutMois, fin: finMois } = getMoisCourantBornes();
  const { debutJour, finJour } = getAujourdhuiBornes();

  // Bornes pour les 12 derniers mois (acquisition chart)
  const debut12mois = new Date();
  debut12mois.setMonth(debut12mois.getMonth() - 11);
  debut12mois.setDate(1);
  debut12mois.setHours(0, 0, 0, 0);

  const [
    totalLeads,
    nouveauxCeMois,
    relancesDuJour,
    leadsEnRetard,
    groupByEtape,
    conclusTotal,
    bilanConclus,
    bilanPerdus,
    leadsAvecTitulaire,
    leadsSansTitulaire,
    leadsFor12Months,
    rawProchainesActions,
  ] = await Promise.all([
    prisma.lead.count(),

    prisma.lead.count({
      where: { dateSaisie: { gte: debutMois, lt: finMois } },
    }),

    prisma.action.count({
      where: { type: "relance", done: false, date: { gte: debutJour, lt: finJour } },
    }),

    prisma.lead.count({
      where: { actions: { some: { done: false, date: { lt: debutJour } } } },
    }),

    prisma.lead.groupBy({
      by: ["etape"],
      _count: { _all: true },
      orderBy: { etape: "asc" },
    }),

    prisma.lead.count({ where: { etape: "vendu_loue" } }),

    prisma.lead.count({
      where: { etape: "vendu_loue", dateSaisie: { gte: debutMois, lt: finMois } },
    }),

    prisma.lead.count({
      where: { etape: "perdu", dateSaisie: { gte: debutMois, lt: finMois } },
    }),

    prisma.lead.groupBy({
      by: ["titulaireId"],
      where: { titulaireId: { not: null } },
      _count: { _all: true },
    }),

    prisma.lead.count({ where: { titulaireId: null } }),

    // Données pour le graphique d'acquisition (12 derniers mois)
    prisma.lead.findMany({
      where: { dateSaisie: { gte: debut12mois } },
      select: { dateSaisie: true },
    }),

    // Prochaines 6 actions non faites
    prisma.action.findMany({
      where: { done: false },
      orderBy: { date: "asc" },
      take: 6,
      include: {
        lead: {
          select: {
            id: true,
            prenom: true,
            nom: true,
            typeLogement: true,
            titulaire: { select: { id: true, prenom: true, nom: true } },
          },
        },
      },
    }),
  ]);

  // ── Commerciaux ──────────────────────────────────────────────────────────────
  const titulaireIds = leadsAvecTitulaire
    .map((g) => g.titulaireId)
    .filter((id): id is string => id !== null);

  const commerciaux = await prisma.user.findMany({
    where: { id: { in: titulaireIds } },
    select: { id: true, nom: true, prenom: true },
  });

  const commerciauxMap = new Map(commerciaux.map((u) => [u.id, u]));

  const leadsParCommercial: LeadsParCommercial[] = [
    ...leadsAvecTitulaire.map((groupe) => {
      const user = commerciauxMap.get(groupe.titulaireId!);
      return {
        titulaireId: groupe.titulaireId,
        nom: user?.nom ?? "Inconnu",
        prenom: user?.prenom ?? "",
        count: groupe._count._all,
      };
    }),
    ...(leadsSansTitulaire > 0
      ? [{ titulaireId: null, nom: "Non assigné", prenom: "", count: leadsSansTitulaire }]
      : []),
  ].sort((a, b) => b.count - a.count);

  // ── Pipeline par étape ───────────────────────────────────────────────────────
  const leadsParEtape: LeadsParEtape[] = groupByEtape.map((g) => ({
    etape: g.etape,
    count: g._count._all,
  }));

  // ── Taux de transformation ───────────────────────────────────────────────────
  const tauxTransformation =
    totalLeads > 0 ? parseFloat(((conclusTotal / totalLeads) * 100).toFixed(2)) : 0;

  // ── Acquisition par mois (12 derniers mois) ───────────────────────────────────
  const MOIS_FR = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];
  const acquisitionParMois: AcquisitionPoint[] = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(debut12mois.getFullYear(), debut12mois.getMonth() + i, 1);
    return { label: MOIS_FR[d.getMonth()], count: 0 };
  });

  for (const lead of leadsFor12Months) {
    const d = new Date(lead.dateSaisie);
    const diffMonths =
      (d.getFullYear() - debut12mois.getFullYear()) * 12 +
      (d.getMonth() - debut12mois.getMonth());
    if (diffMonths >= 0 && diffMonths < 12) {
      acquisitionParMois[diffMonths].count++;
    }
  }

  // ── Prochaines actions ────────────────────────────────────────────────────────
  const prochainesActions: ProchaineAction[] = rawProchainesActions.map((a) => ({
    id: a.id,
    type: a.type,
    date: a.date,
    leadId: a.lead.id,
    leadPrenom: a.lead.prenom,
    leadNom: a.lead.nom,
    leadType: a.lead.typeLogement,
    titulaireId: a.lead.titulaire?.id ?? null,
    titulairePrenom: a.lead.titulaire?.prenom ?? null,
    titulaireNom: a.lead.titulaire?.nom ?? null,
  }));

  return {
    totalLeads,
    nouveauxCeMois,
    relancesDuJour,
    leadsEnRetard,
    leadsParCommercial,
    leadsParEtape,
    tauxTransformation,
    bilanMensuel: { conclus: bilanConclus, perdus: bilanPerdus },
    acquisitionParMois,
    prochainesActions,
  };
}
