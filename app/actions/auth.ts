"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type ActionResult = { success: true } | { error: string };

export async function register(formData: FormData): Promise<ActionResult> {
  const nom = (formData.get("nom") as string | null)?.trim() ?? "";
  const prenom = (formData.get("prenom") as string | null)?.trim() ?? "";
  const email =
    (formData.get("email") as string | null)?.trim().toLowerCase() ?? "";
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

  // Reject early if a Prisma user already exists with this email — keeps the
  // UX consistent with the legacy bcrypt-based flow.
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Un compte existe déjà avec cette adresse email." };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error || !data.user) {
    // Generic, user-facing French message — never leak Supabase internals.
    return {
      error:
        "Impossible de créer le compte. Vérifiez votre adresse email et réessayez.",
    };
  }

  try {
    await prisma.user.create({
      data: {
        nom,
        prenom,
        email,
        supabaseId: data.user.id,
        role: "commercial",
        statut: "en_attente",
      },
    });
  } catch {
    // Local row creation failed — clean up the orphan Supabase auth.users row
    // so the email can be reused. Without this, the user is stuck: Supabase
    // refuses re-registration with the same email, and Prisma has no row to
    // recover from. We swallow admin-delete errors (env var missing, network)
    // and fall back to signOut so the browser at least is not left logged in.
    try {
      const admin = createAdminClient();
      await admin.auth.admin.deleteUser(data.user.id);
    } catch {
      await supabase.auth.signOut();
    }
    return {
      error:
        "Erreur lors de la création du compte. Contactez l'administrateur.",
    };
  }

  // Force the user to go through /login once the admin has approved the
  // account. Without this, `signUp` would leave them authenticated as
  // `en_attente`, which the rest of the app rejects but is still confusing.
  await supabase.auth.signOut();

  return { success: true };
}

export async function login(formData: FormData): Promise<ActionResult> {
  const email =
    (formData.get("email") as string | null)?.trim().toLowerCase() ?? "";
  const password = (formData.get("password") as string | null) ?? "";

  if (!email || !password) {
    return { error: "Email et mot de passe requis." };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    // Do not disclose whether the account exists — same message as
    // wrong-password by design.
    return { error: "Email ou mot de passe incorrect." };
  }

  let dbUser: { id: string; role: import("@prisma/client").Role; statut: import("@prisma/client").UserStatut } | null;
  try {
    dbUser = await prisma.user.findUnique({
      where: { supabaseId: data.user.id },
      select: { id: true, role: true, statut: true },
    });
  } catch {
    // DB unreachable (pool saturation, network). Sign out so the Supabase
    // cookie isn't left in a semi-authenticated state, then return a clear
    // error instead of hanging indefinitely.
    await supabase.auth.signOut();
    return { error: "Service temporairement indisponible. Réessayez dans quelques instants." };
  }

  if (!dbUser) {
    // Inconsistent state: Supabase identity exists but no Prisma row.
    await supabase.auth.signOut();
    return { error: "Email ou mot de passe incorrect." };
  }

  if (dbUser.statut !== "actif") {
    await supabase.auth.signOut();
    if (dbUser.statut === "en_attente") {
      return {
        error:
          "Votre compte est en attente de validation par un administrateur.",
      };
    }
    if (dbUser.statut === "refuse") {
      return {
        error:
          "Votre inscription a été refusée. Contactez l'administrateur.",
      };
    }
    if (dbUser.statut === "inactif") {
      return {
        error: "Votre compte a été désactivé. Contactez l'administrateur.",
      };
    }
    return { error: "Accès refusé." };
  }

  redirect("/dashboard");
}

export async function logout(): Promise<never> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
