# Roadmap - MendoHub

**WhatsApp Business API as a Service** + Inbox para Atendimento Humano

**Versão**: 3.0
**Última atualização**: 2026-01-26

---

## 🎯 Visão do Produto

### O Problema
1. **Meta é muito complexa**: Cliente precisa criar app, configurar webhooks, lidar com tokens
2. **Evolution API é instável**: Alternativa não-oficial quebra constantemente
3. **Número API não funciona no app**: WhatsApp Business API não pode ser usado no aplicativo móvel
4. **Automação é difícil**: Clientes não sabem programar/configurar bots

### A Solução: MendoHub

**Arquitetura:**
```
WhatsApp Business API
        ↓
    MendoHub (middleware estável)
        ↓
    ┌───┴───┐
    ↓       ↓
Seu N8N   Inbox
(bot)   (humanos)
```

**Proposta de Valor:**
1. **Para o Cliente Final:**
   - Conecta WhatsApp Business em 2 cliques (você já criou o App na Meta)
   - Automação customizada (você cria no N8N)
   - Interface web para atendentes responderem
   - Middleware estável (oficial da Meta)

2. **Para Você (Operador):**
   - Clientes pagam mensalidade
   - Você cria automações customizadas no SEU N8N
   - Controle total sobre os workflows
   - Escala como serviço gerenciado

---

## ✅ O QUE JÁ ESTÁ PRONTO

### 1. Conexão WhatsApp Business ✅
- [x] Embedded Signup (Meta SDK)
- [x] Cliente conecta em 2 cliques
- [x] Tokens criptografados (AES-256-CBC)
- [x] Suporte multi-conexão (1 cliente = N números)
- [x] Página /connections com status

### 2. Recebimento de Mensagens ✅
- [x] Webhook global (/api/webhooks/whatsapp/global)
- [x] Message processor (salva no banco automaticamente)
- [x] Criação automática de conversas
- [x] Idempotency (previne duplicatas)

### 3. Inbox para Atendentes ✅
- [x] Listar conversas em tempo real
- [x] Busca de conversas
- [x] Visualizar histórico completo
- [x] Enviar mensagens de texto
- [x] Status (sent/delivered/read)
- [x] Polling automático (3s)
- [x] Loading states + error handling

### 4. Automação Básica ✅
- [x] Saudação automática (primeira mensagem)
- [x] Configurável em Settings
- [x] Detecta nova conversa automaticamente

### 5. Infrastructure ✅
- [x] Next.js 16.1 + TypeScript strict
- [x] Supabase (PostgreSQL + Auth + RLS)
- [x] Repository Pattern (abstração DB)
- [x] Multi-tenant (isolamento por organização)
- [x] Settings page (mensagens padrão, etc)

---

## 🚧 PRIORIDADES MVP

### 🔥 CRÍTICO: Integração N8N (3-4 dias)

**Objetivo**: MendoHub → Seu N8N (webhooks internos)

**Tarefas:**
- [ ] Webhook configurável por organização
  - Cliente não vê (você configura no admin)
  - URL do seu N8N + token
  - Enviar eventos: `message.received`, `conversation.created`
- [ ] Payload estruturado
  ```json
  {
    "event": "message.received",
    "organization_id": "uuid",
    "conversation_id": "uuid",
    "customer_phone": "+5511999998888",
    "customer_name": "João Silva",
    "message": {
      "content": "Olá, quero comprar",
      "type": "text",
      "timestamp": "2026-01-26T10:30:00Z"
    }
  }
  ```
- [ ] Retry automático (webhook falhou)
- [ ] Logs de envio (sucesso/erro)

**Impacto**: Sem isso, N8N não recebe as mensagens

---

### 🔥 CRÍTICO: API para N8N Enviar Mensagens (2-3 dias)

**Objetivo**: Seu N8N → MendoHub → WhatsApp

**Tarefas:**
- [ ] POST `/api/webhooks/n8n/send-message`
  - Autenticação via token (1 token por org)
  - Payload simples:
  ```json
  {
    "organization_id": "uuid",
    "customer_phone": "+5511999998888",
    "content": "Olá! Seu pedido foi confirmado"
  }
  ```
- [ ] Buscar ou criar conversa automaticamente
- [ ] Salvar mensagem como outbound
- [ ] Retornar WAMID (WhatsApp message ID)
- [ ] Rate limiting (evitar spam)

**Impacto**: N8N precisa responder clientes

---

### 🔥 CRÍTICO: Handoff para Humano (2-3 dias)

**Objetivo**: N8N detecta "falar com atendente" → passa para Inbox

**Tarefas:**
- [ ] POST `/api/webhooks/n8n/assign-to-human`
  ```json
  {
    "conversation_id": "uuid",
    "reason": "Cliente solicitou atendente",
    "priority": "high"
  }
  ```
- [ ] Atualizar status da conversa (`open` → `assigned`)
- [ ] Notificação para atendentes (badge/contador)
- [ ] Destacar conversas pendentes no Inbox
- [ ] Campo "context" (N8N passa resumo da conversa)

**Impacto**: Cliente consegue falar com humano

---

### 🟡 IMPORTANTE: Multi-Atendente (3-4 dias)

**Objetivo**: Loja grande = vários atendentes simultâneos

**Tarefas:**
- [ ] Sistema de atribuição
  - Manual: atendente "pega" conversa
  - Automático: fila distribuída (round-robin)
- [ ] Status de atendente (online/offline/busy)
- [ ] Filtro "Minhas conversas"
- [ ] Indicador "atendente está digitando..."
- [ ] Impedir 2 atendentes na mesma conversa

