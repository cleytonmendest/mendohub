# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MendoHub is a WhatsApp Business automation SaaS platform with integrated AI (Claude) for intelligent responses and human handoff capabilities. The platform uses Meta's official WhatsApp Business API for messaging.

**Tech Stack**: Next.js 16.1.1 (App Router), TypeScript, Tailwind CSS, shadcn/ui, Supabase (PostgreSQL + Auth), Anthropic Claude API, Meta WhatsApp Business API

**Project Status**: MVP in development (Phase 1)

## Development Commands

### Essential Commands
```bash
# Development
npm run dev                      # Start dev server (http://localhost:3000)
npm run build                    # Build for production
npm run type-check              # TypeScript type checking (no emit)
npm run lint                    # Run ESLint
npm run format                  # Format code with Prettier

# Supabase - Local Development
npm run supabase:start          # Start Supabase local (Docker)
npm run supabase:stop           # Stop Supabase containers
npm run supabase:status         # Check Supabase services status
npm run supabase:reset          # Reset local DB + apply all migrations
npm run supabase:generate-types # Generate TypeScript types from DB schema

# Supabase - Production
npm run supabase:pull           # Pull schema from production
npm run supabase:push           # Push migrations to production
```

### Working with Database

**Always run after schema changes**:
```bash
npm run supabase:generate-types
```

This generates `src/types/database.ts` with TypeScript types from the Supabase schema.

**Creating new migrations**:
```bash
supabase migration new migration_name
# Edit the generated file in supabase/migrations/
npm run supabase:reset  # Apply locally
```

## Architecture Principles

### 1. KISS (Keep It Simple, Stupid) - TOP PRIORITY
- Simple, straightforward code over abstraction
- No over-engineering
- Functionality before abstraction
- "If you don't need it now, don't build it now"

### 2. Pain-Driven Complexity
> **"Adicione complexidade quando a DOR de não ter é maior que a dor de implementar"**

- Always measure BEFORE adding complexity
- Add monitoring/logs first, then optimize
- Prefer simple solutions that can evolve

### 3. Repository Pattern (Database Abstraction)
The codebase uses Repository Pattern to abstract database access, making it easy to migrate from Supabase in the future if needed.

**Structure**:
```
src/lib/db/
├── repositories/          # Interfaces (contracts)
├── supabase/
│   ├── client.ts         # Client-side Supabase client
│   ├── server.ts         # Server-side Supabase client
│   ├── admin.ts          # Admin client (service_role)
│   └── repositories/     # Supabase implementations
```

**Pattern**:
```typescript
// Interface defines the contract
export interface OrganizationRepository {
  findById(id: string): Promise<Organization | null>;
  create(data: CreateOrgData): Promise<Organization>;
}

// Supabase implementation
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
}

// Factory function
export function getOrgRepository() {
  return new SupabaseOrganizationRepository();
}
```

**When adding database access**:
1. Define interface in `src/lib/db/repositories/`
2. Implement in `src/lib/db/supabase/repositories/`
3. Use factory function in business logic
4. NEVER import Supabase directly in services or components

### 3. Layered Architecture

```
Presentation (src/app + src/components)
    ↓
Business Logic (src/lib/services)
    ↓
Data Access (src/lib/db/repositories)
```

**Separation of concerns**:
- **Presentation**: UI components, route handlers, input validation
- **Business Logic**: Rules, workflows, external integrations (WhatsApp, Claude)
- **Data Access**: Database queries, caching

## Directory Structure

### App Router Organization
```
src/app/
├── (auth)/              # Auth routes group (login, signup)
├── (admin)/             # Admin dashboard group
│   └── admin/
│       ├── dashboard/
│       ├── clients/
│       ├── billing/
│       └── logs/
├── (dashboard)/         # Client dashboard group
│   └── [org]/          # Multi-tenant by slug
│       ├── dashboard/
│       ├── connections/
│       ├── inbox/
│       ├── templates/
│       ├── workflows/
│       ├── team/
│       ├── analytics/
│       └── settings/
└── api/
    ├── webhooks/
    │   └── whatsapp/
    │       └── [connectionId]/
    ├── whatsapp/
    │   ├── connect/
    │   └── send/
    └── admin/
```

### Key Libraries Structure
```
src/lib/
├── db/                  # Database layer (Repository pattern)
├── services/            # Business logic
│   ├── whatsapp/       # Meta API client, webhook handler, message processor
│   ├── ai/             # Claude API client
│   ├── auth/           # RBAC, permissions
│   └── billing/        # Usage tracking
└── utils/              # Utilities (crypto, validation, logger, etc.)
```

## Type Safety & Validation

