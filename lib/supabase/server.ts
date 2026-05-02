import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Supabase client for server-side usage:
 *  - Server Components
 *  - Route Handlers
 *  - Server Actions
 *
 * Reads/writes auth cookies via `next/headers` `cookies()`.
 *
 * IMPORTANT: this client is bound to the current request via the cookie store.
 * Always create a fresh instance per request — never cache or share across requests.
 *
 * The `setAll` handler is wrapped in try/catch because Server Components are not
 * allowed to mutate cookies; the proxy/middleware is responsible for refreshing
 * the session in that case (see `proxy.ts`). This is the documented pattern for
 * `@supabase/ssr` and is safe to ignore here.
 */
export async function createClient() {
  const cookieStore = await cookies();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL and/or NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component — cookies cannot be mutated here.
          // Session refresh is handled by the proxy (see proxy.ts).
        }
      },
    },
  });
}
