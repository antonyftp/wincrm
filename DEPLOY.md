# Guide de déploiement — WIN CRM

Stack : Next.js 16 + Prisma v7 + Supabase + Vercel

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

### Récupérer la chaîne de connexion

Dans ton projet Supabase → **Project Settings → Database → Connection string**

Choisis l'onglet **URI** et copie l'URL. Elle ressemble à :

```
postgresql://postgres:[TON-MOT-DE-PASSE]@db.[PROJECT-REF].supabase.co:5432/postgres
```

> **Note :** Utilise le port **5432** (connexion directe). Ne pas utiliser le pooler (port 6543) pour ce projet — l'adaptateur `PrismaPg` gère lui-même le pool de connexions.

---

## Étape 2 — Générer le secret de session

Lance cette commande dans ton terminal et copie le résultat :

```bash
openssl rand -base64 32
```

---

## Étape 3 — Appliquer les migrations Prisma sur la DB de production

Crée temporairement un fichier `.env.production.local` à la racine avec les vraies valeurs :

```env
DATABASE_URL=postgresql://postgres:[MOT-DE-PASSE]@db.[PROJECT-REF].supabase.co:5432/postgres
NEXTAUTH_SECRET=[valeur générée à l'étape 2]
NEXTAUTH_URL=https://[ton-projet].vercel.app
```

Lance la migration :

```bash
npx prisma migrate deploy
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
# Colle la chaîne de connexion Supabase quand demandé

vercel env add NEXTAUTH_SECRET production
# Colle le secret généré à l'étape 2

vercel env add NEXTAUTH_URL production
# Colle l'URL de ton app, ex : https://wincrm.vercel.app
```

> L'URL Vercel définitive est disponible après le premier déploiement.  
> Si tu ne la connais pas encore, reviens ajouter `NEXTAUTH_URL` après l'étape 4c.

### 4c. Déployer en production

```bash
vercel --prod
```

Vercel exécute automatiquement `npm run build` et déploie.

---

## Étape 5 — Créer le premier compte admin

Après le déploiement, l'application est vide. Pour créer le premier utilisateur admin :

1. Va sur `https://[ton-projet].vercel.app/register`
2. Crée un compte — il sera en statut `en_attente`
3. Dans Supabase → **Table Editor → User** → passe manuellement le statut à `actif` et le rôle à `admin`

À partir de là, l'admin peut valider les autres inscriptions depuis `/admin`.

---

## Vérifications post-déploiement

- [ ] `/login` — connexion avec le compte admin
- [ ] `/leads/nouveau` — création d'un lead
- [ ] `/leads` → Exporter Excel — téléchargement du fichier `.xlsx`
- [ ] `/leads/[id]` → Exporter PDF — téléchargement du fichier `.pdf`
- [ ] `/admin` — validation d'une inscription en attente
- [ ] Navigation mobile — menu hamburger fonctionnel

---

## Variables d'environnement récapitulées

| Variable | Description | Exemple |
|---|---|---|
| `DATABASE_URL` | Connexion directe Supabase (port 5432) | `postgresql://postgres:***@db.xxx.supabase.co:5432/postgres` |
| `NEXTAUTH_SECRET` | Clé de chiffrement des sessions JWT | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | URL publique de l'application | `https://wincrm.vercel.app` |
