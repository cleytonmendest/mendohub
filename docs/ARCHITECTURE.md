# Arquitetura do MendoHub

**Versão**: 1.0  
**Data**: Janeiro 2025  
**Autor**: Cleyton Mendes

---

## 🎯 Princípios de Design

### 1. KISS (Keep It Simple, Stupid) - PRIORIDADE #1
- Código simples e direto
- Evitar over-engineering
- Funcionalidade antes de abstração
- "Se você não precisa agora, não faça agora"

### 2. DRY (Don't Repeat Yourself)
- Reutilizar código quando faz sentido
- Não forçar abstrações prematuras
- Balance entre DRY e KISS

### 3. ❌ NÃO usar DDD (Domain-Driven Design)
- DDD é overkill para MVP
- Adiciona complexidade desnecessária
- Pode ser refatorado depois se crescer muito

---

## 🏗️ Clean Architecture Simplificada

### Estrutura de Camadas

```
┌─────────────────────────────────────┐
│         Presentation Layer          │
│  (Next.js App Router + Components)  │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│         Business Logic              │
│      (Services + Use Cases)         │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│        Data Access Layer            │
│   (Repositories + Database)         │
└─────────────────────────────────────┘
```

### Responsabilidades

**Presentation (src/app + src/components)**
- UI components
- Route handlers
- Client/Server components
- Validação de input do usuário

**Business Logic (src/lib/services)**
- Regras de negócio
- Processamento de mensagens
- Lógica de workflows
- Integrações externas

**Data Access (src/lib/db)**
- Queries ao banco
- Abstração de persistência
- Caching
- Migrations

---

## 🗄️ Database Layer - Repository Pattern

### Por que Repository Pattern?

**Problema**: Acoplamento direto ao Supabase  
**Solução**: Abstração para facilitar migração futura

### Estrutura

```typescript
// Interface (contrato)
export interface OrganizationRepository {
  findById(id: string): Promise<Organization | null>;
  findAll(): Promise<Organization[]>;
  create(data: CreateOrgData): Promise<Organization>;
  update(id: string, data: UpdateOrgData): Promise<Organization>;
  delete(id: string): Promise<void>;
}

// Implementação Supabase
export class SupabaseOrganizationRepository implements OrganizationRepository {
  async findById(id: string) {
    const supabase = createClient();
    const { data } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', id)
      .single();
    return data;
  }
  // ...
}

// Factory
export function getOrgRepository() {
  return new SupabaseOrganizationRepository();
  // No futuro: return new PrismaOrganizationRepository();
}
```

### Vantagens

✅ **Trocar banco é fácil** - Muda só os repositories  
✅ **Business logic não sabe qual DB usa** - Desacoplamento  
✅ **Fácil de testar** - Mock repositories em testes  
✅ **Simples de entender** - Não é over-engineering

---

