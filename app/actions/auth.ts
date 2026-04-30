"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession, deleteSession } from "@/app/lib/session";

type ActionResult = { success: true } | { error: string };

export async function register(formData: FormData): Promise<ActionResult> {
  const nom = (formData.get("nom") as string | null)?.trim() ?? "";
  const prenom = (formData.get("prenom") as string | null)?.trim() ?? "";
  const email = (formData.get("email") as string | null)?.trim().toLowerCase() ?? "";
  const password = (formData.get("password") as string | null) ?? "";

  if (!nom || !prenom || !email || !password) {
    return { error: "Tous les champs sont obligatoires." };
  }
  if (password.length < 8) {
    return { error: "Le mot de passe doit contenir au moins 8 caractères." };
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return { error: "Adresse email invalide." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Un compte existe déjà avec cette adresse email." };
  }

  const hashed = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      nom,
      prenom,
      email,
      password: hashed,
    },
  });

  return { success: true };
}

export async function login(formData: FormData): Promise<ActionResult> {
  const email = (formData.get("email") as string | null)?.trim().toLowerCase() ?? "";
  const password = (formData.get("password") as string | null) ?? "";

  if (!email || !password) {
    return { error: "Email et mot de passe requis." };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { error: "Email ou mot de passe incorrect." };
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return { error: "Email ou mot de passe incorrect." };
  }

  if (user.statut !== "actif") {
    if (user.statut === "en_attente") {
      return {
        error:
          "Votre compte est en attente de validation par un administrateur.",
      };
    }
    if (user.statut === "refuse") {
      return {
        error:
          "Votre inscription a été refusée. Contactez l'administrateur.",
      };
    }
    if (user.statut === "inactif") {
      return {
        error:
          "Votre compte a été désactivé. Contactez l'administrateur.",
      };
    }
    return { error: "Accès refusé." };
  }

  await createSession(user.id, user.role, user.statut);
  redirect("/dashboard");
}

export async function logout(): Promise<never> {
  await deleteSession();
  redirect("/login");
}
