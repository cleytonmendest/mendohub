# Database Schema - MendoHub

**Versão**: 1.0
**Data**: Janeiro 2025
**Autor**: Cleyton Mendes

---

## 🎯 Visão Geral

**Total de tabelas**: 13
**Tipo de banco**: PostgreSQL (via Supabase)
**Segurança**: Row Level Security (RLS) em todas as tabelas

### Características
- ✅ Multi-tenant isolado por `organization_id`
- ✅ Soft deletes (coluna `deleted_at`)
- ✅ Timestamps automáticos (`created_at`, `updated_at`)
- ✅ UUIDs como primary keys
- ✅ Indexes para performance
- ✅ Foreign keys com ON DELETE CASCADE apropriados

---

## 📊 Diagrama de Relacionamentos

```
┌─────────────────────┐
│  platform_admins    │
│ (admins do sistema) │
└─────────────────────┘
       │
       │ (não relacionado diretamente)
       │ (pode acessar TODAS as orgs)
       │
┌─────────────┐
│    plans    │
└──────┬──────┘
       │
       │ 1:N
       │
┌──────▼──────────────┐
│   organizations     │◄────┐
└──────┬──────────────┘     │
       │                    │
       │ 1:N                │ N:1
       │                    │
┌──────▼──────────────┐     │
│      users          │─────┘
│  (org team members) │
└──────┬──────────────┘
       │
       │ 1:N
       │
┌──────▼──────────────────────┐
│  whatsapp_connections       │
└──────┬──────────────────────┘
       │
       │ 1:N
       │
┌──────▼──────────────┐
│   conversations     │
└──────┬──────────────┘
       │
       │ 1:N
       │
┌──────▼──────────────┐
│     messages        │
└─────────────────────┘

┌─────────────────────┐
│ message_templates   │
└─────────────────────┘
       │
       │ N:1
       │
┌──────▼──────────────┐
│   organizations     │
└──────┬──────────────┘
       │
       │ 1:N
       │
┌──────▼──────────────┐
│    workflows        │
└──────┬──────────────┘
       │
       │ 1:N
       │
┌──────▼──────────────┐
│ workflow_triggers   │
└─────────────────────┘

┌─────────────────────┐
│   integrations      │
└─────────────────────┘

┌─────────────────────┐
│   usage_logs        │
└─────────────────────┘

┌─────────────────────┐
│   audit_logs        │
└─────────────────────┘
```

---

## 📋 Tabelas Detalhadas

### 1. `platform_admins`
Administradores da PLATAFORMA MendoHub (você e possíveis colaboradores)

**IMPORTANTE**: Esses NÃO são admins de organizações clientes. São admins do SISTEMA.

```sql
CREATE TABLE platform_admins (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Perfil
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,

  -- Role na plataforma
  role TEXT NOT NULL DEFAULT 'admin',
  -- 'super_admin' (você, acesso total)
  -- 'admin' (colaborador, acesso total exceto criar outros admins)
  -- 'support' (apenas visualização, sem edição)

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

-- Indexes
CREATE INDEX idx_platform_admins_email ON platform_admins(email);
CREATE INDEX idx_platform_admins_role ON platform_admins(role);
CREATE INDEX idx_platform_admins_active ON platform_admins(is_active);

-- Constraints
ALTER TABLE platform_admins
  ADD CONSTRAINT platform_admins_role_check
  CHECK (role IN ('super_admin', 'admin', 'support'));
```

**Relações:**
- 1:1 com `auth.users` (Supabase Auth)
- Self-reference para `created_by`

**Como criar o primeiro admin:**
```sql
-- Após criar sua conta via Supabase Auth, execute:
INSERT INTO platform_admins (id, full_name, email, role)
VALUES (
  'seu-user-id-do-auth-users', -- pegar de auth.users
  'Cleyton Mendes',
  'seu-email@example.com',
  'super_admin'
);
```

**Como verificar se usuário é platform admin:**
```typescript
// lib/auth/platform-admin.ts
export async function isPlatformAdmin(userId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('platform_admins')
    .select('id')
    .eq('id', userId)
    .eq('is_active', true)
    .single();

  return !!data;
}
```

