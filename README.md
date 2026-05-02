# WIN CRM

CRM immobilier interne — gestion des leads, suivi commercial, pipeline et exports.

## Stack

- Next.js 16 (App Router) + TypeScript
- Prisma 7 + Supabase Postgres
- Supabase Auth (email/password)
- TailwindCSS 4
- Déploiement Vercel

## Démarrage local

```bash
npm install
cp .env.local.example .env.local  # remplir les valeurs Supabase
npx prisma db push
npm run dev
```

L'app tourne sur `http://localhost:3000`.

## Documentation

- [PLAN.md](./PLAN.md) — phases de construction
- [DEPLOY.md](./DEPLOY.md) — guide de déploiement Vercel + Supabase
- [Cahier_des_charges_WIN_CRM.md](./Cahier_des_charges_WIN_CRM.md) — spécifications fonctionnelles
- [AGENTS.md](./AGENTS.md) — notes pour les agents IA collaborant sur le projet
