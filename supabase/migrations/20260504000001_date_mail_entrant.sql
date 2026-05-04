-- =============================================================================
-- Date mail entrant — WIN CRM
-- =============================================================================
-- Ajoute un champ optionnel dateMailEntrant sur la table Lead.
-- =============================================================================

ALTER TABLE "Lead" ADD COLUMN "dateMailEntrant" TIMESTAMP(3);