---

### 2. `plans`
Planos disponíveis (Starter, Pro, Enterprise)

```sql
CREATE TABLE plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identificação
  slug TEXT UNIQUE NOT NULL, -- 'starter', 'pro', 'enterprise'
  name TEXT NOT NULL,
  description TEXT,

  -- Pricing
  price_monthly INTEGER NOT NULL, -- em centavos (R$497 = 49700)
  price_yearly INTEGER, -- desconto anual

  -- Limites
  max_conversations_per_month INTEGER NOT NULL,
  max_whatsapp_connections INTEGER NOT NULL DEFAULT 1,
  max_users INTEGER NOT NULL DEFAULT 1,
  max_templates INTEGER,
  max_workflows INTEGER,
  max_faq_items INTEGER,
  max_ai_interactions_per_month INTEGER,

  -- Features (boolean flags)
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

-- Indexes
CREATE INDEX idx_plans_slug ON plans(slug);
CREATE INDEX idx_plans_active ON plans(is_active);

-- Seed data incluído no final do documento
```

**Relações:**
- 1:N com `organizations`

---

### 3. `organizations`
Clientes (tenants) - cada empresa/loja

```sql
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identificação
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL, -- usado na URL: app.mendohub.com/[slug]

  -- Plano
  plan_id UUID REFERENCES plans(id) ON DELETE RESTRICT,

  -- Status
  status TEXT NOT NULL DEFAULT 'trial',
  -- 'trial' | 'active' | 'suspended' | 'cancelled'

  -- Trial
  trial_ends_at TIMESTAMPTZ,

  -- Billing
  current_period_start TIMESTAMPTZ DEFAULT now(),
  current_period_end TIMESTAMPTZ DEFAULT (now() + interval '1 month'),

  -- Usage tracking (reset no início de cada período)
  current_period_conversations INTEGER DEFAULT 0,
  current_period_ai_interactions INTEGER DEFAULT 0,

  -- Configurações
  business_hours JSONB, -- { "monday": { "start": "09:00", "end": "18:00" }, ... }
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

-- Indexes
CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_plan ON organizations(plan_id);
CREATE INDEX idx_organizations_status ON organizations(status);
CREATE INDEX idx_organizations_deleted ON organizations(deleted_at) WHERE deleted_at IS NULL;

-- Constraints
ALTER TABLE organizations
  ADD CONSTRAINT organizations_status_check
  CHECK (status IN ('trial', 'active', 'suspended', 'cancelled'));
```

**Relações:**
- N:1 com `plans`
- 1:N com `users`
- 1:N com `whatsapp_connections`
- 1:N com `message_templates`
- 1:N com `workflows`
- 1:N com `integrations`

---

### 4. `users`
Usuários da plataforma (team members)

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Referencia o Supabase Auth

  -- Organização
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

  -- Perfil
  full_name TEXT NOT NULL,
  avatar_url TEXT,

  -- Role
  role TEXT NOT NULL DEFAULT 'agent',
  -- 'owner' | 'admin' | 'agent'

  -- Permissões (para roles customizadas no futuro)
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

-- Indexes
CREATE INDEX idx_users_organization ON users(organization_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);

-- Constraints
ALTER TABLE users
  ADD CONSTRAINT users_role_check
  CHECK (role IN ('owner', 'admin', 'agent'));
```

**Relações:**
- N:1 com `organizations`
- 1:1 com `auth.users` (Supabase Auth)
- 1:N com `messages` (assigned_to)
- 1:N com `audit_logs`

---

### 5. `whatsapp_connections`
Números WhatsApp conectados via Meta API

```sql
CREATE TABLE whatsapp_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Organização
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Meta WhatsApp API
  phone_number_id TEXT NOT NULL, -- Meta phone number ID
  phone_number TEXT NOT NULL, -- +5521999999999
  display_name TEXT,

  -- Tokens (CRIPTOGRAFADOS no app layer antes de salvar)
  access_token TEXT NOT NULL,
  waba_id TEXT NOT NULL, -- WhatsApp Business Account ID

  -- Status
  is_active BOOLEAN DEFAULT true,
  quality_rating TEXT, -- 'GREEN' | 'YELLOW' | 'RED'

  -- Webhooks
  webhook_verify_token TEXT NOT NULL, -- para verificação do Meta

  -- Metadata da conexão
  connected_at TIMESTAMPTZ DEFAULT now(),
  last_webhook_at TIMESTAMPTZ,

  -- Metadata
  deleted_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Unique: uma org não pode conectar o mesmo número 2x
  UNIQUE(organization_id, phone_number_id)
);

