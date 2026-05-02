import "server-only";

import { createClient } from "@supabase/supabase-js";

/**
 * Supabase admin client — uses the service-role key and therefore bypasses
 * Row Level Security. NEVER import this from a Client Component, browser code,
 * or any module that could be bundled into the client.
 *
 * The leading `import "server-only"` makes any client-side import fail at
 * build time (Next 16 aliases the package internally; no install required).
 *
 * Use cases (Server Actions / Route Handlers only):
 *  - Cleaning up orphan auth.users rows after a failed Prisma create.
 *  - Admin-only operations on Supabase Auth (delete user, force password reset).
 *
 * We intentionally use `@supabase/supabase-js` rather than `@supabase/ssr`:
 * the admin client is stateless, cookie-less, and must not piggy-back on the
 * request's auth context — it operates with full service-role privileges.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing Supabase admin env vars: NEXT_PUBLIC_SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY"
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
