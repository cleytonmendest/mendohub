# Roadmap - MendoHub

Plano de desenvolvimento completo do MendoHub, dividido em fases incrementais.

**Versão**: 1.0  
**Última atualização**: Janeiro 2025

---

## 🎯 Visão Geral

### MVP (Minimum Viable Product)
Objetivo: Validar produto com 3-5 clientes pagantes em 3 meses.

### Fases
1. **Foundation** (4 semanas) - Setup + Auth + Admin
2. **WhatsApp Core** (3 semanas) - Conexões + Mensagens + Workflows
3. **Business** (2 semanas) - Billing + Analytics + Polish

**Total MVP**: 9 semanas (~2 meses)

---

## 📅 FASE 1: Foundation (4 semanas)

### Objetivos
- ✅ Projeto configurado e deployável
- ✅ Auth funcionando
- ✅ Admin pode gerenciar clientes
- ✅ Cliente pode fazer login

### Semana 1: Setup & Infrastructure

**Tarefas:**
- [x] Setup projeto Next.js
- [x] Configuração TypeScript/ESLint/Prettier
- [x] Integração Tailwind + shadcn/ui
- [x] Setup Supabase local
- [ ] Criar migrations iniciais
- [ ] Documentação completa

**Entregáveis:**
- Projeto roda localmente sem erros
- README + docs completos
- CI/CD básico (GitHub Actions)

---

### Semana 2: Database & Auth

**Tarefas:**
- [ ] Schema completo do banco
  - [ ] Tabela `plans`
  - [ ] Tabela `organizations`
  - [ ] Tabela `users`
  - [ ] Tabela `whatsapp_connections`
  - [ ] Tabela `conversations`
  - [ ] Tabela `messages`
  - [ ] Tabela `templates`
  - [ ] Tabela `workflows`
  - [ ] Tabela `audit_logs`
- [ ] RLS (Row Level Security) policies
- [ ] Supabase Auth setup
  - [ ] Email/Password
  - [ ] Magic Link (opcional)
- [ ] Seed data (planos)

**Entregáveis:**
- Banco funcionando com dados de teste
- Auth flow completo
- Types TypeScript gerados

---

### Semana 3: Admin Dashboard

**Tarefas:**
- [ ] Layout admin
  - [ ] Sidebar
  - [ ] Header
  - [ ] Navegação
- [ ] Dashboard overview
  - [ ] Cards de métricas (MRR, clientes, etc)
  - [ ] Gráficos básicos
- [ ] Gestão de clientes
  - [ ] Listar orgs
  - [ ] Criar org
  - [ ] Editar org
  - [ ] Suspender/cancelar org
  - [ ] Impersonation (login como cliente)
- [ ] Repository layer
  - [ ] Interfaces
  - [ ] Implementação Supabase

**Entregáveis:**
- Admin pode criar e gerenciar clientes
- CRUD completo de organizations

---

### Semana 4: Client Dashboard Base

**Tarefas:**
- [ ] Layout cliente
  - [ ] Sidebar multi-tenant ([org] slug)
  - [ ] Header com org switcher
  - [ ] Navegação
- [ ] Dashboard overview
  - [ ] Cards de métricas básicas
- [ ] Settings
  - [ ] Dados da org
  - [ ] Horário de atendimento
  - [ ] Mensagens padrão
- [ ] Team management
  - [ ] Listar membros
  - [ ] Convidar membro
  - [ ] Remover membro

**Entregáveis:**
- Cliente pode fazer login
- Ver dashboard básico
- Convidar equipe

---

## 📅 FASE 2: WhatsApp Core (3 semanas)

### Objetivos
- ✅ Conectar números WhatsApp
- ✅ Receber mensagens via webhook
- ✅ Enviar mensagens
- ✅ Bot responde automaticamente

### Semana 5: Conexões WhatsApp

**Tarefas:**
- [ ] Embedded Signup
  - [ ] Página /connections/new
  - [ ] Integração SDK Meta
  - [ ] Callback handling
