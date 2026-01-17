-- Fix RLS Recursion on users table
-- Migration: 20260116234912_fix_users_rls_recursion.sql
-- Created: 2026-01-16

-- =============================================================================
-- SECURITY DEFINER FUNCTION
-- =============================================================================

-- Função que retorna a organization_id do usuário autenticado
-- Bypassa RLS internamente para evitar recursão
-- É segura porque só retorna dados do próprio usuário (auth.uid())
CREATE OR REPLACE FUNCTION public.user_organization_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER  -- Executa como owner do banco (bypassa RLS)
STABLE            -- Pode ser cacheada durante a query
SET search_path = public
AS $$
  SELECT organization_id
  FROM public.users
  WHERE id = auth.uid()
  LIMIT 1;
$$;

-- Grant execute permission para authenticated users
GRANT EXECUTE ON FUNCTION public.user_organization_id() TO authenticated;

-- =============================================================================
-- DROP OLD RECURSIVE POLICIES
-- =============================================================================

DROP POLICY IF EXISTS "Users view team members" ON users;
DROP POLICY IF EXISTS "Users insert/update/delete" ON users;
DROP POLICY IF EXISTS "Users update members" ON users;
DROP POLICY IF EXISTS "Users delete members" ON users;

-- =============================================================================
-- CREATE NEW NON-RECURSIVE POLICIES
-- =============================================================================

-- SELECT: user vê apenas membros da sua organização
CREATE POLICY "Users view team members"
  ON users FOR SELECT
  USING (
    organization_id = public.user_organization_id()
  );

-- INSERT: apenas owner/admin podem adicionar membros à sua organização
CREATE POLICY "Users insert members"
  ON users FOR INSERT
  WITH CHECK (
    organization_id = public.user_organization_id()
    AND
    EXISTS (
      SELECT 1
      FROM public.users
      WHERE id = auth.uid()
        AND organization_id = public.user_organization_id()
        AND role IN ('owner', 'admin')
    )
  );

-- UPDATE: apenas owner/admin podem atualizar membros da sua organização
CREATE POLICY "Users update members"
  ON users FOR UPDATE
  USING (
    organization_id = public.user_organization_id()
    AND
    EXISTS (
      SELECT 1
      FROM public.users
      WHERE id = auth.uid()
        AND organization_id = public.user_organization_id()
        AND role IN ('owner', 'admin')
    )
  );

-- DELETE: apenas owner/admin podem remover membros da sua organização
CREATE POLICY "Users delete members"
  ON users FOR DELETE
  USING (
    organization_id = public.user_organization_id()
    AND
    EXISTS (
      SELECT 1
      FROM public.users
      WHERE id = auth.uid()
        AND organization_id = public.user_organization_id()
        AND role IN ('owner', 'admin')
    )
  );