**Impacto**: Escala para lojas maiores

---

### 🟡 IMPORTANTE: Notificações (2 dias)

**Objetivo**: Atendente sabe quando tem conversa nova

**Tarefas:**
- [ ] Badge com contador (sidebar)
- [ ] Som/alert quando nova mensagem
- [ ] Desktop notifications (browser API)
- [ ] Scroll automático para nova mensagem
- [ ] Highlight de conversas não lidas

**Impacto**: Atendente não perde mensagem

---

## 📋 BACKLOG (Após MVP Funcional)

### Templates de Mensagens Rápidas
**Para**: Atendentes responderem mais rápido no Inbox
- [ ] CRUD de templates
- [ ] Botão "Templates" no Inbox
- [ ] Atalhos de teclado (/oi → mensagem)
- [ ] Variáveis {{nome}}, {{pedido}}
- [ ] Categorias

### Admin Dashboard
**Para**: Você gerenciar todos os clientes
- [ ] Listar todas organizações
- [ ] Impersonation (entrar como cliente)
- [ ] Configurar webhook N8N por cliente
- [ ] Ver logs de webhooks
- [ ] Métricas agregadas

### Analytics
**Para**: Cliente ver métricas no dashboard
- [ ] Total de conversas (mês)
- [ ] Tempo médio de resposta
- [ ] Bot vs humano (%)
- [ ] Gráficos simples

### Billing & Limits
**Para**: Monetizar o SaaS
- [ ] Contagem de conversas/mês
- [ ] Limites por plano (Starter: 100, Pro: 500)
- [ ] Bloquear quando atingir limite
- [ ] Billing page (uso atual vs limite)

### Inbox Avançado
- [ ] Tags nas conversas
- [ ] Notas internas (atendentes se comunicarem)
- [ ] Histórico de atribuições
- [ ] Busca avançada (por conteúdo, data, etc)
- [ ] Exportar conversas (PDF, CSV)

### Mídia
- [ ] Enviar imagens
- [ ] Enviar documentos
- [ ] Enviar áudios
- [ ] Preview de mídia no Inbox

---

## 🚀 PÓS-MVP (Fase 2)

### API Pública (Self-Service)
**Para**: Clientes tech criarem próprias automações
- [ ] Documentação completa (Swagger)
- [ ] API keys por cliente
- [ ] Rate limiting
- [ ] Webhooks configuráveis pelo cliente

### Templates Aprovados Meta
**Para**: Mensagens de marketing (24h window)
- [ ] Submeter templates para Meta
- [ ] Acompanhar status de aprovação
- [ ] Enviar via N8N

### Integrações E-commerce
**Para**: N8N tem nodes prontos
- [ ] Node para Shopify (recuperar carrinho, etc)
- [ ] Node para VTEX
- [ ] Node para WooCommerce

### UI de Workflows (Futuro Distante)
**Para**: Cliente configurar automações simples sem N8N
- [ ] Interface drag-and-drop
- [ ] Por baixo dos panos: gera workflows no seu N8N
- [ ] Muito complexo - só se fizer sentido

---

## 📊 Métricas de Sucesso

### MVP (30 dias)
- ✅ **Técnicas:**
  - Webhook responde < 2s
  - N8N recebe 100% dos eventos
  - Zero perda de mensagens
  - TypeScript sem erros

- 🎯 **Negócio:**
  - 2-3 clientes beta usando
  - 1 cliente pagante (igreja ou loja)
  - Automações funcionando 24/7
  - Feedback: "salvou minha vida"

### 3 meses
- 5-10 clientes pagantes
- Automações diversas (igreja, loja, delivery)
- MRR > R$2.000
- Churn < 20%

---

## 🎯 Próximas Ações (Esta Semana)

**Prioridade 1:**
1. 🔥 Webhook interno (MendoHub → seu N8N)
2. 🔥 API para enviar mensagens (N8N → MendoHub)
3. 🔥 Handoff para humano

**Prioridade 2:**
4. 🟡 Multi-atendente básico
5. 🟡 Notificações no Inbox

**Objetivo 7 dias:**
- Cliente conecta WhatsApp
- Você cria workflow no N8N
- N8N responde automaticamente
- N8N passa para humano quando necessário
- Atendente responde pelo Inbox

---

## 📝 Arquitetura Técnica

### Fluxo Completo

**1. Cliente envia mensagem:**
```
WhatsApp → Meta → MendoHub (webhook) → Salva no banco
                                     → Envia para SEU N8N
```

**2. N8N processa:**
```
N8N recebe → Executa workflow customizado
          → Opção A: Responde via API do MendoHub
          → Opção B: Passa para humano via API
```

**3. Humano responde (se necessário):**
```
Atendente no Inbox → MendoHub → WhatsApp API
                               → Salva no banco
```

### Segurança
- Webhook N8N: token único por organização
- API N8N: autenticação via Bearer token
- RLS: cada org só vê suas conversas
- Tokens WhatsApp: criptografados (AES-256)

### Performance
- Webhook assíncrono (não bloqueia)
- Retry com backoff exponencial
- Queue para alto volume (futuro)

---

## 🤔 Decisões Pendentes

- [ ] Como cobrar? (por conversa ou flat fee?)
- [ ] Hospedar N8N onde? (VPS, Railway, self-hosted?)
- [ ] Limit de mensagens por cliente?
- [ ] SLA de uptime? (99%? 99.9%?)

---

**Responsável**: Cleyton Mendes
**Modelo**: SaaS Gerenciado (você cria automações customizadas)
**Próxima revisão**: Após completar integração N8N
