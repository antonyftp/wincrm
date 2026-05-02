"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/app/lib/session";
import {
  Genre,
  LeadEtat,
  LeadEtape,
  NatureRecherche,
  SituationMaritale,
  TypeLogement,
  type Prisma,
} from "@prisma/client";

export type FormState = { error: string } | null;

export type LeadsFilters = {
  q?: string;
  commercial?: string;
  etat?: string;
  etape?: string;
  typeLogement?: string;
  natureRecherche?: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
};

const GENRES = new Set<string>(["M", "Mme", "Autre"]);
const LEAD_ETATS = new Set<string>([
  "nouveau", "reponse_envoyee", "contacte_telephone", "non_valide",
  "qualifie", "visite_effectuee", "offre_en_cours", "offre_acceptee",
]);
const LEAD_ETAPES = new Set<string>([
  "nouveau_contact", "en_attente_qualification", "qualifie", "biens_proposes",
  "visite_programmee", "visite_effectuee", "relance_apres_visite",
  "offre_negociation", "conclu", "perdu",
]);
const NATURES_RECHERCHE = new Set<string>(["achat", "location", "investissement"]);
const TYPES_LOGEMENT = new Set<string>(["appartement", "maison", "studio", "t2", "t3", "t4", "autre"]);
const SITUATIONS_MARITALES = new Set<string>(["marie", "veuf", "celibataire", "divorce"]);

const titulaireSelect = { select: { id: true, nom: true, prenom: true } } as const;

function parseOptionalInt(
  raw: FormDataEntryValue | null,
  fieldName: string
): { value: number | undefined } | { error: string } {
  const str = (raw as string | null)?.trim();
  if (!str) return { value: undefined };
  const n = Number.parseInt(str, 10);
  if (Number.isNaN(n)) return { error: `${fieldName} invalide.` };
  return { value: n };
}

function parseOptionalFloat(
  raw: FormDataEntryValue | null,
  fieldName: string
): { value: number | undefined } | { error: string } {
  const str = (raw as string | null)?.trim();
  if (!str) return { value: undefined };
  const n = Number.parseFloat(str);
  if (Number.isNaN(n)) return { error: `${fieldName} invalide.` };
  return { value: n };
}

export async function getLeads(filters: LeadsFilters = {}) {
  const session = await getSession();
  if (!session) return { error: "Non authentifié." };

  const { q, commercial, etat, etape, typeLogement, natureRecherche, sortBy, sortDir = "desc" } = filters;

  const conditions: Prisma.LeadWhereInput[] = [];

  if (session.role !== "admin") {
    conditions.push({ OR: [{ titulaireId: session.userId }, { titulaireId: null }] });
  }

  if (q) {
    const safeQ = q.trim().slice(0, 200);
    conditions.push({
      OR: [
        { nom: { contains: safeQ, mode: "insensitive" } },
        { prenom: { contains: safeQ, mode: "insensitive" } },
        { telephone: { contains: safeQ } },
        { email: { contains: safeQ, mode: "insensitive" } },
      ],
    });
  }

  // Non-admins may only filter by their own commercial ID
  if (commercial) {
    if (session.role === "admin" || commercial === session.userId) {
      conditions.push({ titulaireId: commercial });
    }
  }
  if (etat && LEAD_ETATS.has(etat)) conditions.push({ etat: etat as LeadEtat });
  if (etape && LEAD_ETAPES.has(etape)) conditions.push({ etape: etape as LeadEtape });
  if (typeLogement && TYPES_LOGEMENT.has(typeLogement)) conditions.push({ typeLogement: typeLogement as TypeLogement });
  if (natureRecherche && NATURES_RECHERCHE.has(natureRecherche)) conditions.push({ natureRecherche: natureRecherche as NatureRecherche });

  const dir = sortDir === "asc" ? "asc" : "desc";
  const SORT_FIELDS: Record<string, object> = {
    dateSaisie: { dateSaisie: dir },
    nom: { nom: dir },
    etat: { etat: dir },
    etape: { etape: dir },
    typeLogement: { typeLogement: dir },
    natureRecherche: { natureRecherche: dir },
  };
  const orderBy = sortBy && SORT_FIELDS[sortBy] ? SORT_FIELDS[sortBy] : { dateSaisie: dir };

  return prisma.lead.findMany({
    where: conditions.length > 0 ? { AND: conditions } : {},
    include: { titulaire: titulaireSelect },
    orderBy,
  });
}