-- Indexes
CREATE INDEX idx_whatsapp_connections_org ON whatsapp_connections(organization_id);
CREATE INDEX idx_whatsapp_connections_phone ON whatsapp_connections(phone_number_id);
CREATE INDEX idx_whatsapp_connections_active ON whatsapp_connections(is_active);
```

**Relações:**
- N:1 com `organizations`
- 1:N com `conversations`

---

### 6. `conversations`
Conversas com clientes

```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Conexão WhatsApp
  connection_id UUID NOT NULL REFERENCES whatsapp_connections(id) ON DELETE CASCADE,

  -- Cliente
  customer_phone TEXT NOT NULL, -- +5521999999999
  customer_name TEXT,
  customer_profile_pic_url TEXT,

  -- Status
  status TEXT NOT NULL DEFAULT 'open',
  -- 'open' | 'assigned' | 'resolved' | 'closed'

  -- Atribuição (inbox)
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ,

  -- Métricas
  unread_count INTEGER DEFAULT 0,
  message_count INTEGER DEFAULT 0,

  -- Última mensagem
  last_message_at TIMESTAMPTZ DEFAULT now(),
  last_message_content TEXT,
  last_message_direction TEXT, -- 'inbound' | 'outbound'

  -- Tags e categorização (futuro)
  tags JSONB DEFAULT '[]'::jsonb,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb, -- dados customizados (ex: carrinho abandonado)

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ,

  -- Unique: uma conversa por customer por connection
  UNIQUE(connection_id, customer_phone)
);

-- Indexes
CREATE INDEX idx_conversations_connection ON conversations(connection_id);
CREATE INDEX idx_conversations_customer ON conversations(customer_phone);
CREATE INDEX idx_conversations_status ON conversations(status);
CREATE INDEX idx_conversations_assigned ON conversations(assigned_to);
CREATE INDEX idx_conversations_last_message ON conversations(last_message_at DESC);

-- Constraints
ALTER TABLE conversations
  ADD CONSTRAINT conversations_status_check
  CHECK (status IN ('open', 'assigned', 'resolved', 'closed'));
```

**Relações:**
- N:1 com `whatsapp_connections`
- N:1 com `users` (assigned_to)
- 1:N com `messages`

---

### 7. `messages`
Mensagens individuais

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Conversa
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,

  -- WhatsApp Message ID (wamid)
  wamid TEXT UNIQUE, -- Meta's WhatsApp Message ID

  -- Direção
  direction TEXT NOT NULL,
  -- 'inbound' (cliente enviou) | 'outbound' (empresa enviou)

  -- Conteúdo
  type TEXT NOT NULL DEFAULT 'text',
  -- 'text' | 'image' | 'audio' | 'video' | 'document' | 'sticker' | 'location'

  content TEXT, -- texto da mensagem
  media_url TEXT, -- URL da mídia (se type != 'text')
  media_mime_type TEXT,

  -- Status (apenas para outbound)
  status TEXT,
  -- 'queued' | 'sent' | 'delivered' | 'read' | 'failed'

  -- Metadata do Meta
  timestamp BIGINT, -- Unix timestamp do Meta

  -- Remetente (para outbound)
  sent_by UUID REFERENCES users(id) ON DELETE SET NULL,
  -- Se NULL e direction='outbound', foi enviado por bot

  -- Template usado (se aplicável)
  template_id UUID REFERENCES message_templates(id) ON DELETE SET NULL,

  -- AI generated
  is_ai_generated BOOLEAN DEFAULT false,

  -- Error (se falhou)
  error_message TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_wamid ON messages(wamid);
CREATE INDEX idx_messages_direction ON messages(direction);
CREATE INDEX idx_messages_status ON messages(status);
CREATE INDEX idx_messages_created ON messages(created_at DESC);

-- Constraints
ALTER TABLE messages
  ADD CONSTRAINT messages_direction_check
  CHECK (direction IN ('inbound', 'outbound'));

ALTER TABLE messages
  ADD CONSTRAINT messages_type_check
  CHECK (type IN ('text', 'image', 'audio', 'video', 'document', 'sticker', 'location'));
```

