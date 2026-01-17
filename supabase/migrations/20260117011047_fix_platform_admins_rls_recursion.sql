-- Fix RLS Recursion on platform_admins table
-- Migration: 20260117011047_fix_platform_admins_rls_recursion.sql
-- Created: 2026-01-17

-- =============================================================================
-- SECURITY DEFINER FUNCTION
-- =============================================================================

-- Função que verifica se o usuário autenticado é um platform admin ativo
-- Bypassa RLS internamente para evitar recursão
-- É segura porque só verifica o próprio usuário (auth.uid())
CREATE OR REPLACE FUNCTION public.is_platform_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER  -- Executa como owner do banco (bypassa RLS)
STABLE            -- Pode ser cacheada durante a query
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.platform_admins
    WHERE id = auth.uid()
      AND is_active = true
  );
$$;

-- Grant execute permission para authenticated users
GRANT EXECUTE ON FUNCTION public.is_platform_admin() TO authenticated;

-- =============================================================================
-- SECURITY DEFINER FUNCTION - Super Admin Check
-- =============================================================================

-- Função que verifica se o usuário autenticado é um super admin ativo
-- Usada para WITH CHECK na política (apenas super admins podem criar/modificar)
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER  -- Executa como owner do banco (bypassa RLS)
STABLE            -- Pode ser cacheada durante a query
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.platform_admins
    WHERE id = auth.uid()
      AND role = 'super_admin'
      AND is_active = true
  );
$$;

-- Grant execute permission para authenticated users
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated;

-- =============================================================================
-- DROP OLD RECURSIVE POLICY
-- =============================================================================

DROP POLICY IF EXISTS "Platform admins full access" ON platform_admins;

-- =============================================================================
-- CREATE NEW NON-RECURSIVE POLICY
-- =============================================================================

-- SELECT, UPDATE, DELETE: apenas platform admins ativos podem ver/gerenciar
CREATE POLICY "Platform admins access"
  ON platform_admins FOR ALL
  USING (
    public.is_platform_admin()
  )
  WITH CHECK (
    public.is_super_admin()
  );