export async function getLead(id: string) {
  const session = await getSession();
  if (!session) return null;

  const lead = await prisma.lead.findUnique({
    where: { id },
    include: {
      titulaire: titulaireSelect,
      comments: {
        include: { author: { select: { id: true, nom: true, prenom: true } } },
        orderBy: { createdAt: "desc" },
      },
      actions: {
        orderBy: { date: "asc" },
      },
      visits: {
        orderBy: { dateVisite: "desc" },
      },
    },
  });

  if (!lead) return null;

  if (
    session.role !== "admin" &&
    lead.titulaireId !== null &&
    lead.titulaireId !== session.userId
  ) {
    return null;
  }

  return lead;
}

export async function createLead(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await getSession();
  if (!session) return { error: "Non authentifié." };

  const genreRaw = formData.get("genre") as string | null;
  const prenom = (formData.get("prenom") as string | null)?.trim() ?? "";
  const nom = (formData.get("nom") as string | null)?.trim() ?? "";
  const natureRechercheRaw = formData.get("natureRecherche") as string | null;
  const typeLogementRaw = formData.get("typeLogement") as string | null;

  if (!genreRaw || !GENRES.has(genreRaw)) return { error: "Genre invalide." };
  if (!prenom) return { error: "Le prénom est obligatoire." };
  if (!nom) return { error: "Le nom est obligatoire." };
  if (!natureRechercheRaw || !NATURES_RECHERCHE.has(natureRechercheRaw))
    return { error: "Nature de recherche invalide." };
  if (!typeLogementRaw || !TYPES_LOGEMENT.has(typeLogementRaw))
    return { error: "Type de logement invalide." };

  const genre = genreRaw as Genre;
  const natureRecherche = natureRechercheRaw as NatureRecherche;
  const typeLogement = typeLogementRaw as TypeLogement;

  const etatRaw = formData.get("etat") as string | null;
  const etapeRaw = formData.get("etape") as string | null;
  const situationMaritaleRaw = formData.get("situationMaritale") as string | null;

  if (etatRaw && !LEAD_ETATS.has(etatRaw)) return { error: "État invalide." };
  if (etapeRaw && !LEAD_ETAPES.has(etapeRaw)) return { error: "Étape invalide." };
  if (situationMaritaleRaw && !SITUATIONS_MARITALES.has(situationMaritaleRaw))
    return { error: "Situation maritale invalide." };

  const ageResult = parseOptionalInt(formData.get("age"), "Âge");
  if ("error" in ageResult) return { error: ageResult.error };
  const budgetMinResult = parseOptionalFloat(formData.get("budgetMin"), "Budget min");
  if ("error" in budgetMinResult) return { error: budgetMinResult.error };
  const budgetMaxResult = parseOptionalFloat(formData.get("budgetMax"), "Budget max");
  if ("error" in budgetMaxResult) return { error: budgetMaxResult.error };

  const age = ageResult.value;
  const budgetMin = budgetMinResult.value;
  const budgetMax = budgetMaxResult.value;

  if (budgetMin !== undefined && budgetMax !== undefined && budgetMin > budgetMax)
    return { error: "Le budget min ne peut pas être supérieur au budget max." };

  const heritierRaw = formData.get("heritier");
  const heritier =
    heritierRaw === null ? undefined : heritierRaw === "true" || heritierRaw === "1";

  const titulaireIdRaw = formData.get("titulaireId") as string | null;
  const titulaireId = titulaireIdRaw?.trim() || undefined;

  try {
    await prisma.lead.create({
      data: {
        genre,
        prenom,
        nom,
        natureRecherche,
        typeLogement,
        ...(age !== undefined && { age }),
        ...(budgetMin !== undefined && { budgetMin }),
        ...(budgetMax !== undefined && { budgetMax }),
        ...(heritier !== undefined && { heritier }),
        ...(titulaireId && { titulaireId }),
        ...(etatRaw && { etat: etatRaw as LeadEtat }),
        ...(etapeRaw && { etape: etapeRaw as LeadEtape }),
        email: (formData.get("email") as string | null)?.trim() || undefined,
        telephone: (formData.get("telephone") as string | null)?.trim() || undefined,
        adresse: (formData.get("adresse") as string | null)?.trim() || undefined,
        situationMaritale: (situationMaritaleRaw as SituationMaritale | null) || undefined,
        criteresSpecifiques: (formData.get("criteresSpecifiques") as string | null)?.trim() || undefined,
      },
    });
  } catch {
    return { error: "Erreur lors de la création du lead." };
  }

  redirect("/leads");
}

