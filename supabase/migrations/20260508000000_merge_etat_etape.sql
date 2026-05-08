-- Merge LeadEtat + LeadEtape into a single LeadEtape enum with 13 values.
-- Strategy: cast column to TEXT first so data migration is unconstrained by the old enum,
-- then drop/recreate the enum and cast back. Supabase CLI wraps this file in a transaction.

-- Step 1: Drop the column default (it holds a reference to the old enum type)
ALTER TABLE "Lead" ALTER COLUMN "etape" DROP DEFAULT;

-- Step 2a: Release the column from the old enum constraint
ALTER TABLE "Lead" ALTER COLUMN "etape" TYPE TEXT;

-- Step 2b: Migrate old enum values to their new names
UPDATE "Lead" SET "etape" = 'nouveau'               WHERE "etape" = 'nouveau_contact';
UPDATE "Lead" SET "etape" = 'attente_qualification'  WHERE "etape" = 'en_attente_qualification';
UPDATE "Lead" SET "etape" = 'bien_propose'           WHERE "etape" = 'biens_proposes';
UPDATE "Lead" SET "etape" = 'relance_suivi'          WHERE "etape" = 'relance_apres_visite';
UPDATE "Lead" SET "etape" = 'negociation_offre'      WHERE "etape" = 'offre_negociation';
UPDATE "Lead" SET "etape" = 'vendu_loue'             WHERE "etape" = 'conclu';
-- 'qualifie', 'visite_programmee', 'visite_effectuee', 'perdu' keep their names unchanged

-- Step 3: Drop the etat column (and its index) — no longer needed
ALTER TABLE "Lead" DROP COLUMN IF EXISTS "etat";

-- Step 4: Safety check — abort if any row has an unrecognised value before the cast
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM "Lead"
    WHERE "etape" NOT IN (
      'nouveau', 'attente_qualification', 'reponse_mail_envoye',
      'contacte_telephone', 'non_qualifie', 'qualifie', 'bien_propose',
      'visite_programmee', 'visite_effectuee', 'relance_suivi',
      'negociation_offre', 'vendu_loue', 'perdu'
    )
  ) THEN
    RAISE EXCEPTION 'Unmapped etape values remain in Lead table — aborting migration';
  END IF;
END $$;

-- Step 5: Drop old enums
DROP TYPE IF EXISTS "LeadEtape";
DROP TYPE IF EXISTS "LeadEtat";

-- Step 6: Create the new unified enum
CREATE TYPE "LeadEtape" AS ENUM (
  'nouveau',
  'attente_qualification',
  'reponse_mail_envoye',
  'contacte_telephone',
  'non_qualifie',
  'qualifie',
  'bien_propose',
  'visite_programmee',
  'visite_effectuee',
  'relance_suivi',
  'negociation_offre',
  'vendu_loue',
  'perdu'
);

-- Step 7: Cast the column back to the new enum
ALTER TABLE "Lead" ALTER COLUMN "etape" TYPE "LeadEtape" USING "etape"::"LeadEtape";
ALTER TABLE "Lead" ALTER COLUMN "etape" SET DEFAULT 'nouveau'::"LeadEtape";
