"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/app/lib/session";

export type CalendarAction = {
  id: string;
  type: "appel" | "email" | "rdv" | "visite" | "relance";
  date: string;
  done: boolean;
  lead: {
    id: string;
    prenom: string;
    nom: string;
    titulaire: { prenom: string; nom: string } | null;
  };
};

export async function getActionsCalendrier(
  annee: number,
  mois: number,
  tousLesCommerciaux: boolean
): Promise<{ actions: CalendarAction[]; error?: string }> {
  const session = await getSession();
  if (!session) return { actions: [], error: "Non authentifié." };

  if (mois < 1 || mois > 12 || annee < 2000 || annee > 2100) {
    return { actions: [], error: "Période invalide." };
  }

  // Use UTC to avoid timezone drift at month boundaries on non-UTC servers
  const debut = new Date(Date.UTC(annee, mois - 1, 1));
  const fin = new Date(Date.UTC(annee, mois, 1) - 1);

  const showAll = session.role === "admin" && tousLesCommerciaux;
  const leadFilter = showAll
    ? undefined
    : { OR: [{ titulaireId: session.userId }, { titulaireId: null }] };

  try {
    const actions = await prisma.action.findMany({
      where: {
        done: false,
        date: { gte: debut, lte: fin },
        ...(leadFilter ? { lead: leadFilter } : {}),
      },
      include: {
        lead: {
          select: {
            id: true,
            prenom: true,
            nom: true,
            titulaire: { select: { prenom: true, nom: true } },
          },
        },
      },
      orderBy: { date: "asc" },
    });

    return {
      actions: actions.map((a) => ({
        id: a.id,
        type: a.type,
        date: a.date.toISOString(),
        done: a.done,
        lead: {
          id: a.lead.id,
          prenom: a.lead.prenom,
          nom: a.lead.nom,
          titulaire: a.lead.titulaire,
        },
      })),
    };
  } catch {
    return { actions: [], error: "Erreur lors du chargement du calendrier." };
  }
}
