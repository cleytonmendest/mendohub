-- Update whatsapp_connections RLS to allow platform admins
-- Migration: 20260118001219_update_whatsapp_connections_rls_for_platform_admins.sql
-- Created: 2026-01-18
--
-- Permite que platform admins vejam e gerenciem conexões WhatsApp de todas as organizações
-- Benefícios:
-- 1. Platform admins podem ver conexões na interface de admin
-- 2. Mantém isolamento para usuários normais (apenas sua org)
-- 3. Consistente com políticas de organizations

-- =============================================================================
-- WHATSAPP_CONNECTIONS POLICIES
-- =============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "WhatsApp connections view" ON whatsapp_connections;
DROP POLICY IF EXISTS "WhatsApp connections manage" ON whatsapp_connections;
DROP POLICY IF EXISTS "WhatsApp connections update" ON whatsapp_connections;
DROP POLICY IF EXISTS "WhatsApp connections delete" ON whatsapp_connections;

-- SELECT: usuários veem apenas da sua org OU platform admins veem todas
CREATE POLICY "WhatsApp connections view"
  ON whatsapp_connections FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id
      FROM users
      WHERE id = auth.uid()
    )
    OR public.is_platform_admin()
  );

-- INSERT: admins da org podem criar OU platform admins podem criar para qualquer org
CREATE POLICY "WhatsApp connections manage"
  ON whatsapp_connections FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id
      FROM users
      WHERE id = auth.uid() AND role IN ('owner', 'admin')
    )
    OR public.is_platform_admin()
  );

-- UPDATE: admins da org podem atualizar OU platform admins podem atualizar qualquer uma
CREATE POLICY "WhatsApp connections update"
  ON whatsapp_connections FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id
      FROM users
      WHERE id = auth.uid() AND role IN ('owner', 'admin')
    )
    OR public.is_platform_admin()
  );

-- DELETE: admins da org podem deletar OU platform admins podem deletar qualquer uma
CREATE POLICY "WhatsApp connections delete"
  ON whatsapp_connections FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id
      FROM users
      WHERE id = auth.uid() AND role IN ('owner', 'admin')
    )
    OR public.is_platform_admin()
  );