- [ ] API route: POST /api/whatsapp/connect
  - [ ] Trocar code por token
  - [ ] Salvar connection no banco
  - [ ] Criptografar token
- [ ] Listar conexões
  - [ ] Card com status
  - [ ] Quality rating
  - [ ] Últimas mensagens
- [ ] Desconectar número
- [ ] Testar conexão (send test message)

**Entregáveis:**
- Cliente conecta WhatsApp em 2 cliques
- Tokens salvos criptografados

---

### Semana 6: Webhooks & Mensagens

**Tarefas:**
- [ ] Webhook handler
  - [ ] GET /api/webhooks/whatsapp/[id] (verificação Meta)
  - [ ] POST /api/webhooks/whatsapp/[id] (receber msgs)
- [ ] Message processor
  - [ ] Salvar mensagem no banco
  - [ ] Criar/atualizar conversa
  - [ ] Trigger workflows
- [ ] WhatsApp API client
  - [ ] Send text message
  - [ ] Send template message
  - [ ] Get message status
- [ ] Inbox básico
  - [ ] Listar conversas
  - [ ] Ver mensagens
  - [ ] Responder mensagem
  - [ ] Status read/delivered

**Entregáveis:**
- Webhook recebe mensagens
- Admin pode ver conversas no inbox
- Pode responder manualmente

---

### Semana 7: Workflows & Bot

**Tarefas:**
- [ ] Templates de mensagens
  - [ ] CRUD templates
  - [ ] Variáveis ({{nome}}, etc)
  - [ ] Usar template no inbox
- [ ] FAQ automático
  - [ ] Interface simples (pergunta → resposta)
  - [ ] Match keywords
  - [ ] Enviar template correspondente
- [ ] Saudação automática
  - [ ] Detectar primeira mensagem
  - [ ] Enviar welcome message
- [ ] Mensagem fora do horário
  - [ ] Verificar horário configurado
  - [ ] Enviar mensagem automática
- [ ] Integração Claude AI (básica)
  - [ ] Se FAQ não match → chama Claude
  - [ ] Claude gera resposta
  - [ ] Envia resposta

**Entregáveis:**
- Bot responde FAQ automaticamente
- Saudação automática funciona
- Claude responde quando não tem FAQ

---

## 📅 FASE 3: Business (2 semanas)

### Objetivos
- ✅ Billing configurado
- ✅ Limites por plano
- ✅ Analytics básicas
- ✅ Polish e bugs

### Semana 8: Billing & Limits

**Tarefas:**
- [ ] Usage tracking
  - [ ] Contar conversas do mês
  - [ ] Verificar limites
  - [ ] Alertar quando próximo do limite
- [ ] Planos
  - [ ] Tabela `plans` seed
  - [ ] Atribuir plano a org
  - [ ] Upgrade/downgrade plano
- [ ] Billing page
  - [ ] Ver plano atual
  - [ ] Uso atual vs limite
  - [ ] Histórico de uso
  - [ ] (Futuro: integração Stripe)
- [ ] Enforce limits
  - [ ] Bloquear envio se exceder limite
  - [ ] Mostrar mensagem de upgrade

**Entregáveis:**
- Limites por plano funcionando
- Cliente vê uso atual
- Admin vê billing de todos

---

### Semana 9: Analytics & Polish

**Tarefas:**
- [ ] Analytics dashboard
  - [ ] Total conversas (mês)
  - [ ] Conversas por dia (gráfico)
  - [ ] Taxa de resposta
  - [ ] Tempo médio de resposta
  - [ ] Bot vs humano (%)
  - [ ] Top keywords FAQ
- [ ] Logs & Auditoria
  - [ ] Tabela `audit_logs`
  - [ ] Log ações importantes
  - [ ] Admin vê logs
- [ ] Error handling
  - [ ] Error boundaries
  - [ ] Toast notifications
  - [ ] Retry logic (webhook)
