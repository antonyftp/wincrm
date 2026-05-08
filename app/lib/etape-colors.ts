import type { LeadEtape } from "@prisma/client";

export const ETAPE_ORDER: LeadEtape[] = [
  "nouveau",
  "attente_qualification",
  "reponse_mail_envoye",
  "contacte_telephone",
  "non_qualifie",
  "qualifie",
  "bien_propose",
  "visite_programmee",
  "visite_effectuee",
  "relance_suivi",
  "negociation_offre",
  "vendu_loue",
  "perdu",
];

export const ETAPE_COLORS: Record<LeadEtape, string> = {
  nouveau: "#64748b",
  attente_qualification: "#0ea5e9",
  reponse_mail_envoye: "#38bdf8",
  contacte_telephone: "#6366f1",
  non_qualifie: "#ef4444",
  qualifie: "#3b82f6",
  bien_propose: "#8b5cf6",
  visite_programmee: "#a855f7",
  visite_effectuee: "#d946ef",
  relance_suivi: "#f59e0b",
  negociation_offre: "#f97316",
  vendu_loue: "#10b981",
  perdu: "#dc2626",
};
