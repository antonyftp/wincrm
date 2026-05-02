# Guide de déploiement — WIN CRM

Stack : Next.js 16 + Prisma v7 + Supabase (Postgres + Auth) + Vercel

---

## Prérequis

- Compte [Supabase](https://supabase.com) (gratuit suffisant)
- Compte [Vercel](https://vercel.com) (gratuit suffisant)
- CLI Vercel installé : `npm i -g vercel`
- Repo Git poussé sur GitHub / GitLab / Bitbucket

---

## Étape 1 — Créer le projet Supabase de production

1. Connecte-toi sur [supabase.com](https://supabase.com) → **New project**
2. Choisis une région proche (ex : **West EU — Ireland**)
3. Note le **mot de passe de la base** que tu saisis à la création (non récupérable après)
4. Attends ~2 min que le projet s'initialise

### Récupérer la chaîne de connexion DB

Dans ton projet Supabase → **Project Settings → Database → Connection string**

Choisis l'onglet **URI** et copie l'URL. Elle ressemble à :

```
postgresql://postgres:[TON-MOT-DE-PASSE]@db.[PROJECT-REF].supabase.co:5432/postgres
```

> **Note :** Utilise le port **5432** (connexion directe). Ne pas utiliser le pooler (port 6543) pour ce projet — l'adaptateur `PrismaPg` gère lui-même le pool de connexions.

### Récupérer les clés Supabase Auth

Dans ton projet Supabase → **Project Settings → API** :

- **Project URL** → valeur de `NEXT_PUBLIC_SUPABASE_URL`
- **Project API keys → `anon` `public`** → valeur de `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Project API keys → `service_role` `secret`** → valeur de `SUPABASE_SERVICE_ROLE_KEY`

> ⚠️ La clé `service_role` ne doit **jamais** être exposée côté client (pas de préfixe `NEXT_PUBLIC_`). Elle sert uniquement aux opérations serveur sensibles.

---

## Étape 2 — Configurer Supabase Auth

Dans le Dashboard Supabase :

1. **Authentication → URL Configuration**
   - **Site URL** : `https://[ton-projet].vercel.app`
   - **Redirect URLs** : ajouter `https://[ton-projet].vercel.app/**` et `http://localhost:3000/**` (pour le dev local)
2. **Authentication → Providers → Email**
   - **Désactiver « Confirm email »** (sinon `signUp` n'authentifie pas immédiatement, ce qui casse le flux d'inscription du CRM)
   - Conserver **Email/Password** activé

> Le workflow d'approbation admin est géré côté application via le champ `User.statut` (`en_attente` / `actif` / `inactif` / `refuse`), pas par Supabase Auth.

---

## Étape 3 — Appliquer les migrations Prisma sur la DB de production

Crée temporairement un fichier `.env.production.local` à la racine avec les vraies valeurs :

```env
DATABASE_URL=postgresql://postgres:[MOT-DE-PASSE]@db.[PROJECT-REF].supabase.co:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT-REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon key copiée à l'étape 1]
SUPABASE_SERVICE_ROLE_KEY=[service role key copiée à l'étape 1]
```

Applique le schéma :

```bash
npx prisma db push
```

> Prisma lit `DATABASE_URL` depuis `.env.production.local` via `prisma.config.ts`.
> Ce fichier est ignoré par git — ne le commite pas.

Supprime `.env.production.local` une fois la migration appliquée (les variables seront dans Vercel).

---

## Étape 4 — Configurer et déployer sur Vercel

### 4a. Lier le projet

```bash
vercel link
```

Suis les instructions : choisis ton organisation, crée un nouveau projet ou lie à un existant.

### 4b. Ajouter les variables d'environnement

```bash
vercel env add DATABASE_URL production
# Colle la chaîne de connexion Supabase

vercel env add NEXT_PUBLIC_SUPABASE_URL production
# Colle l'URL du projet Supabase

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
# Colle la clé anon

vercel env add SUPABASE_SERVICE_ROLE_KEY production
# Colle la clé service_role
```

> Astuce : tu peux aussi ajouter ces variables depuis le Dashboard Vercel → **Project Settings → Environment Variables**.
> Les variables `NEXT_PUBLIC_*` sont automatiquement exposées côté client par Next.js.

### 4c. Déployer en production

```bash
vercel --prod
```

Vercel exécute automatiquement `npm run build` (qui fait `prisma generate && next build`) et déploie.

---

## Étape 5 — Créer le premier compte admin

Après le déploiement, l'application est vide. Pour créer le premier utilisateur admin :

1. Va sur `https://[ton-projet].vercel.app/register`
2. Crée un compte — il sera créé dans **Supabase Auth** (table `auth.users`) ET dans la table Prisma `User` avec `statut = en_attente`
3. Dans Supabase → **Table Editor → public.User** → passe manuellement :
   - `statut` → `actif`
   - `role` → `admin`
4. Reviens sur `/login` et connecte-toi avec ce compte

À partir de là, l'admin peut valider les autres inscriptions depuis `/admin`.

> ℹ️ Le lien entre Supabase Auth et la table Prisma `User` se fait via `User.supabaseId` (UUID Supabase). Le `User.id` reste un CUID Prisma utilisé comme clé étrangère par les leads, commentaires, etc.

---

## Vérifications post-déploiement

- [ ] `/register` — création d'un compte (Supabase Auth + row Prisma `en_attente`)
- [ ] `/login` — connexion avec le compte admin
- [ ] Login refusé pour un compte `en_attente` / `inactif` / `refuse` avec message métier explicite
- [ ] `/leads/nouveau` — création d'un lead
- [ ] `/leads` → Exporter Excel — téléchargement du fichier `.xlsx`
- [ ] `/leads/[id]` → Exporter PDF — téléchargement du fichier `.pdf`
- [ ] `/admin` — validation d'une inscription en attente
- [ ] `/admin` inaccessible avec un rôle `commercial` (redirect)
- [ ] Navigation mobile — menu hamburger fonctionnel
- [ ] Logout — redirection vers `/login` et session Supabase invalidée

---

## Variables d'environnement récapitulées

| Variable | Description | Exposée client | Exemple |
|---|---|---|---|
| `DATABASE_URL` | Connexion directe Supabase Postgres (port 5432) | Non | `postgresql://postgres:***@db.xxx.supabase.co:5432/postgres` |
| `NEXT_PUBLIC_SUPABASE_URL` | URL publique du projet Supabase | Oui | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé publique Supabase (auth + RLS) | Oui | `eyJhbGciOi...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé serveur (bypass RLS, opérations sensibles) | **Non** | `eyJhbGciOi...` |

> Variables retirées depuis la migration vers Supabase Auth : `NEXTAUTH_SECRET`, `NEXTAUTH_URL`.

---

## Dépannage

**`Missing Supabase env vars` au runtime** → l'une des trois clés Supabase n'est pas définie dans Vercel. Vérifie via `vercel env ls production`.

**`signUp` réussit mais `login` échoue immédiatement après** → la confirmation email est probablement encore activée dans Supabase (Auth → Providers → Email). Désactive-la.

**Login bloqué avec « Votre compte est en attente de validation »** → comportement attendu pour un nouveau compte. Passe le `statut` à `actif` dans la table Prisma `User`.

**Build Vercel échoue sur `prisma generate`** → vérifie que `DATABASE_URL` est bien définie pour l'environnement Build (pas seulement Runtime).