### TypeScript Strict Mode
The project uses strict TypeScript configuration:
```json
{
  "strict": true,
  "noUncheckedIndexedAccess": true,
  "noImplicitReturns": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true
}
```

### Runtime Validation with Zod
Use Zod for validation at system boundaries (API routes, forms, external data):

```typescript
import { z } from 'zod';

const OrgSchema = z.object({
  name: z.string().min(3).max(100),
  plan_slug: z.enum(['starter', 'pro', 'enterprise']),
  status: z.enum(['trial', 'active', 'suspended', 'cancelled'])
});

// In API routes
const result = OrgSchema.safeParse(data);
if (!result.success) {
  return Response.json({ error: result.error }, { status: 400 });
}
```

## Security Practices

### 1. Authentication & Authorization
- Uses Supabase Auth with Row Level Security (RLS)
- Multi-tenant isolation enforced at database level
- Always use proper Supabase client:
  - `src/lib/db/supabase/client.ts` - Client-side (browser)
  - `src/lib/db/supabase/server.ts` - Server Components/API Routes
  - `src/lib/db/supabase/admin.ts` - Admin operations (service_role)

### 2. Token Encryption
All WhatsApp API tokens are encrypted at rest using AES-256-CBC:
```typescript
// Use crypto utils for token storage
import { encrypt, decrypt } from '@/lib/utils/crypto';

const encryptedToken = encrypt(accessToken);
// Store encryptedToken in database
```

### 3. Environment Variables
Required variables (see `.env.example`):
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Admin service role key (NEVER expose to client)
- `NEXT_PUBLIC_META_APP_ID` - Meta app ID
- `META_APP_SECRET` - Meta app secret (server-only)
- `ANTHROPIC_API_KEY` - Claude API key
- `ENCRYPTION_KEY` - 32-character key for token encryption

## MVP Architectural Improvements

The following patterns are implemented during MVP development:

### 1. API Response Pattern (Week 2)
All API routes use a standardized response format:

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
    ...(process.env.NODE_ENV === 'development' && { stack: new Error().stack })
  } as ApiError, { status });
}
```

**Usage in routes:**
```typescript
import { success, error } from '@/lib/api/response';