**Relações:**
- N:1 com `conversations`
- N:1 com `users` (sent_by)
- N:1 com `message_templates`

---

### 8. `message_templates`
Templates de mensagens rápidas

```sql
CREATE TABLE message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Organização
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Template
  name TEXT NOT NULL, -- Ex: "Saudação", "Preços", "Horário"
  shortcut TEXT, -- Ex: "/ola", "/preco"
  content TEXT NOT NULL,

  -- Variáveis (substituídas antes de enviar)
  -- {{nome}}, {{pedido}}, etc
  -- Exemplo: "Olá {{nome}}! Seu pedido {{pedido}} está pronto."

  -- Categoria
  category TEXT, -- 'greeting' | 'faq' | 'closing' | 'custom'

  -- Mídia (opcional)
  media_url TEXT,
  media_type TEXT, -- 'image' | 'document' | 'video'

  -- Métricas
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,

  -- Metadata
  deleted_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_templates_organization ON message_templates(organization_id);
CREATE INDEX idx_templates_category ON message_templates(category);
CREATE INDEX idx_templates_shortcut ON message_templates(shortcut);
CREATE INDEX idx_templates_deleted ON message_templates(deleted_at) WHERE deleted_at IS NULL;
```

**Relações:**
- N:1 com `organizations`
- 1:N com `messages`

---

### 9. `workflows`
Workflows/automações

```sql
CREATE TABLE workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Organização
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Workflow
  name TEXT NOT NULL,
  description TEXT,

  -- Tipo
  type TEXT NOT NULL,
  -- 'faq' | 'welcome' | 'out_of_hours' | 'cart_recovery' | 'custom'

  -- Ativo/Inativo
  is_active BOOLEAN DEFAULT true,

  -- Prioridade (ordem de execução)
  priority INTEGER DEFAULT 0,

  -- Ação
  action_type TEXT NOT NULL,
  -- 'send_message' | 'assign_to_user' | 'add_tag' | 'call_webhook'

  action_config JSONB NOT NULL,
  -- Depende do action_type
  -- Exemplo para 'send_message': { "template_id": "uuid", "delay": 0 }

  -- Métricas
  trigger_count INTEGER DEFAULT 0,
  last_triggered_at TIMESTAMPTZ,

  -- Metadata
  deleted_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_workflows_organization ON workflows(organization_id);
CREATE INDEX idx_workflows_type ON workflows(type);
CREATE INDEX idx_workflows_active ON workflows(is_active);
CREATE INDEX idx_workflows_priority ON workflows(priority DESC);
```

**Relações:**
- N:1 com `organizations`
- 1:N com `workflow_triggers`

---

### 10. `workflow_triggers`
Triggers/condições dos workflows (FAQ keywords, horários, etc)

```sql
CREATE TABLE workflow_triggers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Workflow
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,

  -- Tipo de trigger
  trigger_type TEXT NOT NULL,
  -- 'keyword' (FAQ) | 'first_message' | 'time_based' | 'webhook'

  -- Configuração do trigger
  trigger_config JSONB NOT NULL,
  -- Depende do trigger_type
  -- Exemplo para 'keyword': { "keywords": ["preço", "valor", "quanto custa"], "match": "any" }
  -- Exemplo para 'time_based': { "schedule": "0 9 * * *" } (cron)

  -- Ativo
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_workflow_triggers_workflow ON workflow_triggers(workflow_id);
CREATE INDEX idx_workflow_triggers_type ON workflow_triggers(trigger_type);
CREATE INDEX idx_workflow_triggers_active ON workflow_triggers(is_active);
```

**Relações:**
- N:1 com `workflows`

---

### 11. `integrations`
Integrações externas (Shopify, VTEX, etc)

