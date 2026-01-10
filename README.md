# MendoHub

> Plataforma SaaS de automação WhatsApp Business com IA integrada

![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## 🎯 Visão Geral

MendoHub é uma plataforma SaaS que permite empresas automatizarem seu atendimento no WhatsApp usando a API oficial da Meta, com respostas inteligentes via IA (Claude) e transferência para atendimento humano quando necessário.

### Principais Features

- ✅ **Embedded Signup** - Conectar número WhatsApp em 2 cliques
- ✅ **Bot Inteligente** - Respostas automáticas via Claude AI
- ✅ **Inbox em Tempo Real** - Atendimento híbrido (bot + humano)
- ✅ **Templates de Mensagens** - Respostas rápidas reutilizáveis
- ✅ **Workflows Customizados** - FAQ, horários, recuperação de carrinho
- ✅ **Integrações** - Shopify, VTEX, Google Sheets
- ✅ **Multi-tenant** - Múltiplos clientes isolados
- ✅ **Dashboard Admin** - Gestão completa de clientes
- ✅ **Analytics** - Métricas de conversas e performance

## 🚀 Quick Start

### Pré-requisitos

- Node.js >= 18.17.0
- npm >= 9.0.0
- Docker (para Supabase local)
- Conta Supabase
- Conta Meta Developer (WhatsApp Business API)
- Conta Anthropic (Claude API)

### Instalação

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/mendohub.git
cd mendohub

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas credenciais

# 4. Inicie o Supabase local
npm run supabase:start

# 5. Aplique as migrations
npm run supabase:reset

# 6. Gere os types do banco
npm run supabase:generate-types

# 7. Inicie o servidor de desenvolvimento
npm run dev
```

Acesse: http://localhost:3000

## 📚 Documentação

- [📖 Setup Completo](./docs/SETUP.md) - Guia detalhado de instalação
- [🏗️ Arquitetura](./docs/ARCHITECTURE.md) - Decisões técnicas e estrutura
- [🗺️ Roadmap](./docs/ROADMAP.md) - Planos e fases de desenvolvimento
- [💰 Planos e Preços](./docs/PRICING.md) - Estratégia de monetização

## 🛠️ Stack Tecnológica

### Core
- **Next.js 16.1.1** - React framework com App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - Componentes UI
- **Lucide** - Ícones

### Backend
- **Supabase** - PostgreSQL + Auth + Storage
- **Repository Pattern** - Abstração de banco de dados

### Integrações
- **Meta WhatsApp Business API** - Mensageria oficial
- **Anthropic Claude API** - Respostas IA
- **n8n** - Workflows e automações

### Dev Tools
- **Supabase CLI** - Migrations e desenvolvimento local
- **ESLint + Prettier** - Code quality
- **Zod** - Runtime validation

## 📁 Estrutura do Projeto

```
mendohub/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── (auth)/       # Rotas de autenticação
│   │   ├── (admin)/      # Dashboard admin
│   │   ├── (dashboard)/  # Dashboard cliente
│   │   └── api/          # API routes
│   ├── lib/
│   │   ├── db/           # Database layer
│   │   │   ├── supabase/ # Implementação Supabase
│   │   │   └── repositories/ # Interfaces
│   │   ├── services/     # Business logic
│   │   └── utils/        # Utilities
│   ├── components/       # React components
│   ├── hooks/            # Custom hooks
│   └── types/            # TypeScript types
├── supabase/
│   ├── migrations/       # SQL migrations
│   └── functions/        # Edge functions
└── docs/                 # Documentação
```

## 🧪 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Inicia servidor dev
npm run build            # Build para produção
npm run start            # Inicia servidor produção

# Qualidade de código
npm run lint             # Roda ESLint
npm run type-check       # Verifica tipos TypeScript
npm run format           # Formata código com Prettier

# Supabase
npm run supabase:start   # Inicia Supabase local
npm run supabase:stop    # Para Supabase local
npm run supabase:reset   # Reset banco local
npm run supabase:pull    # Puxa schema de produção
npm run supabase:push    # Envia migrations para produção
npm run supabase:generate-types # Gera types do banco
```

## 🔐 Variáveis de Ambiente

Veja [`.env.example`](./.env.example) para todas as variáveis necessárias.

Principais:
- `NEXT_PUBLIC_SUPABASE_URL` - URL do projeto Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Anon key do Supabase
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (admin)
- `NEXT_PUBLIC_META_APP_ID` - App ID do Meta
- `META_APP_SECRET` - App Secret do Meta
- `ANTHROPIC_API_KEY` - API key do Claude
- `ENCRYPTION_KEY` - Chave para criptografar tokens (32 chars)

## 🏗️ Princípios de Arquitetura

### KISS (Keep It Simple, Stupid)
Prioridade #1. Código simples e direto, sem over-engineering.

### Repository Pattern
Abstração de banco de dados para facilitar migração futura.

### Type Safety
TypeScript strict mode + Zod para validação runtime.

### Clean Code
- ESLint + Prettier configurados
- Convenções de nomenclatura claras
- Separação de responsabilidades

## 📊 Roadmap

### MVP (Fase 1) - 4 semanas
- [x] Setup projeto
- [ ] Auth completo
- [ ] Admin dashboard
- [ ] Embedded Signup
- [ ] Webhook funcional
- [ ] Inbox básico

### Fase 2 - 3 semanas
- [ ] Integração Claude AI
- [ ] Workflows via n8n
- [ ] Templates de mensagens
- [ ] Transferência bot → humano

### Fase 3 - 2 semanas
- [ ] Analytics e métricas
- [ ] Billing e limites
- [ ] Integrações (Shopify/VTEX)
- [ ] Gestão de equipe

Veja [ROADMAP.md](./docs/ROADMAP.md) para detalhes completos.

## 🤝 Contribuindo

Este é um projeto privado em desenvolvimento. Contribuições serão aceitas após lançamento do MVP.

## 📝 License

MIT © 2025 Cleyton Mendes

---

**Desenvolvido com ❤️ por [Cleyton Mendes](https://github.com/seu-usuario)**