## 📁 Estrutura de Diretórios

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Grupo: Autenticação
│   │   ├── login/
│   │   ├── signup/
│   │   └── layout.tsx
│   │
│   ├── (admin)/                  # Grupo: Admin Dashboard
│   │   ├── admin/
│   │   │   ├── dashboard/
│   │   │   ├── clients/
│   │   │   ├── billing/
│   │   │   └── logs/
│   │   └── layout.tsx            # Sidebar admin
│   │
│   ├── (dashboard)/              # Grupo: Cliente Dashboard
│   │   ├── [org]/                # Multi-tenant por slug
│   │   │   ├── dashboard/
│   │   │   ├── connections/
│   │   │   ├── inbox/
│   │   │   ├── templates/
│   │   │   ├── workflows/
│   │   │   ├── team/
│   │   │   ├── analytics/
│   │   │   └── settings/
│   │   └── layout.tsx            # Sidebar cliente
│   │
│   ├── api/                      # API Routes
│   │   ├── webhooks/
│   │   │   └── whatsapp/
│   │   │       └── [connectionId]/
│   │   ├── whatsapp/
│   │   │   ├── connect/
│   │   │   └── send/
│   │   └── admin/
│   │       └── organizations/
│   │
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing page
│   └── globals.css
│
├── lib/
│   ├── db/                       # 🔥 Database Layer
│   │   ├── supabase/             # Implementação Supabase
│   │   │   ├── client.ts         # Client-side
│   │   │   ├── server.ts         # Server-side
│   │   │   ├── admin.ts          # Admin (service_role)
│   │   │   └── repositories/     # Implementações
│   │   │       ├── organizations.ts
│   │   │       ├── users.ts
│   │   │       ├── connections.ts
│   │   │       ├── conversations.ts
│   │   │       ├── messages.ts
│   │   │       └── templates.ts
│   │   │
│   │   ├── repositories/         # Interfaces (contratos)
│   │   │   └── index.ts          # Factory de repositories
│   │   │
│   │   └── types.ts              # DB types
│   │
│   ├── services/                 # 🎯 Business Logic
│   │   ├── whatsapp/
│   │   │   ├── api.ts            # Client Meta API
│   │   │   ├── webhook-handler.ts
│   │   │   ├── message-processor.ts
│   │   │   └── types.ts
│   │   │
│   │   ├── ai/
│   │   │   └── claude.ts         # Claude API client
│   │   │
│   │   ├── auth/
│   │   │   └── permissions.ts    # RBAC
│   │   │
│   │   └── billing/
│   │       └── usage-tracker.ts  # Track usage
│   │
│   ├── utils/                    # Utilities
│   │   ├── crypto.ts             # Encryption
│   │   ├── validation.ts         # Zod schemas
│   │   ├── date.ts
│   │   ├── errors.ts
│   │   └── logger.ts             # Structured logging
│   │
│   └── constants.ts
│
├── components/
│   ├── ui/                       # shadcn/ui components
│   ├── admin/                    # Admin-specific
│   ├── dashboard/                # Client dashboard
│   ├── conversations/            # Inbox UI
│   └── shared/                   # Shared components
│
├── hooks/
│   ├── use-organization.ts
│   ├── use-user.ts
│   ├── use-conversations.ts
│   └── use-debounce.ts
│
├── types/
│   ├── database.ts               # Gerado pelo Supabase
│   ├── whatsapp.ts
│   └── index.ts
│
└── middleware.ts                 # Auth middleware
```

---

## 🔐 Segurança

### 1. Type Safety

**TypeScript Strict Mode**
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

**Zod Runtime Validation**
```typescript
import { z } from 'zod';

const OrgSchema = z.object({
  name: z.string().min(3).max(100),
  plan_slug: z.enum(['starter', 'pro', 'enterprise']),
  status: z.enum(['trial', 'active', 'suspended', 'cancelled'])
});

// Runtime validation
const result = OrgSchema.safeParse(data);
if (!result.success) {
  throw new ValidationError(result.error);
}
```

### 2. Authentication

**Supabase Auth + RLS (Row Level Security)**
```sql
-- Exemplo: User só vê suas próprias orgs
CREATE POLICY "Users can only see their org"
ON organizations FOR SELECT
USING (auth.uid() IN (
  SELECT user_id FROM users WHERE organization_id = organizations.id
));
```

### 3. Multi-Tenant Isolation - Tenant Context Middleware

**Implementado na Semana 3-4** (setup multi-tenant)

**CRÍTICO para segurança**: Previne vazamento de dados entre clientes

```typescript
// lib/middleware/tenant-context.ts
import { createClient } from '@/lib/db/supabase/server';

export type TenantContext = {
  organizationId: string;
  userId: string;
  role: 'owner' | 'admin' | 'agent';
};

export async function getTenantContext(
  orgSlug: string,
  userId: string
): Promise<TenantContext> {
  const supabase = await createClient();

  const { data: membership } = await supabase
    .from('users')
    .select('organization_id, role, organizations!inner(slug)')
    .eq('id', userId)
    .eq('organizations.slug', orgSlug)
    .single();

  if (!membership) {
    throw new Error('Unauthorized');
  }

  return {
    organizationId: membership.organization_id,
    userId,
    role: membership.role
  };
}
```

```typescript
// lib/middleware/with-tenant.ts
export function withTenant<T>(
  handler: (req: Request, tenant: TenantContext, params: T) => Promise<Response>
) {
  return async (req: Request, { params }: { params: T & { org: string } }) => {
    const user = await getCurrentUser();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenant = await getTenantContext(params.org, user.id);
    return handler(req, tenant, params);
  };
}
```

**Uso em API routes:**
```typescript
// app/api/[org]/conversations/route.ts
import { withTenant } from '@/lib/middleware/with-tenant';

