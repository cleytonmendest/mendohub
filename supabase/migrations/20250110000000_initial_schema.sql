-- MendoHub - Initial Schema
-- Migration: 20250110000000_initial_schema.sql
-- Created: 2025-01-10

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- TABLES
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. platform_admins
-- -----------------------------------------------------------------------------
CREATE TABLE platform_admins (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Perfil
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,

  -- Role na plataforma
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'support')),

  -- Permissões granulares (futuro)
  permissions JSONB DEFAULT '[]'::jsonb,

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Auditoria
  last_login_at TIMESTAMPTZ,
  created_by UUID REFERENCES platform_admins(id) ON DELETE SET NULL,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_platform_admins_email ON platform_admins(email);
CREATE INDEX idx_platform_admins_role ON platform_admins(role);
CREATE INDEX idx_platform_admins_active ON platform_admins(is_active);

-- -----------------------------------------------------------------------------
-- 2. plans
-- -----------------------------------------------------------------------------
CREATE TABLE plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identificação
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,

  -- Pricing (valores em centavos)
  price_monthly INTEGER NOT NULL,
  price_yearly INTEGER,

  -- Limites
  max_conversations_per_month INTEGER NOT NULL,
  max_whatsapp_connections INTEGER NOT NULL DEFAULT 1,
  max_users INTEGER DEFAULT 1,
  max_templates INTEGER,
  max_workflows INTEGER,
  max_faq_items INTEGER,
  max_ai_interactions_per_month INTEGER,

  -- Features
  has_inbox BOOLEAN DEFAULT false,
  has_ai BOOLEAN DEFAULT false,
  has_analytics BOOLEAN DEFAULT false,
  has_integrations BOOLEAN DEFAULT false,
  has_api_access BOOLEAN DEFAULT false,
  max_integrations INTEGER DEFAULT 0,

  -- Metadata
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_plans_slug ON plans(slug);
CREATE INDEX idx_plans_active ON plans(is_active);

-- -----------------------------------------------------------------------------
-- 3. organizations
-- -----------------------------------------------------------------------------
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identificação
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,

  -- Plano
  plan_id UUID REFERENCES plans(id) ON DELETE RESTRICT,

  -- Status
  status TEXT NOT NULL DEFAULT 'trial' CHECK (status IN ('trial', 'active', 'suspended', 'cancelled')),

  -- Trial
  trial_ends_at TIMESTAMPTZ,

  -- Billing
  current_period_start TIMESTAMPTZ DEFAULT now(),
  current_period_end TIMESTAMPTZ DEFAULT (now() + interval '1 month'),

  -- Usage tracking
  current_period_conversations INTEGER DEFAULT 0,
  current_period_ai_interactions INTEGER DEFAULT 0,

  -- Configurações
  business_hours JSONB,
  timezone TEXT DEFAULT 'America/Sao_Paulo',

  -- Mensagens padrão
  welcome_message TEXT,
  out_of_hours_message TEXT,

  -- Metadata
  deleted_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_plan ON organizations(plan_id);
CREATE INDEX idx_organizations_status ON organizations(status);
CREATE INDEX idx_organizations_deleted ON organizations(deleted_at) WHERE deleted_at IS NULL;

-- -----------------------------------------------------------------------------
-- 4. users
-- -----------------------------------------------------------------------------
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Organização
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

  -- Perfil
  full_name TEXT NOT NULL,
  avatar_url TEXT,

  -- Role
  role TEXT NOT NULL DEFAULT 'agent' CHECK (role IN ('owner', 'admin', 'agent')),

  -- Permissões customizadas (futuro)
  permissions JSONB DEFAULT '[]'::jsonb,

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Metadata
  last_seen_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_users_organization ON users(organization_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);

-- -----------------------------------------------------------------------------
-- 5. whatsapp_connections
-- -----------------------------------------------------------------------------
CREATE TABLE whatsapp_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Organização
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Meta WhatsApp API
  phone_number_id TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  display_name TEXT,

  -- Tokens (serão criptografados no app layer)
  access_token TEXT NOT NULL,
  waba_id TEXT NOT NULL,

  -- Status
  is_active BOOLEAN DEFAULT true,
  quality_rating TEXT,

  -- Webhooks
  webhook_verify_token TEXT NOT NULL,

  -- Metadata da conexão
  connected_at TIMESTAMPTZ DEFAULT now(),
  last_webhook_at TIMESTAMPTZ,

  -- Soft delete
  deleted_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(organization_id, phone_number_id)
);

