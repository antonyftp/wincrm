"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/app/lib/session";
import { ActionType } from "@prisma/client";

const ACTION_TYPES = new Set<string>(["appel", "email", "rdv", "visite", "relance"]);

async function canAccessLead(
  leadId: string,
  userId: string,
  role: string
): Promise<{ titulaireId: string | null } | null> {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    select: { titulaireId: true },
  });
  if (!lead) return null;
  if (role === "admin") return lead;
  if (lead.titulaireId !== null && lead.titulaireId !== userId) return null;
  return lead;
}

// ─── Comments ────────────────────────────────────────────────────────────────

export async function addComment(
  leadId: string,
  content: string
): Promise<{ error?: string }> {
  const session = await getSession();
  if (!session) return { error: "Non authentifié." };

  const trimmed = content.trim();
  if (!trimmed) return { error: "Le commentaire ne peut pas être vide." };
  if (trimmed.length > 2000) return { error: "Le commentaire ne peut pas dépasser 2000 caractères." };

  const lead = await canAccessLead(leadId, session.userId, session.role);
  if (!lead) return { error: "Lead introuvable ou accès refusé." };

  try {
    await prisma.comment.create({
      data: { content: trimmed, leadId, authorId: session.userId },
    });
    return {};
  } catch {
    return { error: "Erreur lors de l'ajout du commentaire." };
  }
}

export async function deleteComment(
  commentId: string
): Promise<{ error?: string }> {
  const session = await getSession();
  if (!session) return { error: "Non authentifié." };

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: {
      authorId: true,
      lead: { select: { titulaireId: true } },
    },
  });
  if (!comment) return { error: "Commentaire introuvable." };

  const { titulaireId } = comment.lead;
  const hasLeadAccess =
    session.role === "admin" ||
    titulaireId === null ||
    titulaireId === session.userId;

  if (!hasLeadAccess) return { error: "Accès refusé." };

  if (session.role !== "admin" && comment.authorId !== session.userId) {
    return { error: "Seul l'auteur peut supprimer son commentaire." };
  }

  try {
    await prisma.comment.delete({ where: { id: commentId } });
    return {};
  } catch {
    return { error: "Erreur lors de la suppression du commentaire." };
  }
}

// ─── Visits ──────────────────────────────────────────────────────────────────

export async function addVisit(
  leadId: string,
  bien: string,
  dateVisite: string
): Promise<{ error?: string }> {
  const session = await getSession();
  if (!session) return { error: "Non authentifié." };

  const bienTrimmed = bien.trim();
  if (!bienTrimmed) return { error: "Le bien ne peut pas être vide." };

  const parsed = new Date(dateVisite);
  if (isNaN(parsed.getTime())) return { error: "Date de visite invalide." };

  const lead = await canAccessLead(leadId, session.userId, session.role);
  if (!lead) return { error: "Lead introuvable ou accès refusé." };

  try {
    await prisma.visit.create({
      data: { bien: bienTrimmed, dateVisite: parsed, leadId },
    });
    return {};
  } catch {
    return { error: "Erreur lors de l'ajout de la visite." };
  }
}

export async function deleteVisit(
  visitId: string
): Promise<{ error?: string }> {
  const session = await getSession();
  if (!session) return { error: "Non authentifié." };

  const visit = await prisma.visit.findUnique({
    where: { id: visitId },
    select: { lead: { select: { titulaireId: true } } },
  });
  if (!visit) return { error: "Visite introuvable." };

  const { titulaireId } = visit.lead;
  if (
    session.role !== "admin" &&
    titulaireId !== null &&
    titulaireId !== session.userId
  ) {
    return { error: "Accès refusé." };
  }

  try {
    await prisma.visit.delete({ where: { id: visitId } });
    return {};
  } catch {
    return { error: "Erreur lors de la suppression de la visite." };
  }
}

// ─── Actions ─────────────────────────────────────────────────────────────────

export async function planifierAction(
  leadId: string,
  type: string,
  date: string
): Promise<{ error?: string }> {
  const session = await getSession();
  if (!session) return { error: "Non authentifié." };

  if (!ACTION_TYPES.has(type)) return { error: "Type d'action invalide." };

  const parsed = new Date(date);
  if (isNaN(parsed.getTime())) return { error: "Date invalide." };

  const lead = await canAccessLead(leadId, session.userId, session.role);
  if (!lead) return { error: "Lead introuvable ou accès refusé." };

  try {
    await prisma.action.create({
      data: { type: type as ActionType, date: parsed, leadId, done: false },
    });
    return {};
  } catch {
    return { error: "Erreur lors de la planification de l'action." };
  }
}

export async function completerAction(
  actionId: string
): Promise<{ error?: string }> {
  const session = await getSession();
  if (!session) return { error: "Non authentifié." };

  const action = await prisma.action.findUnique({
    where: { id: actionId },
    select: { lead: { select: { titulaireId: true } } },
  });
  if (!action) return { error: "Action introuvable." };

  const { titulaireId } = action.lead;
  if (
    session.role !== "admin" &&
    titulaireId !== null &&
    titulaireId !== session.userId
  ) {
    return { error: "Accès refusé." };
  }

  try {
    await prisma.action.update({ where: { id: actionId }, data: { done: true } });
    return {};
  } catch {
    return { error: "Erreur lors de la mise à jour de l'action." };
  }
}

export async function supprimerAction(
  actionId: string
): Promise<{ error?: string }> {
  const session = await getSession();
  if (!session) return { error: "Non authentifié." };

  const action = await prisma.action.findUnique({
    where: { id: actionId },
    select: { lead: { select: { titulaireId: true } } },
  });
  if (!action) return { error: "Action introuvable." };

  const { titulaireId } = action.lead;
  if (
    session.role !== "admin" &&
    titulaireId !== null &&
    titulaireId !== session.userId
  ) {
    return { error: "Accès refusé." };
  }

  try {
    await prisma.action.delete({ where: { id: actionId } });
    return {};
  } catch {
    return { error: "Erreur lors de la suppression de l'action." };
  }
}

// ─── Leads à relancer ─────────────────────────────────────────────────────────

export async function getLeadsARelancer() {
  const session = await getSession();
  if (!session) return { error: "Non authentifié.", retard: [], aujourdhui: [] };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const titulaireSelect = { select: { id: true, nom: true, prenom: true } } as const;

  const permissionFilter =
    session.role === "admin"
      ? {}
      : { OR: [{ titulaireId: session.userId }, { titulaireId: null }] };

  try {
    const [leadsEnRetard, leadsAujourdhui] = await Promise.all([
      prisma.lead.findMany({
        where: {
          ...permissionFilter,
          actions: { some: { done: false, date: { lt: today } } },
        },
        include: {
          titulaire: titulaireSelect,
          actions: {
            where: { done: false, date: { lt: today } },
            orderBy: { date: "asc" },
          },
        },
      }),
      prisma.lead.findMany({
        where: {
          ...permissionFilter,
          actions: { some: { done: false, date: { gte: today, lt: tomorrow } } },
        },
        include: {
          titulaire: titulaireSelect,
          actions: {
            where: { done: false, date: { gte: today, lt: tomorrow } },
            orderBy: { date: "asc" },
          },
        },
      }),
    ]);

    return { retard: leadsEnRetard, aujourdhui: leadsAujourdhui };
  } catch {
    return { error: "Erreur lors de la récupération des leads à relancer.", retard: [], aujourdhui: [] };
  }
}