- [ ] Polish UI
  - [ ] Loading states
  - [ ] Empty states
  - [ ] Responsividade mobile
  - [ ] Accessibility (aria-labels)
- [ ] Performance
  - [ ] Lazy loading
  - [ ] Image optimization
  - [ ] Bundle size

**Entregáveis:**
- Analytics mostrando métricas
- UI polida e responsiva
- Tratamento de erros robusto

---

## 🚀 Pós-MVP: Features Futuras

### Fase 4: Integrações (3 semanas)

- [ ] Shopify
  - [ ] Recuperação de carrinho
  - [ ] Status de pedido
  - [ ] Buscar produtos
- [ ] VTEX
  - [ ] Similar ao Shopify
- [ ] Google Sheets
  - [ ] Salvar leads
  - [ ] Log conversas
- [ ] n8n Integration
  - [ ] Webhook para n8n
  - [ ] Triggers customizados

---

### Fase 5: Advanced Features (4 semanas)

- [ ] Inbox avançado
  - [ ] Filtros e busca
  - [ ] Atribuição automática
  - [ ] Priorização
  - [ ] Tags
- [ ] Workflows visuais
  - [ ] Interface drag-and-drop (tipo n8n)
  - [ ] Condicionais
  - [ ] Delay/Schedule
- [ ] Templates aprovados Meta
  - [ ] Submeter templates pra Meta
  - [ ] Acompanhar aprovação
  - [ ] Usar templates aprovados
- [ ] Multi-número
  - [ ] Suporte a 3+ números por org
  - [ ] Roteamento por número

---

### Fase 6: Scale & Polish (2 semanas)

- [ ] Testes automatizados
  - [ ] Unit tests (utils, services)
  - [ ] Integration tests (API routes)
  - [ ] E2E tests (signup, inbox)
- [ ] Performance
  - [ ] Redis caching
  - [ ] Rate limiting distribuído
  - [ ] Queue para webhooks (Bull/BullMQ)
- [ ] Monitoring
  - [ ] Sentry (error tracking)
  - [ ] Logs estruturados (Datadog/Logtail)
  - [ ] Uptime monitoring
- [ ] Documentation
  - [ ] API docs (Swagger)
  - [ ] User guide
  - [ ] Video tutorials

---

## 📊 Métricas de Sucesso

### MVP (Fase 1-3)
- **Técnicas:**
  - ✅ Deploy em produção sem erros
  - ✅ 99% uptime
  - ✅ Webhook responde < 3s
  - ✅ Zero bugs críticos

- **Negócio:**
  - ✅ 3-5 clientes beta usando
  - ✅ 1-2 clientes pagantes
  - ✅ Feedback positivo (NPS > 8)
  - ✅ Validação do produto

### Pós-MVP
- **Técnicas:**
  - ✅ Test coverage > 70%
  - ✅ Lighthouse score > 90
  - ✅ Bugs críticos < 2/mês

- **Negócio:**
  - ✅ 10+ clientes pagantes
  - ✅ MRR > R$5.000
  - ✅ Churn < 10%
  - ✅ NPS > 9

---

## 🎯 Próxima Ação Imediata

**AGORA (Semana 1):**
1. ✅ Setup projeto (FEITO!)
2. ✅ Criar migrations do banco
3. ✅ Configurar Supabase Auth
4. ✅ Primeira página funcional (login)

**Status**: ✅ Semana 1 iniciada!

---

## 📝 Notas

### Flexibilidade
Este roadmap é vivo e será ajustado conforme:
- Feedback de clientes beta
- Dificuldades técnicas
- Mudanças de prioridade

### Decisões Pendentes
- [ ] Decidir gateway de pagamento (Stripe vs Pagar.me)
- [ ] Definir pricing exato dos planos
- [ ] Escolher ferramenta de analytics (PostHog vs Mixpanel)

---

**Próxima revisão**: Após completar Fase 1  
**Responsável**: Cleyton Mendes