export const GET = withTenant(async (req, tenant, params) => {
  // tenant.organizationId já validado!
  const conversations = await getConversations({
    organizationId: tenant.organizationId
  });

  return success(conversations);
});
```

**Benefícios:**
- ✅ Impossível esquecer de validar tenant
- ✅ Type-safe tenant context
- ✅ Audit trail automático
- ✅ Código limpo (sem validação repetida)

### 4. Encryption

**Tokens criptografados no banco**
```typescript
// lib/utils/crypto.ts
export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  // ...
}

export function decrypt(encrypted: string): string {
  // ...
}
```

### 5. CORS & Rate Limiting

**API Routes protegidas**
```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  // 1. Verifica auth
  // 2. Valida rate limit
  // 3. Logs de auditoria
}
```

---

## 🔄 Fluxo de Dados

### API Response Pattern

**Implementado na Semana 2** (primeiras API routes)

**Por quê:**
- Padroniza formato em toda API
- Frontend type-safe
- Tratamento de erros consistente

```typescript
// lib/api/response.ts
export type ApiSuccess<T> = {
  success: true;
  data: T;
};

export type ApiError = {
  success: false;
  error: string;
};

export function success<T>(data: T): Response {
  return Response.json({ success: true, data } as ApiSuccess<T>);
}

export function error(message: string, status = 400): Response {
  return Response.json({
    success: false,
    error: message,
    // Stack trace apenas em dev
    ...(process.env.NODE_ENV === 'development' && { stack: new Error().stack })
  } as ApiError, { status });
}

// Erros específicos
export class NotFoundError extends Error {
  status = 404;
}

export class ValidationError extends Error {
  status = 400;
  constructor(message: string, public details?: any) {
    super(message);
  }
}
```

**Uso:**
```typescript
// app/api/conversations/route.ts
import { success, error, NotFoundError } from '@/lib/api/response';

export async function GET() {
  try {
    const conversations = await getConversations();
    return success(conversations);
  } catch (err) {
    if (err instanceof NotFoundError) {
      return error(err.message, 404);
    }
    return error('Internal error', 500);
  }
}
```

**Frontend type-safe:**
```typescript
async function fetchConversations() {
  const res = await fetch('/api/conversations');
  const json: ApiSuccess<Conversation[]> | ApiError = await res.json();

  if (!json.success) {
    throw new Error(json.error);
  }

  return json.data; // TypeScript sabe que é Conversation[]
}
```

### Exemplo: Enviar Mensagem WhatsApp

```
1. [Client] Button click
   ↓
2. [API Route] POST /api/whatsapp/send
   ↓
3. [Service] whatsapp-api.ts
   - Valida input (Zod)
   - Busca connection (Repository)
   - Decrypt token
   - Chama Meta API
   ↓
4. [Repository] Save message
   ↓
5. [Response] Success/Error (padronizado)
```

**Código:**
```typescript
// app/api/[org]/whatsapp/send/route.ts
import { withTenant } from '@/lib/middleware/with-tenant';
import { success, error } from '@/lib/api/response';