export async function GET() {
  try {
    const data = await fetchData();
    return success(data);
  } catch (err) {
    return error('Something went wrong', 500);
  }
}
```

### 2. Tenant Context Middleware (Week 3-4)
**CRITICAL for security** - Prevents cross-tenant data leaks:

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

**Usage:**
```typescript
// app/api/[org]/conversations/route.ts
export const GET = withTenant(async (req, tenant, params) => {
  // tenant.organizationId is already validated
  const conversations = await getConversations({
    organizationId: tenant.organizationId
  });
  return success(conversations);
});
```

### 3. SWR for Server State (Week 5)
Used for real-time inbox updates and optimistic UI:

```typescript
// hooks/use-conversations.ts
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function useConversations(orgId: string) {
  return useSWR(
    `/api/organizations/${orgId}/conversations`,
    fetcher,
    {
      refreshInterval: 3000, // Poll every 3s
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );
}
```

**Why SWR over React Query:**
- Simpler and smaller (~13KB vs ~45KB)
- Sufficient for our use case
- Easy to migrate to React Query later if needed

### 4. Supabase Realtime (Week 6)
Real-time message updates via WebSocket:

```typescript
// hooks/use-realtime-messages.ts
export function useRealtimeMessages(
  conversationId: string,
  onMessage: (msg: Message) => void
) {
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel(`conversation:${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      }, (payload) => {
        onMessage(payload.new as Message);
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [conversationId]);
}
```

**Enable in Supabase:**
```sql
ALTER TABLE messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
```

### 5. Webhook Performance Monitoring (Week 6)
Always monitor webhook processing time:

```typescript
// app/api/webhooks/whatsapp/[connectionId]/route.ts
export async function POST(request: Request) {
  const start = performance.now();

  await handleWebhook(message);

  const duration = performance.now() - start;
  logger.info('webhook_processed', { duration, messageId: message.id });

  if (duration > 2000) {
    logger.warn('webhook_slow', { duration });
  }

  return success({ received: true });
}
```

This tells you WHEN to add background jobs (if >2.5s consistently).

## Important Patterns

### Supabase Client Usage

**Client Components**:
```typescript
import { createClient } from '@/lib/db/supabase/client';

const supabase = createClient();
const { data } = await supabase.from('table').select();
```

**Server Components**:
```typescript
import { createClient } from '@/lib/db/supabase/server';

const supabase = await createClient();
const { data } = await supabase.from('table').select();
```

**Admin Operations**:
```typescript
import { createAdminClient } from '@/lib/db/supabase/admin';

const supabase = createAdminClient();
// Bypasses RLS - use carefully
```

### Multi-tenant Pattern
Routes under `(dashboard)/[org]` are multi-tenant by organization slug:
- Access organization slug via `params.org`
- Always validate user has access to the organization
- Use RLS policies to enforce data isolation

## Testing & Quality

**No automated tests in MVP** - Conscious decision. Focus on:
1. TypeScript strict mode (compile-time safety)
2. Zod validation (runtime safety at boundaries)
3. ESLint + Prettier (code quality)
4. Structured logging for debugging
5. Performance monitoring (webhook timing, etc.)

**When to add tests:**
- After 5-10 paying customers and code stabilized
- When hiring a team (needed for onboarding)
- If critical code changes frequently (regression risk)

## What NOT to Do

### Architectural Anti-Patterns
- ❌ NO Domain-Driven Design (DDD) - overkill for MVP
- ❌ NO tRPC - Next.js API routes are sufficient
- ❌ NO Prisma - Supabase CLI generates types, Repository pattern abstracts DB
- ❌ NO Service Layer Dependency Injection - useful for tests, but we're not testing in MVP
- ❌ NO ADRs (Architecture Decision Records) - solo dev doesn't need formal decision docs
- ❌ NO React Query - SWR is simpler and sufficient
- ❌ NO premature optimization or abstraction
- ❌ NO tests in MVP phase

### Security Anti-Patterns
- ❌ NEVER import Supabase directly in services - use repositories
- ❌ NEVER expose `SUPABASE_SERVICE_ROLE_KEY` or `META_APP_SECRET` to client
- ❌ NEVER skip tenant validation - use `withTenant` middleware

## Deferred Improvements (Add When Needed)

### Event-Driven Webhooks
**When:** Webhook file >100 lines OR 5+ workflows
**Before that:** Just split into separate files:
```
lib/webhooks/
  ├── save-message.ts
  ├── check-faq.ts
  └── call-ai.ts
```

### Background Jobs
**When:** Webhook consistently >2.5s (you'll know from monitoring)
**Start simple:** Fire-and-forget pattern, upgrade to Bull/Redis later

### Feature Flags
**When:** 10+ clients OR beta testing expensive features (AI)
**Start simple:**
```typescript
const AI_ENABLED_ORGS = ['org-123'];
export const hasAI = (orgId: string) => AI_ENABLED_ORGS.includes(orgId);
```

## Key Integrations

### WhatsApp Business API
- Uses Meta's official Embedded Signup flow
- Webhooks receive messages at `/api/webhooks/whatsapp/[connectionId]`
- Message sending via `src/lib/services/whatsapp/api.ts`

### Claude AI
- Integration for intelligent message responses
- Client in `src/lib/services/ai/claude.ts`

### Supabase
- PostgreSQL database with Row Level Security
- Built-in authentication
- Local development via Docker (Supabase CLI)
- Type generation from schema

## Common Development Workflows

### Adding a new feature
1. Check if it requires DB changes - if yes, create migration
2. Define repository interface if database access needed
3. Implement repository in Supabase layer
4. Add business logic in services (simple functions, not DI)
5. Create API route with `withTenant` middleware and `success/error` responses
6. Build UI components
7. Use SWR for data fetching if real-time updates needed
8. Run `npm run type-check` and `npm run lint`

### Working with API routes
1. Use `withTenant` middleware for multi-tenant routes
2. Use `success()` and `error()` response helpers
3. Validate input with Zod schemas
4. Use repository pattern for database access
5. Add performance logging for webhooks

### Working with forms
1. Define Zod schema for validation
2. Use schema in both client and server
3. Handle validation errors gracefully
4. Use SWR mutation for optimistic updates

### Debugging
- Check Supabase Studio (http://localhost:54323) for DB state
- Use structured logging (don't use `console.log` in production code)
- Check webhook timing logs to identify performance issues
- Verify environment variables are set correctly

## Context for AI Assistants

**Important context:**
- This is a 9-week MVP built by a solo developer
- No automated tests by conscious decision
- Focus: ship fast, validate product, generate revenue
- Principle: "Código feio que funciona > código bonito que não existe"

**When suggesting improvements:**
- Ask: "Does this solve a problem NOW?"
- If not, it's probably premature
- Prefer simple, working code over perfect architecture
- Measure before optimizing

**Priorities:**
1. ✅ Functionality (does it work?)
2. ✅ Security (tenant isolation, encryption)
3. ✅ Type safety (TypeScript strict + Zod)
4. ✅ Simplicity (easy to understand and debug)
5. ⏰ Performance (monitor first, optimize when needed)
6. ⏰ Tests (after MVP validates product)

**Total new dependencies added:** 1 (SWR ~13KB)
