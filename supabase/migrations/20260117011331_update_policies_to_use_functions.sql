-- Update remaining policies to use helper functions
-- Migration: 20260117011331_update_policies_to_use_functions.sql
-- Created: 2026-01-17
--
-- Substitui subqueries em platform_admins por funções helper
-- Benefícios:
-- 1. Performance (função é cacheada)
-- 2. Consistência (mesmo padrão em todas as políticas)
-- 3. Manutenibilidade (lógica centralizada)

-- =============================================================================
-- ORGANIZATIONS POLICIES
-- =============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Organizations access" ON organizations;
DROP POLICY IF EXISTS "Organizations update" ON organizations;
DROP POLICY IF EXISTS "Organizations insert/delete" ON organizations;
DROP POLICY IF EXISTS "Organizations delete" ON organizations;

-- SELECT: users veem sua org OU platform admins veem todas
CREATE POLICY "Organizations access"
  ON organizations FOR SELECT
  USING (
    id IN (
      SELECT organization_id
      FROM users
      WHERE id = auth.uid()
    )
    OR public.is_platform_admin()
  );

-- UPDATE: owner pode atualizar sua org OU platform admin pode atualizar qualquer uma
CREATE POLICY "Organizations update"
  ON organizations FOR UPDATE
  USING (
    id IN (
      SELECT organization_id
      FROM users
      WHERE id = auth.uid() AND role = 'owner'
    )
    OR public.is_platform_admin()
  );

-- INSERT: apenas platform admins podem criar organizações
CREATE POLICY "Organizations insert"
  ON organizations FOR INSERT
  WITH CHECK (
    public.is_platform_admin()
  );

-- DELETE: apenas platform admins podem deletar organizações
CREATE POLICY "Organizations delete"
  ON organizations FOR DELETE
  USING (
    public.is_platform_admin()
  );
