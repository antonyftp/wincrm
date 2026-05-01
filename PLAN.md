# Plan de construction — WIN CRM

## Stack technique

- **Framework** : Next.js 16.2.4 (App Router) + TypeScript
- **Style** : TailwindCSS 4
- **Base de données** : Supabase (PostgreSQL hébergé, compatible Vercel)
- **Auth** : NextAuth.js v5 avec credentials provider
- **ORM** : Prisma
- **Déploiement** : Vercel

---

## Règles de travail

- Validation obligatoire avant de démarrer chaque phase
- Aucun code écrit sans validation préalable
- En cas d'interruption, reprendre à la dernière phase marquée `[ ]`
- Utiliser les agents mentionnés pour chaque phase
- Lancer `npm run build` à la fin de chaque phase et corriger toutes les erreurs avant de continuer
- Utiliser l'agent `Code Reviewer` après chaque phase de développement pour analyser le travail réalisé
- Mettre à jour ce fichier `PLAN.md` à la fin de chaque phase (statut + tableau récapitulatif)

---

## Phases

### Phase 1 — Infrastructure & Base de données
**Statut** : `[x] Terminé`

**Objectif** : Poser les fondations techniques du projet.

**Travaux :**
- Installation des dépendances : Prisma, Supabase, NextAuth v5, bcrypt
- Définition du schéma Prisma complet :
  - `User` (id, nom, prénom, email, mot de passe hashé, rôle, statut)
  - `Lead` (infos générales, coordonnées, projet immobilier, suivi)
  - `Comment` (commentaire horodaté lié à un lead)
  - `Action` (prochaine action planifiée)
  - `Visit` (bien visité + date)
- Migration initiale de la base de données
- Configuration des variables d'environnement

**Agent** : `Backend Architect`

---

### Phase 2 — Authentification & Gestion des utilisateurs
**Statut** : `[x] Terminé`

**Objectif** : Système complet de login, inscription et validation admin.

**Travaux :**
- Page `/` = page de login (email + mot de passe)
- Page `/register` = inscription publique avec création de compte en statut `en_attente`
- Message informatif affiché à l'utilisateur après inscription
- Middleware de protection des routes (redirect si non authentifié)
- Blocage de l'accès si statut ≠ `actif`
- Gestion des rôles : `admin` / `commercial`

**Statuts utilisateur :**

| Statut | Description |
|---|---|
| `en_attente` | Inscription soumise, en attente de validation admin |
| `actif` | Compte validé, accès complet selon le rôle |
| `inactif` | Compte désactivé par un admin |
| `refuse` | Inscription rejetée par un admin |

**Agent** : `Security Engineer`

---

### Phase 3 — CRUD Leads
**Statut** : `[x] Terminé`

**Objectif** : Créer, lire, modifier, supprimer un lead.

**Travaux :**
- Formulaire de création/modification avec tous les champs (sections 2.1 à 2.4 du CDC)
- Menus déroulants pour les champs à valeurs fixes (état, étape, type logement, etc.)
- Liste des leads avec affichage tabulaire
- Page de détail d'un lead
- Suppression avec confirmation
- Affectation d'un lead à un commercial
- Coloration dynamique : **vert** (état positif) / **rouge** (état négatif)

**Agents** : `Frontend Developer` + `Senior Developer`

---

### Phase 4 — Recherche, Filtres & Pipeline
**Statut** : `[x] Terminé`

**Objectif** : Navigation efficace dans les leads.

**Travaux :**
- Barre de recherche : nom, prénom, téléphone, email, commercial, statut, date
- Filtres : commercial assigné, état, étape, type logement, nature (achat/location)
- Tri : date de saisie, titulaire, état, étape, date prochaine action, type logement
- Vue Pipeline Kanban (10 étapes visuelles)

**Étapes du pipeline :**
1. Nouveau contact
2. Contact en attente de qualification
3. Contact qualifié — Besoin identifié
4. Biens proposés
5. Visite programmée
6. Visite effectuée
7. Relance après visite
8. Offre / Négociation
9. Vente ou location conclue ✅
10. Dossier perdu / Abandonné ❌

**Agent** : `Frontend Developer`

---

### Phase 5 — Suivi commercial & Historique
**Statut** : `[x] Terminé`

**Objectif** : Traçabilité complète des actions sur chaque lead.

**Travaux :**
- Timeline d'historique par lead (appels, emails, RDV, visites)
- Ajout de commentaires horodatés
- Liste des biens/appartements visités avec dates
- Planification de la prochaine action (type + date/heure)
- Affichage des leads à relancer aujourd'hui et en retard

**Agents** : `Backend Architect` + `Frontend Developer`

---

### Phase 6 — Tableau de bord (Dashboard)
**Statut** : `[x] Terminé`

**Objectif** : Vue synthétique des KPIs commerciaux.

**Travaux :**
- Compteurs : total leads, leads nouveaux ce mois, relances du jour, leads en retard
- Graphique répartition par commercial
- Graphique répartition par étape
- Taux de transformation (leads en vente/location conclue)
- Bilan contacts gagnés/perdus (mensuel ou global)

**Agents** : `Analytics Reporter` + `UI Designer`

---

### Phase 7 — Exports
**Statut** : `[ ] À faire`

**Objectif** : Extraction des données en formats bureautiques.

**Travaux :**
- Export **Excel (.xlsx)** : liste complète des leads avec filtres appliqués
- Export **PDF** : fiche individuelle d'un client
- Librairies : `exceljs` + `@react-pdf/renderer`

**Agent** : `Backend Architect`

---

### Phase 8 — Espace Admin
**Statut** : `[ ] À faire`

**Objectif** : Gestion des utilisateurs et des inscriptions.

**Travaux :**
- Liste des comptes en attente de validation
- Approuver / Rejeter une inscription
- Gérer les statuts : `actif` / `inactif` / `refuse`
- Liste complète des utilisateurs avec modification des rôles

**Agent** : `Senior Developer`

---

### Phase 9 — Finitions & Déploiement
**Statut** : `[ ] À faire`

**Objectif** : Application prête pour la production.

**Travaux :**
- Responsivité mobile complète
- Tests des flux critiques (auth, CRUD, exports)
- Configuration Vercel + variables d'environnement de production
- Création du compte Supabase de production
- Déploiement final

**Agent** : `DevOps Automator`

---

## Récapitulatif

| Phase | Contenu | Agent principal | Statut |
|---|---|---|---|
| 1 | Infrastructure & DB | Backend Architect | `[x]` |
| 2 | Auth & Utilisateurs | Security Engineer | `[x]` |
| 3 | CRUD Leads | Frontend Developer + Senior Developer | `[x]` |
| 4 | Recherche & Pipeline | Frontend Developer | `[x]` |
| 5 | Suivi & Historique | Backend Architect + Frontend Developer | `[x]` |
| 6 | Dashboard KPIs | Analytics Reporter + UI Designer | `[x]` |
| 7 | Exports Excel/PDF | Backend Architect | `[ ]` |
| 8 | Espace Admin | Senior Developer | `[ ]` |
| 9 | Finitions & Déploiement | DevOps Automator | `[ ]` |
