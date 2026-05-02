import {
  ActionType,
  LeadEtape,
  LeadEtat,
  NatureRecherche,
  SituationMaritale,
  TypeLogement,
} from "@prisma/client";

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

export const ACTION_TYPE_LABELS: Record<ActionType, string> = {
  appel: "Appel",
  email: "Email",
  rdv: "RDV",
  visite: "Visite",
  relance: "Relance",
};

export const SITUATION_LABELS: Record<SituationMaritale, string> = {
  marie: "Marié(e)",
  veuf: "Veuf/Veuve",
  celibataire: "Célibataire",
  divorce: "Divorcé(e)",
};

// ─── Badge helpers ───────────────────────────────────────────────────────────

export function etatBadgeClass(etat: LeadEtat): string {
  const pos: LeadEtat[] = ["qualifie", "visite_effectuee", "offre_en_cours", "offre_acceptee"];
  const neg: LeadEtat[] = ["non_valide"];
  const warn: LeadEtat[] = ["reponse_envoyee", "contacte_telephone"];

  if (pos.includes(etat)) return "badge pos";
  if (neg.includes(etat)) return "badge neg";
  if (warn.includes(etat)) return "badge warn";
  return "badge";
}

export function etapeBadgeClass(etape: LeadEtape): string {
  if (etape === "conclu") return "badge pos";
  if (etape === "perdu") return "badge neg";
  return "badge info";
}
