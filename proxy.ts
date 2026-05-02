import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Root proxy (Next.js 16, formerly `middleware.ts`).
 *
 * Sole responsibility: refresh the Supabase auth session cookies on every
 * matched request. Authorization (redirects for unauthenticated users,
 * role checks, etc.) is handled inside pages and Server Actions via
 * `getSession()`.
 */
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     *  - _next/static  (static build assets)
     *  - _next/image   (Next image optimization)
     *  - favicon.ico
     *  - common static asset extensions (svg, png, jpg, jpeg, gif, webp, ico)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
