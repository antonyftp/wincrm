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

export type DashboardData = {
  totalLeads: number;
  nouveauxCeMois: number;
  relancesDuJour: number;
  leadsEnRetard: number;
  leadsParCommercial: LeadsParCommercial[];
  leadsParEtape: LeadsParEtape[];
  tauxTransformation: number;
  bilanMensuel: BilanMensuel;
};

// ─── Helper: bornes du mois courant ──────────────────────────────────────────

function getMoisCourantBornes(): { debut: Date; fin: Date } {
  const now = new Date();
  const debut = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  const fin = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0, 0);
  return { debut, fin };
}

// ─── Helper: bornes du jour courant ──────────────────────────────────────────

function getAujourdhuiBornes(): { debutJour: Date; finJour: Date } {
  const now = new Date();
  const debutJour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const finJour = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
  return { debutJour, finJour };
}

// ─── Server Action ────────────────────────────────────────────────────────────

export async function getDashboardData(): Promise<DashboardData> {
  const session = await getSession();
  if (!session) throw new Error("Non autorisé");

  const { debut: debutMois, fin: finMois } = getMoisCourantBornes();
  const { debutJour, finJour } = getAujourdhuiBornes();
  const maintenant = new Date();

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
  ] = await Promise.all([
    // KPI 1 — Total leads tous statuts
    prisma.lead.count(),

    // KPI 2 — Leads nouveaux ce mois (dateSaisie dans le mois courant)
    prisma.lead.count({
      where: {
        dateSaisie: { gte: debutMois, lt: finMois },
      },
    }),

    // KPI 3 — Relances du jour (type relance, date = aujourd'hui, done = false)
    prisma.action.count({
      where: {
        type: "relance",
        done: false,
        date: { gte: debutJour, lt: finJour },
      },
    }),

    // KPI 4 — Leads en retard (actions non faites dont date < aujourd'hui)
    // Compte le nombre de leads distincts ayant au moins une action en retard
    prisma.lead.count({
      where: {
        actions: {
          some: {
            done: false,
            date: { lt: debutJour },
          },
        },
      },
    }),

    // KPI 6 — Répartition par étape
    prisma.lead.groupBy({
      by: ["etape"],
      _count: { _all: true },
      orderBy: { etape: "asc" },
    }),

    // KPI 7 — Nombre de leads conclus (pour taux de transformation)
    prisma.lead.count({
      where: { etape: "conclu" },
    }),

    // KPI 8 — Bilan mois : conclus
    prisma.lead.count({
      where: {
        etape: "conclu",
        dateSaisie: { gte: debutMois, lt: finMois },
      },
    }),

    // KPI 8 — Bilan mois : perdus
    prisma.lead.count({
      where: {
        etape: "perdu",
        dateSaisie: { gte: debutMois, lt: finMois },
      },
    }),

    // KPI 5 — Leads avec titulaire (groupBy titulaireId + infos user)
    prisma.lead.groupBy({
      by: ["titulaireId"],
      where: { titulaireId: { not: null } },
      _count: { _all: true },
    }),

    // KPI 5 — Leads sans titulaire assigné
    prisma.lead.count({
      where: { titulaireId: null },
    }),
  ]);

  // ── KPI 5 : enrichir les groupes avec les noms des commerciaux ─────────────
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
    // Ajouter les non assignés si pertinent
    ...(leadsSansTitulaire > 0
      ? [
          {
            titulaireId: null,
            nom: "Non assigné",
            prenom: "",
            count: leadsSansTitulaire,
          },
        ]
      : []),
  ].sort((a, b) => b.count - a.count);

  // ── KPI 6 : formater la répartition par étape ──────────────────────────────
  const leadsParEtape: LeadsParEtape[] = groupByEtape.map((g) => ({
    etape: g.etape,
    count: g._count._all,
  }));

  // ── KPI 7 : taux de transformation ────────────────────────────────────────
  const tauxTransformation =
    totalLeads > 0
      ? parseFloat(((conclusTotal / totalLeads) * 100).toFixed(2))
      : 0;

  return {
    totalLeads,
    nouveauxCeMois,
    relancesDuJour,
    leadsEnRetard,
    leadsParCommercial,
    leadsParEtape,
    tauxTransformation,
    bilanMensuel: {
      conclus: bilanConclus,
      perdus: bilanPerdus,
    },
  };
}
