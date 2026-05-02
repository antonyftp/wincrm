import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refreshes the Supabase auth session on every matched request.
 *
 * This helper is the single source of truth for keeping the auth cookies
 * fresh. It must be called from the root proxy (`proxy.ts`) on every page
 * navigation and Route Handler request that may surface authenticated UI.
 *
 * It does NOT enforce authorization — pages and Server Actions remain
 * responsible for calling `getSession()` and reacting accordingly.
 *
 * The implementation follows the official `@supabase/ssr` pattern: cookies
 * are read from the incoming `NextRequest`, written to both the request
 * (so downstream RSC sees the refreshed token) and the response, then a
 * single `NextResponse` is returned.
 *
 * IMPORTANT: do NOT add code between `createServerClient` and
 * `supabase.auth.getUser()` — that call is what actually triggers the token
 * refresh and the cookie write-back.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If env vars are missing, do nothing — the app will fail closed at the
  // page-level `getSession()` call.
  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        supabaseResponse = NextResponse.next({
          request,
        });
        for (const { name, value, options } of cookiesToSet) {
          supabaseResponse.cookies.set(name, value, options);
        }
      },
    },
  });

  // Triggers the token refresh + cookie write-back if needed.
  // We deliberately ignore the result here: authorization is enforced
  // downstream in pages and Server Actions.
  await supabase.auth.getUser();

  return supabaseResponse;
}