```sql
CREATE TABLE integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Organização
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Integração
  provider TEXT NOT NULL,
  -- 'shopify' | 'vtex' | 'google_sheets' | 'n8n' | 'webhook' | 'custom'

  name TEXT NOT NULL,

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Configuração (CRIPTOGRAFADA antes de salvar)
  config JSONB NOT NULL,
  -- Depende do provider
  -- Shopify: { "shop_url", "access_token" }
  -- Webhook: { "url", "method", "headers" }

  -- Webhooks (se aplicável)
  webhook_url TEXT,
  webhook_secret TEXT,

  -- Métricas
  last_sync_at TIMESTAMPTZ,
  sync_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  last_error TEXT,

  -- Metadata
  deleted_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_integrations_organization ON integrations(organization_id);
CREATE INDEX idx_integrations_provider ON integrations(provider);
CREATE INDEX idx_integrations_active ON integrations(is_active);
```

**Relações:**
- N:1 com `organizations`

---

### 12. `usage_logs`
Tracking de uso para billing e limites

```sql
CREATE TABLE usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Organização
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Tipo de uso
  usage_type TEXT NOT NULL,
  -- 'conversation_started' | 'ai_interaction' | 'message_sent'

  -- Quantidade
  quantity INTEGER DEFAULT 1,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  -- Ex: { "conversation_id": "uuid", "ai_model": "claude-3" }

  -- Período de billing
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_usage_logs_organization ON usage_logs(organization_id);
CREATE INDEX idx_usage_logs_type ON usage_logs(usage_type);
CREATE INDEX idx_usage_logs_period ON usage_logs(organization_id, period_start, period_end);
CREATE INDEX idx_usage_logs_created ON usage_logs(created_at DESC);
```

**Relações:**
- N:1 com `organizations`

---

### 13. `audit_logs`
Logs de auditoria (ações importantes)

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Organização
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

  -- Usuário que executou ação
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Ação
  action TEXT NOT NULL,
  -- 'user.created' | 'organization.updated' | 'connection.created' | etc

  -- Recurso afetado
  resource_type TEXT NOT NULL, -- 'user' | 'organization' | 'conversation'
  resource_id UUID,

  -- Detalhes
  changes JSONB, -- antes/depois
  metadata JSONB DEFAULT '{}'::jsonb,

  -- IP e User Agent
  ip_address INET,
  user_agent TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_audit_logs_organization ON audit_logs(organization_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);
```

**Relações:**
- N:1 com `organizations`
- N:1 com `users`

---

## 🔐 Row Level Security (RLS) Policies

### Enable RLS em todas as tabelas

```sql
-- Enable RLS
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
```

### Policies Principais

```sql
-- platform_admins: apenas platform admins podem ver/gerenciar
CREATE POLICY "Platform admins can view all platform admins"
  ON platform_admins FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM platform_admins WHERE is_active = true
    )
  );

CREATE POLICY "Super admins can manage platform admins"
  ON platform_admins FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM platform_admins WHERE role = 'super_admin' AND is_active = true
    )
  );

-- plans: público (read-only)
CREATE POLICY "Plans são públicos"
  ON plans FOR SELECT
  USING (is_active = true);

-- organizations: user só vê sua org
CREATE POLICY "Users can view their organization"
  ON organizations FOR SELECT
  USING (
    id IN (
      SELECT organization_id
      FROM users
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Owners can update their organization"
  ON organizations FOR UPDATE
  USING (
    id IN (
      SELECT organization_id
      FROM users
      WHERE id = auth.uid() AND role = 'owner'
    )
  );

-- Platform admins veem TODAS as organizations
CREATE POLICY "Platform admins can view all organizations"
  ON organizations FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM platform_admins WHERE is_active = true
    )
  );

CREATE POLICY "Platform admins can manage all organizations"
  ON organizations FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM platform_admins WHERE role IN ('super_admin', 'admin') AND is_active = true
    )
  );

-- users: user vê apenas da sua org
CREATE POLICY "Users can view team members"
  ON users FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id
      FROM users
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage team members"
  ON users FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id
      FROM users
      WHERE id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- whatsapp_connections: apenas da org do user
