-- =============================================================================
-- Budget achat / location — WIN CRM
-- =============================================================================
-- Remplace l'option "investissement" par "achat_ou_location" dans l'enum
-- NatureRecherche, et renomme les colonnes budgetMin/budgetMax en
-- budgetAchat/budgetLocation sur la table Lead.
-- =============================================================================

-- 1. Renommer la valeur d'enum (ne touche pas aux données existantes)
ALTER TYPE "NatureRecherche" RENAME VALUE 'investissement' TO 'achat_ou_location';

-- 2. Renommer les colonnes budget (aucune perte de données)
ALTER TABLE "Lead" RENAME COLUMN "budgetMin" TO "budgetAchat";
ALTER TABLE "Lead" RENAME COLUMN "budgetMax" TO "budgetLocation";
