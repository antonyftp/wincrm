import { cache } from "react";
import { Role, UserStatut } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export type SessionPayload = {
  userId: string;
  role: Role;
  statut: UserStatut;
  expiresAt: Date;
};

const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Returns the authenticated session for the current request, or `null`.
 *
 * - The `userId` returned is the Prisma User CUID (NOT the Supabase Auth UUID).
 *   Downstream consumers (15+ files) rely on this to query their own tables.
 * - We use `supabase.auth.getUser()` (not `getSession()`) because only
 *   `getUser()` makes a server round-trip and is therefore trustable.
 * - If Supabase says the user is authenticated but no Prisma row exists,
 *   we treat the session as invalid (returns `null`). This protects against
 *   stale tokens after manual user deletion.
 *
 * The `expiresAt` field is informative only (Supabase manages real cookie
 * expiry server-side); we return `now + 7d` as a stable placeholder.
 */
export const getSession = cache(async (): Promise<SessionPayload | null> => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
    select: { id: true, role: true, statut: true },
  });

  // Reject any user whose account is not currently `actif` (en_attente, refuse,
  // inactif). Centralising the check here means an admin disabling an account
  // takes effect on the next request — without it, downstream `session != null`
  // guards would let a revoked user keep working until their Supabase session
  // expires (up to ~1h by default, longer with refresh tokens).
  if (!dbUser || dbUser.statut !== "actif") return null;

  return {
    userId: dbUser.id,
    role: dbUser.role,
    statut: dbUser.statut,
    expiresAt: new Date(Date.now() + SESSION_DURATION_MS),
  };
});