CREATE POLICY "Users can view org connections"
  ON whatsapp_connections FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id
      FROM users
      WHERE id = auth.uid()
    )
  );

-- conversations: apenas da org do user
CREATE POLICY "Users can view org conversations"
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
  );

-- messages: apenas da org do user
CREATE POLICY "Users can view org messages"
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
  );

-- templates: apenas da org do user
CREATE POLICY "Users can view org templates"
  ON message_templates FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id
      FROM users
      WHERE id = auth.uid()
    )
  );

-- workflows: apenas da org do user
CREATE POLICY "Users can view org workflows"
  ON workflows FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id
      FROM users
      WHERE id = auth.uid()
    )
  );

-- Adicionar policies similares para as outras tabelas...
```

---

## ⚡ Functions e Triggers

### Auto-update `updated_at`

```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar em todas as tabelas com updated_at
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Repetir para outras tabelas...
```

### Auto-increment conversation counters

```sql
CREATE OR REPLACE FUNCTION increment_conversation_counters()
RETURNS TRIGGER AS $$
BEGIN
  -- Incrementar message_count
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
  FOR EACH ROW
  EXECUTE FUNCTION increment_conversation_counters();
```

### Track usage for billing

```sql
CREATE OR REPLACE FUNCTION track_conversation_usage()
RETURNS TRIGGER AS $$
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
  FOR EACH ROW
  EXECUTE FUNCTION track_conversation_usage();
```

---

## 🌱 Seed Data

### Plans

```sql
INSERT INTO plans (slug, name, description, price_monthly, price_yearly, max_conversations_per_month, max_whatsapp_connections, max_users, max_templates, max_workflows, max_faq_items, max_ai_interactions_per_month, has_inbox, has_ai, has_analytics, has_integrations, max_integrations, display_order)
VALUES
  (
    'starter',
    'Starter',
    'Ideal para lojas pequenas, consultórios, pequenos serviços',
    49700, -- R$497
    44730, -- R$447.30 (10% desconto)
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
    89700, -- R$897
    80730, -- R$807.30 (10% desconto)
    2000,
    2,
    3,
    NULL, -- ilimitado
    5,
    NULL, -- ilimitado
    NULL, -- ilimitado
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
    179700, -- R$1.797
    161730, -- R$1.617.30 (10% desconto)
    5000,
    3,
    NULL, -- ilimitado
    NULL, -- ilimitado
    NULL, -- ilimitado
    NULL, -- ilimitado
    NULL, -- ilimitado
    true,
    true,
    true,
    true,
    NULL, -- ilimitado
    3
  );
```

---

## 📊 Resumo

| Tabela | Descrição | Relações | RLS |
|--------|-----------|----------|-----|
| `platform_admins` | Admins da plataforma (você) | auth.users | ✅ |
| `plans` | Planos disponíveis | - | ✅ |
| `organizations` | Clientes (multi-tenant) | plans | ✅ |
| `users` | Team members | organizations, auth.users | ✅ |
| `whatsapp_connections` | Números WhatsApp | organizations | ✅ |
| `conversations` | Conversas com clientes | connections, users | ✅ |
| `messages` | Mensagens individuais | conversations, users, templates | ✅ |
| `message_templates` | Templates de mensagens | organizations | ✅ |
| `workflows` | Workflows/automações | organizations | ✅ |
| `workflow_triggers` | Triggers de workflows | workflows | ✅ |
| `integrations` | Integrações externas | organizations | ✅ |
| `usage_logs` | Tracking de uso/billing | organizations | ✅ |
| `audit_logs` | Logs de auditoria | organizations, users | ✅ |

**Total**: 13 tabelas

---

## 🚀 Próximos Passos

1. ✅ Criar migration SQL completa (Semana 2)
2. ✅ Aplicar localmente com `supabase db reset`
3. ✅ Gerar types TypeScript com `npm run supabase:generate-types`
4. ✅ Implementar repositories para cada tabela
5. ✅ Testar RLS policies
6. ✅ Seed data de desenvolvimento

---

**Última atualização**: Janeiro 2025
**Próxima revisão**: Após completar Semana 2
