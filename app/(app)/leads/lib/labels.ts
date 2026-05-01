import { LeadEtat, LeadEtape, NatureRecherche, TypeLogement } from "@prisma/client";

export const ETAT_LABELS: Record<LeadEtat, string> = {
  nouveau: "Nouveau",
  reponse_envoyee: "Réponse envoyée",
  contacte_telephone: "Contacté téléphone",
  non_valide: "Non valide",
  qualifie: "Qualifié",
  visite_effectuee: "Visite effectuée",
  offre_en_cours: "Offre en cours",
  offre_acceptee: "Offre acceptée",
};

export const ETAPE_LABELS: Record<LeadEtape, string> = {
  nouveau_contact: "Nouveau contact",
  en_attente_qualification: "En attente de qualification",
  qualifie: "Qualifié",
  biens_proposes: "Biens proposés",
  visite_programmee: "Visite programmée",
  visite_effectuee: "Visite effectuée",
  relance_apres_visite: "Relance après visite",
  offre_negociation: "Offre / Négociation",
  conclu: "Conclu",
  perdu: "Perdu",
};

export const NATURE_LABELS: Record<NatureRecherche, string> = {
  achat: "Achat",
  location: "Location",
  investissement: "Investissement",
};

export const TYPE_LABELS: Record<TypeLogement, string> = {
  appartement: "Appartement",
  maison: "Maison",
  studio: "Studio",
  t2: "T2",
  t3: "T3",
  t4: "T4",
  autre: "Autre",
};

export function etatBadgeClass(etat: LeadEtat): string {
  const green: LeadEtat[] = ["qualifie", "visite_effectuee", "offre_en_cours", "offre_acceptee"];
  const red: LeadEtat[] = ["non_valide"];
  const yellow: LeadEtat[] = ["reponse_envoyee", "contacte_telephone"];

  if (green.includes(etat))
    return "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800";
  if (red.includes(etat))
    return "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800";
  if (yellow.includes(etat))
    return "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800";
  return "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700";
}

export function etapeBadgeClass(etape: LeadEtape): string {
  if (etape === "conclu")
    return "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800";
  if (etape === "perdu")
    return "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800";
  return "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700";
}
