-- =============================================================================
-- RLS (Row Level Security) — WIN CRM
-- =============================================================================
-- Apply this in Supabase → SQL Editor.
--
-- Architecture :
--   • Prisma se connecte via le rôle `postgres` (superuser → BYPASSRLS).
--     Ces policies n'affectent donc PAS les requêtes Prisma existantes.
--   • Elles protègent contre tout accès direct via la clé `anon` ou
--     `authenticated` (PostgREST, Realtime, client JS non contrôlé).
--   • L'autorisation métier reste dans les Server Actions ; le RLS est
--     une couche de défense en profondeur.
-- =============================================================================

-- Helper : résout auth.uid() → User.id (CUID Prisma) via supabaseId
-- Utilisé dans toutes les policies qui ont besoin de l'identité de l'user.
CREATE OR REPLACE FUNCTION public.get_my_user_id()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT id FROM public."User"
  WHERE "supabaseId" = auth.uid()::text
  LIMIT 1;
$$;

-- Helper : vérifie si l'user courant est admin actif
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public."User"
    WHERE "supabaseId" = auth.uid()::text
      AND role = 'admin'
      AND statut = 'actif'
  );
$$;

-- =============================================================================
-- Table : User
-- =============================================================================
ALTER TABLE public."User" ENABLE ROW LEVEL SECURITY;

-- Un user peut lire son propre profil
CREATE POLICY "user_select_own" ON public."User"
  FOR SELECT TO authenticated
  USING ("supabaseId" = auth.uid()::text);

-- Un admin peut lire tous les profils
CREATE POLICY "user_select_admin" ON public."User"
  FOR SELECT TO authenticated
  USING (public.is_admin());

-- Un admin peut modifier n'importe quel profil
CREATE POLICY "user_update_admin" ON public."User"
  FOR UPDATE TO authenticated
  USING (public.is_admin());

-- Aucun accès anonyme
-- (pas de policy anon → accès refusé par défaut)

-- =============================================================================
-- Table : Lead
-- =============================================================================
ALTER TABLE public."Lead" ENABLE ROW LEVEL SECURITY;

-- Un admin voit tous les leads
CREATE POLICY "lead_select_admin" ON public."Lead"
  FOR SELECT TO authenticated
  USING (public.is_admin());

-- Un commercial voit les leads qui lui sont assignés OU non assignés
CREATE POLICY "lead_select_commercial" ON public."Lead"
  FOR SELECT TO authenticated
  USING (
    "titulaireId" = public.get_my_user_id()
    OR "titulaireId" IS NULL
  );

-- Un admin peut créer/modifier/supprimer n'importe quel lead
CREATE POLICY "lead_all_admin" ON public."Lead"
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Un commercial peut modifier les leads qui lui sont assignés ou non assignés
CREATE POLICY "lead_update_commercial" ON public."Lead"
  FOR UPDATE TO authenticated
  USING (
    "titulaireId" = public.get_my_user_id()
    OR "titulaireId" IS NULL
  )
  WITH CHECK (
    "titulaireId" = public.get_my_user_id()
    OR "titulaireId" IS NULL
  );

-- Un commercial actif peut créer un lead
CREATE POLICY "lead_insert_commercial" ON public."Lead"
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public."User"
      WHERE "supabaseId" = auth.uid()::text
        AND statut = 'actif'
    )
  );

-- =============================================================================
-- Table : Comment
-- =============================================================================
ALTER TABLE public."Comment" ENABLE ROW LEVEL SECURITY;

-- Lecture : accessible si l'user peut accéder au lead parent
CREATE POLICY "comment_select" ON public."Comment"
  FOR SELECT TO authenticated
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public."Lead" l
      WHERE l.id = "leadId"
        AND (l."titulaireId" = public.get_my_user_id() OR l."titulaireId" IS NULL)
    )
  );

-- Création : l'user peut commenter les leads auxquels il a accès
CREATE POLICY "comment_insert" ON public."Comment"
  FOR INSERT TO authenticated
  WITH CHECK (
    "authorId" = public.get_my_user_id()
    AND (
      public.is_admin()
      OR EXISTS (
        SELECT 1 FROM public."Lead" l
        WHERE l.id = "leadId"
          AND (l."titulaireId" = public.get_my_user_id() OR l."titulaireId" IS NULL)
      )
    )
  );

-- Suppression : auteur du commentaire OU admin
CREATE POLICY "comment_delete" ON public."Comment"
  FOR DELETE TO authenticated
  USING (
    "authorId" = public.get_my_user_id()
    OR public.is_admin()
  );

-- =============================================================================
-- Table : Action
-- =============================================================================
ALTER TABLE public."Action" ENABLE ROW LEVEL SECURITY;

-- Lecture/écriture : mêmes règles que Lead (accès via le lead parent)
CREATE POLICY "action_select" ON public."Action"
  FOR SELECT TO authenticated
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public."Lead" l
      WHERE l.id = "leadId"
        AND (l."titulaireId" = public.get_my_user_id() OR l."titulaireId" IS NULL)
    )
  );

CREATE POLICY "action_insert" ON public."Action"
  FOR INSERT TO authenticated
  WITH CHECK (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public."Lead" l
      WHERE l.id = "leadId"
        AND (l."titulaireId" = public.get_my_user_id() OR l."titulaireId" IS NULL)
    )
  );

CREATE POLICY "action_update" ON public."Action"
  FOR UPDATE TO authenticated
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public."Lead" l
      WHERE l.id = "leadId"
        AND (l."titulaireId" = public.get_my_user_id() OR l."titulaireId" IS NULL)
    )
  );

CREATE POLICY "action_delete" ON public."Action"
  FOR DELETE TO authenticated
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public."Lead" l
      WHERE l.id = "leadId"
        AND (l."titulaireId" = public.get_my_user_id() OR l."titulaireId" IS NULL)
    )
  );

-- =============================================================================
-- Table : Visit
-- =============================================================================
ALTER TABLE public."Visit" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "visit_select" ON public."Visit"
  FOR SELECT TO authenticated
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public."Lead" l
      WHERE l.id = "leadId"
        AND (l."titulaireId" = public.get_my_user_id() OR l."titulaireId" IS NULL)
    )
  );

CREATE POLICY "visit_insert" ON public."Visit"
  FOR INSERT TO authenticated
  WITH CHECK (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public."Lead" l
      WHERE l.id = "leadId"
        AND (l."titulaireId" = public.get_my_user_id() OR l."titulaireId" IS NULL)
    )
  );

CREATE POLICY "visit_update" ON public."Visit"
  FOR UPDATE TO authenticated
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public."Lead" l
      WHERE l.id = "leadId"
        AND (l."titulaireId" = public.get_my_user_id() OR l."titulaireId" IS NULL)
    )
  );

CREATE POLICY "visit_delete" ON public."Visit"
  FOR DELETE TO authenticated
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public."Lead" l
      WHERE l.id = "leadId"
        AND (l."titulaireId" = public.get_my_user_id() OR l."titulaireId" IS NULL)
    )
  );