CREATE INDEX idx_whatsapp_connections_org ON whatsapp_connections(organization_id);
CREATE INDEX idx_whatsapp_connections_phone ON whatsapp_connections(phone_number_id);
CREATE INDEX idx_whatsapp_connections_active ON whatsapp_connections(is_active);

-- -----------------------------------------------------------------------------
-- 6. conversations
-- -----------------------------------------------------------------------------
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Conexão WhatsApp
  connection_id UUID NOT NULL REFERENCES whatsapp_connections(id) ON DELETE CASCADE,

  -- Cliente
  customer_phone TEXT NOT NULL,
  customer_name TEXT,
  customer_profile_pic_url TEXT,

  -- Status
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'assigned', 'resolved', 'closed')),

  -- Atribuição (inbox)
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ,

  -- Métricas
  unread_count INTEGER DEFAULT 0,
  message_count INTEGER DEFAULT 0,

  -- Última mensagem
  last_message_at TIMESTAMPTZ DEFAULT now(),
  last_message_content TEXT,
  last_message_direction TEXT,

  -- Tags e categorização
  tags JSONB DEFAULT '[]'::jsonb,

  -- Metadata customizada
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ,

  UNIQUE(connection_id, customer_phone)
);

CREATE INDEX idx_conversations_connection ON conversations(connection_id);
CREATE INDEX idx_conversations_customer ON conversations(customer_phone);
CREATE INDEX idx_conversations_status ON conversations(status);
CREATE INDEX idx_conversations_assigned ON conversations(assigned_to);
CREATE INDEX idx_conversations_last_message ON conversations(last_message_at DESC);

-- -----------------------------------------------------------------------------
-- 7. message_templates
-- -----------------------------------------------------------------------------
CREATE TABLE message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Organização
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Template
  name TEXT NOT NULL,
  shortcut TEXT,
  content TEXT NOT NULL,

  -- Categoria
  category TEXT,

  -- Mídia
  media_url TEXT,
  media_type TEXT,

  -- Métricas
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,

  -- Soft delete
  deleted_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_templates_organization ON message_templates(organization_id);
CREATE INDEX idx_templates_category ON message_templates(category);
CREATE INDEX idx_templates_shortcut ON message_templates(shortcut);
CREATE INDEX idx_templates_deleted ON message_templates(deleted_at) WHERE deleted_at IS NULL;

-- -----------------------------------------------------------------------------
-- 8. messages
-- -----------------------------------------------------------------------------
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Conversa
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,

  -- WhatsApp Message ID
  wamid TEXT UNIQUE,

  -- Direção
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),

  -- Conteúdo
  type TEXT NOT NULL DEFAULT 'text' CHECK (type IN ('text', 'image', 'audio', 'video', 'document', 'sticker', 'location')),
  content TEXT,
  media_url TEXT,
  media_mime_type TEXT,

  -- Status (outbound)
  status TEXT,

  -- Metadata do Meta
  timestamp BIGINT,

  -- Remetente (outbound)
  sent_by UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Template usado
  template_id UUID REFERENCES message_templates(id) ON DELETE SET NULL,

  -- AI generated
  is_ai_generated BOOLEAN DEFAULT false,

  -- Error
  error_message TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_wamid ON messages(wamid);
CREATE INDEX idx_messages_direction ON messages(direction);
CREATE INDEX idx_messages_status ON messages(status);
CREATE INDEX idx_messages_created ON messages(created_at DESC);

-- -----------------------------------------------------------------------------
-- 9. workflows
-- -----------------------------------------------------------------------------
CREATE TABLE workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Organização
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Workflow
  name TEXT NOT NULL,
  description TEXT,

  -- Tipo
  type TEXT NOT NULL,

  -- Ativo
  is_active BOOLEAN DEFAULT true,

  -- Prioridade
  priority INTEGER DEFAULT 0,

  -- Ação
  action_type TEXT NOT NULL,
  action_config JSONB NOT NULL,

  -- Métricas
  trigger_count INTEGER DEFAULT 0,
  last_triggered_at TIMESTAMPTZ,

  -- Soft delete
  deleted_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_workflows_organization ON workflows(organization_id);
CREATE INDEX idx_workflows_type ON workflows(type);
CREATE INDEX idx_workflows_active ON workflows(is_active);
CREATE INDEX idx_workflows_priority ON workflows(priority DESC);

