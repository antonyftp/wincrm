"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/app/lib/session";
import { Prisma, Role, UserStatut } from "@prisma/client";

type ActionResult = { success: true } | { error: string };

const VALID_STATUTS: UserStatut[] = ["en_attente", "actif", "inactif", "refuse"];
const VALID_ROLES: Role[] = ["admin", "commercial"];

async function requireAdmin(): Promise<{ userId: string } | { error: string }> {
  const session = await getSession();
  if (!session) return { error: "Accès refusé." };
  if (session.role !== "admin") return { error: "Accès refusé." };
  if (session.statut !== "actif") return { error: "Accès refusé." };
  return { userId: session.userId };
}

export async function updateUserStatut(
  userId: string,
  statut: UserStatut
): Promise<ActionResult> {
  const auth = await requireAdmin();
  if ("error" in auth) return auth;
  if (!VALID_STATUTS.includes(statut)) return { error: "Statut invalide." };
  if (auth.userId === userId) return { error: "Impossible de modifier son propre compte." };

  try {
    await prisma.user.update({ where: { id: userId }, data: { statut } });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return { error: "Utilisateur introuvable." };
    }
    throw e;
  }
  revalidatePath("/admin");
  return { success: true };
}

export async function updateUserRole(
  userId: string,
  role: Role
): Promise<ActionResult> {
  const auth = await requireAdmin();
  if ("error" in auth) return auth;
  if (!VALID_ROLES.includes(role)) return { error: "Rôle invalide." };
  if (auth.userId === userId) return { error: "Impossible de modifier son propre compte." };

  try {
    await prisma.user.update({ where: { id: userId }, data: { role } });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return { error: "Utilisateur introuvable." };
    }
    throw e;
  }
  revalidatePath("/admin");
  return { success: true };
}