export const POST = withTenant(async (request, tenant, params) => {
  // 1. Parse & validate
  const body = await request.json();
  const validated = SendMessageSchema.parse(body);

  // 2. Get connection via repository
  const connectionRepo = getConnectionRepository();
  const connection = await connectionRepo.findById(validated.connectionId);

  // 3. Send via service
  const whatsappService = new WhatsAppService();
  const result = await whatsappService.sendMessage({
    phoneNumberId: connection.phone_number_id,
    to: validated.to,
    message: validated.message,
    token: decrypt(connection.access_token)
  });

  // 4. Save message via repository
  const messageRepo = getMessageRepository();
  await messageRepo.create({
    conversation_id: validated.conversationId,
    direction: 'outbound',
    content: validated.message,
    wamid: result.messages[0].id
  });

  // 5. Return padronizado
  return success({ messageId: result.messages[0].id });
});
```

---

## 📊 Estado e Cache

### Server State - SWR

**Implementado na Semana 5** (antes do Inbox)

**Por quê SWR:**
- Inbox precisa de polling/real-time updates
- Optimistic UI é essencial para UX de mensagens
- Mais simples que React Query (~13KB vs ~45KB)
- Suficiente para nossas necessidades

```typescript
// hooks/use-conversations.ts
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function useConversations(orgId: string) {
  return useSWR(
    `/api/organizations/${orgId}/conversations`,
    fetcher,
    {
      refreshInterval: 3000, // Poll a cada 3s
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );
}

// Uso no componente
function Inbox() {
  const { data, error, isLoading } = useConversations(orgId);

  if (isLoading) return <Spinner />;
  if (error) return <Error />;

  return <ConversationList conversations={data} />;
}
```

### Supabase Realtime

**Implementado na Semana 6** (durante Inbox)

**Por quê:**
- Já incluído no Supabase (zero custo extra)
- WebSocket superior a polling para chat
- Mensagens instantâneas (melhor UX)
- Reduz carga no servidor

```typescript
// hooks/use-realtime-messages.ts
import { useEffect } from 'react';
import { createClient } from '@/lib/db/supabase/client';

export function useRealtimeMessages(
  conversationId: string,
  onMessage: (msg: Message) => void
) {
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel(`conversation:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          onMessage(payload.new as Message);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, supabase, onMessage]);
}

// Combinar SWR + Realtime
function ConversationView({ conversationId }: Props) {
  const { data: messages, mutate } = useSWR(`/api/messages/${conversationId}`);

  // Real-time updates
  useRealtimeMessages(conversationId, (newMessage) => {
    mutate([...messages, newMessage], false);
  });

  return <MessageList messages={messages} />;
}
```

**Habilitar no Supabase:**
```sql
-- Migration: enable_realtime.sql
ALTER TABLE messages REPLICA IDENTITY FULL;
ALTER TABLE conversations REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
```

### Client State (useState + Context)

**Simples e funcional:**
```typescript
// components/dashboard/org-provider.tsx
const OrgContext = createContext<OrgContextValue | null>(null);

export function OrgProvider({ children }: { children: ReactNode }) {
  const [org, setOrg] = useState<Organization | null>(null);

  return (
    <OrgContext.Provider value={{ org, setOrg }}>
      {children}
    </OrgContext.Provider>
  );
}
```

---

## 🧪 Estratégia de Qualidade (Sem Testes Automatizados no MVP)

### 1. TypeScript Strict
Catch 80% dos bugs em compile time

### 2. Zod Validation
Runtime safety em boundaries (API, forms)

### 3. ESLint + Prettier
Código padronizado e limpo

### 4. Structured Logging
```typescript
logger.info('Message sent', {
  orgId: org.id,
  conversationId: conv.id,
  messageId: result.id
});

logger.error('Failed to send message', error, {
  orgId: org.id,
  conversationId: conv.id
});
```

### 5. Error Boundaries
```tsx
<ErrorBoundary fallback={<ErrorPage />}>
  <Dashboard />
</ErrorBoundary>
```

### 6. Sentry (Futuro)
Monitoring de erros em produção

---

## 🚀 Deploy

### Vercel (Recomendado)

**Por quê?**
- Deploy automático via Git
- Edge functions
- Serverless
- Free tier generoso

**Configuração:**
```bash
# vercel.json
{
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase-url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase-anon-key"
  }
}
```

### Supabase (Database)

**Ambientes:**
- **Local**: Docker via Supabase CLI
- **Prod**: Supabase Cloud

**Migrations:**
```bash
# Desenvolvimento
supabase db reset

# Produção
supabase db push
```

---

## 🔮 Evolução Futura

### Princípio de Adição de Complexidade

> **"Adicione complexidade quando a DOR de não ter é maior que a dor de implementar"**

Medição é fundamental. Sempre adicione logs/métricas ANTES de adicionar complexidade.

### Webhook Performance Monitoring

**Desde o início**, monitorar tempo de processamento:

```typescript
// app/api/webhooks/whatsapp/[connectionId]/route.ts
export async function POST(request: Request) {
  const start = performance.now();

  await handleWebhook(message);

  const duration = performance.now() - start;
  logger.info('webhook_processed', { duration, messageId: message.id });

  // Alert se consistentemente >2s
  if (duration > 2000) {
    logger.warn('webhook_slow', { duration });
  }

  return success({ received: true });
}
```

### Quando adicionar testes?
- Depois de 5-10 clientes pagantes e código estabilizado
- Quando contratar time (necessário para onboarding)
- Se código crítico mudar frequentemente (risco de regressão)

### Quando adicionar Background Jobs?
**Trigger**: Webhook consistentemente >2.5s (Meta timeout é 3s)

**Simples primeiro** (sem Redis/Bull):
```typescript
// lib/jobs/simple-queue.ts
export async function enqueueJob(name: string, data: any) {
  // Fire-and-forget
  processJob(name, data).catch(err => {
    logger.error('Job failed', { name, data, err });
  });
}

// Webhook responde rápido
await saveMessage(message);
enqueueJob('process-ai-response', { messageId: message.id });
return success({ received: true });
```

**Bull/BullMQ depois** se precisar de retry, scheduling, etc.

### Quando adicionar Event-Driven Webhooks?
**Triggers**:
- Arquivo de webhook passa de 100 linhas
- Tem 5+ workflows diferentes
- Difícil adicionar novo workflow sem quebrar

**Antes disso**: Simplesmente split em arquivos separados
```
lib/webhooks/
  ├── save-message.ts
  ├── check-faq.ts
  ├── check-workflows.ts
  └── call-ai.ts
```

### Quando adicionar Feature Flags?
**Triggers**:
- 10+ clientes (controle manual não escala)
- Beta testing de features caras (ex: AI)
- Rollout gradual importante

**Simples primeiro**:
```typescript
// lib/features.ts
const AI_ENABLED_ORGS = ['org-123', 'org-456'];
export const hasAI = (orgId: string) => AI_ENABLED_ORGS.includes(orgId);
```

### Quando migrar banco?
Se Supabase ficar caro ou limitante (improvável até 100k+ usuários)

### Quando adicionar Redis?
Quando precisar de:
- Rate limiting distribuído (múltiplas instâncias)
- Cache compartilhado entre servidores
- Session store distribuído

---

## 📝 Decisões Arquiteturais

### Por que Next.js 16?
- ✅ App Router maduro
- ✅ Server Components performático
- ✅ Suporte TypeScript excelente
- ✅ Deploy fácil (Vercel)

### Por que Supabase?
- ✅ PostgreSQL (robusto)
- ✅ Auth integrado
- ✅ RLS nativo
- ✅ CLI excelente (dev local)
- ✅ Free tier generoso

### Por que Repository Pattern?
- ✅ Facilita migração de banco
- ✅ Testável
- ✅ Desacoplamento
- ❌ Pequeno overhead (aceitável)

### Por que NÃO usar Prisma?
- Supabase CLI já gera types
- Adiciona camada extra desnecessária
- Repository pattern já abstrai DB

### Por que NÃO usar tRPC?
- Over-engineering para MVP
- Next.js API routes são suficientes
- Adiciona complexidade

### Por que NÃO usar Service Layer DI (Dependency Injection)?
- DI é útil principalmente para testes
- MVP não terá testes automatizados (decisão consciente)
- Repository Pattern já desacopla database layer
- Factory pattern é suficiente
- Pode adicionar depois se contratar time ou adicionar testes

### Por que NÃO usar ADRs (Architecture Decision Records)?
- ADRs são para times grandes (justificar decisões)
- Dev solo (não precisa convencer ninguém)
- Decisões já documentadas neste arquivo
- Git commits descritivos são suficientes
- Comentários no código quando necessário

---

## 📋 Melhorias Implementadas no MVP

### ✅ Semana 2: API Response Pattern
- Formato padronizado de resposta
- Type-safe no frontend
- Erros consistentes

### ✅ Semana 3-4: Tenant Context Middleware
- Segurança multi-tenant
- Validação centralizada
- Audit trail automático

### ✅ Semana 5: SWR (Server State)
- Polling automático (3s)
- Optimistic UI
- Cache inteligente

### ✅ Semana 6: Supabase Realtime
- WebSocket para mensagens instantâneas
- Combinado com SWR
- Zero custo adicional

**Total de dependências adicionadas**: 1 (SWR ~13KB)

---

**Última atualização**: Janeiro 2025
**Próxima revisão**: Após MVP (Fase 1-3 completa)