-- -----------------------------------------------------------------------------
-- 10. workflow_triggers
-- -----------------------------------------------------------------------------
CREATE TABLE workflow_triggers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Workflow
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,

  -- Tipo de trigger
  trigger_type TEXT NOT NULL,

  -- Configuração
  trigger_config JSONB NOT NULL,

  -- Ativo
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_workflow_triggers_workflow ON workflow_triggers(workflow_id);
CREATE INDEX idx_workflow_triggers_type ON workflow_triggers(trigger_type);
CREATE INDEX idx_workflow_triggers_active ON workflow_triggers(is_active);

-- -----------------------------------------------------------------------------
-- 11. integrations
-- -----------------------------------------------------------------------------
CREATE TABLE integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Organização
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Integração
  provider TEXT NOT NULL,
  name TEXT NOT NULL,

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Configuração (será criptografada no app layer)
  config JSONB NOT NULL,

  -- Webhooks
  webhook_url TEXT,
  webhook_secret TEXT,

  -- Métricas
  last_sync_at TIMESTAMPTZ,
  sync_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  last_error TEXT,

  -- Soft delete
  deleted_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_integrations_organization ON integrations(organization_id);
CREATE INDEX idx_integrations_provider ON integrations(provider);
CREATE INDEX idx_integrations_active ON integrations(is_active);

-- -----------------------------------------------------------------------------
-- 12. usage_logs
-- -----------------------------------------------------------------------------
CREATE TABLE usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Organização
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Tipo de uso
  usage_type TEXT NOT NULL,

  -- Quantidade
  quantity INTEGER DEFAULT 1,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Período de billing
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,

  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_usage_logs_organization ON usage_logs(organization_id);
CREATE INDEX idx_usage_logs_type ON usage_logs(usage_type);
CREATE INDEX idx_usage_logs_period ON usage_logs(organization_id, period_start, period_end);
CREATE INDEX idx_usage_logs_created ON usage_logs(created_at DESC);

-- -----------------------------------------------------------------------------
-- 13. audit_logs
-- -----------------------------------------------------------------------------
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Organização
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

  -- Usuário
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Ação
  action TEXT NOT NULL,

  -- Recurso afetado
  resource_type TEXT NOT NULL,
  resource_id UUID,

  -- Detalhes
  changes JSONB,
  metadata JSONB DEFAULT '{}'::jsonb,

  -- IP e User Agent
  ip_address INET,
  user_agent TEXT,

  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_audit_logs_organization ON audit_logs(organization_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);

-- =============================================================================
-- FUNCTIONS & TRIGGERS
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Auto-update updated_at
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
SET search_path = pg_catalog, public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_platform_admins_updated_at
  BEFORE UPDATE ON platform_admins
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_plans_updated_at
  BEFORE UPDATE ON plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_whatsapp_connections_updated_at
  BEFORE UPDATE ON whatsapp_connections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_message_templates_updated_at
  BEFORE UPDATE ON message_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_workflows_updated_at
  BEFORE UPDATE ON workflows
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_workflow_triggers_updated_at
  BEFORE UPDATE ON workflow_triggers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_integrations_updated_at
  BEFORE UPDATE ON integrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- -----------------------------------------------------------------------------
-- Auto-increment conversation counters
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION increment_conversation_counters()
RETURNS TRIGGER
SET search_path = pg_catalog, public
AS $$
BEGIN
  UPDATE conversations
  SET
    message_count = message_count + 1,
    last_message_at = NEW.created_at,
    last_message_content = NEW.content,
    last_message_direction = NEW.direction,
    unread_count = CASE
      WHEN NEW.direction = 'inbound' THEN unread_count + 1
      ELSE unread_count
    END
  WHERE id = NEW.conversation_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_conversation_counters_trigger
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION increment_conversation_counters();

-- -----------------------------------------------------------------------------
-- Track conversation usage for billing
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION track_conversation_usage()
RETURNS TRIGGER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_org_id UUID;
  v_period_start TIMESTAMPTZ;
  v_period_end TIMESTAMPTZ;
