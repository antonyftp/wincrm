# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev          # Start dev server
npm run build        # prisma generate + next build
npm run lint         # ESLint
npx prisma generate  # Regenerate Prisma client after schema changes
npx prisma migrate dev --name <name>  # Create + apply a new migration locally
supabase db push     # Push migrations to Supabase (production path)
```

No test suite exists.

## Architecture

**Stack**: Next.js 16, React 19, TypeScript, Tailwind CSS v4, Prisma v7, Supabase Auth, deployed on Vercel.

### Route groups

- `app/(auth)/` — public pages (login, register), no auth check
- `app/(app)/` — protected pages; `app/(app)/layout.tsx` calls `getSession()` and redirects to `/login` if null

Pages: `/dashboard`, `/leads`, `/leads/[id]`, `/leads/nouveau`, `/pipeline`, `/calendrier`, `/admin`.

### Auth: dual identity

Every authenticated user has **two IDs**:
- **Supabase UUID** — lives in Supabase `auth.users`, used by Supabase SDK internally
- **Prisma CUID** (`User.id`) — used everywhere in the app (Server Actions, queries, relations)

`getSession()` in `app/lib/session.ts` bridges them: verifies the Supabase token via `supabase.auth.getUser()` (server round-trip, trustable), then looks up the Prisma row by `supabaseId`. It returns `{ userId: string (CUID), role, statut }` or `null`. It is React `cache()`-wrapped — safe to call multiple times per request.

Only users with `statut === "actif"` get a valid session. `en_attente`, `refuse`, and `inactif` are rejected at `getSession()`.

### Middleware

Next.js 16 renamed `middleware.ts` → **`proxy.ts`** (export `proxy`, not `default`). The file at `proxy.ts` only refreshes Supabase session cookies. Authorization is enforced inside pages and Server Actions, not here.

### Data layer

Prisma v7 uses driver adapters — there is **no `url` in `schema.prisma`**. Instead:
- `prisma.config.ts` defines the datasource URL (reads from `DATABASE_URL` in `.env.local`)
- `lib/prisma.ts` instantiates the client with `PrismaPg` adapter (connection pool `max: 2` — Supabase free tier limit)

After any schema change: `npx prisma generate` to update the client, then create a migration and push it to Supabase.

### Server Actions

All mutations live in `app/actions/`. They always call `getSession()` first and return `{ error: string } | null` (typed as `FormState`). Role checks: admins can do everything; commercials can only access unassigned leads or leads they own (`titulaireId === session.userId`).

### Design system

Styling uses **CSS custom properties** defined in `app/globals.css` (not Tailwind classes for tokens). Key variables: `--accent` (#109ADA blue), `--bg`, `--surface`, `--text`, `--text-muted`, `--pos`/`--neg`/`--warn`/`--info` for semantic colors, `--r`/`--r-lg` for border-radius. Dark mode toggles via `[data-theme="dark"]` on the root element. Use these variables for all new UI — never hardcode colors.

Badge utility classes: `badge`, `badge pos`, `badge neg`, `badge warn`, `badge info`.

Icons: use `app/components/Icon.tsx`.

### Shared utilities

- `app/lib/labels.ts` — French display labels and badge class helpers for all Prisma enums
- `app/lib/etape-colors.ts` — color mapping for `LeadEtape`
- `app/lib/format.ts` — date/number formatting helpers

### DB migrations

SQL migrations live in `supabase/migrations/`. Use `npx supabase db push` to apply to the remote Supabase project. RLS policies are in `20260502000000_rls.sql`.
