-- Performance indexes for Lead and related tables
CREATE INDEX IF NOT EXISTS "Lead_titulaireId_idx" ON "Lead"("titulaireId");
CREATE INDEX IF NOT EXISTS "Lead_dateSaisie_idx" ON "Lead"("dateSaisie");
CREATE INDEX IF NOT EXISTS "Lead_etat_idx" ON "Lead"("etat");
CREATE INDEX IF NOT EXISTS "Lead_etape_idx" ON "Lead"("etape");
CREATE INDEX IF NOT EXISTS "Lead_updatedAt_idx" ON "Lead"("updatedAt");

CREATE INDEX IF NOT EXISTS "Action_leadId_done_date_idx" ON "Action"("leadId", "done", "date");

CREATE INDEX IF NOT EXISTS "Comment_leadId_idx" ON "Comment"("leadId");

CREATE INDEX IF NOT EXISTS "Visit_leadId_idx" ON "Visit"("leadId");
