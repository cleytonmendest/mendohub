-- =============================================================================
-- Fix Inbox RLS for Platform Admins
-- =============================================================================
--
-- Problema: Platform admins não conseguem acessar conversations, messages e
-- message_templates porque as RLS policies verificam apenas a tabela users.
--
-- Solução: Adicionar OR is_platform_admin() nas policies, seguindo o padrão
-- já implementado para organizations e whatsapp_connections.
--
-- =============================================================================

-- =============================================================================
-- CONVERSATIONS
-- =============================================================================

-- DROP policies antigas
DROP POLICY IF EXISTS "Conversations view" ON conversations;
DROP POLICY IF EXISTS "Conversations update" ON conversations;

-- SELECT: users da org podem ver OU platform admins podem ver todas
CREATE POLICY "Conversations view"
  ON conversations FOR SELECT
  USING (
    connection_id IN (
      SELECT id
      FROM whatsapp_connections
      WHERE organization_id IN (
        SELECT organization_id
        FROM users
        WHERE id = auth.uid()
      )
    )
    OR public.is_platform_admin()
  );

-- UPDATE: users da org podem atualizar OU platform admins podem atualizar todas
CREATE POLICY "Conversations update"
  ON conversations FOR UPDATE
  USING (
    connection_id IN (
      SELECT id
      FROM whatsapp_connections
      WHERE organization_id IN (
        SELECT organization_id
        FROM users
        WHERE id = auth.uid()
      )
    )
    OR public.is_platform_admin()
  );

-- INSERT: permitir INSERT para webhook (criar conversas automaticamente)
-- Verificar se já existe policy de INSERT
DROP POLICY IF EXISTS "Conversations insert" ON conversations;

CREATE POLICY "Conversations insert"
  ON conversations FOR INSERT
  WITH CHECK (
    -- Users da org podem criar
    connection_id IN (
      SELECT id
      FROM whatsapp_connections
      WHERE organization_id IN (
        SELECT organization_id
        FROM users
        WHERE id = auth.uid()
      )
    )
    -- Platform admins podem criar
    OR public.is_platform_admin()
    -- Service role pode criar (webhook do WhatsApp)
    OR auth.role() = 'service_role'
  );

-- =============================================================================
-- MESSAGES
-- =============================================================================

-- DROP policies antigas
DROP POLICY IF EXISTS "Messages view" ON messages;
DROP POLICY IF EXISTS "Messages insert" ON messages;

-- SELECT: users podem ver mensagens das conversas da sua org OU platform admins
CREATE POLICY "Messages view"
  ON messages FOR SELECT
  USING (
    conversation_id IN (
      SELECT conversations.id
      FROM conversations
      JOIN whatsapp_connections ON conversations.connection_id = whatsapp_connections.id
      WHERE whatsapp_connections.organization_id IN (
        SELECT organization_id
        FROM users
        WHERE id = auth.uid()
      )
    )
    OR public.is_platform_admin()
  );

-- INSERT: users podem criar mensagens OU platform admins OU service role (webhook)
CREATE POLICY "Messages insert"
  ON messages FOR INSERT
  WITH CHECK (
    conversation_id IN (
      SELECT conversations.id
      FROM conversations
      JOIN whatsapp_connections ON conversations.connection_id = whatsapp_connections.id
      WHERE whatsapp_connections.organization_id IN (
        SELECT organization_id
        FROM users
        WHERE id = auth.uid()
      )
    )
    OR public.is_platform_admin()
    OR auth.role() = 'service_role'
  );

-- UPDATE: apenas para atualizar status de mensagens (delivered, read)
DROP POLICY IF EXISTS "Messages update" ON messages;

CREATE POLICY "Messages update"
  ON messages FOR UPDATE
  USING (
    conversation_id IN (
      SELECT conversations.id
      FROM conversations
      JOIN whatsapp_connections ON conversations.connection_id = whatsapp_connections.id
      WHERE whatsapp_connections.organization_id IN (
        SELECT organization_id
        FROM users
        WHERE id = auth.uid()
      )
    )
    OR public.is_platform_admin()
    OR auth.role() = 'service_role'
  );

-- =============================================================================
-- MESSAGE_TEMPLATES
-- =============================================================================

-- DROP policies antigas
DROP POLICY IF EXISTS "Templates view" ON message_templates;
DROP POLICY IF EXISTS "Templates manage" ON message_templates;
DROP POLICY IF EXISTS "Templates insert" ON message_templates;
DROP POLICY IF EXISTS "Templates update" ON message_templates;
DROP POLICY IF EXISTS "Templates delete" ON message_templates;

-- SELECT: users da org podem ver OU platform admins podem ver todos
CREATE POLICY "Templates view"
  ON message_templates FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id
      FROM users
      WHERE id = auth.uid()
    )
    OR public.is_platform_admin()
  );

-- INSERT: admins da org podem criar OU platform admins podem criar para qualquer org
CREATE POLICY "Templates insert"
  ON message_templates FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id
      FROM users
      WHERE id = auth.uid() AND role IN ('owner', 'admin')
    )
    OR public.is_platform_admin()
  );

-- UPDATE: admins da org podem atualizar OU platform admins podem atualizar todos
CREATE POLICY "Templates update"
  ON message_templates FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id
      FROM users
      WHERE id = auth.uid() AND role IN ('owner', 'admin')
    )
    OR public.is_platform_admin()
  );

-- DELETE: admins da org podem deletar OU platform admins podem deletar todos
CREATE POLICY "Templates delete"
  ON message_templates FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id
      FROM users
      WHERE id = auth.uid() AND role IN ('owner', 'admin')
    )
    OR public.is_platform_admin()
  );

-- =============================================================================
-- VERIFICAÇÃO
-- =============================================================================

-- Listar todas as policies das tabelas do inbox
-- Execute para confirmar que as policies foram atualizadas:
--
-- SELECT
--   schemaname,
--   tablename,
--   policyname,
--   permissive,
--   roles,
--   cmd,
--   qual
-- FROM pg_policies
-- WHERE tablename IN ('conversations', 'messages', 'message_templates')
-- ORDER BY tablename, policyname;
