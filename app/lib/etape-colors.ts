import type { LeadEtape } from "@prisma/client";

export const ETAPE_ORDER: LeadEtape[] = [
  "nouveau_contact",
  "en_attente_qualification",
  "qualifie",
  "biens_proposes",
  "visite_programmee",
  "visite_effectuee",
  "relance_apres_visite",
  "offre_negociation",
  "conclu",
  "perdu",
];

export const ETAPE_COLORS: Record<string, string> = {
  nouveau_contact: "#64748b",
  en_attente_qualification: "#0ea5e9",
  qualifie: "#3b82f6",
  biens_proposes: "#8b5cf6",
  visite_programmee: "#a855f7",
  visite_effectuee: "#d946ef",
  relance_apres_visite: "#f59e0b",
  offre_negociation: "#f97316",
  conclu: "#10b981",
  perdu: "#ef4444",
};
