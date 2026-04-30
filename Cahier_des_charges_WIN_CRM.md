# Cahier des charges — WIN CRM
> Application de suivi des leads commerciaux — Activité immobilière

---

## 1. Objectif

Créer un CRM de suivi des leads commerciaux pour une activité immobilière, permettant de :

- Centraliser les contacts et leads
- Suivre leur avancement commercial
- Historiser les actions réalisées
- Programmer les prochaines étapes avec rappel

---

## 2. Fiche contact / lead

Chaque lead devra comporter les champs suivants.

### 2.1 Informations générales

| Champ | Description |
|---|---|
| Date de saisie | Date de création du contact |
| Titulaire | Commercial en charge du lead |
| État du lead | Voir valeurs possibles ci-dessous |
| Étape d'avancement | Étape commerciale en cours |

**Valeurs d'état du lead :**
- Nouveau
- Réponse envoyée
- Contacté téléphone
- Non validé
- Qualifié
- Visite effectuée
- Offre en cours
- Offre acceptée

### 2.2 Coordonnées du contact

| Champ | Type |
|---|---|
| Genre | M / Mme / Autre |
| Prénom | Texte |
| Nom | Texte |
| Âge | Nombre |
| Email | Email |
| Téléphone | Texte |
| Adresse postale | Texte |
| Situation maritale | Marié / Veuf / Célibataire / Divorcé |
| Héritier | Oui / Non |

### 2.3 Projet immobilier

| Champ | Valeurs |
|---|---|
| Nature de la recherche | Achat / Location / Investissement |
| Type de logement | Appartement / Maison / Studio / T2 / T3 / T4 / Autre |
| Budget minimum | Montant en € |
| Budget maximum | Montant en € |
| Critères spécifiques | Étage, ascenseur, parking, etc. (texte libre) |

### 2.4 Suivi commercial

| Champ | Description |
|---|---|
| Biens / appartements visités | Liste des biens présentés |
| Dates de visite | Date de chaque visite |
| Commentaires | Commentaires horodatés après chaque action |
| Historique | Appels, emails, rendez-vous, visites |
| Prochaine action prévue | Type d'action (appel, email, RDV, visite, relance) |
| Date et heure | Date et heure de la prochaine action |

---

## 3. Fonctionnalités attendues

### 3.1 Gestion des leads

- Créer, modifier et supprimer un lead
- Affecter un lead à un commercial
- Visualiser l'historique complet d'un lead
- Ajouter des commentaires horodatés après chaque action commerciale
- Coloration dynamique des leads : **vert** (état positif) / **rouge** (état négatif)

### 3.2 Recherche et filtres

Rechercher un contact par :
- Nom, prénom
- Téléphone
- Email
- Commercial assigné
- Statut / état
- Date

Classer les leads par :
- Date de saisie
- Titulaire / commercial
- État du lead
- Étape d'avancement commercial
- Date de prochaine action
- Type de logement recherché
- Nature (location ou achat)

### 3.3 Actions commerciales

- Planifier une prochaine action : appel, email, rendez-vous, visite, relance

### 3.4 Export des données

- Export **Excel** : liste complète des leads avec filtres appliqués
- Export **PDF** : fiche individuelle du client

### 3.5 Gestion des utilisateurs et authentification

**Connexion :**
- La page d'accueil de l'application (`/`) est la page de login
- Tout utilisateur non authentifié est automatiquement redirigé vers cette page
- Authentification par email et mot de passe
- Page de login sécurisée

**Inscription :**
- Page d'inscription publique accessible depuis la page de login
- L'utilisateur renseigne : nom, prénom, email, mot de passe
- À la soumission, le compte est créé en base de données avec le statut **"en attente de validation"**
- L'utilisateur ne peut pas accéder à l'application tant que son compte n'est pas validé
- Un message informatif lui indique que sa demande est en cours de traitement

**Validation par l'administrateur :**
- L'admin reçoit une notification (ou voit dans son espace) les comptes en attente de validation
- Il peut **approuver** ou **rejeter** chaque inscription
- En cas d'approbation, le statut passe à **"actif"** et l'utilisateur peut se connecter
- En cas de rejet, le compte est supprimé ou marqué comme **"refusé"**

**Statuts possibles d'un compte utilisateur :**

| Statut | Description |
|---|---|
| `en_attente` | Inscription soumise, en attente de validation admin |
| `actif` | Compte validé, accès complet selon le rôle |
| `inactif` | Compte désactivé par un admin |
| `refuse` | Inscription rejetée par un admin |

**Rôles :**
- `admin` : accès complet, gestion des utilisateurs, validation des inscriptions
- `commercial` : accès aux leads qui lui sont assignés et aux fonctionnalités de suivi

---

## 4. Tableau de bord

Le tableau de bord devra afficher :

| Indicateur | Description |
|---|---|
| Total leads | Nombre total de leads dans le CRM |
| Leads nouveaux | Leads créés ce mois |
| Relances du jour | Leads à relancer aujourd'hui |
| Leads en retard | Leads dont la date de relance est dépassée |
| Leads par commercial | Répartition par commercial assigné |
| Leads par étape | Répartition par étape commerciale |
| Taux de transformation | % de leads convertis en vente/location |
| Contacts gagnés / perdus | Bilan mensuel ou global |

---

## 5. Pipeline commercial

Les étapes d'avancement commerciales sont les suivantes (dans l'ordre) :

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

---

## 6. Spécifications techniques suggérées

| Composant | Recommandation |
|---|---|
| Framework | Next.js (dernière version stable) avec App Router |
| Hébergement | Vercel |
| Type d'application | Application web responsive (mobile + desktop) |
| Saisie | Formulaires avec menus déroulants (UX friendly) |
| Base de données | Sécurisée, avec sauvegarde automatique |
| Authentification | Email + mot de passe, inscription avec validation admin |
| Statuts utilisateur | `en_attente` / `actif` / `inactif` / `refuse` |
| Administration | Espace administrateur dédié |
| Exports | Excel (.xlsx) + PDF |

---

## 7. Résumé des modules

```
WIN CRM
├── Auth              → Login / inscription / validation admin / gestion des statuts
├── Leads             → CRUD, pipeline, coloration, filtres
├── Suivi             → Historique, commentaires, actions commerciales
├── Dashboard         → KPIs, graphiques, tableaux de bord
├── Exports           → Excel (liste) + PDF (fiche client)
└── Admin             → Gestion des utilisateurs, validation des inscriptions, droits
```
