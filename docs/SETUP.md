# Setup Guide - MendoHub

Guia completo para configurar o ambiente de desenvolvimento do MendoHub.

---

## 📋 Pré-requisitos

### Ferramentas Necessárias

- **Node.js** >= 18.17.0 ([Download](https://nodejs.org/))
- **npm** >= 9.0.0 (vem com Node.js)
- **Git** ([Download](https://git-scm.com/))
- **Docker Desktop** ([Download](https://www.docker.com/products/docker-desktop/))
  - Necessário para Supabase local
  - No Linux: Docker Engine + Docker Compose

### Contas Necessárias

1. **Supabase** ([Sign up](https://supabase.com/))
   - Criar projeto novo
   - Free tier é suficiente para desenvolvimento

2. **Meta Developer** ([Sign up](https://developers.facebook.com/))
   - Criar app WhatsApp Business
   - Configurar Embedded Signup

3. **Anthropic** ([Sign up](https://console.anthropic.com/))
   - Para Claude API
   - Créditos iniciais gratuitos

---

## 🚀 Instalação

### 1. Clone o Repositório

```bash
git clone https://github.com/seu-usuario/mendohub.git
cd mendohub
```

### 2. Instale as Dependências

```bash
npm install
```

Este comando instalará:
- Next.js 16.1.1
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase client
- E todas as outras dependências

### 3. Configure Variáveis de Ambiente

```bash
cp .env.example .env.local
```

Edite `.env.local` com suas credenciais (veja seção [Variáveis de Ambiente](#variáveis-de-ambiente) abaixo).

---

## 🗄️ Setup Supabase

### 1. Instale o Supabase CLI

**macOS (Homebrew):**
```bash
brew install supabase/tap/supabase
```

**Windows (Scoop):**
```bash
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

**Linux:**
```bash
brew install supabase/tap/supabase
# ou
npm install -g supabase
```

### 2. Faça Login no Supabase

```bash
supabase login
```

Siga as instruções no navegador para autenticar.

### 3. Inicie o Supabase Local

```bash
npm run supabase:start
```

**Primeira vez?** Isso vai:
- Baixar imagens Docker do Supabase (~1GB)
- Iniciar containers locais
- Criar banco PostgreSQL local

**Output esperado:**
```
Started supabase local development setup.

         API URL: http://localhost:54321
          DB URL: postgresql://postgres:postgres@localhost:54322/postgres
      Studio URL: http://localhost:54323
    Inbucket URL: http://localhost:54324
      JWT secret: super-secret-jwt-token-with-at-least-32-characters-long
        anon key: eyJh...
service_role key: eyJh...
```

⚠️ **Salve essas informações!** Você vai precisar delas.

### 4. Configure Variáveis Locais

Atualize `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key do output acima>
SUPABASE_SERVICE_ROLE_KEY=<service_role key do output acima>
```

### 5. Link com Projeto Remoto (Opcional)

Se você já criou um projeto no Supabase Cloud:

```bash
supabase link --project-ref seu-project-ref
```

Encontre `project-ref` em: https://app.supabase.com/project/[seu-projeto]/settings/general

### 6. Aplique Migrations

```bash
npm run supabase:reset
```

Isso vai:
- Criar todas as tabelas
- Aplicar policies (RLS)
- Configurar functions

### 7. Gere Types TypeScript

```bash
npm run supabase:generate-types
```

Isso cria `src/types/database.ts` com types do seu banco.

---

## 📱 Setup Meta WhatsApp API

### 1. Crie um App no Meta Developer

1. Acesse: https://developers.facebook.com/apps/
2. Clique "Create App"
3. Tipo: "Business"
4. Nome: "MendoHub Dev" (ou similar)

### 2. Adicione WhatsApp Product

1. No dashboard do app, clique "Add Product"
2. Selecione "WhatsApp"
3. Clique "Set Up"

### 3. Configure Embedded Signup

1. Vá em: WhatsApp → Configuration
2. Scroll até "Embedded Signup"
3. Clique "Create Configuration"
4. Preencha:
   - **Name**: "Production Setup"
   - **Callback URL**: (deixe em branco por enquanto)
5. Copie o **Configuration ID**

### 4. Pegue Credenciais

1. **App ID**: Settings → Basic → App ID
2. **App Secret**: Settings → Basic → App Secret (clique "Show")

### 5. Atualize .env.local

```bash
NEXT_PUBLIC_META_APP_ID=seu-app-id
META_APP_SECRET=seu-app-secret
NEXT_PUBLIC_META_CONFIG_ID=seu-config-id
WEBHOOK_VERIFY_TOKEN=gere-um-token-aleatorio
```

**Gerar token aleatório:**
```bash
openssl rand -hex 32
```

---

## 🤖 Setup Anthropic Claude

### 1. Crie Conta

1. Acesse: https://console.anthropic.com/
2. Crie conta (com Google ou email)
3. Verifique email

### 2. Gere API Key

1. Console → Settings → API Keys
2. Clique "Create Key"
3. Nome: "MendoHub Dev"
4. Copie a key (só mostra uma vez!)

### 3. Atualize .env.local

```bash
ANTHROPIC_API_KEY=sk-ant-sua-key-aqui
```

---

## 🔐 Variáveis de Ambiente

### Arquivo: `.env.local`

```bash
# Supabase (LOCAL para desenvolvimento)
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh...
SUPABASE_SERVICE_ROLE_KEY=eyJh...

# Meta WhatsApp Business API
NEXT_PUBLIC_META_APP_ID=123456789
META_APP_SECRET=abc123...
NEXT_PUBLIC_META_CONFIG_ID=987654321
WEBHOOK_VERIFY_TOKEN=seu-token-aleatorio-aqui

# Anthropic Claude API
ANTHROPIC_API_KEY=sk-ant-api...

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
ENCRYPTION_KEY=sua-chave-32-caracteres-aqui

# Optional: Para produção
# NEXT_PUBLIC_SENTRY_DSN=
```

### Gerar ENCRYPTION_KEY

```bash
openssl rand -hex 16
# Output: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

---

## ▶️ Rodando o Projeto

### 1. Certifique-se que Supabase está rodando

```bash
npm run supabase:status
```

Se não estiver:
```bash
npm run supabase:start
```

### 2. Inicie o Servidor Dev

```bash
npm run dev
```

### 3. Acesse

Abra no navegador: http://localhost:3000

---

## 🧪 Verificação

### Checklist de Funcionamento

- [ ] ✅ Projeto abre em http://localhost:3000
- [ ] ✅ Sem erros no console
- [ ] ✅ Supabase Studio abre em http://localhost:54323
- [ ] ✅ Consegue fazer login no Supabase Studio
- [ ] ✅ Tabelas criadas no banco (veja via Studio)

### Testar Conexão Supabase

```bash
# No terminal, rode:
node -e "
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'http://localhost:54321',
  'sua-anon-key-aqui'
);
supabase.from('plans').select('*').then(console.log);
"
```

Deve retornar lista de planos ou array vazio (sem erros).

---

## 🛠️ Comandos Úteis

### Next.js

```bash
npm run dev          # Servidor dev (port 3000)
npm run build        # Build produção
npm run start        # Roda build de produção
npm run lint         # Roda ESLint
npm run type-check   # Verifica tipos TypeScript
npm run format       # Formata código (Prettier)
```

### Supabase

```bash
# Local
npm run supabase:start    # Inicia containers
npm run supabase:stop     # Para containers
npm run supabase:status   # Status dos services
npm run supabase:reset    # Reset banco + migrations

# Remoto (produção)
npm run supabase:pull     # Puxa schema de prod
npm run supabase:push     # Envia migrations pra prod

# Types
npm run supabase:generate-types  # Gera types do banco
```

### Git

```bash
git status           # Ver mudanças
git add .            # Adicionar tudo
git commit -m "..."  # Commit
git push             # Push para remote
```

---

## 🐛 Troubleshooting

### Erro: "Docker not running"

**Solução**: Inicie Docker Desktop

### Erro: "Port 54321 already in use"

**Causa**: Outro processo usando a porta  
**Solução**:
```bash
# Encontre o processo
lsof -i :54321

# Mate o processo
kill -9 PID

# Ou use outra porta no supabase/config.toml
```

### Erro: "Module not found"

**Solução**:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Erro: Migrations não aplicam

**Solução**:
```bash
# Para Supabase
npm run supabase:stop

# Limpa volumes
docker volume prune

# Inicia novamente
npm run supabase:start
npm run supabase:reset
```

### Erro: TypeScript types desatualizados

**Solução**:
```bash
npm run supabase:generate-types
```

---

## 🔄 Workflow de Desenvolvimento

### Ciclo Típico

```bash
# 1. Pull últimas mudanças
git pull

# 2. Instala dependências (se houver novas)
npm install

# 3. Inicia Supabase
npm run supabase:start

# 4. Aplica migrations (se houver novas)
npm run supabase:reset

# 5. Gera types
npm run supabase:generate-types

# 6. Inicia dev server
npm run dev

# 7. Desenvolve...

# 8. Testa localmente

# 9. Commit
git add .
git commit -m "feat: nova funcionalidade"

# 10. Push
git push
```

### Criando Nova Migration

```bash
# 1. Cria arquivo de migration
supabase migration new nome_da_migration

# 2. Edita arquivo em supabase/migrations/
# Adiciona SQL

# 3. Aplica localmente
npm run supabase:reset

# 4. Testa se funcionou

# 5. Commit a migration
git add supabase/migrations/
git commit -m "feat: add migration nome_da_migration"

# 6. Deploy para prod
npm run supabase:push
```

---

## 🚀 Deploy para Produção

### 1. Setup Vercel

```bash
# Instala Vercel CLI
npm i -g vercel

# Login
vercel login

# Link projeto
vercel link

# Deploy
vercel --prod
```

### 2. Configure Variáveis no Vercel

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# ... todas as outras variáveis
```

Ou via dashboard: https://vercel.com/seu-projeto/settings/environment-variables

### 3. Deploy Migrations

```bash
# Certifique-se que está linkado ao projeto prod
supabase link --project-ref seu-project-ref-prod

# Push migrations
npm run supabase:push
```

### 4. Teste Produção

Acesse: https://seu-projeto.vercel.app

---

## 📚 Próximos Passos

Agora que o ambiente está configurado:

1. ✅ Explore o código em `src/`
2. ✅ Leia [ARCHITECTURE.md](./ARCHITECTURE.md)
3. ✅ Veja [ROADMAP.md](./ROADMAP.md)
4. ✅ Comece a desenvolver!

---

## 🆘 Ajuda

**Problemas?**
- Veja [Troubleshooting](#troubleshooting) acima
- Abra issue no GitHub
- Consulte docs oficiais:
  - [Next.js](https://nextjs.org/docs)
  - [Supabase](https://supabase.com/docs)
  - [Meta WhatsApp API](https://developers.facebook.com/docs/whatsapp)

---

**Última atualização**: Janeiro 2025
