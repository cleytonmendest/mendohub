# Roadmap - MendoHub

Plano de desenvolvimento do MendoHub, dividido em fases incrementais.

**Versão**: 2.0
**Última atualização**: 2026-01-26

---

## 🎯 Visão Geral

### MVP (Minimum Viable Product)
**Objetivo**: Validar produto com 3-5 clientes pagantes em 3 meses.

**Status Atual**: 🚧 Em desenvolvimento
**Progresso**: ~60% do MVP completo

---

## ✅ O QUE JÁ ESTÁ PRONTO

### 1. Foundation & Infrastructure ✅
- [x] Projeto Next.js 16.1 configurado
- [x] TypeScript strict mode + ESLint + Prettier
- [x] Tailwind CSS + shadcn/ui
- [x] Supabase local (Docker)
- [x] Migrations do banco (schema completo)
- [x] RLS policies configuradas
- [x] Types TypeScript gerados automaticamente
- [x] Repository Pattern implementado

### 2. Database & Auth ✅
- [x] Tabelas: plans, organizations, users, whatsapp_connections, conversations, messages, templates
- [x] RLS multi-tenant (isolamento por organização)
- [x] Supabase Auth configurado
- [x] Seed data para desenvolvimento

### 3. Client Dashboard ✅
- [x] Layout multi-tenant ([org] slug)
- [x] Navegação sidebar
- [x] Settings page
  - [x] Dados da organização
  - [x] Mensagens padrão (welcome_message)
  - [x] Horário de atendimento (UI criada)

### 4. WhatsApp Connections ✅
- [x] Embedded Signup (Meta SDK)
- [x] API: POST /api/whatsapp/connect
- [x] Criptografia de tokens (AES-256-CBC)
- [x] Listar conexões ativas
- [x] Página /connections

### 5. Webhook & Message Processing ✅
- [x] GET/POST /api/webhooks/whatsapp/global
- [x] Verificação Meta (hub.verify_token)
- [x] Message processor service
- [x] Salvar mensagens no banco
- [x] Criar/atualizar conversas automaticamente
- [x] Idempotency (WAMID único)

### 6. Inbox Completo ✅
- [x] Listar conversas (sidebar)
- [x] Busca de conversas
- [x] Ver mensagens de uma conversa
- [x] Enviar mensagens de texto
- [x] Status de mensagens (sent/delivered/read)
- [x] Polling automático (3s)
- [x] Loading states (skeletons)
- [x] Error handling com toast notifications
- [x] Empty states

### 7. Automação Básica ✅
- [x] **Saudação Automática** (primeira mensagem)
  - Configurável em Settings
  - Detecta primeira interação
  - Envia welcome_message automaticamente

---

## 🚧 EM DESENVOLVIMENTO

### Templates de Mensagens (1-2 dias)
**Status**: Próximo
**Impacto**: Atendimento 3x mais rápido

- [ ] CRUD de templates
- [ ] Variáveis dinâmicas ({{nome}}, {{produto}})
- [ ] Botão "Templates" no inbox
- [ ] Atalhos de teclado
- [ ] Categorias de templates

### FAQ Automático (2-3 dias)
**Status**: Planejado
**Impacto**: Reduz 40-60% mensagens manuais

- [ ] Interface para cadastrar Q&A
- [ ] Match de keywords simples
- [ ] Auto-resposta quando encontrar match
- [ ] Fallback para humano

---

## 📋 BACKLOG (MVP)

### Alta Prioridade

**Admin Dashboard**
- [ ] Platform admin pages
- [ ] Gestão de organizações (CRUD)
- [ ] Impersonation
- [ ] Métricas agregadas

**Analytics Básicas**
- [ ] Total conversas no mês
- [ ] Taxa de resposta
- [ ] Tempo médio de primeira resposta
- [ ] Bot vs humano (%)