export async function updateLead(
  id: string,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await getSession();
  if (!session) return { error: "Non authentifié." };

  const existing = await prisma.lead.findUnique({
    where: { id },
    select: { titulaireId: true },
  });
  if (!existing) return { error: "Lead introuvable." };

  if (
    session.role !== "admin" &&
    existing.titulaireId !== null &&
    existing.titulaireId !== session.userId
  ) {
    return { error: "Accès refusé." };
  }

  const genreRaw = formData.get("genre") as string | null;
  const prenom = (formData.get("prenom") as string | null)?.trim() ?? "";
  const nom = (formData.get("nom") as string | null)?.trim() ?? "";
  const natureRechercheRaw = formData.get("natureRecherche") as string | null;
  const typeLogementRaw = formData.get("typeLogement") as string | null;

  if (!genreRaw || !GENRES.has(genreRaw)) return { error: "Genre invalide." };
  if (!prenom) return { error: "Le prénom est obligatoire." };
  if (!nom) return { error: "Le nom est obligatoire." };
  if (!natureRechercheRaw || !NATURES_RECHERCHE.has(natureRechercheRaw))
    return { error: "Nature de recherche invalide." };
  if (!typeLogementRaw || !TYPES_LOGEMENT.has(typeLogementRaw))
    return { error: "Type de logement invalide." };

  const genre = genreRaw as Genre;
  const natureRecherche = natureRechercheRaw as NatureRecherche;
  const typeLogement = typeLogementRaw as TypeLogement;

  const etatRaw = formData.get("etat") as string | null;
  const etapeRaw = formData.get("etape") as string | null;
  const situationMaritaleRaw = formData.get("situationMaritale") as string | null;

  if (etatRaw && !LEAD_ETATS.has(etatRaw)) return { error: "État invalide." };
  if (etapeRaw && !LEAD_ETAPES.has(etapeRaw)) return { error: "Étape invalide." };
  if (situationMaritaleRaw && !SITUATIONS_MARITALES.has(situationMaritaleRaw))
    return { error: "Situation maritale invalide." };

  const ageResult = parseOptionalInt(formData.get("age"), "Âge");
  if ("error" in ageResult) return { error: ageResult.error };
  const budgetMinResult = parseOptionalFloat(formData.get("budgetMin"), "Budget min");
  if ("error" in budgetMinResult) return { error: budgetMinResult.error };
  const budgetMaxResult = parseOptionalFloat(formData.get("budgetMax"), "Budget max");
  if ("error" in budgetMaxResult) return { error: budgetMaxResult.error };

  const age = ageResult.value ?? null;
  const budgetMin = budgetMinResult.value ?? null;
  const budgetMax = budgetMaxResult.value ?? null;

  if (budgetMin !== null && budgetMax !== null && budgetMin > budgetMax)
    return { error: "Le budget min ne peut pas être supérieur au budget max." };

  const heritierRaw = formData.get("heritier");
  const heritier =
    heritierRaw === null ? null : heritierRaw === "true" || heritierRaw === "1";

  const titulaireIdRaw = formData.get("titulaireId") as string | null;
  const titulaireId = titulaireIdRaw?.trim() || null;

  try {
    await prisma.lead.update({
      where: { id },
      data: {
        genre,
        prenom,
        nom,
        natureRecherche,
        typeLogement,
        age,
        budgetMin,
        budgetMax,
        heritier,
        titulaireId,
        ...(etatRaw && { etat: etatRaw as LeadEtat }),
        ...(etapeRaw && { etape: etapeRaw as LeadEtape }),
        email: (formData.get("email") as string | null)?.trim() || null,
        telephone: (formData.get("telephone") as string | null)?.trim() || null,
        adresse: (formData.get("adresse") as string | null)?.trim() || null,
        situationMaritale: (situationMaritaleRaw as SituationMaritale | null) || null,
        criteresSpecifiques: (formData.get("criteresSpecifiques") as string | null)?.trim() || null,
      },
    });
  } catch {
    return { error: "Erreur lors de la mise à jour du lead." };
  }

  redirect(`/leads/${id}`);
}

export async function deleteLead(id: string): Promise<FormState> {
  const session = await getSession();
  if (!session) return { error: "Non authentifié." };
  if (session.role !== "admin") return { error: "Accès refusé." };

  try {
    await prisma.lead.delete({ where: { id } });
  } catch {
    return { error: "Lead introuvable ou déjà supprimé." };
  }

  redirect("/leads");
}

export async function getCommercials() {
  const session = await getSession();
  if (!session) return { error: "Non authentifié." };

  return prisma.user.findMany({
    where: { statut: "actif" },
    select: { id: true, nom: true, prenom: true },
    orderBy: [{ nom: "asc" }, { prenom: "asc" }],
  });
}
