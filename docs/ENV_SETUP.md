# Environment Variables Setup - MendoHub

Guia completo para configurar as variáveis de ambiente (.env.local)

---

## 📋 Variáveis Necessárias

### 🟢 Agora (Desenvolvimento Local)
1. ✅ Supabase (local)
2. ⏳ Application config
3. ⏳ Encryption key

### 🟡 Depois (Fase 2-3)
4. ⏳ Meta WhatsApp API
5. ⏳ Anthropic Claude API

---

## 🚀 Passo a Passo: Setup Supabase Local

### 1️⃣ Instalar Supabase CLI

**Windows (Scoop):**
```bash
# Instalar Scoop (se não tiver)
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
irm get.scoop.sh | iex

# Instalar Supabase CLI
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

**Alternativa (NPM Global):**
```bash
npm install -g supabase
```

**Verificar instalação:**
```bash
supabase --version
# Deve mostrar: 1.x.x ou superior
```

---

### 2️⃣ Iniciar Supabase Local

```bash
# No diretório do projeto
cd C:\Users\Cleyton\Desktop\Projects\pessoal\mendohub

# Iniciar Supabase (primeira vez demora ~2-5min para baixar Docker images)
npm run supabase:start
```

**Output esperado:**
```
Started supabase local development setup.

         API URL: http://localhost:54321
     GraphQL URL: http://localhost:54321/graphql/v1
          DB URL: postgresql://postgres:postgres@localhost:54322/postgres
      Studio URL: http://localhost:54323
    Inbucket URL: http://localhost:54324
      JWT secret: super-secret-jwt-token-with-at-least-32-characters-long
        anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU
```

**⚠️ IMPORTANTE:** Copie esse output! Você vai precisar dessas informações.

---

### 3️⃣ Aplicar as Migrations

```bash
# Aplica todas as migrations (cria todas as 13 tabelas)
npm run supabase:reset
```

**Output esperado:**
```
Applying migration 20250110000000_initial_schema.sql...
Seeding data...
Done.
```

**Verificar no Supabase Studio:**
```
Abra: http://localhost:54323

Você deve ver:
- Table Editor: 13 tabelas criadas
- Plans: 3 planos (Starter, Pro, Enterprise)
```

---

### 4️⃣ Gerar Types TypeScript

```bash
npm run supabase:generate-types
```

**Resultado:**
Cria/atualiza `src/types/database.ts` com todos os types do banco.

---

## 📝 Criar .env.local

### Copiar Template

```bash
cp .env.example .env.local
```

### Preencher com Valores do Supabase Local

Abra `.env.local` e edite:

```bash
# =============================================================================
# SUPABASE (LOCAL)
# =============================================================================

# URL da API local do Supabase
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321

# Anon Key (do output do supabase:start)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0

# Service Role Key (do output do supabase:start)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU

# =============================================================================
# APPLICATION
# =============================================================================

# URL da aplicação
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Encryption Key (gere um aleatório - veja abaixo)
ENCRYPTION_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6

# =============================================================================
# META WHATSAPP (deixe vazio por enquanto)
# =============================================================================

NEXT_PUBLIC_META_APP_ID=
META_APP_SECRET=
NEXT_PUBLIC_META_CONFIG_ID=
WEBHOOK_VERIFY_TOKEN=

# =============================================================================
# ANTHROPIC CLAUDE (deixe vazio por enquanto)
# =============================================================================

ANTHROPIC_API_KEY=

# =============================================================================
# SENTRY (opcional - deixe comentado)
# =============================================================================

# NEXT_PUBLIC_SENTRY_DSN=
# SENTRY_AUTH_TOKEN=
```

---

## 🔑 Gerar Encryption Key

A `ENCRYPTION_KEY` é usada para criptografar tokens do WhatsApp no banco.

**Gerar chave aleatória:**

```bash
# Windows PowerShell
$bytes = New-Object byte[] 16
[Security.Cryptography.RNGCryptoServiceProvider]::Create().GetBytes($bytes)
[BitConverter]::ToString($bytes).Replace('-','').ToLower()

# Ou use um site (HTTPS):
# https://generate-random.org/encryption-key-generator (escolha 128-bit hex)
```

**Copie o resultado** (32 caracteres hexadecimais) e cole em `ENCRYPTION_KEY`.

Exemplo:
```
ENCRYPTION_KEY=a7f3c8e1b2d4f6a8c3e5b7d9f1a3c5e7
```

---

## ✅ Verificar Configuração

### 1. Verificar .env.local

```bash
# Deve existir
ls .env.local

# Verificar conteúdo (não comite esse arquivo!)
cat .env.local
```

### 2. Verificar se Supabase está rodando

```bash
npm run supabase:status
```

**Output esperado:**
```
         API URL: http://localhost:54321
      Studio URL: http://localhost:54323
   DB connections: 1/60
          Status: RUNNING
```

### 3. Testar conexão

Crie um script de teste temporário:

```typescript
// scripts/test-supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function test() {
  // Testar conexão
  const { data, error } = await supabase.from('plans').select('*');

  if (error) {
    console.error('❌ Erro:', error);
  } else {
    console.log('✅ Sucesso! Planos encontrados:', data.length);
    console.log(data);
  }
}