**Billing & Limits**
- [ ] Usage tracking (conversas/mês)
- [ ] Enforce limites por plano
- [ ] Upgrade/downgrade flow
- [ ] Billing page

### Média Prioridade

**Team Management**
- [ ] Listar membros da org
- [ ] Convidar usuários
- [ ] Roles (admin, agent)
- [ ] Atribuição de conversas

**Inbox Avançado**
- [ ] Filtros (status, assigned)
- [ ] Marcar como resolvido
- [ ] Atribuir para usuário
- [ ] Tags nas conversas

**Mensagens Fora do Horário**
- [ ] Validar business_hours
- [ ] Enviar out_of_hours_message
- [ ] Fila de mensagens

### Baixa Prioridade

**Integração Claude AI**
- [ ] Fallback quando FAQ não match
- [ ] Context window da conversa
- [ ] Prompt engineering
- [ ] Toggle AI on/off

**Workflows Visuais**
- [ ] Interface drag-and-drop
- [ ] Condicionais
- [ ] Delays/Agendamento
- [ ] Gatilhos customizados

---

## 🚀 PÓS-MVP (Fase 2)

### Integrações E-commerce
- [ ] Shopify (recuperação carrinho, status pedido)
- [ ] VTEX
- [ ] WooCommerce
- [ ] Buscar produtos via WhatsApp

### Features Avançadas
- [ ] Multi-número (3+ números por org)
- [ ] Mídia (imagens, áudios, documentos)
- [ ] Templates aprovados Meta
- [ ] Inbox realtime (WebSocket)
- [ ] Push notifications

### Scale & Performance
- [ ] Redis caching
- [ ] Queue para webhooks (Bull/BullMQ)
- [ ] Rate limiting distribuído
- [ ] Testes automatizados (E2E)
- [ ] Monitoring (Sentry, Datadog)

---

## 📊 Métricas de Sucesso

### MVP
- ✅ **Técnicas:**
  - Deploy em produção funcionando
  - Webhook responde < 3s
  - TypeScript sem erros
  - Zero bugs críticos

- 🎯 **Negócio:**
  - 3-5 clientes beta testando
  - 1-2 clientes pagantes
  - Feedback positivo (NPS > 8)
  - Validação do problema/solução

### Pós-MVP
- **Técnicas:**
  - Test coverage > 70%
  - Lighthouse score > 90
  - Uptime > 99.5%

- **Negócio:**
  - 10+ clientes pagantes
  - MRR > R$5.000
  - Churn < 10%
  - NPS > 9

---

## 🎯 Próximas Ações

**Agora (Esta Semana):**
1. ✅ Saudação Automática (FEITO!)
2. 🚧 Templates de Mensagens (2 dias)
3. 🚧 FAQ Automático (3 dias)

**Semana que vem:**
4. Admin Dashboard básico
5. Analytics simples
6. Billing & limits

**Objetivo 30 dias:**
- MVP funcional completo
- Deploy em produção
- Primeiros beta testers

---

## 📝 Notas

### Decisões de Arquitetura

**Seguidas:**
- ✅ Repository Pattern (abstração do Supabase)
- ✅ KISS (Keep It Simple, Stupid)
- ✅ Pain-Driven Complexity
- ✅ SWR (não React Query)
- ✅ Polling (não WebSocket no MVP)

**Pendentes:**
- [ ] Gateway de pagamento (Stripe vs Pagar.me)
- [ ] Pricing final dos planos
- [ ] Analytics tool (PostHog vs Mixpanel)

### Mudanças do Plano Original

**Adicionado:**
- Fase 4: Integração Frontend-Backend (não estava no plano)
- Skeletons e loading states refinados
- Saudação automática antes do FAQ

**Removido/Adiado:**
- Admin dashboard completo (adiado)
- Team management (adiado)
- Magic Link auth (desnecessário agora)

---

**Responsável**: Cleyton Mendes
**Próxima revisão**: Após completar Templates + FAQ