BEGIN
  -- Get organization and period
  SELECT
    wc.organization_id,
    o.current_period_start,
    o.current_period_end
  INTO v_org_id, v_period_start, v_period_end
  FROM whatsapp_connections wc
  JOIN organizations o ON o.id = wc.organization_id
  WHERE wc.id = NEW.connection_id;

  -- Insert usage log
  INSERT INTO usage_logs (
    organization_id,
    usage_type,
    quantity,
    period_start,
    period_end,
    metadata
  ) VALUES (
    v_org_id,
    'conversation_started',
    1,
    v_period_start,
    v_period_end,
    jsonb_build_object('conversation_id', NEW.id)
  );

  -- Increment organization counter
  UPDATE organizations
  SET current_period_conversations = current_period_conversations + 1
  WHERE id = v_org_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER track_conversation_usage_trigger
  AFTER INSERT ON conversations
  FOR EACH ROW EXECUTE FUNCTION track_conversation_usage();

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Enable RLS em todas as tabelas
ALTER TABLE platform_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Platform Admins: apenas platform admins podem ver/gerenciar
CREATE POLICY "Platform admins full access"
  ON platform_admins FOR ALL
  USING (
    (select auth.uid()) IN (
      SELECT id FROM platform_admins WHERE is_active = true
    )
  )
  WITH CHECK (
    (select auth.uid()) IN (
      SELECT id FROM platform_admins WHERE role = 'super_admin' AND is_active = true
    )
  );

-- Plans: público (read-only)
CREATE POLICY "Plans são públicos"
  ON plans FOR SELECT
  USING (is_active = true);

-- Organizations: users veem sua org, platform admins veem todas
CREATE POLICY "Organizations access"
  ON organizations FOR SELECT
  USING (
    -- User vê sua org OU platform admin vê todas
    id IN (
      SELECT organization_id
      FROM users
      WHERE id = (select auth.uid())
    )
    OR
    (select auth.uid()) IN (
      SELECT id FROM platform_admins WHERE is_active = true
    )
  );

CREATE POLICY "Organizations update"
  ON organizations FOR UPDATE
  USING (
    -- Owner pode atualizar sua org OU platform admin pode atualizar qualquer uma
    id IN (
      SELECT organization_id
      FROM users
      WHERE id = (select auth.uid()) AND role = 'owner'
    )
    OR
    (select auth.uid()) IN (
      SELECT id FROM platform_admins WHERE role IN ('super_admin', 'admin') AND is_active = true
    )
  );

CREATE POLICY "Organizations insert/delete"
  ON organizations FOR INSERT
  WITH CHECK (
    (select auth.uid()) IN (
      SELECT id FROM platform_admins WHERE role IN ('super_admin', 'admin') AND is_active = true
    )
  );

CREATE POLICY "Organizations delete"
  ON organizations FOR DELETE
  USING (
    (select auth.uid()) IN (
      SELECT id FROM platform_admins WHERE role IN ('super_admin', 'admin') AND is_active = true
    )
  );

-- Users: user vê apenas da sua org
CREATE POLICY "Users view team members"
  ON users FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id
      FROM users
      WHERE id = (select auth.uid())
    )
  );

CREATE POLICY "Users insert/update/delete"
  ON users FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id
      FROM users
      WHERE id = (select auth.uid()) AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Users update members"
  ON users FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id
      FROM users
      WHERE id = (select auth.uid()) AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Users delete members"
  ON users FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id
      FROM users
      WHERE id = (select auth.uid()) AND role IN ('owner', 'admin')
    )
  );

-- WhatsApp Connections: apenas da org do user
CREATE POLICY "WhatsApp connections view"
  ON whatsapp_connections FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id
      FROM users
      WHERE id = (select auth.uid())
    )
  );

CREATE POLICY "WhatsApp connections manage"
  ON whatsapp_connections FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id
      FROM users
      WHERE id = (select auth.uid()) AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "WhatsApp connections update"
  ON whatsapp_connections FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id
      FROM users
      WHERE id = (select auth.uid()) AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "WhatsApp connections delete"
  ON whatsapp_connections FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id
      FROM users
      WHERE id = (select auth.uid()) AND role IN ('owner', 'admin')
    )
  );

-- Conversations: apenas da org do user
CREATE POLICY "Conversations view"
  ON conversations FOR SELECT
  USING (
    connection_id IN (
      SELECT id
      FROM whatsapp_connections
      WHERE organization_id IN (
        SELECT organization_id
        FROM users
        WHERE id = (select auth.uid())
      )
    )
  );

CREATE POLICY "Conversations update"
  ON conversations FOR UPDATE
  USING (
    connection_id IN (
      SELECT id
      FROM whatsapp_connections
      WHERE organization_id IN (
        SELECT organization_id
        FROM users
        WHERE id = (select auth.uid())
      )
    )
  );

-- Messages: apenas da org do user
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
        WHERE id = (select auth.uid())
      )
    )
  );

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
        WHERE id = (select auth.uid())
      )
    )
  );

-- Templates: apenas da org do user
CREATE POLICY "Templates view"
  ON message_templates FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id
      FROM users
      WHERE id = (select auth.uid())
    )
  );

