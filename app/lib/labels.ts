import {
  ActionType,
  LeadEtape,
  NatureRecherche,
  SituationMaritale,
  TypeLogement,
} from "@prisma/client";

export const ETAPE_LABELS: Record<LeadEtape, string> = {
  nouveau: "Nouveau",
  attente_qualification: "Attente qualification",
  reponse_mail_envoye: "Réponse mail envoyé",
  contacte_telephone: "Contacté téléphone",
  non_qualifie: "Non qualifié",
  qualifie: "Qualifié",
  bien_propose: "Bien proposé",
  visite_programmee: "Visite programmée",
  visite_effectuee: "Visite effectuée",
  relance_suivi: "Relance suivi",
  negociation_offre: "Negociation / offre",
  vendu_loue: "Vendu / loué",
  perdu: "Perdu",
};

export const NATURE_LABELS: Record<NatureRecherche, string> = {
  achat: "Achat",
  location: "Location",
  achat_ou_location: "Achat ou location",
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

export function etapeBadgeClass(etape: LeadEtape): string {
  if (etape === "vendu_loue") return "badge pos";
  if (etape === "perdu" || etape === "non_qualifie") return "badge neg";
  if (
    etape === "qualifie" ||
    etape === "bien_propose" ||
    etape === "visite_programmee" ||
    etape === "visite_effectuee" ||
    etape === "negociation_offre"
  )
    return "badge info";
  return "badge";
}