test();
```

```bash
# Executar teste
npx tsx scripts/test-supabase.ts
```

**Resultado esperado:**
```
✅ Sucesso! Planos encontrados: 3
[
  { slug: 'starter', name: 'Starter', price_monthly: 49700, ... },
  { slug: 'pro', name: 'Pro', price_monthly: 89700, ... },
  { slug: 'enterprise', name: 'Enterprise', price_monthly: 179700, ... }
]
```

---

## 📚 Explicação das Variáveis

### Supabase

| Variável | Descrição | Onde usar |
|----------|-----------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL da API Supabase | Client + Server |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Key pública (pode expor) | Client + Server |
| `SUPABASE_SERVICE_ROLE_KEY` | Key admin (NUNCA expor) | **Apenas Server** |

**⚠️ NUNCA use `SERVICE_ROLE_KEY` no client-side!**

```typescript
// ✅ CORRETO
// lib/db/supabase/server.ts (Server Component)
import { createClient } from '@supabase/supabase-js';

export async function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // OK no servidor
  );
}

// ❌ ERRADO
// components/something.tsx (Client Component)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // ❌ NUNCA no client!
);
```

### Application

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `NEXT_PUBLIC_APP_URL` | URL base da aplicação | `http://localhost:3000` |
| `ENCRYPTION_KEY` | Chave AES-256 (32 chars) | `a7f3...c5e7` |

### Meta WhatsApp (Fase 2)

| Variável | Descrição | Quando obter |
|----------|-----------|--------------|
| `NEXT_PUBLIC_META_APP_ID` | ID do app Meta | Semana 5 (Conexões) |
| `META_APP_SECRET` | Secret do app | Semana 5 |
| `NEXT_PUBLIC_META_CONFIG_ID` | Embedded Signup Config | Semana 5 |
| `WEBHOOK_VERIFY_TOKEN` | Token para verificação | Semana 6 (Webhooks) |

### Anthropic Claude (Fase 2)

| Variável | Descrição | Quando obter |
|----------|-----------|--------------|
| `ANTHROPIC_API_KEY` | API key Claude | Semana 7 (IA) |

---

## 🔄 Supabase: Local vs Produção

### Local (Desenvolvimento)

```bash
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG... (chave local)
SUPABASE_SERVICE_ROLE_KEY=eyJhbG... (chave local)
```

**Características:**
- ✅ Dados em Docker local (não commitados)
- ✅ Reset fácil com `npm run supabase:reset`
- ✅ Gratuito
- ✅ Offline

### Produção (Supabase Cloud)

Quando for fazer deploy:

1. **Criar projeto no Supabase Cloud:**
   - Acesse https://supabase.com
   - Create New Project
   - Escolha região (SA East - São Paulo)

2. **Obter credenciais:**
   ```
   Settings → API

   - Project URL: https://xxxxx.supabase.co
   - anon/public key: eyJhbG...
   - service_role key: eyJhbG...
   ```

3. **Aplicar migrations:**
   ```bash
   # Link projeto local com produção
   supabase link --project-ref xxxxx

   # Push migrations
   npm run supabase:push
   ```

4. **Configurar no Vercel:**
   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   vercel env add SUPABASE_SERVICE_ROLE_KEY
   ```

---

## 🚨 Troubleshooting

### "supabase not recognized"

**Solução:** Instale Supabase CLI (passo 1)

### "Docker not running"

**Solução:** Instale e inicie Docker Desktop

### "Port 54321 already in use"

**Solução:**
```bash
# Parar Supabase
npm run supabase:stop

# Verificar processos
netstat -ano | findstr :54321

# Reiniciar
npm run supabase:start
```

### ".env.local não funciona"

**Verificar:**
```bash
# 1. Arquivo existe?
ls .env.local

# 2. Está no .gitignore?
cat .gitignore | grep .env.local

# 3. Restart do servidor
npm run dev
```

### "Invalid API key"

**Causa:** Copiou as keys erradas

**Solução:**
```bash
# Ver as keys corretas
npm run supabase:status

# Copiar anon key e service_role key
# Colar no .env.local
```

---

## 📋 Checklist de Setup

- [ ] Supabase CLI instalado
- [ ] Docker Desktop rodando
- [ ] `npm run supabase:start` executado
- [ ] Migrations aplicadas (`npm run supabase:reset`)
- [ ] Types gerados (`npm run supabase:generate-types`)
- [ ] `.env.local` criado
- [ ] Variáveis do Supabase preenchidas
- [ ] `ENCRYPTION_KEY` gerada
- [ ] Teste de conexão passou
- [ ] Supabase Studio acessível (http://localhost:54323)
- [ ] 13 tabelas visíveis no Studio
- [ ] 3 planos em `plans` table

---

## 🎯 Próximos Passos

### Agora (Semana 2)
1. ✅ Configurar .env.local com Supabase
2. ⏳ Adicionar você como platform admin
3. ⏳ Criar primeira organização de teste

### Semana 5 (Conexões WhatsApp)
- Obter credenciais Meta WhatsApp
- Adicionar ao .env.local

### Semana 7 (Bot IA)
- Criar conta Anthropic
- Obter API key Claude
- Adicionar ao .env.local

---

**Última atualização**: Janeiro 2025
**Responsável**: Cleyton Mendes