CREATE POLICY "Templates manage"
  ON message_templates FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id
      FROM users
      WHERE id = (select auth.uid())
    )
  );

CREATE POLICY "Templates update"
  ON message_templates FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id
      FROM users
      WHERE id = (select auth.uid())
    )
  );

CREATE POLICY "Templates delete"
  ON message_templates FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id
      FROM users
      WHERE id = (select auth.uid())
    )
  );

-- Workflows: apenas da org do user
CREATE POLICY "Workflows view"
  ON workflows FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id
      FROM users
      WHERE id = (select auth.uid())
    )
  );

CREATE POLICY "Workflows manage"
  ON workflows FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id
      FROM users
      WHERE id = (select auth.uid()) AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Workflows update"
  ON workflows FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id
      FROM users
      WHERE id = (select auth.uid()) AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Workflows delete"
  ON workflows FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id
      FROM users
      WHERE id = (select auth.uid()) AND role IN ('owner', 'admin')
    )
  );

-- Workflow Triggers
CREATE POLICY "Workflow triggers view"
  ON workflow_triggers FOR SELECT
  USING (
    workflow_id IN (
      SELECT id
      FROM workflows
      WHERE organization_id IN (
        SELECT organization_id
        FROM users
        WHERE id = (select auth.uid())
      )
    )
  );

CREATE POLICY "Workflow triggers manage"
  ON workflow_triggers FOR INSERT
  WITH CHECK (
    workflow_id IN (
      SELECT id
      FROM workflows
      WHERE organization_id IN (
        SELECT organization_id
        FROM users
        WHERE id = (select auth.uid()) AND role IN ('owner', 'admin')
      )
    )
  );

CREATE POLICY "Workflow triggers update"
  ON workflow_triggers FOR UPDATE
  USING (
    workflow_id IN (
      SELECT id
      FROM workflows
      WHERE organization_id IN (
        SELECT organization_id
        FROM users
        WHERE id = (select auth.uid()) AND role IN ('owner', 'admin')
      )
    )
  );

CREATE POLICY "Workflow triggers delete"
  ON workflow_triggers FOR DELETE
  USING (
    workflow_id IN (
      SELECT id
      FROM workflows
      WHERE organization_id IN (
        SELECT organization_id
        FROM users
        WHERE id = (select auth.uid()) AND role IN ('owner', 'admin')
      )
    )
  );

-- Integrations: apenas da org do user
CREATE POLICY "Integrations view"
  ON integrations FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id
      FROM users
      WHERE id = (select auth.uid())
    )
  );

CREATE POLICY "Integrations manage"
  ON integrations FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id
      FROM users
      WHERE id = (select auth.uid()) AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Integrations update"
  ON integrations FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id
      FROM users
      WHERE id = (select auth.uid()) AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Integrations delete"
  ON integrations FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id
      FROM users
      WHERE id = (select auth.uid()) AND role IN ('owner', 'admin')
    )
  );

-- Usage Logs: apenas admins da org
CREATE POLICY "Usage logs view"
  ON usage_logs FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id
      FROM users
      WHERE id = (select auth.uid()) AND role IN ('owner', 'admin')
    )
  );

-- Audit Logs: apenas admins da org
CREATE POLICY "Audit logs view"
  ON audit_logs FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id
      FROM users
      WHERE id = (select auth.uid()) AND role IN ('owner', 'admin')
    )
  );

-- =============================================================================
-- SEED DATA
-- =============================================================================

-- Plans
INSERT INTO plans (slug, name, description, price_monthly, price_yearly, max_conversations_per_month, max_whatsapp_connections, max_users, max_templates, max_workflows, max_faq_items, max_ai_interactions_per_month, has_inbox, has_ai, has_analytics, has_integrations, max_integrations, display_order)
VALUES
  (
    'starter',
    'Starter',
    'Ideal para lojas pequenas, consultórios, pequenos serviços',
    49700,
    44730,
    500,
    1,
    1,
    10,
    3,
    20,
    100,
    false,
    true,
    false,
    false,
    0,
    1
  ),
  (
    'pro',
    'Pro',
    'Ideal para e-commerces médios, clínicas, agências',
    89700,
    80730,
    2000,
    2,
    3,
    NULL,
    5,
    NULL,
    NULL,
    true,
    true,
    true,
    true,
    1,
    2
  ),
  (
    'enterprise',
    'Enterprise',
    'Ideal para grandes e-commerces, empresas multi-marca',
    179700,
    161730,
    5000,
    3,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    true,
    true,
    true,
    true,
    NULL,
    3
  );
